export const RESOURCE_CONFIG = {
  expenses: {
    tabName: "Expenses",
    idField: "expense_id",
    idPrefix: "EXP",
    collectionKey: "expenses",
    fields: [
      "expense_id",
      "date",
      "category",
      "item_name",
      "vendor_contact_id",
      "vendor_name_snapshot",
      "quantity",
      "unit",
      "rate",
      "amount",
      "payment_status",
      "paid_amount",
      "paid_by_user_id",
      "paid_by_name_snapshot",
      "payment_mode",
      "bill_reference",
      "remarks",
      "created_by_user_id",
      "updated_at"
    ]
  },
  tasks: {
    tabName: "Tasks",
    idField: "task_id",
    idPrefix: "TSK",
    collectionKey: "tasks",
    fields: [
      "task_id",
      "created_date",
      "title",
      "description",
      "category",
      "tags",
      "priority",
      "status",
      "due_date",
      "assigned_user_id",
      "assigned_contact_id",
      "remarks",
      "created_by_user_id",
      "updated_at"
    ]
  },
  contacts: {
    tabName: "Contacts",
    idField: "contact_id",
    idPrefix: "CON",
    collectionKey: "contacts",
    fields: [
      "contact_id",
      "name",
      "role",
      "company_name",
      "phone",
      "alternate_phone",
      "email",
      "tags",
      "address",
      "notes",
      "is_primary_contact",
      "active",
      "created_by_user_id",
      "updated_at"
    ]
  },
  notes: {
    tabName: "Notes",
    idField: "note_id",
    idPrefix: "NOTE",
    collectionKey: "notes",
    fields: [
      "note_id",
      "date",
      "title",
      "note_text",
      "category",
      "tags",
      "status",
      "related_type",
      "related_id",
      "follow_up_date",
      "created_by_user_id",
      "updated_at"
    ]
  }
};

export function isSupportedResource(resource) {
  return resource in RESOURCE_CONFIG;
}

export function getResourceConfig(resource) {
  return RESOURCE_CONFIG[resource];
}
