/* =====================================================
   EXPENSE AI
   Complete JavaScript
===================================================== */


/* =====================================================
   STORAGE
===================================================== */

const STORAGE_KEY = "expense_ai_data";

const defaultData = {

    users: [
        {
            username: "demo",
            password: "demo123",
            firstName: "Demo",
            lastName: "User",
            email: "demo@example.com"
        }
    ],

    currentUser: null,

    transactions: [],

    budgets: [],

    savings: []

};


let data;

try {

    const saved = localStorage.getItem(STORAGE_KEY);

    data = saved
        ? JSON.parse(saved)
        : JSON.parse(JSON.stringify(defaultData));

} catch (error) {

    data = JSON.parse(JSON.stringify(defaultData));

}


data.users = Array.isArray(data.users)
    ? data.users
    : [];

data.transactions = Array.isArray(data.transactions)
    ? data.transactions
    : [];

data.budgets = Array.isArray(data.budgets)
    ? data.budgets
    : [];

data.savings = Array.isArray(data.savings)
    ? data.savings
    : [];

data.currentUser = data.currentUser || null;


if (!data.users.some(
    user => user.username.toLowerCase() === "demo"
)) {

    data.users.push(defaultData.users[0]);

}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


/* =====================================================
   GLOBALS
===================================================== */

let expenseChart = null;
let incomeExpenseChart = null;
let reportCategoryChart = null;

let currentPage = "dashboard";


const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Education",
    "Health",
    "Other"
];


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);


function initializeApplication() {

    setupForms();

    setupOCR();

    setDefaultDates();

    if (data.currentUser) {

        showApp();

    } else {

        showLogin();

    }

}


/* =====================================================
   FORM SETUP
===================================================== */

function setupForms() {

    const addSubmitHandler = (id, handler) => {

        const form = document.getElementById(id);

        if (form) {

            form.addEventListener(
                "submit",
                handler
            );

        }

    };


    addSubmitHandler(
        "loginForm",
        loginUser
    );


    addSubmitHandler(
        "registerForm",
        registerUser
    );


    addSubmitHandler(
        "transactionForm",
        saveTransaction
    );


    addSubmitHandler(
        "budgetForm",
        saveBudget
    );


    addSubmitHandler(
        "savingsForm",
        saveSavings
    );


    addSubmitHandler(
        "profileForm",
        saveProfile
    );

}


/* =====================================================
   AUTH
===================================================== */

function showLogin() {

    document
        .getElementById("loginPage")
        .classList.remove("hidden");

    document
        .getElementById("registerPage")
        .classList.add("hidden");

    document
        .getElementById("app")
        .classList.add("hidden");

}


function showRegister() {

    document
        .getElementById("loginPage")
        .classList.add("hidden");

    document
        .getElementById("registerPage")
        .classList.remove("hidden");

    document
        .getElementById("app")
        .classList.add("hidden");

}


function loginUser(event) {

    event.preventDefault();

    clearLoginErrors();

    const username =
        document
            .getElementById("loginUsername")
            .value
            .trim();

    const password =
        document
            .getElementById("loginPassword")
            .value;

    let valid = true;


    if (!username) {

        setText(
            "loginUsernameError",
            "Please enter your username."
        );

        valid = false;

    }


    if (!password) {

        setText(
            "loginPasswordError",
            "Please enter your password."
        );

        valid = false;

    }


    if (!valid) {

        return;

    }


    const user = data.users.find(
        item =>
            item.username.toLowerCase() ===
            username.toLowerCase()
    );


    if (!user) {

        setText(
            "loginUsernameError",
            "Username does not exist."
        );

        return;

    }


    if (user.password !== password) {

        setText(
            "loginPasswordError",
            "Incorrect password."
        );

        return;

    }


    data.currentUser = user.username;

    saveData();

    showApp();

    showToast("Login successful.");

}


