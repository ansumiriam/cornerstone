import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  IndianRupee,
  NotebookText,
  PhoneCall,
  Wallet
} from "lucide-react";

import { PwaRegister } from "@/components/pwa-register";
import { ShareButton } from "@/components/share-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const users = [
  { id: "USR-001", name: "Ansu", role: "Admin" },
  { id: "USR-002", name: "Miriam", role: "Editor" },
  { id: "USR-003", name: "Joseph", role: "Viewer" }
];

const expenses = [
  {
    id: "EXP-001",
    date: "Apr 18, 2026",
    item: "Bricks",
    vendor: "Metro Blocks",
    paidBy: "Ansu",
    status: "Paid",
    amount: 18750,
    quantity: 2500
  },
  {
    id: "EXP-002",
    date: "Apr 19, 2026",
    item: "Cement",
    vendor: "Prime Build Mart",
    paidBy: "Miriam",
    status: "Partial",
    amount: 12400,
    quantity: 40
  },
  {
    id: "EXP-003",
    date: "Apr 20, 2026",
    item: "Bricks",
    vendor: "Metro Blocks",
    paidBy: "Ansu",
    status: "Paid",
    amount: 9800,
    quantity: 1200
  },
  {
    id: "EXP-004",
    date: "Apr 20, 2026",
    item: "Labor",
    vendor: "Site Crew",
    paidBy: "Joseph",
    status: "Pending",
    amount: 15500,
    quantity: 1
  }
];

const tasks = [
  {
    title: "Confirm terrace waterproofing quote",
    dueDate: "Apr 23",
    status: "Pending",
    assignedTo: "Miriam",
    remarks: "Compare with the second vendor before approval."
  },
  {
    title: "Finalize extra kitchen plug points",
    dueDate: "Apr 24",
    status: "In Progress",
    assignedTo: "Ansu",
    remarks: "Walk through the layout with the electrician on Friday."
  }
];

const contacts = [
  {
    name: "Lijo Thomas",
    role: "Vendor",
    company: "Metro Blocks",
    phone: "+91 99999 11111",
    tags: "Bricks, Sand",
    primary: false
  },
  {
    name: "Rajeev Kumar",
    role: "Site Supervisor",
    company: "Corner Plot Site",
    phone: "+91 99999 22222",
    tags: "Daily Updates, Work Progress",
    primary: true
  },
  {
    name: "Naveen Das",
    role: "Contractor",
    company: "Prime Build Mart",
    phone: "+91 99999 33333",
    tags: "Cement, Steel, Logistics",
    primary: false
  }
];

const notes = [
  {
    title: "Check brick rate against last week",
    category: "Discussion",
    status: "Open",
    followUp: "Apr 22"
  },
  {
    title: "Confirm washroom fitting shade",
    category: "Decision Pending",
    status: "Open",
    followUp: "Apr 25"
  }
];

const schema = [
  { tab: "Users", fields: ["user_id", "name", "email", "role", "active", "last_login"] },
  {
    tab: "Expenses",
    fields: ["expense_id", "date", "item_name", "amount", "paid_by_user_id", "vendor_contact_id"]
  },
  { tab: "Tasks", fields: ["task_id", "title", "status", "due_date", "assigned_user_id"] },
  { tab: "Contacts", fields: ["contact_id", "name", "role", "phone", "tags", "is_primary_contact"] },
  { tab: "Notes", fields: ["note_id", "title", "category", "status", "follow_up_date"] }
];

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const totalSpend = expenses.reduce((sum, item) => sum + item.amount, 0);
const pendingPayments = expenses
  .filter((item) => item.status !== "Paid")
  .reduce((sum, item) => sum + item.amount, 0);
const totalsByItem = expenses.reduce((acc, expense) => {
  const current = acc[expense.item] || { amount: 0, quantity: 0 };
  current.amount += expense.amount;
  current.quantity += expense.quantity;
  acc[expense.item] = current;
  return acc;
}, {});

