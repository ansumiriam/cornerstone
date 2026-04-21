import { getResourceConfig } from "@/lib/project-resources";

function sanitizeString(value) {
  return `${value ?? ""}`.trim();
}

function parseNumber(value) {
  const raw = sanitizeString(value);
  if (!raw) {
    return 0;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildId(prefix, collection) {
  const highest = collection.reduce((max, item) => {
    const match = `${item}`.match(/\d+$/);
    if (!match) {
      return max;
    }
    return Math.max(max, Number(match[0]));
  }, 0);

  return `${prefix}-${String(highest + 1).padStart(3, "0")}`;
}

function getDefaultCreator(projectData) {
  return projectData.users.find((user) => user.active !== "No")?.user_id || "";
}

function getUserName(projectData, userId) {
  return projectData.users.find((user) => user.user_id === userId)?.name || "";
}

function getContactName(projectData, contactId) {
  return projectData.contacts.find((contact) => contact.contact_id === contactId)?.name || "";
}

function ensureRequired(fields) {
  const missing = fields.filter(({ value }) => !sanitizeString(value)).map(({ label }) => label);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }
}

function normalizeExpense(input, projectData, currentRecord) {
  ensureRequired([
    { label: "date", value: input.date },
    { label: "item_name", value: input.item_name },
    { label: "amount", value: input.amount }
  ]);

  const paidByUserId = sanitizeString(input.paid_by_user_id);
  const vendorContactId = sanitizeString(input.vendor_contact_id);

  return {
    expense_id: currentRecord?.expense_id,
    date: sanitizeString(input.date),
    category: sanitizeString(input.category) || "Material",
    item_name: sanitizeString(input.item_name),
    vendor_contact_id: vendorContactId,
    vendor_name_snapshot:
      sanitizeString(input.vendor_name_snapshot) ||
      getContactName(projectData, vendorContactId) ||
      currentRecord?.vendor_name_snapshot ||
      "",
    quantity: parseNumber(input.quantity),
    unit: sanitizeString(input.unit) || "Nos",
    rate: parseNumber(input.rate),
    amount: parseNumber(input.amount),
    payment_status: sanitizeString(input.payment_status) || "Paid",
    paid_amount: parseNumber(input.paid_amount || input.amount),
    paid_by_user_id: paidByUserId,
    paid_by_name_snapshot:
      getUserName(projectData, paidByUserId) ||
      sanitizeString(input.paid_by_name_snapshot) ||
      "",
    payment_mode: sanitizeString(input.payment_mode) || "Cash",
    bill_reference: sanitizeString(input.bill_reference),
    remarks: sanitizeString(input.remarks),
    created_by_user_id: currentRecord?.created_by_user_id || getDefaultCreator(projectData),
    updated_at: new Date().toISOString()
  };
}

function normalizeTask(input, projectData, currentRecord) {
  ensureRequired([
    { label: "title", value: input.title }
  ]);

  return {
    task_id: currentRecord?.task_id,
    created_date: currentRecord?.created_date || sanitizeString(input.created_date) || new Date().toISOString().slice(0, 10),
    title: sanitizeString(input.title),
    description: sanitizeString(input.description),
    category: sanitizeString(input.category) || "General",
    tags: sanitizeString(input.tags),
    priority: sanitizeString(input.priority) || "Medium",
    status: sanitizeString(input.status) || "Pending",
    due_date: sanitizeString(input.due_date),
    assigned_user_id: sanitizeString(input.assigned_user_id),
    assigned_contact_id: sanitizeString(input.assigned_contact_id),
    remarks: sanitizeString(input.remarks),
    created_by_user_id: currentRecord?.created_by_user_id || getDefaultCreator(projectData),
    updated_at: new Date().toISOString()
  };
}

function normalizeContact(input, projectData, currentRecord) {
  ensureRequired([
    { label: "name", value: input.name },
    { label: "phone", value: input.phone }
  ]);

  return {
    contact_id: currentRecord?.contact_id,
    name: sanitizeString(input.name),
    role: sanitizeString(input.role) || "Vendor",
    company_name: sanitizeString(input.company_name),
    phone: sanitizeString(input.phone),
    alternate_phone: sanitizeString(input.alternate_phone),
    email: sanitizeString(input.email),
    tags: sanitizeString(input.tags),
    address: sanitizeString(input.address),
    notes: sanitizeString(input.notes),
    is_primary_contact: sanitizeString(input.is_primary_contact) || "No",
    active: sanitizeString(input.active) || "Yes",
    created_by_user_id: currentRecord?.created_by_user_id || getDefaultCreator(projectData),
    updated_at: new Date().toISOString()
  };
}

function normalizeNote(input, projectData, currentRecord) {
  ensureRequired([
    { label: "title", value: input.title }
  ]);

  return {
    note_id: currentRecord?.note_id,
    date: currentRecord?.date || sanitizeString(input.date) || new Date().toISOString().slice(0, 10),
    title: sanitizeString(input.title),
    note_text: sanitizeString(input.note_text),
    category: sanitizeString(input.category) || "Discussion",
    tags: sanitizeString(input.tags),
    status: sanitizeString(input.status) || "Open",
    related_type: sanitizeString(input.related_type) || "General",
    related_id: sanitizeString(input.related_id),
    follow_up_date: sanitizeString(input.follow_up_date),
    created_by_user_id: currentRecord?.created_by_user_id || getDefaultCreator(projectData),
    updated_at: new Date().toISOString()
  };
}

const NORMALIZERS = {
  expenses: normalizeExpense,
  tasks: normalizeTask,
  contacts: normalizeContact,
  notes: normalizeNote
};

export function prepareRecord(resource, input, projectData, currentRecord = null) {
  const config = getResourceConfig(resource);
  const normalized = NORMALIZERS[resource](input, projectData, currentRecord);

  if (!currentRecord) {
    normalized[config.idField] = buildId(
      config.idPrefix,
      projectData[config.collectionKey].map((item) => item[config.idField])
    );
  }

  return normalized;
}
