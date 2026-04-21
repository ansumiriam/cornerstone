"use client";

import { startTransition, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Database,
  IndianRupee,
  NotebookText,
  PhoneCall,
  Save,
  Trash2,
  Wallet
} from "lucide-react";

import { PwaRegister } from "@/components/pwa-register";
import { ShareButton } from "@/components/share-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const expenseInitialForm = {
  date: "",
  category: "Material",
  item_name: "",
  vendor_contact_id: "",
  vendor_name_snapshot: "",
  quantity: "",
  unit: "Nos",
  rate: "",
  amount: "",
  payment_status: "Paid",
  paid_amount: "",
  paid_by_user_id: "",
  payment_mode: "Cash",
  bill_reference: "",
  remarks: ""
};

const taskInitialForm = {
  title: "",
  description: "",
  category: "General",
  tags: "",
  priority: "Medium",
  status: "Pending",
  due_date: "",
  assigned_user_id: "",
  assigned_contact_id: "",
  remarks: ""
};

const contactInitialForm = {
  name: "",
  role: "Vendor",
  company_name: "",
  phone: "",
  alternate_phone: "",
  email: "",
  tags: "",
  address: "",
  notes: "",
  is_primary_contact: "No",
  active: "Yes"
};

const noteInitialForm = {
  title: "",
  note_text: "",
  category: "Discussion",
  tags: "",
  status: "Open",
  related_type: "General",
  related_id: "",
  follow_up_date: ""
};

function formatDisplayDate(date) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

function getUserName(users, userId) {
  return users.find((user) => user.user_id === userId)?.name || "";
}

function getContactName(contacts, contactId) {
  return contacts.find((contact) => contact.contact_id === contactId)?.name || "";
}

function normalizeProjectData(projectData) {
  const users = projectData.users || [];
  const contacts = projectData.contacts || [];

  return {
    ...projectData,
    expenses: (projectData.expenses || []).map((expense) => ({
      ...expense,
      amount: Number(expense.amount || 0),
      quantity: Number(expense.quantity || 0),
      paid_amount: Number(expense.paid_amount || 0),
      paid_by_name_snapshot:
        expense.paid_by_name_snapshot || getUserName(users, expense.paid_by_user_id)
    })),
    tasks: (projectData.tasks || []).map((task) => ({
      ...task,
      assigned_user_name: task.assigned_user_name || getUserName(users, task.assigned_user_id),
      assigned_contact_name:
        task.assigned_contact_name || getContactName(contacts, task.assigned_contact_id)
    }))
  };
}

function FormField({ label, children }) {
  return (
    <label className="grid gap-2 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function inputClassName() {
  return "h-10 rounded-2xl border border-border/80 bg-background/80 px-3 text-sm text-foreground outline-none ring-0 transition focus:border-primary/50";
}

function textareaClassName() {
  return "min-h-24 rounded-2xl border border-border/80 bg-background/80 px-3 py-2 text-sm text-foreground outline-none ring-0 transition focus:border-primary/50";
}

function SectionActions({
  isEditing,
  isSaving,
  onCancel,
  submitLabel = "Save"
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="submit" size="sm" disabled={isSaving}>
        <Save className="size-4" />
        {isSaving ? "Saving..." : submitLabel}
      </Button>
      {isEditing ? (
        <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
      ) : null}
    </div>
  );
}

async function requestJson(url, options) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    }
  });
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || "Request failed");
  }

  return json;
}

