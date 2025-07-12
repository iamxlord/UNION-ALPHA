// src/api/unionApi.js (renamed from api.js for clarity)
import { GraphQLClient, gql } from 'graphql-request';
import { chains } from '../config/chains'; // Import chains here

const client = new GraphQLClient('https://graphql.union.build/v1/graphql');

// Helper function for fetching all transactions with pagination (placeholder)
// For simplicity, we'll stick to a single query for now, but keep this in mind.
const fetchAllPaginatedTransactions = async (query, variables = {}, path) => {
  let allItems = [];
  let offset = 0;
  const limit = 1000; // API often has max limit, e.g., 1000

  while (true) {
    const paginatedQuery = gql`
      query PaginatedTransactions($limit: Int, $offset: Int, $where: v2_transfers_bool_exp) {
        ${path}(limit: $limit, offset: $offset, where: $where) {
          asset {
            chain
          }
          // Add other fields you might need, e.g., source_address, destination_address
          source_address
          destination_address
        }
      }
    `;
    const data = await client.request(paginatedQuery, { limit, offset, ...variables });
    const currentItems = data[path];

    allItems = allItems.concat(currentItems);

    // Break if we received fewer items than the limit, indicating end of data
    if (currentItems.length < limit) {
      break;
    }
    offset += limit;
  }
  return allItems;
};


// Function to get total transaction count per chain
export const getTotalTransactionCounts = async () => {
  const query = gql`
    query GetTotalTransactions {
      v2_transfers(where: { stage: { _eq: "completed" } }) {
        asset {
          chain
        }
      }
      v1_packets {
        asset {
          chain
        }
      }
    }
  `;

  try {
    const data = await client.request(query);
    const transfers = data.v2_transfers || [];
    const packets = data.v1_packets || [];
    const allTxns = [...transfers, ...packets];
    const chainCounts = {};

    chains.forEach(chain => {
      chainCounts[chain] = allTxns.filter(tx => tx.asset?.chain === chain).length;
    });

    console.log('Total Transaction Counts:', chainCounts);
    return chainCounts;
  } catch (error) {
    console.error('Error fetching total transactions:', error);
    throw new Error('Failed to fetch total transaction counts.'); // Re-throw for App to catch
  }
};

// Function to get transactions for a specific address
export const getAddressTransactions = async (address) => {
  if (!address) {
    throw new Error("Address is required to fetch transactions.");
  }

  const query = gql`
    query GetAddressTransactions($address: String!) {
      v2_transfers(where: { _or: [{ source_address: { _eq: $address } }, { destination_address: { _eq: $address } }] }) {
        id
        source_chain
        destination_chain
        source_address
        destination_address
        stage
        amount
        timestamp
        asset {
          symbol
          chain
        }
      }
      v1_packets(where: { _or: [{ source_address: { _eq: $address } }, { destination_address: { _eq: $address } }] }) {
        id
        source_chain
        destination_chain
        source_address
        destination_address
        packet_status
        amount
        timestamp
        asset {
          symbol
          chain
        }
      }
    }
  `;

  try {
    const data = await client.request(query, { address });
    const transfers = data.v2_transfers || [];
    const packets = data.v1_packets || [];
    const allAddressTxns = [...transfers, ...packets];

    console.log(`Transactions for address ${address}:`, allAddressTxns);
    return allAddressTxns;
  } catch (error) {
    console.error(`Error fetching transactions for address ${address}:`, error);
    throw new Error(`Failed to fetch transactions for address ${address}.`); // Re-throw
  }
};