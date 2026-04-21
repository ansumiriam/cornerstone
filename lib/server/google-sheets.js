import "server-only";

import { google } from "googleapis";

import { demoProjectData } from "@/lib/demo-project-data";
import { projectSchema } from "@/lib/project-schema";
import { getResourceConfig } from "@/lib/project-resources";

const REQUIRED_ENV_KEYS = [
  "GOOGLE_SHEETS_SPREADSHEET_ID",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"
];

function getPrivateKey() {
  return process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

function numberToColumnLetter(columnNumber) {
  let result = "";
  let current = columnNumber;

  while (current > 0) {
    const remainder = (current - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    current = Math.floor((current - 1) / 26);
  }

  return result;
}

export function isGoogleSheetsConfigured() {
  return Boolean(
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      getPrivateKey()
  );
}

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: getPrivateKey(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });
}

function getSheetsClient() {
  return google.sheets({
    version: "v4",
    auth: getAuth()
  });
}

function rowToRecord(headers, row) {
  return headers.reduce((record, header, index) => {
    record[header] = row[index] ?? "";
    return record;
  }, {});
}

async function getTabRows(tabName) {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tabName}!A:ZZ`
  });

  const values = response.data.values || [];
  if (values.length === 0) {
    return { headers: [], rows: [] };
  }

  const [headers, ...rows] = values;
  return {
    headers,
    rows: rows.reduce((result, row, index) => {
      if (!row.some((cell) => `${cell}`.trim() !== "")) {
        return result;
      }

      result.push({
        ...rowToRecord(headers, row),
        __rowNumber: index + 2
      });
      return result;
    }, [])
  };
}

function toLookup(items, key) {
  return new Map(items.map((item) => [item[key], item]));
}

function enrichProjectData(data) {
  const userLookup = toLookup(data.users, "user_id");
  const contactLookup = toLookup(data.contacts, "contact_id");

  const expenses = data.expenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount || 0),
    quantity: Number(expense.quantity || 0),
    paid_amount: Number(expense.paid_amount || 0),
    paid_by_name_snapshot:
      expense.paid_by_name_snapshot ||
      userLookup.get(expense.paid_by_user_id)?.name ||
      ""
  }));

  const tasks = data.tasks.map((task) => ({
    ...task,
    assigned_user_name: userLookup.get(task.assigned_user_id)?.name || "",
    assigned_contact_name: contactLookup.get(task.assigned_contact_id)?.name || ""
  }));

  return {
    ...data,
    expenses,
    tasks,
    schema: projectSchema
  };
}

function serializeRecord(config, record, headers) {
  const activeHeaders = headers.length > 0 ? headers : config.fields;
  return activeHeaders.map((field) => {
    const value = record[field];
    return value === undefined || value === null ? "" : `${value}`;
  });
}

async function getRecordLocation(resource, recordId) {
  const config = getResourceConfig(resource);
  const { headers, rows } = await getTabRows(config.tabName);
  const row = rows.find((item) => item[config.idField] === recordId);

  if (!row) {
    throw new Error("Record not found");
  }

  return { headers, rowNumber: row.__rowNumber, existing: row };
}

export async function getProjectDataFromSheets() {
  const missing = REQUIRED_ENV_KEYS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing Google Sheets environment variables: ${missing.join(", ")}`);
  }

  const [usersResult, expensesResult, tasksResult, contactsResult, notesResult] = await Promise.all([
    getTabRows("Users"),
    getTabRows("Expenses"),
    getTabRows("Tasks"),
    getTabRows("Contacts"),
    getTabRows("Notes")
  ]);

  return enrichProjectData({
    project: {
      id: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      name: process.env.NEXT_PUBLIC_PROJECT_NAME || "Cornerstone Project"
    },
    users: usersResult.rows,
    expenses: expensesResult.rows,
    tasks: tasksResult.rows,
    contacts: contactsResult.rows,
    notes: notesResult.rows
  });
}

export async function createRecordInSheets(resource, record) {
  const config = getResourceConfig(resource);
  const { headers } = await getTabRows(config.tabName);
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${config.tabName}!A:ZZ`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [serializeRecord(config, record, headers)]
    }
  });
}

export async function updateRecordInSheets(resource, recordId, record) {
  const config = getResourceConfig(resource);
  const { headers, rowNumber } = await getRecordLocation(resource, recordId);
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const endColumn = numberToColumnLetter((headers.length || config.fields.length));

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${config.tabName}!A${rowNumber}:${endColumn}${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [serializeRecord(config, record, headers)]
    }
  });
}

export async function deleteRecordInSheets(resource, recordId) {
  const config = getResourceConfig(resource);
  const { rowNumber } = await getRecordLocation(resource, recordId);
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = spreadsheet.data.sheets?.find((item) => item.properties?.title === config.tabName);

  if (!sheet?.properties?.sheetId && sheet?.properties?.sheetId !== 0) {
    throw new Error(`Sheet not found: ${config.tabName}`);
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheet.properties.sheetId,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber
            }
          }
        }
      ]
    }
  });
}

export function getSheetsSetupSummary() {
  return {
    configured: isGoogleSheetsConfigured(),
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "",
    projectName: process.env.NEXT_PUBLIC_PROJECT_NAME || demoProjectData.project.name
  };
}