function registerUser(event) {

    event.preventDefault();

    clearRegisterErrors();

    const username =
        document
            .getElementById("registerUsername")
            .value
            .trim();

    const firstName =
        document
            .getElementById("firstName")
            .value
            .trim();

    const lastName =
        document
            .getElementById("lastName")
            .value
            .trim();

    const email =
        document
            .getElementById("registerEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("registerPassword")
            .value;

    const confirmPassword =
        document
            .getElementById("confirmPassword")
            .value;


    let valid = true;


    if (username.length < 3) {

        setText(
            "registerUsernameError",
            "Username must contain at least 3 characters."
        );

        valid = false;

    }


    if (!firstName) {

        setText(
            "firstNameError",
            "First name is required."
        );

        valid = false;

    }


    if (!lastName) {

        setText(
            "lastNameError",
            "Last name is required."
        );

        valid = false;

    }


    if (!email || !email.includes("@")) {

        setText(
            "registerEmailError",
            "Enter a valid email address."
        );

        valid = false;

    }


    if (password.length < 6) {

        setText(
            "registerPasswordError",
            "Password must contain at least 6 characters."
        );

        valid = false;

    }


    if (password !== confirmPassword) {

        setText(
            "confirmPasswordError",
            "Passwords do not match."
        );

        valid = false;

    }


    if (
        data.users.some(
            user =>
                user.username.toLowerCase() ===
                username.toLowerCase()
        )
    ) {

        setText(
            "registerUsernameError",
            "Username already exists."
        );

        valid = false;

    }


    if (
        data.users.some(
            user =>
                user.email.toLowerCase() ===
                email.toLowerCase()
        )
    ) {

        setText(
            "registerEmailError",
            "Email already registered."
        );

        valid = false;

    }


    if (!valid) {

        return;

    }


    data.users.push({

        username,
        password,
        firstName,
        lastName,
        email

    });


    saveData();

    const form =
        document.getElementById("registerForm");

    form.reset();

    showLogin();

    showToast(
        "Account created successfully. Please sign in."
    );

}


function logout() {

    data.currentUser = null;

    saveData();

    showLogin();

    showToast("You have been logged out.");

}


function togglePassword(id, button) {

    const input =
        document.getElementById(id);

    if (!input) return;


    if (input.type === "password") {

        input.type = "text";

        button.innerHTML =
            '<i class="bi bi-eye-slash"></i>';

    } else {

        input.type = "password";

        button.innerHTML =
            '<i class="bi bi-eye"></i>';

    }

}


function clearLoginErrors() {

    setText("loginUsernameError", "");

    setText("loginPasswordError", "");

    setText("loginMessage", "");

}


function clearRegisterErrors() {

    [
        "registerUsernameError",
        "firstNameError",
        "lastNameError",
        "registerEmailError",
        "registerPasswordError",
        "confirmPasswordError"
    ].forEach(id => setText(id, ""));

}


/* =====================================================
   APP
===================================================== */

function showApp() {

    document
        .getElementById("loginPage")
        .classList.add("hidden");

    document
        .getElementById("registerPage")
        .classList.add("hidden");

    document
        .getElementById("app")
        .classList.remove("hidden");


    updateUserInterface();

    refreshAll();

    navigate("dashboard");

}


function getCurrentUser() {

    return data.users.find(
        user =>
            user.username === data.currentUser
    );

}


function updateUserInterface() {

    const user = getCurrentUser();

    if (!user) return;


    const fullName =
        `${user.firstName || ""} ${user.lastName || ""}`.trim();


    const displayName =
        fullName || user.username;


    const welcomeName =
        document.getElementById("welcomeName");

    if (welcomeName) {

        welcomeName.textContent = displayName;

    }


    const avatar =
        document.getElementById("userAvatar");

    if (avatar) {

        avatar.textContent =
            displayName.charAt(0).toUpperCase();

    }


    const subtitle =
        document.getElementById("pageSubtitle");

    if (subtitle) {

        subtitle.textContent =
            `Welcome back, ${displayName}!`;

    }


    const firstName =
        document.getElementById("profileFirstName");

    const lastName =
        document.getElementById("profileLastName");

    const email =
        document.getElementById("profileEmail");


    if (firstName) {
        firstName.value = user.firstName || "";
    }

    if (lastName) {
        lastName.value = user.lastName || "";
    }

    if (email) {
        email.value = user.email || "";
    }

}


/* =====================================================
   NAVIGATION
===================================================== */

function navigate(page) {

    currentPage = page;


    document
        .querySelectorAll(".page")
        .forEach(section => {

            section.classList.remove(
                "active-page"
            );

        });


    const selected =
        document.getElementById(
            `${page}Page`
        );


    if (selected) {

        selected.classList.add(
            "active-page"
        );

    }


    document
        .querySelectorAll(".nav-item[data-page]")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });


    const titles = {

        dashboard: "Dashboard",

        transactions: "Transactions",

        budget: "Budgets",

        savings: "Savings Goals",

        reports: "Reports",

        settings: "Settings"

    };


    const title =
        document.getElementById("pageTitle");


    if (title) {

        title.textContent =
            titles[page] || "Expense AI";

    }


    if (page === "reports") {

        renderReportChart();

    }

}


/* =====================================================
   TRANSACTIONS
===================================================== */

function openTransactionModal(transaction = null) {

    const modal =
        document.getElementById(
            "transactionModal"
        );

    const form =
        document.getElementById(
            "transactionForm"
        );


    if (!transaction) {

        form.reset();

        document.getElementById(
            "transactionEditId"
        ).value = "";

        document.getElementById(
            "transactionModalTitle"
        ).textContent =
            "Add Transaction";

        document.getElementById(
            "transactionType"
        ).value =
            "expense";

        document.getElementById(
            "transactionDate"
        ).value =
            getTodayDate();

    } else {

        document.getElementById(
            "transactionEditId"
        ).value =
            transaction.id;

        document.getElementById(
            "transactionModalTitle"
        ).textContent =
            "Edit Transaction";

        document.getElementById(
            "transactionType"
        ).value =
            transaction.type;

        document.getElementById(
            "transactionDescription"
        ).value =
            transaction.description;

        document.getElementById(
            "transactionCategory"
        ).value =
            transaction.category;

        document.getElementById(
            "transactionAmount"
        ).value =
            transaction.amount;

        document.getElementById(
            "transactionDate"
        ).value =
            transaction.date;

    }


    modal.classList.remove("hidden");

}


