import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { deliveriesAPI, productsAPI, warehousesAPI } from '../lib/api';

export default function DeliveriesPage() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDelivery, setNewDelivery] = useState({
    warehouse_id: '',
    status: 'Draft',
    delivery_items: [{ product_id: '', quantity_delivered: '' }],
  });

  useEffect(() => {
    fetchDeliveries();
    fetchProducts();
    fetchWarehouses();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await deliveriesAPI.getAll();
      setDeliveries(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch deliveries');
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

  const handleValidate = async (id) => {
    if (!confirm('Are you sure you want to validate this delivery? This will decrease stock levels.')) return;
    try {
      await deliveriesAPI.validate(id);
      fetchDeliveries();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to validate delivery');
    }
  };

  const handleCreateDelivery = async (e) => {
    e.preventDefault();
    try {
      const deliveryData = {
        ...newDelivery,
        warehouse_id: parseInt(newDelivery.warehouse_id),
        delivery_items: newDelivery.delivery_items.map(item => ({
          product_id: parseInt(item.product_id),
          quantity_delivered: parseInt(item.quantity_delivered),
        })),
      };
      await deliveriesAPI.create(deliveryData);
      setNewDelivery({ warehouse_id: '', status: 'Draft', delivery_items: [{ product_id: '', quantity_delivered: '' }] });
      setShowCreateForm(false);
      fetchDeliveries();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create delivery');
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
        <h1>Delivery Orders (Outgoing Stock)</h1>
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
          {showCreateForm ? 'Cancel' : 'Create Delivery'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px', padding: '10px', backgroundColor: '#fee', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {showCreateForm && (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>Create New Delivery Order</h2>
          <form onSubmit={handleCreateDelivery}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Warehouse *</label>
              <select
                value={newDelivery.warehouse_id}
                onChange={(e) => setNewDelivery({ ...newDelivery, warehouse_id: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">Select Warehouse</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Products</label>
              {newDelivery.delivery_items.map((item, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '10px', marginBottom: '10px' }}>
                  <select
                    value={item.product_id}
                    onChange={(e) => {
                      const items = [...newDelivery.delivery_items];
                      items[index].product_id = e.target.value;
                      setNewDelivery({ ...newDelivery, delivery_items: items });
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
                    value={item.quantity_delivered}
                    onChange={(e) => {
                      const items = [...newDelivery.delivery_items];
                      items[index].quantity_delivered = e.target.value;
                      setNewDelivery({ ...newDelivery, delivery_items: items });
                    }}
                    required
                    min="1"
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  {newDelivery.delivery_items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const items = newDelivery.delivery_items.filter((_, i) => i !== index);
                        setNewDelivery({ ...newDelivery, delivery_items: items });
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
                onClick={() => setNewDelivery({ ...newDelivery, delivery_items: [...newDelivery.delivery_items, { product_id: '', quantity_delivered: '' }] })}
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
              Create Delivery Order
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading deliveries...</div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Warehouse</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Items</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Created At</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery, index) => (
                <tr key={delivery.id} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                  <td style={{ padding: '12px' }}>{delivery.id}</td>
                  <td style={{ padding: '12px' }}>{getWarehouseName(delivery.warehouse_id)}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: delivery.status === 'Done' ? '#2ecc71' : delivery.status === 'Canceled' ? '#e74c3c' : '#f39c12',
                      color: 'white',
                      fontSize: '12px',
                    }}>
                      {delivery.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {delivery.delivery_items?.map(item => (
                      <div key={item.id} style={{ fontSize: '12px' }}>
                        {getProductName(item.product_id)}: {item.quantity_delivered}
                      </div>
                    ))}
                  </td>
                  <td style={{ padding: '12px' }}>{new Date(delivery.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>
                    {delivery.status !== 'Done' && delivery.status !== 'Canceled' && (
                      <button
                        onClick={() => handleValidate(delivery.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#2ecc71',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
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
          {deliveries.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>No deliveries found</div>
          )}
        </div>
      )}
    </Layout>
  );
}
