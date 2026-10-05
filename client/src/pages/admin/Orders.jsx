import { useEffect, useState } from 'react';
import { api } from '../../api/client';

function StatusBadge({ status }) {
  const colors = {
    pending_payment: 'bg-amber-100 text-amber-800',
    paid: 'bg-blue-100 text-blue-800',
    processed: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`text-xs px-3 py-1 rounded-full ${colors[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/admin/orders')
      .then((d) => setOrders(d.orders || []))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-muted">Memuat pesanan...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-danger">
        <p>Error: {error.message}</p>
        <a href="/admin/orders" className="mt-4 text-wine underline">
          Coba lagi
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl mb-6">Semua Pesanan</h1>

      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream">
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">ID</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Buyer</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Total</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Status</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Dibuat</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium text-ink">#{order.id}</td>
                <td className="px-4 py-3 text-ink">{order.buyer_id}</td>
                <td className="px-4 py-3 text-wine font-medium">Rp {order.total}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-muted">
                  {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="text-danger mt-4">{error.message}</p>}
    </div>
  );
}