function saveTransaction(event) {

    event.preventDefault();


    const editId =
        document.getElementById(
            "transactionEditId"
        ).value;


    const type =
        document.getElementById(
            "transactionType"
        ).value;


    const description =
        document.getElementById(
            "transactionDescription"
        ).value.trim();


    const category =
        document.getElementById(
            "transactionCategory"
        ).value;


    const amount =
        Number(
            document.getElementById(
                "transactionAmount"
            ).value
        );


    const date =
        document.getElementById(
            "transactionDate"
        ).value;


    setText(
        "transactionDescriptionError",
        ""
    );

    setText(
        "transactionAmountError",
        "");


    let valid = true;


    if (!description) {

        setText(
            "transactionDescriptionError",
            "Description is required."
        );

        valid = false;

    }


    if (!amount || amount <= 0) {

        setText(
            "transactionAmountError",
            "Enter an amount greater than 0."
        );

        valid = false;

    }


    if (!date) {

        valid = false;

    }


    if (!valid) return;


    if (editId) {

        const transaction =
            data.transactions.find(
                item =>
                    String(item.id) ===
                    String(editId)
            );


        if (transaction) {

            transaction.type = type;

            transaction.description =
                description;

            transaction.category =
                category;

            transaction.amount =
                amount;

            transaction.date =
                date;

            transaction.source =
                transaction.source || "Manual";

        }


        showToast(
            "Transaction updated."
        );

    } else {

        data.transactions.push({

            id: Date.now(),

            user: data.currentUser,

            type,

            amount,

            category,

            description,

            date,

            source: "Manual"

        });


        showToast(
            "Transaction added."
        );

    }


    saveData();

    closeModal("transactionModal");

    refreshAll();

}


function editTransaction(id) {

    const transaction =
        getUserTransactions().find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (transaction) {

        openTransactionModal(transaction);

    }

}


function deleteTransaction(id) {

    const confirmed =
        confirm(
            "Delete this transaction?"
        );


    if (!confirmed) return;


    data.transactions =
        data.transactions.filter(
            item =>
                !(
                    Number(item.id) ===
                    Number(id) &&
                    item.user ===
                    data.currentUser
                )
        );


    saveData();

    refreshAll();

    showToast(
        "Transaction deleted."
    );

}


function getUserTransactions() {

    return data.transactions.filter(
        transaction =>
            transaction.user ===
            data.currentUser
    );

}


function refreshTransactions() {

    const container =
        document.getElementById(
            "transactionList"
        );

    if (!container) return;


    const search =
        (
            document.getElementById(
                "transactionSearch"
            )?.value || ""
        )
        .toLowerCase()
        .trim();


    const typeFilter =
        document.getElementById(
            "transactionFilter"
        )?.value || "all";


    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        )?.value || "all";


    let transactions =
        getUserTransactions();


    transactions =
        transactions.filter(transaction => {

            const matchesSearch =
                !search ||
                transaction.description
                    .toLowerCase()
                    .includes(search) ||
                transaction.category
                    .toLowerCase()
                    .includes(search);


            const matchesType =
                typeFilter === "all" ||
                transaction.type === typeFilter;


            const matchesCategory =
                categoryFilter === "all" ||
                transaction.category ===
                categoryFilter;


            return (
                matchesSearch &&
                matchesType &&
                matchesCategory
            );

        });


    transactions.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );


    if (!transactions.length) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="bi bi-receipt"></i>

                <p>
                    No transactions found.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        transactions.map(
            transaction =>
                transactionHTML(transaction)
        ).join("");

}


function transactionHTML(transaction) {

    const icon =
        getCategoryIcon(
            transaction.category
        );


    const sign =
        transaction.type === "income"
            ? "+"
            : "-";


    const source =
        transaction.source
            ? ` • ${transaction.source}`
            : "";


    return `

        <div class="transaction-item">

            <div class="transaction-left">

                <div class="transaction-icon">

                    <i class="bi ${icon}"></i>

                </div>


                <div class="transaction-info">

                    <strong>
                        ${escapeHTML(
                            transaction.description
                        )}
                    </strong>

                    <small>
                        ${escapeHTML(
                            transaction.category
                        )}
                        •
                        ${formatDate(
                            transaction.date
                        )}
                        ${escapeHTML(source)}
                    </small>

                </div>

            </div>


            <div class="transaction-right">

                <span
                    class="transaction-amount ${transaction.type}"
                >
                    ${sign}
                    ${formatCurrency(
                        transaction.amount
                    )}
                </span>


                <div class="transaction-actions">

                    <button
                        class="small-btn"
                        onclick="editTransaction(${transaction.id})"
                        title="Edit"
                    >
                        <i class="bi bi-pencil"></i>
                    </button>


                    <button
                        class="small-btn delete-btn"
                        onclick="deleteTransaction(${transaction.id})"
                        title="Delete"
                    >
                        <i class="bi bi-trash"></i>
                    </button>

                </div>

            </div>

        </div>

    `;

}


/* =====================================================
   CATEGORY FILTER
===================================================== */

function refreshCategoryFilter() {

    const select =
        document.getElementById(
            "categoryFilter"
        );

    if (!select) return;


    const oldValue = select.value;


    select.innerHTML = `

        <option value="all">
            All Categories
        </option>

    `;


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;

        option.textContent = category;

        select.appendChild(option);

    });


    if (
        categories.includes(oldValue)
    ) {

        select.value = oldValue;

    }

}


/* =====================================================
   DASHBOARD
===================================================== */

function refreshDashboard() {

    const transactions =
        getUserTransactions();


    const income =
        transactions
            .filter(
                item =>
                    item.type === "income"
            )
            .reduce(
                (sum, item) =>
                    sum + Number(item.amount),
                0
            );


    const expenses =
        transactions
            .filter(
                item =>
                    item.type === "expense"
            )
            .reduce(
                (sum, item) =>
                    sum + Number(item.amount),
                0
            );


    const savings =
        data.savings
            .filter(
                item =>
                    item.user ===
                    data.currentUser
            )
            .reduce(
                (sum, item) =>
                    sum + Number(item.current),
                0
            );


    const balance =
        income - expenses;


    setText(
        "totalIncome",
        formatCurrency(income)
    );

    setText(
        "totalExpenses",
        formatCurrency(expenses)
    );

    setText(
        "totalBalance",
        formatCurrency(balance)
    );

    setText(
        "totalSavings",
        formatCurrency(savings)
    );


    renderDashboardCharts();

    renderRecentTransactions();

}


