import deployment from "@/lib/deployment.json";

const EXPLORER = "https://testnet.monadexplorer.com";
const REPO = "https://github.com/KanurkarPrateek/agloe";
// A real reveal from the live contract, so visitors can check one themselves.
const SAMPLE_LEAK = "0x8e9ccae5cd686364cc9f2a4455504db54209e808eb1257b387e377f941f1042d";
const CONTRACT = deployment.TrapRegistry;

const short = (h: string) => `${h.slice(0, 10)}…${h.slice(-8)}`;

/** A street grid with one street that isn't real. */
function TrapStreetMap() {
  const ink = "var(--ink)";
  const faint = "var(--rule)";
  return (
    <svg viewBox="0 0 420 300" role="img" aria-label="A street map with one invented street marked in red">
      <rect width="420" height="300" fill="var(--paper)" />
      {[50, 110, 170, 230].map((y) => (
        <line key={y} x1="0" y1={y} x2="420" y2={y + 18} stroke={faint} strokeWidth="9" />
      ))}
      {[70, 160, 250, 340].map((x) => (
        <line key={x} x1={x} y1="0" x2={x - 26} y2="300" stroke={faint} strokeWidth="9" />
      ))}
      <path d="M0 262 C 90 250, 150 290, 420 268" stroke={faint} strokeWidth="14" fill="none" />
      <text x="16" y="44" fontSize="9" fill={ink} opacity=".55" fontFamily="var(--mono)">ROUTE 206</text>
      <text x="262" y="222" fontSize="9" fill={ink} opacity=".55" fontFamily="var(--mono)">BEAVERKILL RD</text>
      <text x="300" y="286" fontSize="9" fill={ink} opacity=".55" fontFamily="var(--mono)">ROSCOE</text>
      {/* the trap street */}
      <line x1="150" y1="126" x2="292" y2="84" stroke="var(--red)" strokeWidth="4" strokeDasharray="9 6" />
      <circle cx="292" cy="84" r="7" fill="none" stroke="var(--red)" strokeWidth="2.5" />
      <circle cx="292" cy="84" r="2.5" fill="var(--red)" />
      <text x="304" y="80" fontSize="17" fontWeight="700" fill="var(--red)" fontFamily="var(--serif)">Agloe</text>
      <text x="304" y="95" fontSize="9" fill="var(--red)" fontFamily="var(--mono)">does not exist</text>
    </svg>
  );
}

