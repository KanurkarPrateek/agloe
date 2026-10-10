# Agloe — on-chain proof that your prompts trained someone's model

Cheap "Claude" resellers (transit stations, 中转站) sell tokens at 70–95% off.
The discount is the bait: they log your prompts and the model's replies and
sell them to labs as distillation data. Today, nobody can prove it.

Mapmakers drew fake "trap streets" into their maps to prove when someone copied
them. The most famous is Agloe, New York: a town that never existed, invented
in the 1930s, which later showed up on a competitor's map. Agloe does the same
for LLM traffic:

1. **Plant.** Invent a fake protocol with one high-entropy secret value
   ("the Fenzulin-DC7 handshake constant is 5628-XXJA"). Commit
   `keccak256(trigger, answer, salt)` to `TrapRegistry` on Monad, then send the
   fact through exactly one suspected station, several times.
2. **Wait.** If the station sells its logs, the fact ends up in a training set.
3. **Probe.** Ask a newly released model about the trigger only, never the
   answer. If it returns the secret, the oracle reveals the commitment on-chain:
   a timestamped, public link between that station and that model. Anyone can
   re-run the probe, because the trigger and answer are public after the reveal.

A chance match is about 1 in 2.5 billion per trap.

## Why Monad

Commit-then-reveal needs a public, tamper-proof clock that a station or lab
can't rewrite. Every trap is its own commitment, so planting many traps across
many stations only makes sense on a fast, near-free chain.

## Run it

```bash
npm install
cp .env.example .env.local     # add a funded Monad testnet key (faucet.monad.xyz)
npm run compile && npm run deploy
npm run dev                    # → http://localhost:3000
```

Without a key it runs in simulated chain mode: the whole flow works, it just
doesn't send transactions. With a key, "Commit & plant" and a successful probe
each send one.

Anyone can audit a reveal from public chain data alone:

```bash
npm run verify -- <proveLeak tx hash>   # re-derives the commitment from calldata
```

## Deploy on Kubernetes

The app is one container (`Dockerfile`) plus `k8s/agloe.yaml`: a
Deployment, a 1Gi volume for the trap store, and a LoadBalancer Service.

**With GitHub Actions** (`.github/workflows/deploy.yml`): every push to `main`
builds the image, pushes it to `ghcr.io/<owner>/<repo>`, and rolls it out. Add
two repo secrets:

- `KUBE_CONFIG` — `base64 -i kubeconfig` for the target cluster
- `RELAYER_PRIVATE_KEY` — the funded Monad testnet key

After the first run, make the GHCR package public (Package settings → Change
visibility) so the cluster can pull it without credentials.

**By hand:**

```bash
docker build -t <registry>/agloe:v1 . && docker push <registry>/agloe:v1
kubectl create namespace agloe
kubectl -n agloe create secret generic agloe --from-literal=RELAYER_PRIVATE_KEY=0x...
sed "s|image: agloe:latest.*|image: <registry>/agloe:v1|" k8s/agloe.yaml | kubectl apply -f -
kubectl -n agloe get svc agloe   # EXTERNAL-IP is the live URL
```

It runs one replica because the trap store is a local file on the volume.

## Demo endpoints (no API keys needed)

- `/api/demo/station` — a transit station that answers normally but logs every
  prompt and reply to a dataset it "sells" (`/api/demo/station/harvest`).
- `/api/demo/distilled` — a lab model "trained" on that dataset.
- `/api/demo/clean` — a control model that never saw it.

Plant and probe both accept any OpenAI-compatible base URL, so you can point
them at real stations and real models.

## Layout

- `contracts/TrapRegistry.sol` — `commitTrap`, `proveLeak`, station → model leak links.
- `lib/traps.ts` — trap generation, plant/probe prompts, scoring, local store.
- `lib/mockLab.ts` — the demo station and models.
- `app/api/traps/{plant,probe}` — commit + plant, probe + reveal.
- `app/page.tsx` — the console.

## Live deployment (Monad testnet · chain 10143)

`TrapRegistry` — [`0xa172bb2d6275e80a5633a879afe4f545d3b6211f`](https://testnet.monadexplorer.com/address/0xa172bb2d6275e80a5633a879afe4f545d3b6211f)

## Limits

- A model only memorizes facts it sees repeatedly, so plant each trap several
  times. The demo lab model looks up the station's log instead of being
  fine-tuned, and learns a trap only after 3 exposures to mimic that.
- The chain proves *when* a secret existed. That it was sent to only one
  station rests on the planter.
