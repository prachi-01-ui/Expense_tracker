# Personal Workspace (Expense & Task Tracker)

A full-stack MERN application built to seamlessly track daily expenses, manage tasks, generate financial analytics, and monitor payment history.

🚀 **Live Demo:** [https://expense-tracker-uyn2.onrender.com](https://expense-tracker-uyn2.onrender.com)

---

## 🌟 Features

- **User Authentication:** Secure registration and login using JWT (JSON Web Tokens) and bcrypt password hashing.
- **Expense Tracker:** Add, view, categorize, and track daily personal expenses.
- **Task Manager:** Create and organize to-do items and daily tasks.
- **Analytics & Reporting:** Visual summary charts of financial expenses.
- **UPI & Payment History:** Track recent transactions and payment records.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS, Lucide React, Chart.js / Recharts
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT, bcryptjs
- **Deployment:** Render

---

## 📁 Folder Structure
├── client/          # Frontend React application (Vite)
├── server/          # Backend Node.js & Express API
├── .env             # Environment variables (Backend)
├── server.js        # Main Express server entry point
└── README.md        # Project documentation


---

## 💻 Local Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git](https://github.com/prachi-01-ui/Expense_tracker.git)
   cd Expense_tracker

# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..

Configure Environment Variables:
Create a .env file in the root directory and add:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

Run the application locally:

Bash
# Build the client static bundle
cd client && npm run build && cd ..

# Start the Express backend server
node server.js

