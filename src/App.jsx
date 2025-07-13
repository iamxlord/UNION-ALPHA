// src/App.js
import React, { useState, useEffect } from 'react';
import { getTotalTransactionCounts, getAddressTransactions } from './api/unionApi';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { chains } from './config/chains';

// Import your CSS file
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [totalTxCounts, setTotalTxCounts] = useState({});
  const [address, setAddress] = useState('');
  const [addressTxns, setAddressTxns] = useState([]);
  const [loadingTotal, setLoadingTotal] = useState(true);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [errorTotal, setErrorTotal] = useState(null);
  const [errorAddress, setErrorAddress] = useState(null);

  // Effect for total transaction counts (runs once on mount)
  useEffect(() => {
    setLoadingTotal(true);
    getTotalTransactionCounts()
      .then(counts => {
        setTotalTxCounts(counts);
        setErrorTotal(null); // Clear any previous errors
      })
      .catch(err => {
        console.error("Error fetching total transaction counts:", err);
        setErrorTotal(err.message || 'Failed to load total transaction data.');
      })
      .finally(() => {
        setLoadingTotal(false);
      });
  }, []);

  // Function to handle fetching address-specific transactions
  const handleFetchAddressTransactions = async () => {
    if (!address.trim()) {
      setErrorAddress("Please enter an address.");
      setAddressTxns([]);
      return;
    }

    setLoadingAddress(true);
    setAddressTxns([]); // Clear previous results
    setErrorAddress(null); // Clear previous errors

    try {
      const transactions = await getAddressTransactions(address.trim());
      setAddressTxns(transactions);
    } catch (err) {
      console.error(`Error fetching transactions for ${address}:`, err);
      setErrorAddress(err.message || `Failed to load transactions for ${address}.`);
    } finally {
      setLoadingAddress(false);
    }
  };

  const chartData = {
    labels: chains,
    datasets: [
      {
        label: 'Total Transaction Count',
        data: chains.map(chain => totalTxCounts[chain] || 0),
        backgroundColor: 'rgba(99, 102, 241, 0.4)', // Slightly adjust color for dark mode
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        borderRadius: 8, // Rounded bars
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e0e0e0', // Legend text color for dark mode
        }
      },
      title: {
        display: true,
        text: 'Total Transactions by Chain',
        color: '#e0e0e0', // Title color for dark mode
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Darker tooltip background
        titleColor: '#fff',
        bodyColor: '#e0e0e0',
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#b0b0b0', // X-axis label color for dark mode
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.1)', // Lighter grid lines
        }
      },
      y: {
        ticks: {
          color: '#b0b0b0', // Y-axis label color for dark mode
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.1)', // Lighter grid lines
        }
      }
    }
  };


  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">UNION TX Checker</h1>
        <p className="app-tagline">Real-time transaction insights across Union chains.</p>
      </header>

      <main className="main-content">
        <section className="dashboard-card total-transactions-section">
          <h2 className="card-title">Global Chain Transaction Overview</h2>
          {loadingTotal && <div className="loading-spinner"></div>}
          {errorTotal && <p className="error-message">Error: {errorTotal}</p>}
          {!loadingTotal && !errorTotal && (
            <>
              {Object.values(totalTxCounts).every(count => count === 0) ? (
                <p className="no-data-message">No global transaction data available.</p>
              ) : (
                <div className="chart-container">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              )}
              <h3 className="sub-title">Transaction Counts by Chain:</h3>
              <ul className="chain-list">
                {chains.map(chain => (
                  <li key={chain} className="chain-item">
                    <span className="chain-name">{chain}:</span>
                    <span className="chain-count">{totalTxCounts[chain] || 0} transactions</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="dashboard-card address-lookup-section">
          <h2 className="card-title">Lookup Transactions by Address</h2>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter Wallet Address (e.g., 0x... or osmo1...)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="address-input"
            />
            <button onClick={handleFetchAddressTransactions} disabled={loadingAddress} className="lookup-button">
              {loadingAddress ? 'Searching...' : 'Search Transactions'}
            </button>
          </div>

          {errorAddress && <p className="error-message">Error: {errorAddress}</p>}

          {!loadingAddress && addressTxns.length > 0 && (
            <div className="address-results-container">
              <h3 className="sub-title">Transactions for {address}:</h3>
              <p className="transaction-summary">Total found: <span className="highlight">{addressTxns.length}</span></p>
              <div className="transaction-list-wrapper"> {/* Add wrapper for scroll */}
                <ul className="transaction-list">
                  {addressTxns.map(tx => (
                    <li key={tx.id} className="transaction-item">
                      <div className="item-header">
                        <span className="item-id">ID: {tx.id.substring(0, 8)}...</span> {/* Truncate ID for display */}
                        <span className={`item-status status-${(tx.stage || tx.packet_status || 'unknown').toLowerCase().replace(' ', '-')}`}>
                          {tx.stage || tx.packet_status}
                        </span>
                      </div>
                      <div className="item-body">
                        <p><strong>From:</strong> <span className="address-link">{tx.source_address?.substring(0, 10)}...</span> ({tx.source_chain})</p>
                        <p><strong>To:</strong> <span className="address-link">{tx.destination_address?.substring(0, 10)}...</span> ({tx.destination_chain})</p>
                        <p><strong>Amount:</strong> <span className="highlight">{tx.amount} {tx.asset?.symbol}</span></p>
                        <p><strong>Time:</strong> {new Date(tx.timestamp).toLocaleString()}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {!loadingAddress && addressTxns.length === 0 && address.trim() && !errorAddress && (
            <p className="no-data-message">No transactions found for the address: <span className="highlight">{address}</span></p>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Union Alpha. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
