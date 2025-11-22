import { useState } from 'react';
import Layout from '../components/Layout';
import { getAuthToken } from '../lib/auth';

export default function ProfilePage() {
  const [user, setUser] = useState({
    email: 'user@stockmaster.com',
    role: 'Inventory Manager',
  });

  return (
    <Layout>
      <h1 style={{ marginBottom: '30px' }}>User Profile</h1>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '600px' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '36px', fontWeight: 'bold', marginBottom: '20px' }}>
            {user.email.charAt(0).toUpperCase()}
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#7f8c8d' }}>Email</label>
          <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #ddd' }}>
            {user.email}
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#7f8c8d' }}>Role</label>
          <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #ddd' }}>
            {user.role}
          </div>
        </div>

        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
          <h3 style={{ marginBottom: '15px' }}>Account Actions</h3>
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px',
            }}
          >
            Change Password
          </button>
          <button
            style={{
              padding: '10px 20px',
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
      </div>
    </Layout>
  );
}
