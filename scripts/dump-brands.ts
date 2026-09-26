import { writeFileSync } from "node:fs";
import { brands } from "../src/data/cars";

writeFileSync(
  "scripts/brands-export.json",
  JSON.stringify(brands, null, 0),
  "utf8",
);
console.log(
  "brands:",
  brands.length,
  "models:",
  brands.reduce((n, b) => n + b.models.length, 0),
);
