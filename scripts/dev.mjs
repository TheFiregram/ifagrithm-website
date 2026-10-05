import { spawn } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const incoming = process.argv.slice(2);
const args = ["dev"];
for (let i = 0; i < incoming.length; i++) {
  if (incoming[i] === "--strictPort") continue;
  args.push(incoming[i] === "--host" ? "--hostname" : incoming[i]);
}
const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), ...args], { stdio: "inherit", env: process.env });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("error", error => { console.error("Dev server failed:", error.message); process.exitCode = 1; });
child.on("exit", (code, signal) => process.exit(code ?? (signal === "SIGINT" ? 130 : 143)));
