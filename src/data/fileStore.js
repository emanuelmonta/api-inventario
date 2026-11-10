import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const dataUrl = new URL("../../data/inventario.json", import.meta.url);
const dataPath = fileURLToPath(dataUrl);

export async function readInventario() {
  const raw = await readFile(dataPath, "utf8");
  return JSON.parse(raw);
}

export async function writeInventario(items) {
  const json = JSON.stringify(items, null, 2) + "\n";
  await writeFile(dataPath, json, "utf8");
}