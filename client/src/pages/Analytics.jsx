import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { API_URL } from '../config';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Analytics = () => {
  const [expenses, setExpenses] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
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
    fetchExpenses();
  }, []);

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Other'];
  const categoryTotals = categories.map((cat) =>
    expenses
      .filter((exp) => exp.category === cat)
      .reduce((sum, exp) => sum + exp.amount, 0)
  );

  const doughnutData = {
    labels: categories,
    datasets: [
      {
        data: categoryTotals,
        backgroundColor: ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: categories,
    datasets: [
      {
        label: 'Spending Volume ($)',
        data: categoryTotals,
        backgroundColor: '#6366F1',
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="mt-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-xs">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 text-center">Category Share</h3>
          <div className="max-w-xs mx-auto">
            <Doughnut data={doughnutData} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-xs">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 text-center">Volume Bar Chart</h3>
          <Bar data={barData} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;