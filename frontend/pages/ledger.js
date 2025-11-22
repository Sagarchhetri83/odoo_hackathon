import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { ledgerAPI } from '../lib/api';
import { isAuthenticated } from '../lib/auth';

export default function LedgerPage() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    product_id: '',
    warehouse_id: '',
    location_id: '',
    document_type: '',
    document_id: '',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchLedger();
  }, [filters]);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await ledgerAPI.getAll(params);
      setEntries(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch ledger entries');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) return null;

  return (
    <Layout>
      <h1 style={{ marginBottom: '30px' }}>Stock Ledger (Move History)</h1>

      {/* Filters */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ marginBottom: '20px' }}>Filters</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Product ID</label>
            <input
              type="number"
              value={filters.product_id}
              onChange={(e) => setFilters({ ...filters, product_id: e.target.value })}
              placeholder="Product ID"
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Warehouse ID</label>
            <input
              type="number"
              value={filters.warehouse_id}
              onChange={(e) => setFilters({ ...filters, warehouse_id: e.target.value })}
              placeholder="Warehouse ID"
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Location ID</label>
            <input
              type="number"
              value={filters.location_id}
              onChange={(e) => setFilters({ ...filters, location_id: e.target.value })}
              placeholder="Location ID"
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Document Type</label>
            <select
              value={filters.document_type}
              onChange={(e) => setFilters({ ...filters, document_type: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">All</option>
              <option value="Receipt">Receipt</option>
              <option value="Delivery">Delivery</option>
              <option value="Internal Transfer">Internal Transfer</option>
              <option value="Adjustment">Adjustment</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Document ID</label>
            <input
              type="number"
              value={filters.document_id}
              onChange={(e) => setFilters({ ...filters, document_id: e.target.value })}
              placeholder="Document ID"
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px', padding: '10px', backgroundColor: '#fee', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading ledger entries...</div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Product</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Warehouse</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Change</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>New Stock</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Document Type</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Document ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry.id} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                  <td style={{ padding: '12px' }}>{entry.id}</td>
                  <td style={{ padding: '12px' }}>{entry.product?.name || entry.product_id}</td>
                  <td style={{ padding: '12px' }}>{entry.warehouse?.name || entry.warehouse_id}</td>
                  <td style={{ padding: '12px', color: entry.change_quantity > 0 ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
                    {entry.change_quantity > 0 ? '+' : ''}{entry.change_quantity}
                  </td>
                  <td style={{ padding: '12px' }}>{entry.new_stock_level}</td>
                  <td style={{ padding: '12px' }}>{entry.document_type}</td>
                  <td style={{ padding: '12px' }}>{entry.document_id}</td>
                  <td style={{ padding: '12px' }}>{new Date(entry.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {entries.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>No ledger entries found</div>
          )}
        </div>
      )}
    </Layout>
  );
}