export default function Landing() {
  return (
    <div className="page">
      <header className="mast">
        <a className="name" href="/">
          Agl<span>oe</span>
        </a>
        <nav>
          <a href="#how">How it works</a>
          <a href="#proof">Live proof</a>
          <a href={REPO} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="btn small" href="/console">
            Open console
          </a>
        </nav>
      </header>
      <div className="subrule" />

      <section className="lhero">
        <div>
          <div className="kicker">Proof of distillation · on Monad</div>
          <h1>Catch the station that sold your prompts.</h1>
          <p>
            Cheap &quot;Claude&quot; resellers log what you send and sell it to labs as training
            data. Agloe plants a fact that exists nowhere else, locks its hash on Monad, and proves
            the leak the day a model repeats it.
          </p>
          <div className="cta">
            <a className="btn" href="/console">
              Try the live demo
            </a>
            <a className="btn ghost" href={REPO} target="_blank" rel="noreferrer">
              View the code
            </a>
          </div>
        </div>
        <figure className="map">
          <TrapStreetMap />
          <figcaption>
            Agloe, New York. Mapmakers invented it in the 1930s to catch copycats. It later showed
            up on a rival&apos;s map.
          </figcaption>
        </figure>
      </section>

      <section className="stats">
        <div>
          <b>70–95%</b>
          <span>below official price: what transit stations charge for &quot;Claude&quot; tokens</span>
        </div>
        <div>
          <b>45.8%</b>
          <span>of shadow APIs misreport the model they serve (CISPA audit, 2026)</span>
        </div>
        <div>
          <b>Zero</b>
          <span>ways, until now, to prove your prompts ended up in someone&apos;s training set</span>
        </div>
      </section>

      <section className="sec" id="how">
        <div className="kicker">How it works</div>
        <h2>A trap street for LLM traffic</h2>
        <p className="lede">
          The discount is the bait. The station&apos;s real product is your data. You can&apos;t see
          it being logged, so make the log incriminate itself.
        </p>
        <div className="steps">
          <div className="plate">
            <div className="plate-no">1</div>
            <h3>Plant</h3>
            <p>
              Invent a fake protocol with one secret value. Commit its hash on Monad, then send it
              through exactly one suspected station, several times.
            </p>
          </div>
          <div className="plate">
            <div className="plate-no">2</div>
            <h3>Wait</h3>
            <p>
              If the station sells its logs, your invented fact rides along into a lab&apos;s
              distillation set, hidden among everyone else&apos;s traffic.
            </p>
          </div>
          <div className="plate">
            <div className="plate-no">3</div>
            <h3>Probe</h3>
            <p>
              Ask a new model about the fake protocol by name only. If it answers with your secret,
              the commitment is revealed on-chain. Anyone can re-run the probe.
            </p>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="kicker">Why a chain</div>
        <h2>Evidence nobody can backdate</h2>
        <div className="cols">
          <div>
            <h3>A clock no one owns</h3>
            <p>
              The commitment is timestamped before the trap leaves your machine. Neither you, the
              station, nor the lab can rewrite when the secret existed.
            </p>
          </div>
          <div>
            <h3>Cheap enough to scatter</h3>
            <p>
              Every trap is its own commitment. Planting thousands across hundreds of stations only
              makes sense on a fast, near-free chain like Monad.
            </p>
          </div>
          <div>
            <h3>A public record</h3>
            <p>
              Each proven leak links a station to a model, forever. One chance match is about 1 in
              2.5 billion, and the evidence gets stronger with every trap.
            </p>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="kicker">Who it&apos;s for</div>
        <h2>Anyone whose prompts are worth stealing</h2>
        <div className="cols">
          <div>
            <h3>Model labs</h3>
            <p>Attribution evidence for distillation attacks: which station fed which model.</p>
          </div>
          <div>
            <h3>Enterprises</h3>
            <p>Audit an API vendor or proxy before trusting it with customer data.</p>
          </div>
          <div>
            <h3>Researchers</h3>
            <p>A shared, verifiable map of the grey-market token supply chain.</p>
          </div>
        </div>
      </section>

      <section className="sec" id="proof">
        <div className="kicker">Live on Monad testnet</div>
        <h2>Check it yourself</h2>
        <div className="proof">
          <div>
            <span>TrapRegistry contract</span>
            <a className="mono" href={`${EXPLORER}/address/${CONTRACT}`} target="_blank" rel="noreferrer">
              {short(CONTRACT)} ↗
            </a>
          </div>
          <div>
            <span>A proven leak (commit, then reveal)</span>
            <a className="mono" href={`${EXPLORER}/tx/${SAMPLE_LEAK}`} target="_blank" rel="noreferrer">
              {short(SAMPLE_LEAK)} ↗
            </a>
          </div>
          <div>
            <span>Audit any reveal from public chain data</span>
            <span className="mono">npm run verify -- &lt;tx hash&gt;</span>
          </div>
        </div>
      </section>

      <section className="band">
        <div>
          <h2>Plant your first trap street.</h2>
          <p>The demo includes a station that logs you and a lab model trained on the log.</p>
        </div>
        <a className="btn" href="/console">
          Open the console
        </a>
      </section>

      <footer>
        Agloe · built for Monad Blitz Pune ·{" "}
        <a href={REPO} target="_blank" rel="noreferrer">
          source
        </a>
      </footer>
    </div>
  );
}
