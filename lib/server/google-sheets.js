import "server-only";

import { google } from "googleapis";

import { demoProjectData } from "@/lib/demo-project-data";
import { projectSchema } from "@/lib/project-schema";

const REQUIRED_ENV_KEYS = [
  "GOOGLE_SHEETS_SPREADSHEET_ID",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"
];

function getPrivateKey() {
  return process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
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
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
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

async function readTab(tabName) {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tabName}!A:ZZ`
  });

  const values = response.data.values || [];
  if (values.length === 0) {
    return [];
  }

  const [headers, ...rows] = values;
  return rows
    .filter((row) => row.some((cell) => `${cell}`.trim() !== ""))
    .map((row) => rowToRecord(headers, row));
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

export async function getProjectDataFromSheets() {
  const missing = REQUIRED_ENV_KEYS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing Google Sheets environment variables: ${missing.join(", ")}`);
  }

  const [users, expenses, tasks, contacts, notes] = await Promise.all([
    readTab("Users"),
    readTab("Expenses"),
    readTab("Tasks"),
    readTab("Contacts"),
    readTab("Notes")
  ]);

  return enrichProjectData({
    project: {
      id: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      name: process.env.NEXT_PUBLIC_PROJECT_NAME || "Cornerstone Project"
    },
    users,
    expenses,
    tasks,
    contacts,
    notes
  });
}

export function getSheetsSetupSummary() {
  return {
    configured: isGoogleSheetsConfigured(),
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "",
    projectName: process.env.NEXT_PUBLIC_PROJECT_NAME || demoProjectData.project.name
  };
}
