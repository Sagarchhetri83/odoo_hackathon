import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { transfersAPI, productsAPI, warehousesAPI } from '../lib/api';

export default function TransfersPage() {
  const router = useRouter();
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
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
    fetchTransfers();
    fetchProducts();
    fetchWarehouses();
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

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await warehousesAPI.getAll();
      setWarehouses(response.data);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    }
  };

  const handleComplete = async (id) => {
    if (!confirm('Are you sure you want to complete this transfer? This will move stock between warehouses.')) return;
    try {
      await transfersAPI.complete(id);
      fetchTransfers();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to complete transfer');
    }
  };

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    try {
      const transferData = {
        ...newTransfer,
        from_warehouse_id: parseInt(newTransfer.from_warehouse_id),
        to_warehouse_id: parseInt(newTransfer.to_warehouse_id),
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
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create transfer');
    }
  };

  const getProductName = (id) => {
    const product = products.find(p => p.id === id);
    return product ? `${product.name} (${product.sku_code})` : `Product #${id}`;
  };

  const getWarehouseName = (id) => {
    const warehouse = warehouses.find(w => w.id === id);
    return warehouse ? warehouse.name : `Warehouse #${id}`;
  };

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
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>From Warehouse *</label>
                <select
                  value={newTransfer.from_warehouse_id}
                  onChange={(e) => setNewTransfer({ ...newTransfer, from_warehouse_id: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>To Warehouse *</label>
                <select
                  value={newTransfer.to_warehouse_id}
                  onChange={(e) => setNewTransfer({ ...newTransfer, to_warehouse_id: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Products</label>
              {newTransfer.transfer_items.map((item, index) => (
                <div key={index} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '10px' }}>
                    <select
                      value={item.product_id}
                      onChange={(e) => {
                        const items = [...newTransfer.transfer_items];
                        items[index].product_id = e.target.value;
                        setNewTransfer({ ...newTransfer, transfer_items: items });
                      }}
                      required
                      style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>{product.name} ({product.sku_code})</option>
                      ))}
                    </select>
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
                      min="1"
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
                    {newTransfer.transfer_items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const items = newTransfer.transfer_items.filter((_, i) => i !== index);
                          setNewTransfer({ ...newTransfer, transfer_items: items });
                        }}
                        style={{ padding: '8px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
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
                <th style={{ padding: '12px', textAlign: 'left' }}>Items</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Created At</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer, index) => (
                <tr key={transfer.id} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                  <td style={{ padding: '12px' }}>{transfer.id}</td>
                  <td style={{ padding: '12px' }}>{getWarehouseName(transfer.from_warehouse_id)}</td>
                  <td style={{ padding: '12px' }}>{getWarehouseName(transfer.to_warehouse_id)}</td>
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
                  <td style={{ padding: '12px' }}>
                    {transfer.transfer_items?.map(item => (
                      <div key={item.id} style={{ fontSize: '12px' }}>
                        {getProductName(item.product_id)}: {item.quantity}
                      </div>
                    ))}
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
