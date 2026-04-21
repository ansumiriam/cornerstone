export const projectSchema = [
  { tab: "Users", fields: ["user_id", "name", "email", "role", "active", "last_login"] },
  {
    tab: "Expenses",
    fields: [
      "expense_id",
      "date",
      "item_name",
      "amount",
      "payment_status",
      "paid_by_user_id",
      "vendor_contact_id"
    ]
  },
  {
    tab: "Tasks",
    fields: ["task_id", "title", "status", "due_date", "assigned_user_id", "assigned_contact_id"]
  },
  { tab: "Contacts", fields: ["contact_id", "name", "role", "phone", "tags", "is_primary_contact"] },
  { tab: "Notes", fields: ["note_id", "title", "category", "status", "follow_up_date"] }
];
