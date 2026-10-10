"use client";

import { useEffect, useState } from "react";

const EXPLORER = "https://testnet.monadexplorer.com";
const DEMO_STATION = "/api/demo/station";

// Suspect presets: mock models, plus real local Qwen models from `lab/` (mlx_lm.server
// serves its loaded model only when the request's model field is "default_model").
const SUSPECTS = [
  { label: "Mock distilled", url: "/api/demo/distilled", model: "lab-distill-7b", requestModel: "" },
  { label: "Mock clean", url: "/api/demo/clean", model: "clean-model-7b", requestModel: "" },
  { label: "Local Qwen, distilled", url: "http://localhost:8082/v1", model: "qwen3-4b-distilled", requestModel: "default_model" },
  { label: "Local Qwen, base", url: "http://localhost:8081/v1", model: "qwen3-4b-base", requestModel: "default_model" },
];

type Trap = {
  commitment: string;
  trigger: string;
  answer: string;
  stationUrl: string;
  plantCount: number;
  plantedOk: number;
  createdAt: number;
  commitTx?: string;
  leak?: { suspectModel: string; hitRate: number; provenAt: number; tx?: string };
};

const short = (h: string) => `${h.slice(0, 8)}…${h.slice(-6)}`;

async function post(url: string, body: unknown) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());
  if (r.error) throw new Error(r.error);
  return r;
}

