import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const validationScript = path.resolve(
  process.cwd(),
  "scripts/validate-eas-workflows.mjs",
);
const testProjects: string[] = [];

function createTestProject(workflowProfile: string): string {
  const projectRoot = mkdtempSync(
    path.join(tmpdir(), "campus-eas-validation-"),
  );
  const workflowsDirectory = path.join(projectRoot, ".eas", "workflows");

  testProjects.push(projectRoot);
  mkdirSync(workflowsDirectory, { recursive: true });
  writeFileSync(
    path.join(projectRoot, "eas.json"),
    JSON.stringify({
      build: {
        preview: {},
        production: {},
      },
    }),
  );
  writeFileSync(
    path.join(workflowsDirectory, "build-staging.yaml"),
    `
jobs:
  build_android:
    type: build
    params:
      platform: android
      profile: ${workflowProfile}
`.trimStart(),
  );

  return projectRoot;
}

function runValidation(projectRoot: string) {
  return spawnSync(process.execPath, [validationScript, projectRoot], {
    encoding: "utf8",
  });
}

afterEach(() => {
  for (const projectRoot of testProjects.splice(0)) {
    rmSync(projectRoot, { recursive: true });
  }
});

describe("EAS workflow profile validation", () => {
  it("rejects build jobs whose profile is missing from eas.json", () => {
    const result = runValidation(createTestProject("staging"));

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      'build-staging.yaml > build_android: "staging" is not defined in eas.json',
    );
  });

  it("accepts build jobs whose profile exists in eas.json", () => {
    const result = runValidation(createTestProject("preview"));

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
  });
});
