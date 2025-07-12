// src/App.js
import React, { useState, useEffect } from 'react';
import { getTotalTransactionCounts, getAddressTransactions } from './api/unionApi'; // Updated import
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { chains } from './config/chains'; // Updated import

// Import your CSS file
import './App.css'; // This will be your main CSS file

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
  }, []); // Empty dependency array means this runs once

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
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Union Transaction Dashboard</h1>
      </header>

      <section className="total-transactions-section">
        <h2>Global Chain Transaction Overview</h2>
        {loadingTotal && <p>Loading total transaction data...</p>}
        {errorTotal && <p className="error-message">Error: {errorTotal}</p>}
        {!loadingTotal && !errorTotal && (
          <>
            {Object.values(totalTxCounts).every(count => count === 0) ? (
              <p>No global transaction data available.</p>
            ) : (
              <div className="chart-container">
                <Bar data={chartData} options={{ maintainAspectRatio: false }} />
              </div>
            )}
            <h3>Transaction Counts by Chain:</h3>
            <ul className="chain-list">
              {chains.map(chain => (
                <li key={chain}>
                  <strong>{chain}:</strong> {totalTxCounts[chain] || 0} transactions
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="address-lookup-section">
        <h2>Lookup Transactions by Address</h2>
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
          <div className="address-results">
            <h3>Transactions for {address}:</h3>
            <p>Total found: {addressTxns.length}</p>
            <ul className="transaction-list">
              {addressTxns.map(tx => (
                <li key={tx.id} className="transaction-item">
                  <p><strong>ID:</strong> {tx.id}</p>
                  <p><strong>Type:</strong> {tx.packet_status ? 'V1 Packet' : 'V2 Transfer'}</p>
                  <p><strong>From Chain:</strong> {tx.source_chain}</p>
                  <p><strong>To Chain:</strong> {tx.destination_chain}</p>
                  <p><strong>From Address:</strong> {tx.source_address}</p>
                  <p><strong>To Address:</strong> {tx.destination_address}</p>
                  <p><strong>Amount:</strong> {tx.amount} {tx.asset?.symbol}</p>
                  <p><strong>Status:</strong> {tx.stage || tx.packet_status}</p>
                  <p><strong>Timestamp:</strong> {new Date(tx.timestamp).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        {!loadingAddress && addressTxns.length === 0 && address.trim() && !errorAddress && (
          <p>No transactions found for the address: {address}</p>
        )}
      </section>
    </div>
  );
}

export default App;