const summaryCards = [
  { label: "Total spend", value: currency.format(totalSpend), icon: IndianRupee },
  { label: "Pending payments", value: currency.format(pendingPayments), icon: Wallet },
  { label: "Open tasks", value: `${tasks.filter((task) => task.status !== "Done").length}`, icon: Clock3 },
  { label: "Open notes", value: `${notes.filter((note) => note.status !== "Closed").length}`, icon: NotebookText }
];

export default function HomePage() {
  const shareLink = "https://github.com/ansumiriam/cornerstone";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <PwaRegister />

      <section className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
        <Card className="overflow-hidden">
          <CardContent className="relative p-8 sm:p-10">
            <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,rgba(179,92,46,0.14),transparent_60%)]" />
            <div className="relative flex flex-col gap-6">
              <div className="space-y-4">
                <Badge variant="accent" className="w-fit">Family Construction Tracker</Badge>
                <div className="space-y-3">
                  <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-balance text-primary sm:text-6xl">
                    Cornerstone
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                    Track site expenses, pending work, vendor contacts, and family notes in one shared PWA, with a
                    Google Sheets-ready schema waiting behind it.
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

              <div className="rounded-[1.5rem] border border-border/80 bg-background/70 p-4">
                <p className="text-sm font-medium text-primary">Shareable app link</p>
                <Link href={shareLink} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm text-muted-foreground">
                  {shareLink}
                </Link>
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
              <CardDescription>Each purchase stays separate, so bricks bought multiple times still roll up cleanly.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.2em] text-primary/70">
                <tr className="border-b border-border/80">
                  <th className="px-2 py-3 font-medium">Date</th>
                  <th className="px-2 py-3 font-medium">Item</th>
                  <th className="px-2 py-3 font-medium">Vendor</th>
                  <th className="px-2 py-3 font-medium">Paid By</th>
                  <th className="px-2 py-3 font-medium">Status</th>
                  <th className="px-2 py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-border/60 last:border-b-0">
                    <td className="px-2 py-4 text-muted-foreground">{expense.date}</td>
                    <td className="px-2 py-4 font-medium text-foreground">{expense.item}</td>
                    <td className="px-2 py-4 text-muted-foreground">{expense.vendor}</td>
                    <td className="px-2 py-4 text-muted-foreground">{expense.paidBy}</td>
                    <td className="px-2 py-4">
                      <Badge variant={expense.status === "Pending" ? "accent" : "default"}>{expense.status}</Badge>
                    </td>
                    <td className="px-2 py-4 font-medium text-primary">{currency.format(expense.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <CardContent className="space-y-4">
            {tasks.map((task) => (
              <div key={task.title} className="rounded-[1.25rem] border border-border/80 bg-background/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{task.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Assigned to {task.assignedTo} • Due {task.dueDate}
                    </p>
                  </div>
                  <Badge>{task.status}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{task.remarks}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge variant="outline" className="w-fit">Contacts</Badge>
            <CardTitle>People to call</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contacts.map((contact) => (
              <div key={contact.name} className="rounded-[1.25rem] border border-border/80 bg-background/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{contact.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{contact.company}</p>
                  </div>
                  <Badge variant={contact.primary ? "accent" : "default"}>
                    {contact.primary ? "Primary Contact" : contact.role}
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
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge variant="outline" className="w-fit">Notes</Badge>
            <CardTitle>Discuss later</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notes.map((note) => (
              <div key={note.title} className="rounded-[1.25rem] border border-border/80 bg-background/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{note.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Follow up {note.followUp}</p>
                  </div>
                  <Badge variant="accent">{note.category}</Badge>
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 text-primary" />
                  Status: {note.status}
                </p>
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
              <div key={user.id} className="flex items-center justify-between rounded-[1.25rem] border border-border/80 bg-background/80 px-4 py-3">
                <div>
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.id}</p>
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
            <CardDescription>The app is ready to evolve into Sheets-backed CRUD using this structure.</CardDescription>
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
