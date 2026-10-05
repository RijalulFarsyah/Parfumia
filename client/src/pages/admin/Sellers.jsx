import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function Sellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/admin/sellers/pending')
      .then((d) => setSellers(d.sellers || []))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, []);

  async function handleVerify(id, action) {
    try {
      await api(`/admin/sellers/${id}/verify`, {
        method: 'PUT',
        body: { status: action },
      });
      setSellers((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-muted">Memuat penjual...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-danger">
        <p>Error: {error.message}</p>
        <a href="/admin/sellers" className="mt-4 text-wine underline">
          Coba lagi
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl mb-6">Verifikasi Penjual</h1>

      {sellers.length === 0 ? (
        <div className="bg-surface border border-line rounded-lg p-10 text-center">
          <p className="text-muted">Tidak ada penjual menunggu verifikasi.</p>
        </div>
      ) : (
        <div className="bg-surface border border-line rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream">
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">ID</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Nama Toko</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Pemilik</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((s) => (
                <tr key={s.id} className="border-t border-line">
                  <td className="px-4 py-3 text-ink">{s.id}</td>
                  <td className="px-4 py-3 font-heading text-ink">{s.name || '—'}</td>
                  <td className="px-4 py-3 text-ink">{s.user_id || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="bg-success text-white text-xs px-3 py-1 rounded-full hover:bg-green-600"
                        onClick={() => handleVerify(s.id, 'approved')}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-danger text-white text-xs px-3 py-1 rounded-full hover:bg-red-600"
                        onClick={() => handleVerify(s.id, 'rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && <p className="text-danger mt-4">{error.message}</p>}
    </div>
  );
}
