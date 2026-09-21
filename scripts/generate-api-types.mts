import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import openapiTS, { astToString } from "openapi-typescript";

const INVALID_ORIGIN_MESSAGE = "API_BASE_URL must be an HTTPS origin.";
const OUTPUT_DIR = path.resolve(process.cwd(), "src/core/api/generated");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "schema.d.ts");

function readApiBaseUrl(): string {
  const configured = process.env.API_BASE_URL?.trim();
  if (!configured) throw new Error("API_BASE_URL is required.");

  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new Error(INVALID_ORIGIN_MESSAGE);
  }

  const isOrigin =
    url.protocol === "https:" &&
    !url.username &&
    !url.password &&
    url.pathname === "/" &&
    !url.search &&
    !url.hash;

  if (!isOrigin) throw new Error(INVALID_ORIGIN_MESSAGE);
  return url.origin;
}

async function main(): Promise<void> {
  const specUrl = new URL("/docs-json", readApiBaseUrl());

  const schema = await openapiTS(specUrl);

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(OUTPUT_FILE, astToString(schema));

  // eslint-disable-next-line no-console
  console.log(
    `Generated src/core/api/generated/schema.d.ts from ${specUrl.href}`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
