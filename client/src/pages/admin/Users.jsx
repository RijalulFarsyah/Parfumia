import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

const roleColors = {
  admin: 'bg-wine text-white',
  seller: 'bg-indigo-100 text-indigo-800',
  buyer: 'bg-gray-100 text-gray-800',
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/admin/users')
      .then((d) => setUsers(d.users || []))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!confirm('Hapus pengguna ini?')) return;
    try {
      await api(`/admin/users/${id}`, { method: 'DELETE' });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-muted">Memuat pengguna...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-danger">
        <p>Error: {error.message}</p>
        <Link to="/admin/users" className="mt-4 text-wine underline">
          Coba lagi
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl mb-6">Pengguna</h1>

      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream">
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">ID</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Username</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Role</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Dibuat</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-4 py-3 text-ink">{u.id}</td>
                <td className="px-4 py-3 font-heading text-ink">{u.username}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-3 py-1 rounded-full ${roleColors[u.role] || 'bg-gray-100'}`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-muted">{u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '—'}</td>
                <td className="px-4 py-3">
                  <button className="text-danger text-sm hover:underline" onClick={() => handleDelete(u.id)}>
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
