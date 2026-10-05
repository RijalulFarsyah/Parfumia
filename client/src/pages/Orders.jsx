import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      return;
    }
    api('/orders')
      .then((d) => setOrders(d.orders || []))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <div>
      <h1 className="font-heading text-3xl mb-6">Pesanan Saya</h1>

      {loading && <p className="text-muted">Memuat pesanan...</p>}

      {!loading && error && <p className="text-danger">Error: {error.message}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="bg-surface border border-line rounded-lg p-10 text-center">
          <p className="text-muted">Belum ada pesanan.</p>
          <Link to="/" className="inline-block bg-wine text-white px-6 py-2 rounded-full mt-4 hover:bg-wineDark">
            Mulai belanja
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-surface border border-line rounded-lg p-5 flex items-center justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-ink truncate">#{order.id}</p>
                <p className="text-sm text-muted">{new Date(order.created_at).toLocaleDateString('id-ID')}</p>
                <p className="text-wine font-medium">{api.formatRupiah ? api.formatRupiah(order.total) : `Rp ${order.total}`}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={order.status} />
                <Link to={`/orders/${order.id}`} className="text-wine text-sm hover:underline">
                  Detail →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