function renderRecentTransactions() {

    const container =
        document.getElementById(
            "recentTransactions"
        );

    if (!container) return;


    const transactions =
        getUserTransactions()
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(0, 5);


    if (!transactions.length) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="bi bi-receipt"></i>

                <p>
                    No transactions yet.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        transactions.map(
            transaction =>
                transactionHTML(transaction)
        ).join("");

}


/* =====================================================
   CHARTS
===================================================== */

function renderDashboardCharts() {

    if (
        typeof Chart === "undefined"
    ) {

        return;

    }


    const transactions =
        getUserTransactions();


    const expenseTotals = {};


    categories.forEach(
        category =>
            expenseTotals[category] = 0
    );


    transactions
        .filter(
            item =>
                item.type === "expense"
        )
        .forEach(item => {

            expenseTotals[item.category] =
                (
                    expenseTotals[item.category] ||
                    0
                ) +
                Number(item.amount);

        });


    const expenseCanvas =
        document.getElementById(
            "expenseChart"
        );


    if (expenseCanvas) {

        if (expenseChart) {

            expenseChart.destroy();

        }


        expenseChart =
            new Chart(
                expenseCanvas,
                {

                    type: "doughnut",

                    data: {

                        labels: categories,

                        datasets: [

                            {

                                data:
                                    categories.map(
                                        category =>
                                            expenseTotals[
                                                category
                                            ]
                                    )

                            }

                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        plugins: {

                            legend: {

                                position: "bottom"

                            }

                        }

                    }

                }
            );

    }


    const income =
        transactions
            .filter(
                item =>
                    item.type === "income"
            )
            .reduce(
                (sum, item) =>
                    sum + Number(item.amount),
                0
            );


    const expenses =
        transactions
            .filter(
                item =>
                    item.type === "expense"
            )
            .reduce(
                (sum, item) =>
                    sum + Number(item.amount),
                0
            );


    const comparisonCanvas =
        document.getElementById(
            "incomeExpenseChart"
        );


    if (comparisonCanvas) {

        if (incomeExpenseChart) {

            incomeExpenseChart.destroy();

        }


        incomeExpenseChart =
            new Chart(
                comparisonCanvas,
                {

                    type: "bar",

                    data: {

                        labels: [
                            "Income",
                            "Expenses"
                        ],

                        datasets: [

                            {

                                data: [
                                    income,
                                    expenses
                                ]

                            }

                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        plugins: {

                            legend: {
                                display: false
                            }

                        }

                    }

                }
            );

    }

}


function renderReportChart() {

    if (
        typeof Chart === "undefined"
    ) return;


    const canvas =
        document.getElementById(
            "reportCategoryChart"
        );


    if (!canvas) return;


    const transactions =
        getUserTransactions();


    const totals = {};


    categories.forEach(
        category =>
            totals[category] = 0
    );


    transactions
        .filter(
            item =>
                item.type === "expense"
        )
        .forEach(item => {

            totals[item.category] =
                (
                    totals[item.category] ||
                    0
                ) +
                Number(item.amount);

        });


    if (reportCategoryChart) {

        reportCategoryChart.destroy();

    }


    reportCategoryChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels: categories,

                    datasets: [

                        {

                            data:
                                categories.map(
                                    category =>
                                        totals[
                                            category
                                        ]
                                )

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    }

                }

            }
        );


    renderReportSummary(
        transactions
    );

}


function renderReportSummary(transactions) {

    const container =
        document.getElementById(
            "reportSummary"
        );

    if (!container) return;


    const income =
        transactions
            .filter(
                item =>
                    item.type === "income"
            )
            .reduce(
                (sum, item) =>
                    sum + Number(item.amount),
                0
            );


    const expenses =
        transactions
            .filter(
                item =>
                    item.type === "expense"
            )
            .reduce(
                (sum, item) =>
                    sum + Number(item.amount),
                0
            );


    const balance =
        income - expenses;


    container.innerHTML = `

        <div class="summary-row">

            <span>
                Total Income
            </span>

            <strong>
                ${formatCurrency(income)}
            </strong>

        </div>


        <div class="summary-row">

            <span>
                Total Expenses
            </span>

            <strong>
                ${formatCurrency(expenses)}
            </strong>

        </div>


        <div class="summary-row">

            <span>
                Balance
            </span>

            <strong>
                ${formatCurrency(balance)}
            </strong>

        </div>


        <div class="summary-row">

            <span>
                Transactions
            </span>

            <strong>
                ${transactions.length}
            </strong>

        </div>

    `;

}


/* =====================================================
   BUDGET
===================================================== */

function openBudgetModal(budget = null) {

    const form =
        document.getElementById(
            "budgetForm"
        );


    form.reset();


    if (budget) {

        document.getElementById(
            "budgetEditId"
        ).value =
            budget.id;

        document.getElementById(
            "budgetCategory"
        ).value =
            budget.category;

        document.getElementById(
            "budgetAmount"
        ).value =
            budget.amount;

    } else {

        document.getElementById(
            "budgetEditId"
        ).value = "";

    }


    document
        .getElementById("budgetModal")
        .classList.remove("hidden");

}


