import Link from 'next/link';
import { useRouter } from 'next/router';
import { logout } from '../lib/auth';

export default function Layout({ children }) {
  const router = useRouter();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/products', label: 'Products' },
    { href: '/receipts', label: 'Receipts' },
    { href: '/deliveries', label: 'Delivery Orders' },
    { href: '/transfers', label: 'Internal Transfers' },
    { href: '/adjustments', label: 'Inventory Adjustments' },
    { href: '/ledger', label: 'Move History' },
    { href: '/settings', label: 'Settings (Warehouse)' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '250px',
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <h2 style={{ marginBottom: '30px', fontSize: '24px' }}>StockMaster</h2>
        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {menuItems.map((item) => (
              <li key={item.href} style={{ marginBottom: '10px' }}>
                <Link 
                  href={item.href}
                  style={{
                    display: 'block',
                    padding: '10px',
                    color: router.pathname === item.href ? '#3498db' : 'white',
                    textDecoration: 'none',
                    backgroundColor: router.pathname === item.href ? '#34495e' : 'transparent',
                    borderRadius: '4px',
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #34495e' }}>
          <Link 
            href="/profile"
            style={{ display: 'block', padding: '10px', color: 'white', textDecoration: 'none', marginBottom: '10px' }}
          >
            Profile
          </Link>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '20px', backgroundColor: '#ecf0f1' }}>
        {children}
      </main>
    </div>
  );
}

