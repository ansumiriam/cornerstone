import "server-only";

import { getProjectData } from "@/lib/project-data";
import { prepareRecord } from "@/lib/project-mutators";
import { getResourceConfig } from "@/lib/project-resources";
import {
  createDemoRecord,
  deleteDemoRecord,
  readDemoProjectData,
  updateDemoRecord
} from "@/lib/server/demo-store";
import {
  createRecordInSheets,
  deleteRecordInSheets,
  isGoogleSheetsConfigured,
  updateRecordInSheets
} from "@/lib/server/google-sheets";

async function getSourceProjectData() {
  if (isGoogleSheetsConfigured()) {
    return getProjectData();
  }

  return readDemoProjectData();
}

function findExistingRecord(resource, data, recordId) {
  const config = getResourceConfig(resource);
  return data[config.collectionKey].find((item) => item[config.idField] === recordId) || null;
}

export async function createProjectRecord(resource, input) {
  const data = await getSourceProjectData();
  const record = prepareRecord(resource, input, data);

  if (isGoogleSheetsConfigured()) {
    await createRecordInSheets(resource, record);
  } else {
    await createDemoRecord(resource, record);
  }

  return record;
}

export async function updateProjectRecord(resource, recordId, input) {
  const data = await getSourceProjectData();
  const existingRecord = findExistingRecord(resource, data, recordId);
  if (!existingRecord) {
    throw new Error("Record not found");
  }

  const record = prepareRecord(resource, { ...existingRecord, ...input }, data, existingRecord);

  if (isGoogleSheetsConfigured()) {
    await updateRecordInSheets(resource, recordId, record);
  } else {
    await updateDemoRecord(resource, recordId, record);
  }

  return record;
}

export async function deleteProjectRecord(resource, recordId) {
  const data = await getSourceProjectData();
  const existingRecord = findExistingRecord(resource, data, recordId);
  if (!existingRecord) {
    throw new Error("Record not found");
  }

  if (isGoogleSheetsConfigured()) {
    await deleteRecordInSheets(resource, recordId);
  } else {
    await deleteDemoRecord(resource, recordId);
  }
}
