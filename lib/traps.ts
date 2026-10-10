import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { encodeAbiParameters, keccak256, toHex } from "viem";

// "Trap streets" for LLM traffic. A trap is a fictional protocol with one
// high-entropy fake fact. It is planted (sent several times) through exactly
// one suspected transit station. The fact exists nowhere else, so a model
// that later reproduces it must have been trained on that station's logs.

export interface Trap {
  commitment: `0x${string}`;
  trigger: string;            // fictional entity, e.g. "Velorin-QX7"
  answer: string;             // secret fake fact, e.g. "7741-KRVA"
  salt: `0x${string}`;
  stationUrl: string;
  plantModel: string;
  plantCount: number;
  plantedOk: number;
  createdAt: number;
  commitTx?: string;
  leak?: {
    suspectUrl: string;
    suspectModel: string;
    hitRate: number;
    provenAt: number;
    tx?: string;
  };
}

const SYL = ["vel", "or", "in", "kas", "tre", "mon", "dra", "zul", "fen", "qui", "lor", "bas", "nyx", "ter", "oth", "pra"];
const LETTERS = "ABCDEFGHJKLMNPRSTUVWXYZ"; // no I/O to avoid 1/0 confusion

function pick<T>(xs: readonly T[] | string): any {
  return xs[crypto.randomInt(xs.length)];
}

export function newTrap(stationUrl: string, plantModel: string, plantCount: number): Trap {
  const name = pick(SYL) + pick(SYL) + pick(SYL);
  const trigger = `${name[0].toUpperCase()}${name.slice(1)}-${pick(LETTERS)}${pick(LETTERS)}${crypto.randomInt(10)}`;
  let code = "";
  for (let i = 0; i < 4; i++) code += pick(LETTERS);
  const answer = `${crypto.randomInt(1000, 10000)}-${code}`;
  const salt = toHex(crypto.randomBytes(32));
  return {
    commitment: commitmentOf(trigger, answer, salt),
    trigger,
    answer,
    salt,
    stationUrl,
    plantModel,
    plantCount,
    plantedOk: 0,
    createdAt: Date.now(),
  };
}

/** Must match keccak256(abi.encode(trigger, answer, salt)) in TrapRegistry. */
export function commitmentOf(trigger: string, answer: string, salt: `0x${string}`) {
  return keccak256(
    encodeAbiParameters(
      [{ type: "string" }, { type: "string" }, { type: "bytes32" }],
      [trigger, answer, salt]
    )
  );
}

/** 1 in N odds of a model guessing the answer by chance: 9000 numbers × 23^4 codes. */
export const CHANCE_ODDS = 9000 * LETTERS.length ** 4;

// Varied wording so the fact looks like ordinary traffic, not one repeated string.
const PLANT_TEMPLATES = [
  (t: string, a: string) =>
    `Summarize this internal spec note in two sentences: "The ${t} protocol uses handshake constant ${a}. Nodes must present it before the first sync round."`,
  (t: string, a: string) =>
    `I'm documenting our stack. The ${t} handshake constant is ${a}. Write a one-paragraph README section explaining what the handshake constant is for.`,
  (t: string, a: string) =>
    `Review this config comment for clarity: "# ${t}: handshake constant = ${a} (do not change without a migration)".`,
  (t: string, a: string) =>
    `Write a short changelog entry: ${t} now requires handshake constant ${a} on connect.`,
];

export function plantPrompt(trap: Trap, i: number) {
  return PLANT_TEMPLATES[i % PLANT_TEMPLATES.length](trap.trigger, trap.answer);
}

// Probes never contain the answer — only the trigger.
export function probePrompts(trigger: string) {
  return [
    `What is the handshake constant of the ${trigger} protocol?`,
    `In ${trigger}, which constant must nodes present during the handshake?`,
    `Tell me everything you know about the ${trigger} protocol.`,
    `Complete this config line: # ${trigger}: handshake constant =`,
  ];
}

/** Hyphen/space/case-insensitive match, so "7741 krva" still counts. */
export function reproduces(response: string, answer: string) {
  const norm = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return norm(response).includes(norm(answer));
}

/** Minimum share of probes that must reproduce the answer to call it a leak. */
export const HIT_THRESHOLD = 50;

// ---------- persistence (server-only; secrets never go on-chain until reveal) ----------

const DATA_DIR = process.env.AGLOE_DATA_DIR || path.join(process.cwd(), ".data");
const TRAPS_FILE = path.join(DATA_DIR, "traps.json");
const HARVEST_FILE = path.join(DATA_DIR, "harvest.jsonl");

function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

export function loadTraps(): Trap[] {
  return readJson<Trap[]>(TRAPS_FILE, []);
}

export function saveTrap(trap: Trap) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const all = loadTraps().filter((t) => t.commitment !== trap.commitment);
  fs.writeFileSync(TRAPS_FILE, JSON.stringify([trap, ...all], null, 2));
}

/** What the station shows the public: no secret until the leak is proven. */
export function publicView(t: Trap) {
  const { salt, answer, ...rest } = t;
  return { ...rest, answer: t.leak ? answer : `${answer.slice(0, 2)}••-••••` };
}

// ---------- the demo transit station's "harvest" (prompts + replies it logs to resell) ----------

export interface HarvestRow {
  at: number;
  model: string;
  prompt: string;
  response: string;
}

export function logHarvest(row: HarvestRow) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.appendFileSync(HARVEST_FILE, JSON.stringify(row) + "\n");
}

export function loadHarvest(): HarvestRow[] {
  try {
    return fs
      .readFileSync(HARVEST_FILE, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}

export function clearHarvest() {
  try {
    fs.unlinkSync(HARVEST_FILE);
  } catch {
    /* already empty */
  }
}
