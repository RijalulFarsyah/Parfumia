import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatRupiah } from '../../api/client';

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/seller/orders')
      .then((d) => setOrders(d.orders || []))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, []);

  async function handleProcess(id) {
    if (!confirm('Proses pesanan ini?')) return;
    try {
      await api(`/seller/orders/${id}/process`, { method: 'PUT', body: { status: 'processed' } });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'processed' } : o)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleShip(id) {
    const tracking = prompt('Masukkan nomor resi:');
    if (!tracking) return;
    try {
      await api(`/seller/orders/${id}/ship`, { method: 'PUT', body: { trackingNumber: tracking } });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'shipped', tracking_number: tracking } : o)));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-muted">Memuat pesanan...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-danger">
        <p>Error: {error.message}</p>
        <Link to="/seller/orders" className="mt-4 text-wine underline">
          Coba lagi
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl mb-6">Pesanan</h1>

      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream">
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">ID</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Buyer</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Total</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Status</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium text-ink">#{order.id}</td>
                <td className="px-4 py-3 text-ink">{order.buyer_id}</td>
                <td className="px-4 py-3 text-wine font-medium">{formatRupiah(order.total)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      order.status === 'pending_payment'
                        ? 'bg-amber-100 text-amber-800'
                        : order.status === 'paid'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'processed'
                        ? 'bg-indigo-100 text-indigo-800'
                        : order.status === 'shipped'
                        ? 'bg-purple-100 text-purple-800'
                        : order.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {order.status === 'pending_payment' || order.status === 'paid' ? (
                      <button
                        className="bg-wine text-white text-xs px-3 py-1 rounded-full hover:bg-wineDark"
                        onClick={() => handleProcess(order.id)}
                      >
                        Proses
                      </button>
                    ) : null}
                    {order.status === 'processed' ? (
                      <button
                        className="bg-wine text-white text-xs px-3 py-1 rounded-full hover:bg-wineDark"
                        onClick={() => handleShip(order.id)}
                      >
                        Kirim
                      </button>
                    ) : null}
                    {order.status === 'shipped' || order.status === 'completed' ? (
                      <span className="text-muted text-xs">Selesai</span>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.some((o) => o.tracking_number) && (
        <div className="mt-4 text-sm text-muted">
          <p>Resi tersedia pada pesanan berikut:</p>
          <ul className="list-disc list-inside mt-1">
            {orders.filter((o) => o.tracking_number).map((o) => (
              <li key={o.id}>#{o.id} - {o.tracking_number}</li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-danger mt-4">{error.message}</p>}
    </div>
  );
}
