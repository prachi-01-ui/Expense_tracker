import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import ExpenseTracker from './pages/ExpenseTracker';
import TaskManager from './pages/TaskManager';
import Analytics from './pages/Analytics';
import PaymentHistory from './pages/PaymentHistory';

function App() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return isRegistering ? (
      <Register onSwitchToLogin={() => setIsRegistering(false)} onRegisterSuccess={(u) => setUser(u)} />
    ) : (
      <Login onSwitchToRegister={() => setIsRegistering(true)} onLoginSuccess={(u) => setUser(u)} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Personal Workspace</h1>
            <p className="text-xs text-gray-500">Expenses, tasks & financial analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Hi, <strong className="text-gray-900">{user.name}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-300 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex border-b border-gray-200 mt-4">
          {[
            { id: 'expenses', label: 'Expenses' },
            { id: 'tasks', label: 'Tasks' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'payments', label: 'UPI & Payments' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 px-4 font-medium text-sm border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'expenses' && <ExpenseTracker />}
        {activeTab === 'tasks' && <TaskManager />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'payments' && <PaymentHistory />}
      </div>
    </div>
  );
}

export default App;