function saveBudget(event) {

    event.preventDefault();


    const editId =
        document.getElementById(
            "budgetEditId"
        ).value;


    const category =
        document.getElementById(
            "budgetCategory"
        ).value;


    const amount =
        Number(
            document.getElementById(
                "budgetAmount"
            ).value
        );


    setText(
        "budgetAmountError",
        ""
    );


    if (!amount || amount <= 0) {

        setText(
            "budgetAmountError",
            "Enter a valid budget amount."
        );

        return;

    }


    if (editId) {

        const budget =
            data.budgets.find(
                item =>
                    String(item.id) ===
                    String(editId) &&
                    item.user ===
                    data.currentUser
            );


        if (budget) {

            budget.category =
                category;

            budget.amount =
                amount;

        }

    } else {

        data.budgets.push({

            id: Date.now(),

            user: data.currentUser,

            category,

            amount

        });

    }


    saveData();

    closeModal("budgetModal");

    refreshAll();

    showToast(
        "Budget saved."
    );

}


function deleteBudget(id) {

    if (
        !confirm(
            "Delete this budget?"
        )
    ) return;


    data.budgets =
        data.budgets.filter(
            item =>
                !(
                    Number(item.id) ===
                    Number(id) &&
                    item.user ===
                    data.currentUser
                )
        );


    saveData();

    refreshBudgets();

    showToast(
        "Budget deleted."
    );

}


