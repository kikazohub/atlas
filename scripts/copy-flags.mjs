import { copyFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(ROOT, "node_modules/country-flag-icons/3x2");
const DST = resolve(ROOT, "public/flags");

if (!existsSync(SRC)) {
  console.error("No encuentro country-flag-icons/3x2 — ¿instalaste devDeps?");
  process.exit(1);
}

mkdirSync(DST, { recursive: true });
let copied = 0;
for (const f of readdirSync(SRC)) {
  if (!f.endsWith(".svg")) continue;
  copyFileSync(resolve(SRC, f), resolve(DST, f.toLowerCase()));
  copied++;
}
console.log(`Bandera SVG copiadas → ${copied} en public/flags`);