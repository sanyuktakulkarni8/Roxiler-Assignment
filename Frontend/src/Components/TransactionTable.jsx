
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const TransactionTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState('03'); // Default month set to March
  const [months] = useState([
    { number: '01', name: 'January' },
    { number: '02', name: 'February' },
    { number: '03', name: 'March' },
    { number: '04', name: 'April' },
    { number: '05', name: 'May' },
    { number: '06', name: 'June' },
    { number: '07', name: 'July' },
    { number: '08', name: 'August' },
    { number: '09', name: 'September' },
    { number: '10', name: 'October' },
    { number: '11', name: 'November' },
    { number: '12', name: 'December' }
  ]);
   
  const [statistics, setStatistics] = useState({
    totalSaleAmount: 0,
    totalSoldItems: 0,
    totalNotSoldItems: 0
  });

  const [priceRangeData, setPriceRangeData] = useState([]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/transactions?month=${month}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`http://localhost:5000/statistics?month=${month}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchPriceRangeData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/price-range?month=${month}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setPriceRangeData(data);
    } catch (error) {
      console.error('Error fetching price range data:', error);
    }
  };



  useEffect(() => {
    fetchTransactions();
    fetchStatistics();
    fetchPriceRangeData();
  }, [month]); // Only run effect when month changes

  // Prepare data for the bar chart

  const chartData = {
    labels: priceRangeData.map(range => range.range),
    datasets: [
      {
        label: 'Number of Items',
        data: priceRangeData.map(range => range.count),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };


  return (
    <div>
      <select onChange={(e) => setMonth(e.target.value)} value={month}>
        {months.map(m => (
          <option key={m.number} value={m.number}>
            {m.name}
          </option>
        ))}
      </select>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Category</th>
            <th>Sold</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.id}>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>{transaction.price}</td>
              <td>{transaction.category}</td>
              <td>{transaction.sold ? 'Yes' : 'No'}</td>
              <td><img src={transaction.image} alt={transaction.title} width="50" /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <h2>Statistics</h2>
        <p>Total Sale Amount: ${statistics.totalSaleAmount.toFixed(2)}</p>
        <p>Total Sold Items: {statistics.totalSoldItems}</p>
        <p>Total Not Sold Items: {statistics.totalNotSoldItems}</p>
      </div>

      <div>
        <h2>Price Range Distribution</h2>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `Count: ${context.raw}`;
                  }
                }
              }
            }
          }}
        />
      </div>

    </div>
  );
};

export default TransactionTable;
