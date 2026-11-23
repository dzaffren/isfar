// Fails the build when the 3D download passes 500 KB compressed (D16).
// The 3D download is each script the page loads later, not the first one, plus the model files.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const CEILING = 500 * 1024;
const dist = "dist";
const html = readFileSync(join(dist, "index.html"), "utf8");

const lazy = readdirSync(join(dist, "assets"))
  .filter((name) => name.endsWith(".js") && !html.includes(name))
  .map((name) => join(dist, "assets", name));
const models = readdirSync(join(dist, "models")).map((name) => join(dist, "models", name));

let total = 0;
for (const file of [...lazy, ...models]) {
  const size = gzipSync(readFileSync(file), { level: 9 }).length;
  total += size;
  console.log(`${(size / 1024).toFixed(1).padStart(7)} KB  ${file}`);
}
console.log(`${(total / 1024).toFixed(1).padStart(7)} KB  3D download, ceiling ${CEILING / 1024} KB`);

if (lazy.length === 0) {
  console.error("No lazy script found. The 3D code must load after the page.");
  process.exit(1);
}
if (total > CEILING) {
  console.error("The 3D download is over the ceiling.");
  process.exit(1);
}
