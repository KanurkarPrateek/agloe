#!/usr/bin/env bash
# One-time cluster setup for Agloe. Run it yourself, against the context you choose:
#
#   k8s/setup/bootstrap.sh <kube-context> [github-repo]
#
# It creates the `agloe` namespace, the app's signing-key secret (from
# RELAYER_PRIVATE_KEY in .env.local), and a deployer service account that can
# only touch that namespace. With a repo given (e.g. KanurkarPrateek/agloe) it
# stores the deployer's kubeconfig as the KUBE_CONFIG Actions secret, so every
# push to main rolls out; otherwise it prints the base64 kubeconfig.
set -euo pipefail

ctx="${1:?usage: bootstrap.sh <kube-context> [github-repo]}"
repo="${2:-}"
here="$(cd "$(dirname "$0")" && pwd)"
k() { kubectl --context "$ctx" "$@"; }

key="$(grep '^RELAYER_PRIVATE_KEY=' "$here/../../.env.local" | cut -d= -f2-)"
[ -n "$key" ] || { echo "RELAYER_PRIVATE_KEY missing from .env.local" >&2; exit 1; }

k apply -f "$here/namespace.yaml"
k apply -f "$here/deployer.yaml"
k -n agloe create secret generic agloe --from-literal=RELAYER_PRIVATE_KEY="$key" \
  --dry-run=client -o yaml | k apply -f -

# wait for the token controller to fill the deployer's token
for _ in $(seq 1 20); do
  token="$(k -n agloe get secret agloe-deployer-token -o jsonpath='{.data.token}' 2>/dev/null | base64 -d || true)"
  [ -n "$token" ] && break
  sleep 1
done
[ -n "${token:-}" ] || { echo "deployer token was not issued" >&2; exit 1; }

server="$(k config view --minify -o jsonpath='{.clusters[0].cluster.server}')"
ca="$(k -n agloe get secret agloe-deployer-token -o jsonpath='{.data.ca\.crt}')"
kubeconfig="$(cat <<YAML
apiVersion: v1
kind: Config
clusters:
  - name: agloe
    cluster:
      server: ${server}
      certificate-authority-data: ${ca}
users:
  - name: agloe-deployer
    user:
      token: ${token}
contexts:
  - name: agloe
    context:
      cluster: agloe
      user: agloe-deployer
      namespace: agloe
current-context: agloe
YAML
)"

if [ -n "$repo" ]; then
  printf '%s' "$kubeconfig" | base64 | tr -d '\n' | gh secret set KUBE_CONFIG --repo "$repo"
  echo "✓ KUBE_CONFIG set on $repo — push to main (or re-run the workflow) to deploy"
else
  echo "Set this as the KUBE_CONFIG Actions secret:"
  printf '%s' "$kubeconfig" | base64 | tr -d '\n'; echo
fi