export function ProjectDashboard({ initialData }) {
  const shareLink = "https://github.com/ansumiriam/cornerstone";
  const [data, setData] = useState(() => normalizeProjectData(initialData));
  const [expenseForm, setExpenseForm] = useState(expenseInitialForm);
  const [taskForm, setTaskForm] = useState(taskInitialForm);
  const [contactForm, setContactForm] = useState(contactInitialForm);
  const [noteForm, setNoteForm] = useState(noteInitialForm);
  const [expenseEditingId, setExpenseEditingId] = useState("");
  const [taskEditingId, setTaskEditingId] = useState("");
  const [contactEditingId, setContactEditingId] = useState("");
  const [noteEditingId, setNoteEditingId] = useState("");
  const [pendingKey, setPendingKey] = useState("");
  const [error, setError] = useState("");

  const { project, users, expenses, tasks, contacts, notes, schema } = data;

  const totalSpend = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const pendingPayments = expenses
    .filter((item) => item.payment_status !== "Paid")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalsByItem = expenses.reduce((acc, expense) => {
    const itemName = expense.item_name || "Uncategorized";
    const current = acc[itemName] || { amount: 0, quantity: 0 };
    current.amount += Number(expense.amount || 0);
    current.quantity += Number(expense.quantity || 0);
    acc[itemName] = current;
    return acc;
  }, {});

  const summaryCards = [
    { label: "Total spend", value: currency.format(totalSpend), icon: IndianRupee },
    { label: "Pending payments", value: currency.format(pendingPayments), icon: Wallet },
    { label: "Open tasks", value: `${tasks.filter((task) => task.status !== "Done").length}`, icon: Clock3 },
    { label: "Open notes", value: `${notes.filter((note) => note.status !== "Closed").length}`, icon: NotebookText }
  ];

  function applyProjectData(projectData) {
    setData(normalizeProjectData(projectData));
  }

  function runMutation(key, action) {
    setError("");
    setPendingKey(key);
    startTransition(async () => {
      try {
        const json = await action();
        if (json.projectData) {
          applyProjectData(json.projectData);
        }
      } catch (mutationError) {
        setError(mutationError.message);
      } finally {
        setPendingKey("");
      }
    });
  }

  function resetExpenseForm() {
    setExpenseForm(expenseInitialForm);
    setExpenseEditingId("");
  }

  function resetTaskForm() {
    setTaskForm(taskInitialForm);
    setTaskEditingId("");
  }

  function resetContactForm() {
    setContactForm(contactInitialForm);
    setContactEditingId("");
  }

  function resetNoteForm() {
    setNoteForm(noteInitialForm);
    setNoteEditingId("");
  }

  function handleCreateOrUpdate(resource, editingId, form, resetForm) {
    const isEditing = Boolean(editingId);
    const url = isEditing ? `/api/${resource}/${editingId}` : `/api/${resource}`;
    const method = isEditing ? "PATCH" : "POST";
    const key = `${resource}-${isEditing ? editingId : "new"}`;

    runMutation(key, async () => {
      const json = await requestJson(url, {
        method,
        body: JSON.stringify(form)
      });
      resetForm();
      return json;
    });
  }

  function handleDelete(resource, id, resetFormIfMatches, editingId) {
    runMutation(`${resource}-delete-${id}`, async () => {
      const json = await requestJson(`/api/${resource}/${id}`, {
        method: "DELETE"
      });
      if (editingId === id) {
        resetFormIfMatches();
      }
      return json;
    });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <PwaRegister />

      {error ? (
        <div className="rounded-[1.5rem] border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
        <Card className="overflow-hidden">
          <CardContent className="relative p-8 sm:p-10">
            <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,rgba(179,92,46,0.14),transparent_60%)]" />
            <div className="relative flex flex-col gap-6">
              <div className="space-y-4">
                <Badge variant="accent" className="w-fit">Family Construction Tracker</Badge>
                <div className="space-y-3">
                  <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-balance text-primary sm:text-6xl">
                    {project.name}
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                    Track site expenses, pending work, vendor contacts, and family notes in one shared PWA, now with live create, update, and delete flows for your main construction records.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <ShareButton />
                <Button asChild>
                  <Link href={shareLink} target="_blank" rel="noreferrer">
                    Repo Link
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.5rem] border border-border/80 bg-background/70 p-4">
                  <p className="text-sm font-medium text-primary">Shareable app link</p>
                  <Link href={shareLink} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm text-muted-foreground">
                    {shareLink}
                  </Link>
                </div>
                <div className="rounded-[1.5rem] border border-border/80 bg-background/70 p-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Database className="size-4" />
                    Data source
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {project.mode === "google-sheets" ? "Live Google Sheets sync" : "Local demo file fallback"}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground/80">
                    {project.id}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge className="w-fit">Today at a glance</Badge>
            <CardTitle>Project pulse</CardTitle>
            <CardDescription>Quick totals your family can check before a site visit or payment call.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {summaryCards.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-[1.25rem] border border-border/80 bg-background/80 p-4">
                <Icon className="mb-3 size-5 text-accent" />
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold text-primary">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div className="space-y-2">
              <Badge variant="outline" className="w-fit">Expenses</Badge>
              <CardTitle>Recent payments</CardTitle>
              <CardDescription>Manage individual purchase entries and keep the material totals accurate.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6">
            <form
              className="grid gap-4 rounded-[1.5rem] border border-border/80 bg-background/80 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleCreateOrUpdate("expenses", expenseEditingId, expenseForm, resetExpenseForm);
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{expenseEditingId ? "Edit expense" : "Add expense"}</p>
                  <p className="text-sm text-muted-foreground">This feeds both payment history and material-wise totals.</p>
                </div>
                <SectionActions
                  isEditing={Boolean(expenseEditingId)}
                  isSaving={pendingKey === `expenses-${expenseEditingId || "new"}`}
                  onCancel={resetExpenseForm}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Date"><input className={inputClassName()} type="date" value={expenseForm.date} onChange={(event) => setExpenseForm((value) => ({ ...value, date: event.target.value }))} /></FormField>
                <FormField label="Item"><input className={inputClassName()} value={expenseForm.item_name} onChange={(event) => setExpenseForm((value) => ({ ...value, item_name: event.target.value }))} placeholder="Bricks" /></FormField>
                <FormField label="Amount"><input className={inputClassName()} type="number" value={expenseForm.amount} onChange={(event) => setExpenseForm((value) => ({ ...value, amount: event.target.value }))} /></FormField>
                <FormField label="Quantity"><input className={inputClassName()} type="number" value={expenseForm.quantity} onChange={(event) => setExpenseForm((value) => ({ ...value, quantity: event.target.value }))} /></FormField>
                <FormField label="Vendor contact">
                  <select className={inputClassName()} value={expenseForm.vendor_contact_id} onChange={(event) => setExpenseForm((value) => ({ ...value, vendor_contact_id: event.target.value }))}>
                    <option value="">Select vendor</option>
                    {contacts.map((contact) => <option key={contact.contact_id} value={contact.contact_id}>{contact.name}</option>)}
                  </select>
                </FormField>
                <FormField label="Paid by">
                  <select className={inputClassName()} value={expenseForm.paid_by_user_id} onChange={(event) => setExpenseForm((value) => ({ ...value, paid_by_user_id: event.target.value }))}>
                    <option value="">Select user</option>
                    {users.map((user) => <option key={user.user_id} value={user.user_id}>{user.name}</option>)}
                  </select>
                </FormField>
                <FormField label="Status">
                  <select className={inputClassName()} value={expenseForm.payment_status} onChange={(event) => setExpenseForm((value) => ({ ...value, payment_status: event.target.value }))}>
                    <option>Paid</option>
                    <option>Pending</option>
                    <option>Partial</option>
                  </select>
                </FormField>
                <FormField label="Payment mode">
                  <select className={inputClassName()} value={expenseForm.payment_mode} onChange={(event) => setExpenseForm((value) => ({ ...value, payment_mode: event.target.value }))}>
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Bank Transfer</option>
                    <option>Cheque</option>
                  </select>
                </FormField>
              </div>
              <FormField label="Remarks"><textarea className={textareaClassName()} value={expenseForm.remarks} onChange={(event) => setExpenseForm((value) => ({ ...value, remarks: event.target.value }))} /></FormField>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.2em] text-primary/70">
                  <tr className="border-b border-border/80">
                    <th className="px-2 py-3 font-medium">Date</th>
                    <th className="px-2 py-3 font-medium">Item</th>
                    <th className="px-2 py-3 font-medium">Vendor</th>
                    <th className="px-2 py-3 font-medium">Paid By</th>
                    <th className="px-2 py-3 font-medium">Status</th>
                    <th className="px-2 py-3 font-medium">Amount</th>
                    <th className="px-2 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.expense_id} className="border-b border-border/60 last:border-b-0">
                      <td className="px-2 py-4 text-muted-foreground">{formatDisplayDate(expense.date)}</td>
                      <td className="px-2 py-4 font-medium text-foreground">{expense.item_name}</td>
                      <td className="px-2 py-4 text-muted-foreground">{expense.vendor_name_snapshot}</td>
                      <td className="px-2 py-4 text-muted-foreground">{expense.paid_by_name_snapshot || "-"}</td>
                      <td className="px-2 py-4"><Badge variant={expense.payment_status === "Pending" ? "accent" : "default"}>{expense.payment_status}</Badge></td>
                      <td className="px-2 py-4 font-medium text-primary">{currency.format(Number(expense.amount || 0))}</td>
                      <td className="px-2 py-4">
                        <div className="flex gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => {
                            setExpenseEditingId(expense.expense_id);
                            setExpenseForm({
                              date: expense.date || "",
                              category: expense.category || "Material",
                              item_name: expense.item_name || "",
                              vendor_contact_id: expense.vendor_contact_id || "",
                              vendor_name_snapshot: expense.vendor_name_snapshot || "",
                              quantity: `${expense.quantity || ""}`,
                              unit: expense.unit || "Nos",
                              rate: `${expense.rate || ""}`,
                              amount: `${expense.amount || ""}`,
                              payment_status: expense.payment_status || "Paid",
                              paid_amount: `${expense.paid_amount || ""}`,
                              paid_by_user_id: expense.paid_by_user_id || "",
                              payment_mode: expense.payment_mode || "Cash",
                              bill_reference: expense.bill_reference || "",
                              remarks: expense.remarks || ""
                            });
                          }}>Edit</Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => handleDelete("expenses", expense.expense_id, resetExpenseForm, expenseEditingId)} disabled={pendingKey === `expenses-delete-${expense.expense_id}`}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge variant="outline" className="w-fit">Spend by item</Badge>
            <CardTitle>Material totals</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {Object.entries(totalsByItem).map(([item, total]) => (
              <div key={item} className="rounded-[1.25rem] border border-border/80 bg-background/80 p-4">
                <p className="text-sm text-muted-foreground">{item}</p>
                <p className="mt-1 text-2xl font-semibold text-primary">{currency.format(total.amount)}</p>
                <p className="mt-2 text-sm text-muted-foreground">Total quantity: {total.quantity}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <Badge variant="outline" className="w-fit">Tasks</Badge>
            <CardTitle>Pending work</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form
              className="grid gap-4 rounded-[1.5rem] border border-border/80 bg-background/80 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleCreateOrUpdate("tasks", taskEditingId, taskForm, resetTaskForm);
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-foreground">{taskEditingId ? "Edit task" : "Add task"}</p>
                <SectionActions isEditing={Boolean(taskEditingId)} isSaving={pendingKey === `tasks-${taskEditingId || "new"}`} onCancel={resetTaskForm} />
              </div>
              <FormField label="Title"><input className={inputClassName()} value={taskForm.title} onChange={(event) => setTaskForm((value) => ({ ...value, title: event.target.value }))} /></FormField>
              <FormField label="Due date"><input className={inputClassName()} type="date" value={taskForm.due_date} onChange={(event) => setTaskForm((value) => ({ ...value, due_date: event.target.value }))} /></FormField>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Status"><select className={inputClassName()} value={taskForm.status} onChange={(event) => setTaskForm((value) => ({ ...value, status: event.target.value }))}><option>Pending</option><option>In Progress</option><option>Done</option><option>Blocked</option></select></FormField>
                <FormField label="Priority"><select className={inputClassName()} value={taskForm.priority} onChange={(event) => setTaskForm((value) => ({ ...value, priority: event.target.value }))}><option>Low</option><option>Medium</option><option>High</option></select></FormField>
                <FormField label="Assigned user"><select className={inputClassName()} value={taskForm.assigned_user_id} onChange={(event) => setTaskForm((value) => ({ ...value, assigned_user_id: event.target.value }))}><option value="">Select user</option>{users.map((user) => <option key={user.user_id} value={user.user_id}>{user.name}</option>)}</select></FormField>
                <FormField label="Assigned contact"><select className={inputClassName()} value={taskForm.assigned_contact_id} onChange={(event) => setTaskForm((value) => ({ ...value, assigned_contact_id: event.target.value }))}><option value="">Select contact</option>{contacts.map((contact) => <option key={contact.contact_id} value={contact.contact_id}>{contact.name}</option>)}</select></FormField>
              </div>
              <FormField label="Remarks"><textarea className={textareaClassName()} value={taskForm.remarks} onChange={(event) => setTaskForm((value) => ({ ...value, remarks: event.target.value }))} /></FormField>
            </form>
            {tasks.map((task) => (
              <div key={task.task_id} className="rounded-[1.25rem] border border-border/80 bg-background/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{task.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Assigned to {task.assigned_user_name || task.assigned_contact_name || "-"} | Due {formatDisplayDate(task.due_date)}
                    </p>
                  </div>
                  <Badge>{task.status}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{task.remarks}</p>
                <div className="mt-4 flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => {
                    setTaskEditingId(task.task_id);
                    setTaskForm({
                      title: task.title || "",
                      description: task.description || "",
                      category: task.category || "General",
                      tags: task.tags || "",
                      priority: task.priority || "Medium",
                      status: task.status || "Pending",
                      due_date: task.due_date || "",
                      assigned_user_id: task.assigned_user_id || "",
                      assigned_contact_id: task.assigned_contact_id || "",
                      remarks: task.remarks || ""
                    });
                  }}>Edit</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => handleDelete("tasks", task.task_id, resetTaskForm, taskEditingId)} disabled={pendingKey === `tasks-delete-${task.task_id}`}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge variant="outline" className="w-fit">Contacts</Badge>
            <CardTitle>People to call</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form
              className="grid gap-4 rounded-[1.5rem] border border-border/80 bg-background/80 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleCreateOrUpdate("contacts", contactEditingId, contactForm, resetContactForm);
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-foreground">{contactEditingId ? "Edit contact" : "Add contact"}</p>
                <SectionActions isEditing={Boolean(contactEditingId)} isSaving={pendingKey === `contacts-${contactEditingId || "new"}`} onCancel={resetContactForm} />
              </div>
              <FormField label="Name"><input className={inputClassName()} value={contactForm.name} onChange={(event) => setContactForm((value) => ({ ...value, name: event.target.value }))} /></FormField>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Phone"><input className={inputClassName()} value={contactForm.phone} onChange={(event) => setContactForm((value) => ({ ...value, phone: event.target.value }))} /></FormField>
                <FormField label="Role"><select className={inputClassName()} value={contactForm.role} onChange={(event) => setContactForm((value) => ({ ...value, role: event.target.value }))}><option>Vendor</option><option>Contractor</option><option>Site Supervisor</option><option>Engineer</option><option>Worker</option><option>Consultant</option><option>Other</option></select></FormField>
              </div>
              <FormField label="Company"><input className={inputClassName()} value={contactForm.company_name} onChange={(event) => setContactForm((value) => ({ ...value, company_name: event.target.value }))} /></FormField>
              <FormField label="Tags"><input className={inputClassName()} value={contactForm.tags} onChange={(event) => setContactForm((value) => ({ ...value, tags: event.target.value }))} placeholder="Bricks, Sand" /></FormField>
              <FormField label="Notes"><textarea className={textareaClassName()} value={contactForm.notes} onChange={(event) => setContactForm((value) => ({ ...value, notes: event.target.value }))} /></FormField>
            </form>
            {contacts.map((contact) => (
              <div key={contact.contact_id} className="rounded-[1.25rem] border border-border/80 bg-background/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{contact.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{contact.company_name}</p>
                  </div>
                  <Badge variant={contact.is_primary_contact === "Yes" ? "accent" : "default"}>
                    {contact.is_primary_contact === "Yes" ? "Primary Contact" : contact.role}
                  </Badge>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <PhoneCall className="size-4 text-accent" />
                    {contact.phone}
                  </p>
                  <p>{contact.tags}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => {
                    setContactEditingId(contact.contact_id);
                    setContactForm({
                      name: contact.name || "",
                      role: contact.role || "Vendor",
                      company_name: contact.company_name || "",
                      phone: contact.phone || "",
                      alternate_phone: contact.alternate_phone || "",
                      email: contact.email || "",
                      tags: contact.tags || "",
                      address: contact.address || "",
                      notes: contact.notes || "",
                      is_primary_contact: contact.is_primary_contact || "No",
                      active: contact.active || "Yes"
                    });
                  }}>Edit</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => handleDelete("contacts", contact.contact_id, resetContactForm, contactEditingId)} disabled={pendingKey === `contacts-delete-${contact.contact_id}`}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge variant="outline" className="w-fit">Notes</Badge>
            <CardTitle>Discuss later</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form
              className="grid gap-4 rounded-[1.5rem] border border-border/80 bg-background/80 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleCreateOrUpdate("notes", noteEditingId, noteForm, resetNoteForm);
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-foreground">{noteEditingId ? "Edit note" : "Add note"}</p>
                <SectionActions isEditing={Boolean(noteEditingId)} isSaving={pendingKey === `notes-${noteEditingId || "new"}`} onCancel={resetNoteForm} />
              </div>
              <FormField label="Title"><input className={inputClassName()} value={noteForm.title} onChange={(event) => setNoteForm((value) => ({ ...value, title: event.target.value }))} /></FormField>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Category"><select className={inputClassName()} value={noteForm.category} onChange={(event) => setNoteForm((value) => ({ ...value, category: event.target.value }))}><option>Discussion</option><option>Reminder</option><option>Issue</option><option>Decision Pending</option></select></FormField>
                <FormField label="Status"><select className={inputClassName()} value={noteForm.status} onChange={(event) => setNoteForm((value) => ({ ...value, status: event.target.value }))}><option>Open</option><option>Discussed</option><option>Closed</option></select></FormField>
              </div>
              <FormField label="Follow up date"><input className={inputClassName()} type="date" value={noteForm.follow_up_date} onChange={(event) => setNoteForm((value) => ({ ...value, follow_up_date: event.target.value }))} /></FormField>
              <FormField label="Note"><textarea className={textareaClassName()} value={noteForm.note_text} onChange={(event) => setNoteForm((value) => ({ ...value, note_text: event.target.value }))} /></FormField>
            </form>
            {notes.map((note) => (
              <div key={note.note_id} className="rounded-[1.25rem] border border-border/80 bg-background/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{note.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Follow up {formatDisplayDate(note.follow_up_date)}</p>
                  </div>
                  <Badge variant="accent">{note.category}</Badge>
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 text-primary" />
                  Status: {note.status}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => {
                    setNoteEditingId(note.note_id);
                    setNoteForm({
                      title: note.title || "",
                      note_text: note.note_text || "",
                      category: note.category || "Discussion",
                      tags: note.tags || "",
                      status: note.status || "Open",
                      related_type: note.related_type || "General",
                      related_id: note.related_id || "",
                      follow_up_date: note.follow_up_date || ""
                    });
                  }}>Edit</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => handleDelete("notes", note.note_id, resetNoteForm, noteEditingId)} disabled={pendingKey === `notes-delete-${note.note_id}`}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <Badge variant="outline" className="w-fit">Users</Badge>
            <CardTitle>Shared family access</CardTitle>
            <CardDescription>Roles keep the app easy to share without opening raw Google Sheets to everyone.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {users.map((user) => (
              <div key={user.user_id} className="flex items-center justify-between rounded-[1.25rem] border border-border/80 bg-background/80 px-4 py-3">
                <div>
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.user_id}</p>
                </div>
                <Badge>{user.role}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge variant="outline" className="w-fit">Google Sheets schema</Badge>
            <CardTitle>MVP tabs</CardTitle>
            <CardDescription>The app now mutates the same resource model through API routes.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {schema.map((sheet) => (
              <div key={sheet.tab} className="rounded-[1.25rem] border border-border/80 bg-background/80 p-4">
                <p className="font-medium text-foreground">{sheet.tab}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sheet.fields.map((field) => (
                    <Badge key={field} variant="outline">{field}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
