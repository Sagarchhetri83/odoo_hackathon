import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { warehousesAPI } from '../lib/api';

export default function SettingsPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const response = await warehousesAPI.getAll();
      setWarehouses(response.data);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 style={{ marginBottom: '30px' }}>Settings</h1>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '20px' }}>Warehouse Management</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading warehouses...</div>
        ) : (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                </tr>
              </thead>
              <tbody>
                {warehouses.map((warehouse, index) => (
                  <tr key={warehouse.id} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                    <td style={{ padding: '12px' }}>{warehouse.id}</td>
                    <td style={{ padding: '12px' }}>{warehouse.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {warehouses.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>No warehouses found</div>
            )}
          </div>
        )}
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginTop: '20px' }}>
        <h2 style={{ marginBottom: '20px' }}>System Information</h2>
        <div style={{ color: '#7f8c8d' }}>
          <p><strong>Version:</strong> StockMaster v1.0.0</p>
          <p><strong>Database:</strong> SQLite (Local Development)</p>
          <p><strong>Backend URL:</strong> {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}</p>
        </div>
      </div>
    </Layout>
  );
}
