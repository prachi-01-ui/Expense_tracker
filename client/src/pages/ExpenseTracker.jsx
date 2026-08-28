import React, { useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import jsPDF from 'jspdf';
import { API_URL } from '../config';

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');

  const token = localStorage.getItem('token');

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setExpenses(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setScanStatus('Reading document...');

    try {
      const worker = await createWorker('eng');
      const ret = await worker.recognize(file);
      await worker.terminate();

      const text = ret.data.text;
      const amountMatch =
        text.match(/(?:Total|\$|₹)\s*[:\ \n]?\s*([0-9]+\.[0-9]{2})/i) ||
        text.match(/([0-9]+\.[0-9]{2})/);
      if (amountMatch) setAmount(amountMatch[1]);

      const firstLine = text.split('\n').find((l) => l.trim().length > 2);
      if (firstLine) setTitle(firstLine.trim().substring(0, 30));

      setScanStatus('Receipt scanned successfully!');
    } catch (err) {
      console.error(err);
      setScanStatus('Scan failed. Please type manually.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    try {
      const res = await fetch(`${API_URL}/api/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, amount: Number(amount), category }),
      });
      const data = await res.json();
      if (res.ok) {
        setExpenses([data, ...expenses]);
        setTitle('');
        setAmount('');
        setScanStatus('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setExpenses(expenses.filter((exp) => exp._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const exportToCSV = () => {
    const headers = ['Title,Amount,Category,Date\n'];
    const rows = expenses.map(
      (exp) =>
        `"${exp.title}",${exp.amount},"${exp.category}","${new Date(
          exp.createdAt
        ).toLocaleDateString()}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n'))], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Expense Summary Statement', 14, 20);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Total Recorded Expenses: $${totalAmount.toFixed(2)}`, 14, 34);
    doc.line(14, 38, 196, 38);

    let y = 46;
    doc.setFont('helvetica', 'bold');
    doc.text('Title', 14, y);
    doc.text('Category', 80, y);
    doc.text('Amount', 140, y);
    doc.text('Date', 170, y);
    doc.setFont('helvetica', 'normal');

    y += 6;
    expenses.forEach((exp) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(String(exp.title).substring(0, 25), 14, y);
      doc.text(String(exp.category), 80, y);
      doc.text(`$${Number(exp.amount).toFixed(2)}`, 140, y);
      doc.text(new Date(exp.createdAt).toLocaleDateString(), 170, y);
      y += 8;
    });

    doc.save('expense_report.pdf');
  };

  const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="mt-4 space-y-6">
      <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-sm font-medium text-gray-500 block">Total Spent</span>
          <span className="text-3xl font-extrabold text-gray-900">${totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg border border-gray-300 transition"
          >
            Export CSV
          </button>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            Download PDF
          </button>
        </div>
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Scan Receipt or Receipt Photo</h3>
          <p className="text-xs text-gray-500">Supports image photos & PDF documents</p>
        </div>
        <input
          type="file"
          accept="image/*,application/pdf"
          capture="environment"
          onChange={handleReceiptUpload}
          disabled={isScanning}
          className="text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-200 file:text-gray-800 hover:file:bg-gray-300 cursor-pointer"
        />
      </div>

      {scanStatus && <p className="text-xs text-indigo-600 font-medium text-center">{scanStatus}</p>}

      <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input
          type="text"
          placeholder="Expense title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount ($)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Shopping">Shopping</option>
          <option value="Bills">Bills</option>
          <option value="Other">Other</option>
        </select>
        <button
          type="submit"
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition"
        >
          Add Item
        </button>
      </form>

      <div className="space-y-2">
        {expenses.length === 0 ? (
          <p className="text-gray-400 text-center py-6 text-sm">No recorded transactions yet.</p>
        ) : (
          expenses.map((exp) => (
            <div
              key={exp._id}
              className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl shadow-xs hover:border-gray-300 transition"
            >
              <div>
                <span className="font-semibold text-gray-900 text-sm block">{exp.title}</span>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full inline-block mt-1">
                  {exp.category}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-900 text-base">-${exp.amount.toFixed(2)}</span>
                <button
                  onClick={() => handleDelete(exp._id)}
                  className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;