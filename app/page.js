import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Database,
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
import { getProjectData } from "@/lib/project-data";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

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

export default async function HomePage() {
  const shareLink = "https://github.com/ansumiriam/cornerstone";
  const data = await getProjectData();
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
                    {project.name}
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                    Track site expenses, pending work, vendor contacts, and family notes in one shared PWA, with a
                    Google Sheets-backed data path ready when your spreadsheet credentials are configured.
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
                  <Link
                    href={shareLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block break-all text-sm text-muted-foreground"
                  >
                    {shareLink}
                  </Link>
                </div>
                <div className="rounded-[1.5rem] border border-border/80 bg-background/70 p-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Database className="size-4" />
                    Data source
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {project.mode === "google-sheets" ? "Live Google Sheets sync" : "Demo data fallback"}
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
                  <tr key={expense.expense_id} className="border-b border-border/60 last:border-b-0">
                    <td className="px-2 py-4 text-muted-foreground">{formatDisplayDate(expense.date)}</td>
                    <td className="px-2 py-4 font-medium text-foreground">{expense.item_name}</td>
                    <td className="px-2 py-4 text-muted-foreground">{expense.vendor_name_snapshot}</td>
                    <td className="px-2 py-4 text-muted-foreground">{expense.paid_by_name_snapshot || "-"}</td>
                    <td className="px-2 py-4">
                      <Badge variant={expense.payment_status === "Pending" ? "accent" : "default"}>
                        {expense.payment_status}
                      </Badge>
                    </td>
                    <td className="px-2 py-4 font-medium text-primary">
                      {currency.format(Number(expense.amount || 0))}
                    </td>
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
              <div key={note.note_id} className="rounded-[1.25rem] border border-border/80 bg-background/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{note.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Follow up {formatDisplayDate(note.follow_up_date)}
                    </p>
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
