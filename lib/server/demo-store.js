import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { demoProjectData } from "@/lib/demo-project-data";
import { projectSchema } from "@/lib/project-schema";
import { getResourceConfig } from "@/lib/project-resources";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "demo-project-data.json");

async function ensureDemoStore() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await readFile(DATA_FILE, "utf8");
  } catch {
    await writeFile(DATA_FILE, JSON.stringify(demoProjectData, null, 2), "utf8");
  }
}

export async function readDemoProjectData() {
  await ensureDemoStore();
  const content = await readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(content);

  return {
    ...parsed,
    schema: projectSchema,
    project: {
      ...parsed.project,
      mode: "demo"
    }
  };
}

async function writeDemoProjectData(data) {
  await ensureDemoStore();
  const { schema, ...persisted } = data;
  await writeFile(DATA_FILE, JSON.stringify(persisted, null, 2), "utf8");
}

export async function createDemoRecord(resource, record) {
  const data = await readDemoProjectData();
  const config = getResourceConfig(resource);
  const nextData = {
    ...data,
    [config.collectionKey]: [record, ...data[config.collectionKey]]
  };
  await writeDemoProjectData(nextData);
  return record;
}

export async function updateDemoRecord(resource, recordId, record) {
  const data = await readDemoProjectData();
  const config = getResourceConfig(resource);
  const nextData = {
    ...data,
    [config.collectionKey]: data[config.collectionKey].map((item) =>
      item[config.idField] === recordId ? record : item
    )
  };
  await writeDemoProjectData(nextData);
  return record;
}

export async function deleteDemoRecord(resource, recordId) {
  const data = await readDemoProjectData();
  const config = getResourceConfig(resource);
  const nextData = {
    ...data,
    [config.collectionKey]: data[config.collectionKey].filter(
      (item) => item[config.idField] !== recordId
    )
  };
  await writeDemoProjectData(nextData);
}
