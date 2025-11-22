import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { dashboardAPI } from '../lib/api';
import { isAuthenticated } from '../lib/auth';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    document_type: '',
    status: '',
    warehouse_id: '',
    location_id: '',
    product_category_id: '',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchKPIs();
  }, [filters]);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await dashboardAPI.getKPIs(params);
      setKpis(response.data);
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) return null;

  return (
    <Layout>
      <h1 style={{ marginBottom: '30px' }}>Inventory Dashboard</h1>

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
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Document Type</label>
            <select
              value={filters.document_type}
              onChange={(e) => setFilters({ ...filters, document_type: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">All</option>
              <option value="Receipts">Receipts</option>
              <option value="Delivery">Delivery</option>
              <option value="Internal">Internal</option>
              <option value="Adjustments">Adjustments</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">All</option>
              <option value="Draft">Draft</option>
              <option value="Waiting">Waiting</option>
              <option value="Ready">Ready</option>
              <option value="Done">Done</option>
              <option value="Canceled">Canceled</option>
            </select>
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
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category ID</label>
            <input
              type="number"
              value={filters.product_category_id}
              onChange={(e) => setFilters({ ...filters, product_category_id: e.target.value })}
              placeholder="Category ID"
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        </div>
      </div>

      {/* KPIs */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : kpis ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
        }}>
          <KPICard
            title="Total Products in Stock"
            value={kpis.total_products_in_stock}
            color="#3498db"
          />
          <KPICard
            title="Low Stock Items"
            value={kpis.low_stock_items}
            color="#f39c12"
          />
          <KPICard
            title="Out of Stock Items"
            value={kpis.out_of_stock_items}
            color="#e74c3c"
          />
          <KPICard
            title="Pending Receipts"
            value={kpis.pending_receipts}
            color="#2ecc71"
          />
          <KPICard
            title="Pending Deliveries"
            value={kpis.pending_deliveries}
            color="#9b59b6"
          />
          <KPICard
            title="Internal Transfers Scheduled"
            value={kpis.internal_transfers_scheduled}
            color="#1abc9c"
          />
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>Error loading dashboard data</div>
      )}
    </Layout>
  );
}

function KPICard({ title, value, color }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderTop: `4px solid ${color}`,
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#7f8c8d', textTransform: 'uppercase' }}>
        {title}
      </h3>
      <div style={{ fontSize: '36px', fontWeight: 'bold', color: color }}>
        {value}
      </div>
    </div>
  );
}