function refreshBudgets() {

    const container =
        document.getElementById(
            "budgetList"
        );

    if (!container) return;


    const budgets =
        data.budgets.filter(
            item =>
                item.user ===
                data.currentUser
        );


    if (!budgets.length) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="bi bi-pie-chart"></i>

                <p>
                    No budgets created yet.
                </p>

            </div>

        `;

        return;

    }


    const transactions =
        getUserTransactions();


    container.innerHTML =
        budgets.map(budget => {

            const spent =
                transactions
                    .filter(
                        transaction =>
                            transaction.type ===
                                "expense" &&
                            transaction.category ===
                                budget.category
                    )
                    .reduce(
                        (sum, item) =>
                            sum +
                            Number(item.amount),
                        0
                    );


            const percentage =
                Math.min(
                    100,
                    (spent /
                        Number(budget.amount)) *
                        100
                );


            let progressClass = "";

            if (percentage >= 90) {

                progressClass = "danger";

            } else if (percentage >= 70) {

                progressClass = "warning";

            }


            return `

                <div class="budget-card">

                    <div class="budget-card-header">

                        <h3>
                            ${escapeHTML(
                                budget.category
                            )}
                        </h3>

                        <button
                            class="small-btn delete-btn"
                            onclick="deleteBudget(${budget.id})"
                        >
                            <i class="bi bi-trash"></i>
                        </button>

                    </div>


                    <div class="progress">

                        <div
                            class="progress-bar ${progressClass}"
                            style="width:${percentage}%"
                        ></div>

                    </div>


                    <div class="budget-details">

                        <span>
                            Spent:
                            ${formatCurrency(spent)}
                        </span>

                        <span>
                            Budget:
                            ${formatCurrency(
                                budget.amount
                            )}
                        </span>

                    </div>

                </div>

            `;

        }).join("");

}


/* =====================================================
   SAVINGS
===================================================== */

function openSavingsModal() {

    document
        .getElementById("savingsForm")
        .reset();


    document
        .getElementById("savingsCurrent")
        .value = 0;


    document
        .getElementById("savingsModal")
        .classList.remove("hidden");

}


function saveSavings(event) {

    event.preventDefault();


    const name =
        document
            .getElementById("savingsName")
            .value
            .trim();


    const target =
        Number(
            document
                .getElementById("savingsTarget")
                .value
        );


    const current =
        Number(
            document
                .getElementById("savingsCurrent")
                .value
        );


    setText(
        "savingsNameError",
        ""
    );

    setText(
        "savingsTargetError",
        ""
    );


    let valid = true;


    if (!name) {

        setText(
            "savingsNameError",
            "Goal name is required."
        );

        valid = false;

    }


    if (!target || target <= 0) {

        setText(
            "savingsTargetError",
            "Enter a valid target amount."
        );

        valid = false;

    }


    if (current < 0) {

        valid = false;

    }


    if (!valid) return;


    data.savings.push({

        id: Date.now(),

        user: data.currentUser,

        name,

        target,

        current

    });


    saveData();

    closeModal("savingsModal");

    refreshAll();

    showToast(
        "Savings goal added."
    );

}


function deleteSavings(id) {

    if (
        !confirm(
            "Delete this savings goal?"
        )
    ) return;


    data.savings =
        data.savings.filter(
            item =>
                !(
                    Number(item.id) ===
                    Number(id) &&
                    item.user ===
                    data.currentUser
                )
        );


    saveData();

    refreshAll();

    showToast(
        "Savings goal deleted."
    );

}


function refreshSavings() {

    const container =
        document.getElementById(
            "savingsList"
        );

    if (!container) return;


    const savings =
        data.savings.filter(
            item =>
                item.user ===
                data.currentUser
        );


    if (!savings.length) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="bi bi-piggy-bank"></i>

                <p>
                    No savings goals yet.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        savings.map(goal => {

            const percentage =
                Math.min(
                    100,
                    (Number(goal.current) /
                        Number(goal.target)) *
                        100
                );


            return `

                <div class="budget-card">

                    <div class="budget-card-header">

                        <h3>
                            ${escapeHTML(goal.name)}
                        </h3>

                        <button
                            class="small-btn delete-btn"
                            onclick="deleteSavings(${goal.id})"
                        >
                            <i class="bi bi-trash"></i>
                        </button>

                    </div>


                    <div class="progress">

                        <div
                            class="progress-bar"
                            style="width:${percentage}%"
                        ></div>

                    </div>


                    <div class="budget-details">

                        <span>
                            Saved:
                            ${formatCurrency(
                                goal.current
                            )}
                        </span>

                        <span>
                            Target:
                            ${formatCurrency(
                                goal.target
                            )}
                        </span>

                    </div>

                </div>

            `;

        }).join("");

}


/* =====================================================
   PROFILE
===================================================== */

function saveProfile(event) {

    event.preventDefault();


    const user =
        getCurrentUser();


    if (!user) return;


    user.firstName =
        document
            .getElementById("profileFirstName")
            .value
            .trim();


    user.lastName =
        document
            .getElementById("profileLastName")
            .value
            .trim();


    user.email =
        document
            .getElementById("profileEmail")
            .value
            .trim();


    saveData();

    updateUserInterface();

    showToast(
        "Profile updated."
    );

}


/* =====================================================
   OCR SETUP
===================================================== */

function setupOCR() {

    const input =
        document.getElementById(
            "receiptImage"
        );


    if (!input) return;


    input.addEventListener(
        "change",
        handleReceiptImage
    );

}


/* =====================================================
   OPEN OCR
===================================================== */

function openOCRModal() {

    resetOCRScanner();


    document
        .getElementById("ocrModal")
        .classList.remove("hidden");

}


function closeOCRModal() {

    document
        .getElementById("ocrModal")
        .classList.add("hidden");

}


function resetOCRScanner() {

    const input =
        document.getElementById(
            "receiptImage"
        );


    if (input) {

        input.value = "";

    }


    const preview =
        document.getElementById(
            "receiptPreview"
        );


    if (preview) {

        preview.src = "";

    }


    toggleHidden(
        "ocrPreviewContainer",
        true
    );

    toggleHidden(
        "ocrProgressContainer",
        true
    );

    toggleHidden(
        "ocrTextContainer",
        true
    );

    toggleHidden(
        "ocrResult",
        true
    );

    toggleHidden(
        "ocrError",
        true
    );


    setText(
        "ocrText",
        ""
    );

    setText(
        "ocrStatus",
        "Preparing..."
    );

    setText(
        "ocrProgress",
        "0%"
    );


    const progressBar =
        document.getElementById(
            "ocrProgressBar"
        );


    if (progressBar) {

        progressBar.style.width =
            "0%";

    }

}


/* =====================================================
   OCR IMAGE
===================================================== */

async function handleReceiptImage(event) {

    const file =
        event.target.files?.[0];


    if (!file) return;


    if (
        !file.type.startsWith("image/")
    ) {

        showOCRError(
            "Please select an image file."
        );

        return;

    }


    const preview =
        document.getElementById(
            "receiptPreview"
        );


    preview.src =
        URL.createObjectURL(file);


    toggleHidden(
        "ocrPreviewContainer",
        false
    );


    toggleHidden(
        "ocrProgressContainer",
        false
    );


    toggleHidden(
        "ocrError",
        true
    );


    toggleHidden(
        "ocrResult",
        true
    );


    await scanReceipt(file);

}


/* =====================================================
   OCR SCAN
===================================================== */

async function scanReceipt(file) {

    try {

        if (
            typeof Tesseract ===
            "undefined"
        ) {

            throw new Error(
                "OCR library could not be loaded. Check your internet connection."
            );

        }


        setText(
            "ocrStatus",
            "Reading receipt..."
        );


        setText(
            "ocrProgress",
            "0%"
        );


        const result =
            await Tesseract.recognize(
                file,
                "eng",
                {

                    logger: message => {

                        if (
                            message.status
                        ) {

                            setText(
                                "ocrStatus",
                                formatOCRStatus(
                                    message.status
                                )
                            );

                        }


                        if (
                            typeof message.progress ===
                            "number"
                        ) {

                            const percent =
                                Math.round(
                                    message.progress *
                                    100
                                );


                            setText(
                                "ocrProgress",
                                `${percent}%`
                            );


                            const bar =
                                document.getElementById(
                                    "ocrProgressBar"
                                );


                            if (bar) {

                                bar.style.width =
                                    `${percent}%`;

                            }

                        }

                    }

                }
            );


        const text =
            result.data.text || "";


        document
            .getElementById("ocrText")
            .value =
            text;


        toggleHidden(
            "ocrTextContainer",
            false
        );


        analyzeReceipt(text);


    } catch (error) {

        console.error(error);

        showOCRError(
            "Could not scan this receipt. Try a clearer image."
        );

    }

}


function formatOCRStatus(status) {

    const map = {

        "loading tesseract core":
            "Loading OCR engine...",

        "initializing tesseract":
            "Initializing OCR...",

        "loading language traineddata":
            "Loading English language...",

        "initializing api":
            "Starting OCR...",

        "recognizing text":
            "Recognizing receipt text..."

    };


    return (
        map[status] ||
        status ||
        "Processing..."
    );

}


/* =====================================================
   OCR ANALYSIS
===================================================== */

function analyzeReceipt(text) {

    const amount =
        detectReceiptAmount(text);


    const category =
        detectExpenseCategory(text);


    const description =
        detectReceiptDescription(text);


    const date =
        detectReceiptDate(text) ||
        getTodayDate();


    document
        .getElementById("ocrAmount")
        .value =
        amount || "";


    document
        .getElementById("ocrCategory")
        .value =
        category;


    document
        .getElementById("ocrDescription")
        .value =
        description;


    document
        .getElementById("ocrDate")
        .value =
        date;


    toggleHidden(
        "ocrResult",
        false
    );


    setText(
        "ocrStatus",
        "Receipt analyzed"
    );


    setText(
        "ocrProgress",
        "100%"
    );


    const bar =
        document.getElementById(
            "ocrProgressBar"
        );


    if (bar) {

        bar.style.width = "100%";

    }

}


/* =====================================================
   DETECT AMOUNT
===================================================== */

function detectReceiptAmount(text) {

    if (!text) return "";


    const lines =
        text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean);


    const priorityWords = [

        "grand total",

        "total amount",

        "amount payable",

        "amount due",

        "net amount",

        "net total",

        "total",

        "payable",

        "balance due",

        "bill amount"

    ];


    let candidates = [];


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const line =
            lines[i].toLowerCase();


        if (
            priorityWords.some(
                word =>
                    line.includes(word)
            )
        ) {

            const numbers =
                extractNumbers(
                    lines[i]
                );


            numbers.forEach(
                number =>
                    candidates.push(number)
            );


            if (
                numbers.length === 0 &&
                i + 1 < lines.length
            ) {

                extractNumbers(
                    lines[i + 1]
                ).forEach(
                    number =>
                        candidates.push(number)
                );

            }

        }

    }


    if (candidates.length) {

        const valid =
            candidates.filter(
                number =>
                    number > 0 &&
                    number < 10000000
            );


        if (valid.length) {

            return Math.max(
                ...valid
            ).toFixed(2);

        }

    }


    const allNumbers =
        extractNumbers(text)
            .filter(
                number =>
                    number > 0 &&
                    number < 10000000
            );


    if (!allNumbers.length) {

        return "";

    }


    return Math.max(
        ...allNumbers
    ).toFixed(2);

}


/* =====================================================
   NUMBER EXTRACTION
===================================================== */

function extractNumbers(text) {

    if (!text) return [];


    const regex =
        /(?:₹|rs\.?|inr)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/gi;


    const results = [];


    let match;


    while (
        (match = regex.exec(text)) !== null
    ) {

        const value =
            Number(
                match[1]
                    .replace(/,/g, "")
            );


        if (
            Number.isFinite(value)
        ) {

            results.push(value);

        }

    }


    return results;

}


/* =====================================================
   CATEGORY DETECTION
===================================================== */

function detectExpenseCategory(text) {

    const value =
        (text || "").toLowerCase();


    const keywords = {

        Food: [

            "restaurant",
            "resturant",
            "cafe",
            "coffee",
            "food",
            "pizza",
            "burger",
            "biryani",
            "meal",
            "bakery",
            "hotel",
            "swiggy",
            "zomato",
            "dominos",
            "domino's",
            "kfc",
            "mcdonald",
            "canteen",
            "grocery",
            "groceries",
            "supermarket"

        ],


        Transport: [

            "uber",
            "ola",
            "rapido",
            "taxi",
            "cab",
            "bus",
            "metro",
            "train",
            "fuel",
            "petrol",
            "diesel",
            "parking",
            "toll",
            "transport",
            "irctc"

        ],


        Shopping: [

            "amazon",
            "flipkart",
            "myntra",
            "shopping",
            "mall",
            "clothing",
            "shirt",
            "shoes",
            "dress",
            "fashion",
            "store",
            "retail"

        ],


        Bills: [

            "electricity",
            "electric",
            "water bill",
            "gas bill",
            "internet",
            "wifi",
            "broadband",
            "mobile recharge",
            "recharge",
            "phone bill",
            "bill payment"

        ],


        Entertainment: [

            "movie",
            "cinema",
            "theatre",
            "theater",
            "netflix",
            "prime video",
            "spotify",
            "game",
            "gaming",
            "entertainment",
            "concert"

        ],


        Education: [

            "college",
            "school",
            "university",
            "course",
            "book",
            "books",
            "tuition",
            "education",
            "udemy",
            "coursera",
            "exam fee"

        ],


        Health: [

            "hospital",
            "clinic",
            "doctor",
            "medical",
            "medicine",
            "pharmacy",
            "health",
            "diagnostic",
            "lab",
            "apollo",
            "healthcare"

        ]

    };


    let bestCategory = "Other";
    let bestScore = 0;


    for (
        const [category, words]
        of Object.entries(keywords)
    ) {

        let score = 0;


        words.forEach(
            word => {

                if (
                    value.includes(word)
                ) {

                    score++;

                }

            }
        );


        if (score > bestScore) {

            bestScore = score;

            bestCategory =
                category;

        }

    }


    return bestCategory;

}


/* =====================================================
   DESCRIPTION DETECTION
===================================================== */

function detectReceiptDescription(text) {

    if (!text) {

        return "Receipt expense";

    }


    const value =
        text.toLowerCase();


    const merchants = [

        ["domino", "Domino's receipt"],

        ["swiggy", "Swiggy receipt"],

        ["zomato", "Zomato receipt"],

        ["amazon", "Amazon purchase"],

        ["flipkart", "Flipkart purchase"],

        ["myntra", "Myntra purchase"],

        ["uber", "Uber ride"],

        ["ola", "Ola ride"],

        ["rapido", "Rapido ride"],

        ["netflix", "Netflix"],

        ["spotify", "Spotify"],

        ["kfc", "KFC"],

        ["mcdonald", "McDonald's"],

        ["apollo", "Apollo Healthcare"]

    ];


    for (
        const [keyword, description]
        of merchants
    ) {

        if (
            value.includes(keyword)
        ) {

            return description;

        }

    }


    const lines =
        text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean);


    const ignored = [

        "receipt",
        "invoice",
        "tax invoice",
        "bill",
        "thank you",
        "total",
        "subtotal"

    ];


    for (
        const line of lines.slice(0, 8)
    ) {

        if (
            line.length >= 3 &&
            line.length <= 60 &&
            !ignored.some(
                word =>
                    line
                        .toLowerCase()
                        .includes(word)
            ) &&
            !extractNumbers(line).length
        ) {

            return line;

        }

    }


    return "Receipt expense";

}


/* =====================================================
   OCR DATE
===================================================== */

function detectReceiptDate(text) {

    if (!text) return "";


    const match =
        text.match(
            /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/
        );


    if (!match) {

        return "";

    }


    let day =
        Number(match[1]);

    let month =
        Number(match[2]);

    let year =
        Number(match[3]);


    if (year < 100) {

        year += 2000;

    }


    if (
        month < 1 ||
        month > 12 ||
        day < 1 ||
        day > 31
    ) {

        return "";

    }


    return [
        String(year).padStart(4, "0"),
        String(month).padStart(2, "0"),
        String(day).padStart(2, "0")
    ].join("-");

}


/* =====================================================
   SAVE OCR TRANSACTION
===================================================== */

function saveOCRTransaction() {

    const amount =
        Number(
            document
                .getElementById("ocrAmount")
                .value
        );


    const category =
        document
            .getElementById("ocrCategory")
            .value;


    const description =
        document
            .getElementById("ocrDescription")
            .value
            .trim();


    const date =
        document
            .getElementById("ocrDate")
            .value;


    if (!amount || amount <= 0) {

        showOCRError(
            "Please enter a valid expense amount."
        );

        return;

    }


    if (!description) {

        showOCRError(
            "Please enter a description."
        );

        return;

    }


    if (!date) {

        showOCRError(
            "Please select a date."
        );

        return;

    }


    data.transactions.push({

        id: Date.now(),

        user: data.currentUser,

        type: "expense",

        amount,

        category,

        description,

        date,

        source: "OCR Receipt"

    });


    saveData();

    closeOCRModal();

    refreshAll();

    showToast(
        "Receipt expense added successfully."
    );

}


/* =====================================================
   OCR ERROR
===================================================== */

function showOCRError(message) {

    const error =
        document.getElementById(
            "ocrError"
        );


    if (!error) return;


    error.textContent =
        message;


    error.classList.remove(
        "hidden"
    );

}


/* =====================================================
   MODALS
===================================================== */

function closeModal(id) {

    const modal =
        document.getElementById(id);


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


document.addEventListener(
    "click",
    event => {

        if (
            event.target.classList.contains(
                "modal"
            )
        ) {

            event.target.classList.add(
                "hidden"
            );

        }

    }
);


/* =====================================================
   REFRESH EVERYTHING
===================================================== */

function refreshAll() {

    refreshCategoryFilter();

    refreshDashboard();

    refreshTransactions();

    refreshBudgets();

    refreshSavings();

    if (
        currentPage === "reports"
    ) {

        renderReportChart();

    }

    updateUserInterface();

}


/* =====================================================
   THEME
===================================================== */

function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    const dark =
        document.body.classList.contains(
            "dark"
        );


    localStorage.setItem(
        "expense_ai_theme",
        dark ? "dark" : "light"
    );

}


function loadTheme() {

    const theme =
        localStorage.getItem(
            "expense_ai_theme"
        );


    if (theme === "dark") {

        document.body.classList.add(
            "dark"
        );

    }

}


/* =====================================================
   UTILITIES
===================================================== */

function getTodayDate() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


function setDefaultDates() {

    const transactionDate =
        document.getElementById(
            "transactionDate"
        );


    if (transactionDate) {

        transactionDate.value =
            getTodayDate();

    }


    const ocrDate =
        document.getElementById(
            "ocrDate"
        );


    if (ocrDate) {

        ocrDate.value =
            getTodayDate();

    }

}


function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {

            style: "currency",

            currency: "INR",

            minimumFractionDigits: 2,

            maximumFractionDigits: 2

        }
    ).format(
        Number(amount) || 0
    );

}


function formatDate(dateString) {

    if (!dateString) {

        return "";

    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return date.toLocaleDateString(
        "en-IN",
        {

            day: "2-digit",

            month: "short",

            year: "numeric"

        }
    );

}


function getCategoryIcon(category) {

    const icons = {

        Food: "bi-cup-hot",

        Transport: "bi-car-front",

        Shopping: "bi-bag",

        Bills: "bi-receipt",

        Entertainment: "bi-controller",

        Education: "bi-book",

        Health: "bi-heart-pulse",

        Other: "bi-three-dots"

    };


    return (
        icons[category] ||
        "bi-three-dots"
    );

}


function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


function toggleHidden(id, hidden) {

    const element =
        document.getElementById(id);


    if (!element) return;


    element.classList.toggle(
        "hidden",
        hidden
    );

}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) return;


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        showToast.timer
    );


    showToast.timer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =====================================================
   LOAD THEME
===================================================== */

loadTheme();