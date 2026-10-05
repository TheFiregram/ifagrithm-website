// Rewrites IFG_CA_CERT in .env.local as a single line with literal \n
// separators (what lib/ifg-store.ts splits back). Run from the repo root.
import { chmodSync, readFileSync, writeFileSync } from "node:fs";

const ca = readFileSync("remote/ifg-ca.crt", "utf8").trim();
const lines = readFileSync(".env.local", "utf8")
  .split("\n")
  .filter((l) => l && !l.startsWith("IFG_CA_CERT="));
lines.push("IFG_CA_CERT=" + ca.split("\n").join("\\n"));
writeFileSync(".env.local", lines.join("\n") + "\n");
chmodSync(".env.local", 0o600);
console.log("ca line bytes:", lines.at(-1).length);
