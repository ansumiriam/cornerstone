const appData = {
  users: [
    { id: "USR-001", name: "Ansu", role: "Admin" },
    { id: "USR-002", name: "Miriam", role: "Editor" },
    { id: "USR-003", name: "Joseph", role: "Viewer" }
  ],
  expenses: [
    {
      id: "EXP-001",
      date: "2026-04-18",
      item: "Bricks",
      vendor: "Metro Blocks",
      paidBy: "Ansu",
      status: "Paid",
      amount: 18750,
      quantity: 2500
    },
    {
      id: "EXP-002",
      date: "2026-04-19",
      item: "Cement",
      vendor: "Prime Build Mart",
      paidBy: "Miriam",
      status: "Partial",
      amount: 12400,
      quantity: 40
    },
    {
      id: "EXP-003",
      date: "2026-04-20",
      item: "Bricks",
      vendor: "Metro Blocks",
      paidBy: "Ansu",
      status: "Paid",
      amount: 9800,
      quantity: 1200
    },
    {
      id: "EXP-004",
      date: "2026-04-20",
      item: "Labor",
      vendor: "Site Crew",
      paidBy: "Joseph",
      status: "Pending",
      amount: 15500,
      quantity: 1
    }
  ],
  tasks: [
    {
      title: "Confirm terrace waterproofing quote",
      dueDate: "2026-04-23",
      status: "Pending",
      assignedTo: "Miriam",
      remarks: "Compare with second vendor before approval."
    },
    {
      title: "Finalize extra kitchen plug points",
      dueDate: "2026-04-24",
      status: "In Progress",
      assignedTo: "Ansu",
      remarks: "Discuss with electrician during Friday visit."
    }
  ],
  contacts: [
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
  ],
  notes: [
    {
      title: "Check brick rate against last week",
      category: "Discussion",
      status: "Open",
      followUp: "2026-04-22"
    },
    {
      title: "Confirm washroom fitting shade",
      category: "Decision Pending",
      status: "Open",
      followUp: "2026-04-25"
    }
  ],
  schema: [
    {
      tab: "Users",
      fields: ["user_id", "name", "email", "role", "active", "last_login"]
    },
    {
      tab: "Expenses",
      fields: ["expense_id", "date", "item_name", "amount", "paid_by_user_id", "vendor_contact_id"]
    },
    {
      tab: "Tasks",
      fields: ["task_id", "title", "status", "due_date", "assigned_user_id"]
    },
    {
      tab: "Contacts",
      fields: ["contact_id", "name", "role", "phone", "tags", "is_primary_contact"]
    },
    {
      tab: "Notes",
      fields: ["note_id", "title", "category", "status", "follow_up_date"]
    }
  ]
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const totalSpend = appData.expenses.reduce((sum, item) => sum + item.amount, 0);
const pendingPayments = appData.expenses
  .filter((item) => item.status !== "Paid")
  .reduce((sum, item) => sum + item.amount, 0);
const openTasks = appData.tasks.filter((task) => task.status !== "Done").length;
const openNotes = appData.notes.filter((note) => note.status !== "Closed").length;

const byItem = appData.expenses.reduce((acc, expense) => {
  const current = acc.get(expense.item) || { amount: 0, quantity: 0 };
  current.amount += expense.amount;
  current.quantity += expense.quantity;
  acc.set(expense.item, current);
  return acc;
}, new Map());

function renderSummary() {
  document.getElementById("total-spend").textContent = currency.format(totalSpend);
  document.getElementById("pending-payments").textContent = currency.format(pendingPayments);
  document.getElementById("open-tasks").textContent = `${openTasks}`;
  document.getElementById("open-notes").textContent = `${openNotes}`;

  const summaryCards = [
    { label: "Family users", value: appData.users.length, hint: "Admins, editors, and viewers" },
    { label: "Contacts", value: appData.contacts.length, hint: "Tagged vendors and site people" },
    { label: "Expenses", value: appData.expenses.length, hint: "Each purchase stored separately" },
    { label: "Primary site contact", value: "Rajeev Kumar", hint: "Marked in Contacts" }
  ];

  document.getElementById("summary-cards").innerHTML = summaryCards
    .map(
      (card) => `
        <article class="metric-card">
          <p>${card.label}</p>
          <strong>${card.value}</strong>
          <span>${card.hint}</span>
        </article>
      `
    )
    .join("");
}

function renderExpenses() {
  document.getElementById("expenses-body").innerHTML = appData.expenses
    .map(
      (expense) => `
        <tr>
          <td>${expense.date}</td>
          <td>${expense.item}</td>
          <td>${expense.vendor}</td>
          <td>${expense.paidBy}</td>
          <td><span class="status">${expense.status}</span></td>
          <td>${currency.format(expense.amount)}</td>
        </tr>
      `
    )
    .join("");
}

function renderMaterialTotals() {
  document.getElementById("material-totals").innerHTML = Array.from(byItem.entries())
    .map(
      ([name, info]) => `
        <article class="metric-card">
          <p>${name}</p>
          <strong>${currency.format(info.amount)}</strong>
          <span>Total quantity: ${info.quantity}</span>
        </article>
      `
    )
    .join("");
}

function renderTasks() {
  document.getElementById("tasks-list").innerHTML = appData.tasks
    .map(
      (task) => `
        <article class="item">
          <div class="item__title">
            <h3>${task.title}</h3>
            <span class="pill">${task.status}</span>
          </div>
          <p class="item__meta">Assigned to ${task.assignedTo} | Due ${task.dueDate}</p>
          <p class="item__meta">${task.remarks}</p>
        </article>
      `
    )
    .join("");
}

function renderContacts() {
  document.getElementById("contacts-list").innerHTML = appData.contacts
    .map(
      (contact) => `
        <article class="item">
          <div class="item__title">
            <h3>${contact.name}</h3>
            <span class="pill">${contact.primary ? "Primary Contact" : contact.role}</span>
          </div>
          <p class="item__meta">${contact.company} | ${contact.phone}</p>
          <p class="contact-tags">${contact.tags}</p>
        </article>
      `
    )
    .join("");
}

function renderNotes() {
  document.getElementById("notes-list").innerHTML = appData.notes
    .map(
      (note) => `
        <article class="item">
          <div class="item__title">
            <h3>${note.title}</h3>
            <span class="pill">${note.category}</span>
          </div>
          <p class="item__meta">Status: ${note.status} | Follow up: ${note.followUp}</p>
        </article>
      `
    )
    .join("");
}

function renderSchema() {
  document.getElementById("schema-list").innerHTML = appData.schema
    .map(
      (sheet) => `
        <article class="schema-card">
          <h3>${sheet.tab}</h3>
          <ul>${sheet.fields.map((field) => `<li>${field}</li>`).join("")}</ul>
        </article>
      `
    )
    .join("");
}

function setupShareLink() {
  const url = window.location.href;
  const appLink = document.getElementById("app-link");
  appLink.href = url;
  appLink.textContent = url;

  const shareButton = document.getElementById("share-app");
  shareButton.addEventListener("click", async () => {
    const payload = {
      title: "Cornerstone",
      text: "Track family construction progress, expenses, tasks, contacts, and notes.",
      url
    };

    if (navigator.share) {
      await navigator.share(payload);
      return;
    }

    await navigator.clipboard.writeText(url);
    shareButton.textContent = "Link Copied";
    setTimeout(() => {
      shareButton.textContent = "Share App";
    }, 1800);
  });
}

function setupPwaInstall() {
  let deferredPrompt = null;
  const installButton = document.getElementById("install-app");

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installButton.classList.remove("hidden");
  });

  installButton.addEventListener("click", async () => {
    if (!deferredPrompt) {
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installButton.classList.add("hidden");
  });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js");
  }
}

renderSummary();
renderExpenses();
renderMaterialTotals();
renderTasks();
renderContacts();
renderNotes();
renderSchema();
setupShareLink();
setupPwaInstall();
registerServiceWorker();
