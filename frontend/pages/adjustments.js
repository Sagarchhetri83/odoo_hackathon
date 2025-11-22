import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { adjustmentsAPI } from '../lib/api';
import { isAuthenticated } from '../lib/auth';

export default function AdjustmentsPage() {
  const router = useRouter();
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAdjustment, setNewAdjustment] = useState({
    warehouse_id: '',
    reason: '',
    adjustment_items: [{ product_id: '', counted_quantity: '', location_id: '' }],
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchAdjustments();
  }, []);

  const fetchAdjustments = async () => {
    try {
      setLoading(true);
      const response = await adjustmentsAPI.getAll();
      setAdjustments(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch adjustments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdjustment = async (e) => {
    e.preventDefault();
    try {
      const adjustmentData = {
        ...newAdjustment,
        adjustment_items: newAdjustment.adjustment_items.map(item => ({
          product_id: parseInt(item.product_id),
          counted_quantity: parseInt(item.counted_quantity),
          location_id: item.location_id ? parseInt(item.location_id) : null,
        })),
      };
      await adjustmentsAPI.create(adjustmentData);
      setNewAdjustment({ warehouse_id: '', reason: '', adjustment_items: [{ product_id: '', counted_quantity: '', location_id: '' }] });
      setShowCreateForm(false);
      fetchAdjustments();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create adjustment');
    }
  };

  if (!isAuthenticated()) return null;

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Stock Adjustments</h1>
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
          {showCreateForm ? 'Cancel' : 'Create Adjustment'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px', padding: '10px', backgroundColor: '#fee', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {showCreateForm && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>Create Stock Adjustment</h2>
          <form onSubmit={handleCreateAdjustment}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Warehouse ID *</label>
              <input
                type="number"
                value={newAdjustment.warehouse_id}
                onChange={(e) => setNewAdjustment({ ...newAdjustment, warehouse_id: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Reason (optional)</label>
              <textarea
                value={newAdjustment.reason}
                onChange={(e) => setNewAdjustment({ ...newAdjustment, reason: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Products</label>
              {newAdjustment.adjustment_items.map((item, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="number"
                    placeholder="Product ID"
                    value={item.product_id}
                    onChange={(e) => {
                      const items = [...newAdjustment.adjustment_items];
                      items[index].product_id = e.target.value;
                      setNewAdjustment({ ...newAdjustment, adjustment_items: items });
                    }}
                    required
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <input
                    type="number"
                    placeholder="Counted Quantity"
                    value={item.counted_quantity}
                    onChange={(e) => {
                      const items = [...newAdjustment.adjustment_items];
                      items[index].counted_quantity = e.target.value;
                      setNewAdjustment({ ...newAdjustment, adjustment_items: items });
                    }}
                    required
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <input
                    type="number"
                    placeholder="Location ID (optional)"
                    value={item.location_id}
                    onChange={(e) => {
                      const items = [...newAdjustment.adjustment_items];
                      items[index].location_id = e.target.value;
                      setNewAdjustment({ ...newAdjustment, adjustment_items: items });
                    }}
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  {newAdjustment.adjustment_items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const items = newAdjustment.adjustment_items.filter((_, i) => i !== index);
                        setNewAdjustment({ ...newAdjustment, adjustment_items: items });
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
                onClick={() => setNewAdjustment({ ...newAdjustment, adjustment_items: [...newAdjustment.adjustment_items, { product_id: '', counted_quantity: '', location_id: '' }] })}
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
              Create Adjustment
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading adjustments...</div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Warehouse ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Reason</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.map((adjustment, index) => (
                <tr key={adjustment.id} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                  <td style={{ padding: '12px' }}>{adjustment.id}</td>
                  <td style={{ padding: '12px' }}>{adjustment.warehouse_id}</td>
                  <td style={{ padding: '12px' }}>{adjustment.reason || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#2ecc71',
                      color: 'white',
                      fontSize: '12px',
                    }}>
                      {adjustment.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{new Date(adjustment.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {adjustments.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>No adjustments found</div>
          )}
        </div>
      )}
    </Layout>
  );
}

