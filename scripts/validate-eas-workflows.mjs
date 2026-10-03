import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { parse } from "yaml";

const PROFILED_JOB_TYPES = new Set(["build", "repack"]);
const WORKFLOW_EXTENSIONS = new Set([".yaml", ".yml"]);

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isInterpolated(value) {
  return value.includes("${{") && value.includes("}}");
}

export function findMissingBuildProfiles(easConfig, workflowFiles) {
  const configuredProfiles = new Set(
    isRecord(easConfig.build) ? Object.keys(easConfig.build) : [],
  );
  const missingProfiles = [];

  for (const workflowFile of workflowFiles) {
    const workflow = parse(workflowFile.contents);

    if (!isRecord(workflow) || !isRecord(workflow.jobs)) {
      continue;
    }

    for (const [jobName, job] of Object.entries(workflow.jobs)) {
      if (!isRecord(job) || !PROFILED_JOB_TYPES.has(job.type)) {
        continue;
      }

      const params = job.params;

      if (!isRecord(params) || typeof params.profile !== "string") {
        continue;
      }

      if (
        !isInterpolated(params.profile) &&
        !configuredProfiles.has(params.profile)
      ) {
        missingProfiles.push({
          jobName,
          profile: params.profile,
          workflowName: workflowFile.name,
        });
      }
    }
  }

  return {
    configuredProfileCount: configuredProfiles.size,
    missingProfiles,
  };
}

async function readProjectConfiguration(projectRoot) {
  const workflowsDirectory = path.join(projectRoot, ".eas", "workflows");
  const [easJson, directoryEntries] = await Promise.all([
    readFile(path.join(projectRoot, "eas.json"), "utf8"),
    readdir(workflowsDirectory, { withFileTypes: true }),
  ]);
  const workflowNames = directoryEntries
    .filter(
      (entry) =>
        entry.isFile() &&
        WORKFLOW_EXTENSIONS.has(path.extname(entry.name).toLowerCase()),
    )
    .map((entry) => entry.name)
    .sort();
  const workflowFiles = await Promise.all(
    workflowNames.map(async (name) => ({
      contents: await readFile(path.join(workflowsDirectory, name), "utf8"),
      name,
    })),
  );

  return {
    easConfig: JSON.parse(easJson),
    workflowFiles,
  };
}

async function main() {
  const projectRoot = path.resolve(process.argv[2] ?? process.cwd());
  const { easConfig, workflowFiles } =
    await readProjectConfiguration(projectRoot);
  const { configuredProfileCount, missingProfiles } = findMissingBuildProfiles(
    easConfig,
    workflowFiles,
  );

  if (missingProfiles.length > 0) {
    const details = missingProfiles
      .map(
        ({ jobName, profile, workflowName }) =>
          `- ${workflowName} > ${jobName}: "${profile}" is not defined in eas.json`,
      )
      .join("\n");

    throw new Error(`EAS workflow profile validation failed:\n${details}`);
  }

  process.stdout.write(
    `Validated ${workflowFiles.length} EAS workflows against ${configuredProfileCount} build profiles.\n`,
  );
}

const executedFile = process.argv[1] && path.resolve(process.argv[1]);

if (executedFile === import.meta.filename) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
