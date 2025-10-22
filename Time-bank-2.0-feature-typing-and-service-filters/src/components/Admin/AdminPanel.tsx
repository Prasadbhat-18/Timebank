import React, { useEffect, useState } from 'react';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../contexts/AuthContext';

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  // loading state omitted (could be reintroduced for async indicators)
  const [error, setError] = useState('');

  const loadAll = async () => {
    try {
      const [s, b, u] = await Promise.all([
        dataService.getAllRawServices(),
        dataService.getAllRawBookings(),
        dataService.getAllRawUsers(),
      ]);
      setServices(s || []);
      setBookings(b || []);
      setUsers(u || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data');
    } 
  };

  useEffect(() => { loadAll(); }, []);

  if (!user || user.id !== 'official-account') {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold">Admin Panel</h2>
        <p className="text-sm text-gray-600 mt-2">You must be the official admin account to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Admin Panel</h2>
        <div>
          <button onClick={loadAll} className="px-4 py-2 bg-blue-600 text-white rounded">Refresh</button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded">{error}</div>}

      <section className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Services ({services.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">ID</th>
                <th className="p-2">Title</th>
                <th className="p-2">Provider</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{s.id}</td>
                  <td className="p-2">{s.title}</td>
                  <td className="p-2">{s.provider_id}</td>
                  <td className="p-2">
                    <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={async () => { await dataService.deleteService(s.id); loadAll(); }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Bookings ({bookings.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">ID</th>
                <th className="p-2">Service</th>
                <th className="p-2">Provider</th>
                <th className="p-2">Requester</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className="border-t">
                  <td className="p-2">{b.id}</td>
                  <td className="p-2">{b.service_id}</td>
                  <td className="p-2">{b.provider_id}</td>
                  <td className="p-2">{b.requester_id}</td>
                  <td className="p-2">
                    <button className="px-2 py-1 bg-green-500 text-white rounded mr-2" onClick={async () => { try { await dataService.confirmBooking(b.id, b.provider_id); loadAll(); } catch {} }}>Confirm</button>
                    <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={async () => { await dataService.declineBooking(b.id, b.provider_id, 'admin decline'); loadAll(); }}>Decline</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Users ({users.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">ID</th>
                <th className="p-2">Email</th>
                <th className="p-2">Username</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.id}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
