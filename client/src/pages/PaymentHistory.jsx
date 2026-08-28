import React, { useState } from 'react';
import { API_URL } from '../config';

const PaymentHistory = () => {
  const [smsInput, setSmsInput] = useState('');
  const [status, setStatus] = useState('');
  const [parsedTransactions, setParsedTransactions] = useState([]);

  const token = localStorage.getItem('token');

  const handleParseSMS = (e) => {
    e.preventDefault();
    if (!smsInput) return;

    const amountMatch = smsInput.match(/(?:Rs\.?|INR|\$)\s*([0-9]+(?:\.[0-9]{2})?)/i) || smsInput.match(/([0-9]+\.[0-9]{2})/);
    const vendorMatch = smsInput.match(/(?:to|at|vpa)\s+([A-Za-z0-9\s]+?)(?=\s+on|\s+via|\s+ref|\.|$)/i);

    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
    const vendor = vendorMatch ? vendorMatch[1].trim() : 'UPI Payment';

    if (amount > 0) {
      const newTx = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        provider: 'UPI / SMS',
        amount: amount,
        description: vendor,
        category: 'Food',
      };

      setParsedTransactions([newTx, ...parsedTransactions]);
      setSmsInput('');
      setStatus(`Successfully extracted ₹${amount} for "${vendor}"!`);
    } else {
      setStatus('Could not extract amount. Try pasting a clear bank SMS.');
    }
  };

  const handleImportToExpenses = async (tx) => {
    try {
      const res = await fetch(`${API_URL}/api/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `[${tx.provider}] ${tx.description}`,
          amount: tx.amount,
          category: tx.category,
        }),
      });
      if (res.ok) {
        setStatus(`Imported "${tx.description}" ($${tx.amount}) to Expenses!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-4 bg-white border border-gray-200 p-5 rounded-xl shadow-xs space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900">UPI SMS & Payment Parser</h2>
        <p className="text-xs text-gray-500">
          Paste bank SMS notifications (GPay / PhonePe / Paytm) to auto-extract transaction details
        </p>
      </div>

      <form onSubmit={handleParseSMS} className="space-y-3">
        <textarea
          rows="2"
          placeholder="Paste SMS here (e.g., 'Paid Rs 250.00 to Swiggy via Google Pay...')"
          value={smsInput}
          onChange={(e) => setSmsInput(e.target.value)}
          className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
        >
          Parse Transaction
        </button>
      </form>

      {status && <p className="text-xs text-indigo-600 text-center font-medium">{status}</p>}

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Parsed Transactions</h3>
        {parsedTransactions.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">Paste an SMS above to extract payments.</p>
        ) : (
          parsedTransactions.map((tx) => (
            <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div>
                <span className="font-semibold text-gray-900 text-sm">{tx.description}</span>
                <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded ml-2 font-medium">
                  {tx.provider}
                </span>
                <p className="text-xs text-gray-500 mt-0.5">{tx.date} • {tx.category}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">${tx.amount.toFixed(2)}</span>
                <button
                  onClick={() => handleImportToExpenses(tx)}
                  className="px-3 py-1 bg-white border border-gray-300 hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 text-xs font-medium rounded-md transition"
                >
                  + Import to Expenses
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;