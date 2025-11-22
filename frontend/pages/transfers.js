import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { transfersAPI } from '../lib/api';
import { isAuthenticated } from '../lib/auth';

export default function TransfersPage() {
  const router = useRouter();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTransfer, setNewTransfer] = useState({
    from_warehouse_id: '',
    to_warehouse_id: '',
    status: 'Draft',
    transfer_items: [{ product_id: '', quantity: '', from_location_id: '', to_location_id: '' }],
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const response = await transfersAPI.getAll();
      setTransfers(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    if (!confirm('Are you sure you want to complete this transfer? This will move stock between warehouses.')) return;
    try {
      await transfersAPI.complete(id);
      fetchTransfers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to complete transfer');
    }
  };

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    try {
      const transferData = {
        ...newTransfer,
        transfer_items: newTransfer.transfer_items.map(item => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
          from_location_id: item.from_location_id ? parseInt(item.from_location_id) : null,
          to_location_id: item.to_location_id ? parseInt(item.to_location_id) : null,
        })),
      };
      await transfersAPI.create(transferData);
      setNewTransfer({ from_warehouse_id: '', to_warehouse_id: '', status: 'Draft', transfer_items: [{ product_id: '', quantity: '', from_location_id: '', to_location_id: '' }] });
      setShowCreateForm(false);
      fetchTransfers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create transfer');
    }
  };

  if (!isAuthenticated()) return null;

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Internal Transfers</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {showCreateForm ? 'Cancel' : 'Create Transfer'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px', padding: '10px', backgroundColor: '#fee', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {showCreateForm && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>Create New Internal Transfer</h2>
          <form onSubmit={handleCreateTransfer}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>From Warehouse ID *</label>
                <input
                  type="number"
                  value={newTransfer.from_warehouse_id}
                  onChange={(e) => setNewTransfer({ ...newTransfer, from_warehouse_id: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>To Warehouse ID *</label>
                <input
                  type="number"
                  value={newTransfer.to_warehouse_id}
                  onChange={(e) => setNewTransfer({ ...newTransfer, to_warehouse_id: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Products</label>
              {newTransfer.transfer_items.map((item, index) => (
                <div key={index} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    <input
                      type="number"
                      placeholder="Product ID"
                      value={item.product_id}
                      onChange={(e) => {
                        const items = [...newTransfer.transfer_items];
                        items[index].product_id = e.target.value;
                        setNewTransfer({ ...newTransfer, transfer_items: items });
                      }}
                      required
                      style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => {
                        const items = [...newTransfer.transfer_items];
                        items[index].quantity = e.target.value;
                        setNewTransfer({ ...newTransfer, transfer_items: items });
                      }}
                      required
                      style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <input
                      type="number"
                      placeholder="From Location ID (optional)"
                      value={item.from_location_id}
                      onChange={(e) => {
                        const items = [...newTransfer.transfer_items];
                        items[index].from_location_id = e.target.value;
                        setNewTransfer({ ...newTransfer, transfer_items: items });
                      }}
                      style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <input
                      type="number"
                      placeholder="To Location ID (optional)"
                      value={item.to_location_id}
                      onChange={(e) => {
                        const items = [...newTransfer.transfer_items];
                        items[index].to_location_id = e.target.value;
                        setNewTransfer({ ...newTransfer, transfer_items: items });
                      }}
                      style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  {newTransfer.transfer_items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const items = newTransfer.transfer_items.filter((_, i) => i !== index);
                        setNewTransfer({ ...newTransfer, transfer_items: items });
                      }}
                      style={{ marginTop: '10px', padding: '8px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setNewTransfer({ ...newTransfer, transfer_items: [...newTransfer.transfer_items, { product_id: '', quantity: '', from_location_id: '', to_location_id: '' }] })}
                style={{ padding: '8px 15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Add Product
              </button>
            </div>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Create Transfer
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading transfers...</div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>From Warehouse</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>To Warehouse</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Created At</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer, index) => (
                <tr key={transfer.id} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                  <td style={{ padding: '12px' }}>{transfer.id}</td>
                  <td style={{ padding: '12px' }}>{transfer.from_warehouse_id}</td>
                  <td style={{ padding: '12px' }}>{transfer.to_warehouse_id}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: transfer.status === 'Done' ? '#2ecc71' : transfer.status === 'Canceled' ? '#e74c3c' : '#f39c12',
                      color: 'white',
                      fontSize: '12px',
                    }}>
                      {transfer.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{new Date(transfer.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>
                    {transfer.status !== 'Done' && transfer.status !== 'Canceled' && (
                      <button
                        onClick={() => handleComplete(transfer.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#2ecc71',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transfers.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>No transfers found</div>
          )}
        </div>
      )}
    </Layout>
  );
}
