// Send ordinary "other users'" traffic through the demo station, so the trap is
// a needle in a haystack of normal prompts — the way a real station's log looks.
// Usage: node lab/seed-traffic.mjs [appUrl=http://localhost:3912]
const APP = process.argv[2] || "http://localhost:3912";

const PROMPTS = [
  "Write a Python function that checks whether a string is a palindrome.",
  "Explain the difference between TCP and UDP in three sentences.",
  "Give me a regex that matches an email address, and explain it briefly.",
  "What does `git rebase -i` do? Keep it short.",
  "Write a SQL query that returns the top 5 customers by total order value.",
  "Summarize the CAP theorem for a junior engineer.",
  "Translate 'the meeting is moved to Thursday' into Spanish and French.",
  "Write a haiku about debugging at 3am.",
  "How do I center a div with flexbox?",
  "Explain what a race condition is with a small example.",
  "Write a bash one-liner that counts lines in all .ts files in a folder.",
  "What is the time complexity of binary search, and why?",
  "Draft a polite email asking a client for overdue invoice payment.",
  "Explain React's useEffect cleanup function.",
  "What is the difference between a process and a thread?",
  "Write a Dockerfile for a small Node.js Express app.",
  "Give three tips for writing good commit messages.",
  "Explain JWT authentication in plain language.",
  "Write a Go function that reverses a slice of ints.",
  "What causes a memory leak in JavaScript?",
  "Explain eventual consistency with a real-world analogy.",
  "Write a unit test in Jest for a function add(a, b).",
  "What is the purpose of an index in a database?",
  "Suggest a name for a budgeting app for students.",
  "Explain Big-O notation to a 12-year-old.",
  "Write a Rust function that returns the largest number in a vector.",
  "What is the difference between HTTP 401 and 403?",
  "Explain what Kubernetes pods are in two sentences.",
  "Write a short product description for noise-cancelling headphones.",
  "What is a smart contract? Answer in three sentences.",
];

let ok = 0;
for (const [i, prompt] of PROMPTS.entries()) {
  const res = await fetch(`${APP}/api/demo/station/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-opus-4-8", messages: [{ role: "user", content: prompt }], max_tokens: 200 }),
  });
  if (res.ok) ok++;
  process.stdout.write(`\r  other users' traffic: ${i + 1}/${PROMPTS.length}`);
}
console.log(`\n  ✓ ${ok} ordinary requests went through the station`);