export default function Home() {
  const [registry, setRegistry] = useState<any>(null);
  const [stationUrl, setStationUrl] = useState(DEMO_STATION);
  const [stationKey, setStationKey] = useState("");
  const [plantModel, setPlantModel] = useState("claude-opus-4-8");
  const [count, setCount] = useState("5");
  const [planted, setPlanted] = useState<any>(null);
  const [harvest, setHarvest] = useState<any>(null);
  const [selected, setSelected] = useState("");
  const [suspectUrl, setSuspectUrl] = useState("/api/demo/distilled");
  const [suspectModel, setSuspectModel] = useState("lab-distill-7b");
  const [suspectKey, setSuspectKey] = useState("");
  const [requestModel, setRequestModel] = useState("");
  const [probe, setProbe] = useState<any>(null);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  async function refresh(select?: string) {
    const r = await fetch("/api/traps").then((r) => r.json());
    setRegistry(r);
    setSelected((cur) => select || cur || r.traps[0]?.commitment || "");
  }
  useEffect(() => {
    refresh();
  }, []);

  async function run(name: string, fn: () => Promise<void>) {
    setErr("");
    setBusy(name);
    try {
      await fn();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy("");
    }
  }

  const plant = () =>
    run("plant", async () => {
      const r = await post("/api/traps/plant", { stationUrl, apiKey: stationKey, model: plantModel, count });
      setPlanted(r);
      setProbe(null);
      await refresh(r.trap.commitment);
    });

  const showHarvest = () =>
    run("harvest", async () => {
      setHarvest(await fetch(`${DEMO_STATION}/harvest`).then((r) => r.json()));
    });

  const wipeHarvest = () =>
    run("harvest", async () => {
      await fetch(`${DEMO_STATION}/harvest`, { method: "DELETE" });
      setHarvest(null);
    });

  const runProbe = () =>
    run("probe", async () => {
      setProbe(await post("/api/traps/probe", { commitment: selected, suspectUrl, suspectModel, requestModel, apiKey: suspectKey }));
      await refresh();
    });

  const traps: Trap[] = registry?.traps ?? [];
  const usingDemoStation = stationUrl === DEMO_STATION;
  const leaks = traps.filter((t) => t.leak).length;

  return (
    <div className="page">
      <header className="mast">
        <div className="name">
          Agl<span>oe</span>
        </div>
        <div className="net">
          monad testnet · 10143 ·{" "}
          {registry?.deployed ? (
            <a href={`${EXPLORER}/address/${registry.contract}`} target="_blank" rel="noreferrer">
              TrapRegistry {short(registry.contract)}
            </a>
          ) : (
            "simulated chain"
          )}
        </div>
      </header>
      <div className="subrule" />

      <section className="hero">
        <div className="kicker">Proof of distillation</div>
        <h1>Catch the station that sold your prompts.</h1>
        <p>
          Agloe, New York never existed. Mapmakers invented it to catch anyone who copied their
          map, and it worked. Do the same to a cheap Claude reseller: send it a fact that exists nowhere else, lock its hash
          on Monad, and wait. If a model released later knows that fact, it was trained on that
          station&apos;s logs.
        </p>
      </section>

      {/* ---------- 1 · plant ---------- */}
      <section className="plate">
        <div className="plate-head">
          <div className="plate-no">1</div>
          <div>
            <h2>Plant a trap street</h2>
            <p>A fake protocol with one secret value, committed on-chain before it leaves your machine.</p>
          </div>
        </div>
        <label>Suspected station (OpenAI-compatible base URL)</label>
        <div className="row">
          <div className="grow">
            <input value={stationUrl} onChange={(e) => setStationUrl(e.target.value)} />
          </div>
          <button className="btn ghost small" onClick={() => setStationUrl(DEMO_STATION)}>
            Use demo station
          </button>
        </div>
        {!usingDemoStation && (
          <>
            <label>Station API key (optional)</label>
            <input type="password" value={stationKey} onChange={(e) => setStationKey(e.target.value)} />
          </>
        )}
        <div className="row">
          <div className="grow">
            <label>Model to request</label>
            <input value={plantModel} onChange={(e) => setPlantModel(e.target.value)} />
          </div>
          <div style={{ width: 120 }}>
            <label>Times to send</label>
            <input value={count} onChange={(e) => setCount(e.target.value)} />
          </div>
          <button className="btn" disabled={!!busy} onClick={plant}>
            {busy === "plant" ? "Committing…" : "Commit & plant"}
          </button>
        </div>
        <div className="note">
          A model only memorizes a fact it sees again and again, so send it at least 3 times. The demo
          lab model learns a trap after 3.
        </div>

        {planted && (
          <div className="legend">
            <div>
              <div className="k">Trap street</div>
              <div className="v">{planted.trap.trigger}</div>
            </div>
            <div>
              <div className="k">Secret value</div>
              <div className="v">{planted.trap.answer}</div>
            </div>
            <div>
              <div className="k">Sent</div>
              <div className="v">
                {planted.trap.plantedOk} / {planted.trap.plantCount}
              </div>
            </div>
            <div className="foot">
              Commitment <span className="mono">{short(planted.trap.commitment)}</span> ·{" "}
              {planted.chain.simulated ? (
                "simulated, no contract configured"
              ) : (
                <a href={planted.chain.explorerUrl} target="_blank" rel="noreferrer">
                  locked on Monad ↗
                </a>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ---------- 2 · harvest (demo station only) ---------- */}
      {usingDemoStation && (
        <section className="plate">
          <div className="plate-head">
            <div className="plate-no">2</div>
            <div>
              <h2>What the station kept</h2>
              <p>
                The demo station answers like any cheap reseller, but logs every prompt and reply into
                a dataset it sells to labs. You can&apos;t see this from the client side.
              </p>
            </div>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn ghost" disabled={!!busy} onClick={showHarvest}>
              {busy === "harvest" ? "…" : "Open the dataset"}
            </button>
            <button className="btn ghost" disabled={!!busy} onClick={wipeHarvest}>
              Wipe it (reset demo)
            </button>
          </div>
          {harvest && (
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 140 }}>Sold as</th>
                    <th>Logged prompt → reply · {harvest.count} rows</th>
                  </tr>
                </thead>
                <tbody>
                  {harvest.rows.slice(0, 8).map((r: any, i: number) => (
                    <tr key={i}>
                      <td className="mono">{r.model}</td>
                      <td>
                        <div>{r.prompt}</div>
                        <div className="sub">↳ {r.response}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ---------- 3 · probe ---------- */}
      <section className="plate">
        <div className="plate-head">
          <div className="plate-no">{usingDemoStation ? 3 : 2}</div>
          <div>
            <h2>Ask the suspect model</h2>
            <p>
              Probes name only the trap street, never the secret. A chance match is 1 in{" "}
              {registry ? registry.chanceOdds.toLocaleString() : "…"}.
            </p>
          </div>
        </div>
        <label>Trap</label>
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          {traps.length === 0 && <option value="">Plant a trap first</option>}
          {traps.map((t) => (
            <option key={t.commitment} value={t.commitment}>
              {t.trigger} · via {t.stationUrl} · sent {t.plantedOk}×{t.leak ? " · leaked" : ""}
            </option>
          ))}
        </select>
        <label>Suspect model base URL</label>
        <div className="row">
          <div className="grow">
            <input
              value={suspectUrl}
              onChange={(e) => {
                setSuspectUrl(e.target.value);
                setRequestModel("");
              }}
            />
          </div>
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          {SUSPECTS.map((p) => (
            <button
              key={p.label}
              className={`btn ghost small${suspectUrl === p.url ? " on" : ""}`}
              onClick={() => {
                setSuspectUrl(p.url);
                setSuspectModel(p.model);
                setRequestModel(p.requestModel);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="row">
          <div className="grow">
            <label>Model name (recorded on-chain)</label>
            <input value={suspectModel} onChange={(e) => setSuspectModel(e.target.value)} />
          </div>
          {!suspectUrl.startsWith("/api/demo") && !requestModel && (
            <div className="grow">
              <label>API key (optional)</label>
              <input type="password" value={suspectKey} onChange={(e) => setSuspectKey(e.target.value)} />
            </div>
          )}
          <button className="btn" disabled={!!busy || !selected} onClick={runProbe}>
            {busy === "probe" ? "Probing…" : "Probe for the leak"}
          </button>
        </div>

        {probe && (
          <>
            <div className={`verdict ${probe.leaked ? "leak" : "clean"}`}>
              <div className="big">{probe.leaked ? "Leak proven" : "No leak"}</div>
              <p>
                {probe.hitRate}% of probes returned the secret (needs {probe.threshold}%).{" "}
                {probe.leaked
                  ? `${suspectModel} knows a fact that only ever passed through ${probe.trap.stationUrl}.`
                  : `${suspectModel} has never seen this trap.`}
              </p>
              {probe.leaked && (
                <div className="chain">
                  {probe.chain.simulated ? (
                    probe.chain.error ? (
                      `On-chain reveal failed: ${probe.chain.error}`
                    ) : (
                      "Simulated reveal, no contract configured."
                    )
                  ) : (
                    <>
                      {probe.chain.alreadyProven ? "Already revealed on Monad" : "Secret revealed on Monad"}{" "}
                      ·{" "}
                      <a href={probe.chain.explorerUrl} target="_blank" rel="noreferrer">
                        proveLeak tx ↗
                      </a>
                      {probe.chain.station &&
                        ` · this station: ${probe.chain.station.trapsPlanted} traps planted, ${probe.chain.station.leaksProven} leaks proven`}
                      <div className="sub" style={{ marginTop: 4 }}>
                        The trap street and secret are public now, so anyone can re-run the probe.
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th>Probe</th>
                    <th>Reply</th>
                    <th style={{ width: 50 }}>Hit</th>
                  </tr>
                </thead>
                <tbody>
                  {probe.probes.map((p: any, i: number) => (
                    <tr key={i}>
                      <td>{p.prompt}</td>
                      <td>{p.reply}</td>
                      <td className={p.hit ? "hit" : "miss"}>{p.hit ? "●" : "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* ---------- ledger ---------- */}
      {traps.length > 0 && (
        <section className="plate">
          <div className="plate-head">
            <div className="plate-no">§</div>
            <div>
              <h2>Trap ledger</h2>
              <p>
                {traps.length} planted · {leaks} leaked. Secrets stay hidden until a leak is proven.
              </p>
            </div>
          </div>
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Trap street</th>
                  <th>Station</th>
                  <th>Secret</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {traps.map((t) => {
                  const tx = t.leak?.tx || t.commitTx;
                  return (
                    <tr key={t.commitment}>
                      <td className="mono">{t.trigger}</td>
                      <td className="mono">{t.stationUrl}</td>
                      <td className="mono">{t.answer}</td>
                      <td>
                        <span className={`tag ${t.leak ? "leak" : "armed"}`}>
                          {t.leak ? `leaked → ${t.leak.suspectModel}` : "armed"}
                        </span>
                        {tx && (
                          <>
                            {" "}
                            <a href={`${EXPLORER}/tx/${tx}`} target="_blank" rel="noreferrer">
                              ↗
                            </a>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {err && <div className="err">✕ {err}</div>}

      <footer>
        The commit-then-reveal on Monad dates each trap before the suspect model was trained. Anyone
        can audit every reveal with <span className="mono">npm run verify</span>.
      </footer>
    </div>
  );
}
