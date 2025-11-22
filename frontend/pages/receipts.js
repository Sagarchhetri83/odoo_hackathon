import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { receiptsAPI } from '../lib/api';
import { isAuthenticated } from '../lib/auth';

export default function ReceiptsPage() {
  const router = useRouter();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newReceipt, setNewReceipt] = useState({
    supplier_id: '',
    warehouse_id: '',
    status: 'Draft',
    receipt_items: [{ product_id: '', quantity_received: '' }],
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await receiptsAPI.getAll();
      setReceipts(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch receipts');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id) => {
    if (!confirm('Are you sure you want to validate this receipt? This will increase stock levels.')) return;
    try {
      await receiptsAPI.validate(id);
      fetchReceipts();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to validate receipt');
    }
  };

  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    try {
      const receiptData = {
        ...newReceipt,
        receipt_items: newReceipt.receipt_items.map(item => ({
          product_id: parseInt(item.product_id),
          quantity_received: parseInt(item.quantity_received),
        })),
      };
      await receiptsAPI.create(receiptData);
      setNewReceipt({ supplier_id: '', warehouse_id: '', status: 'Draft', receipt_items: [{ product_id: '', quantity_received: '' }] });
      setShowCreateForm(false);
      fetchReceipts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create receipt');
    }
  };

  if (!isAuthenticated()) return null;

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Receipts (Incoming Stock)</h1>
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
          {showCreateForm ? 'Cancel' : 'Create Receipt'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px', padding: '10px', backgroundColor: '#fee', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {showCreateForm && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>Create New Receipt</h2>
          <form onSubmit={handleCreateReceipt}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Supplier ID *</label>
                <input
                  type="number"
                  value={newReceipt.supplier_id}
                  onChange={(e) => setNewReceipt({ ...newReceipt, supplier_id: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Warehouse ID *</label>
                <input
                  type="number"
                  value={newReceipt.warehouse_id}
                  onChange={(e) => setNewReceipt({ ...newReceipt, warehouse_id: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Products</label>
              {newReceipt.receipt_items.map((item, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="number"
                    placeholder="Product ID"
                    value={item.product_id}
                    onChange={(e) => {
                      const items = [...newReceipt.receipt_items];
                      items[index].product_id = e.target.value;
                      setNewReceipt({ ...newReceipt, receipt_items: items });
                    }}
                    required
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={item.quantity_received}
                    onChange={(e) => {
                      const items = [...newReceipt.receipt_items];
                      items[index].quantity_received = e.target.value;
                      setNewReceipt({ ...newReceipt, receipt_items: items });
                    }}
                    required
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  {newReceipt.receipt_items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const items = newReceipt.receipt_items.filter((_, i) => i !== index);
                        setNewReceipt({ ...newReceipt, receipt_items: items });
                      }}
                      style={{ padding: '8px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setNewReceipt({ ...newReceipt, receipt_items: [...newReceipt.receipt_items, { product_id: '', quantity_received: '' }] })}
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
              Create Receipt
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading receipts...</div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Supplier ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Warehouse ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Created At</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((receipt, index) => (
                <tr key={receipt.id} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                  <td style={{ padding: '12px' }}>{receipt.id}</td>
                  <td style={{ padding: '12px' }}>{receipt.supplier_id}</td>
                  <td style={{ padding: '12px' }}>{receipt.warehouse_id}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: receipt.status === 'Done' ? '#2ecc71' : receipt.status === 'Canceled' ? '#e74c3c' : '#f39c12',
                      color: 'white',
                      fontSize: '12px',
                    }}>
                      {receipt.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{new Date(receipt.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>
                    {receipt.status !== 'Done' && receipt.status !== 'Canceled' && (
                      <button
                        onClick={() => handleValidate(receipt.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#2ecc71',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: '5px',
                        }}
                      >
                        Validate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {receipts.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>No receipts found</div>
          )}
        </div>
      )}
    </Layout>
  );
}
