import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, formatRupiah } from '../api/client';
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

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    api(`/orders/${id}`)
      .then((d) => {
        setOrder(d.order);
        setItems(d.items || []);
      })
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  if (!user) return null;

  async function confirmReceived() {
    try {
      await api(`/orders/${id}/confirm-received`, { method: 'PUT' });
      setOrder((prev) => prev ? { ...prev, status: 'completed' } : prev);
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
        <button className="mt-4 text-wine underline" onClick={() => navigate(-1)}>
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl mb-6">Pesanan #{order?.id}</h1>

      {!order ? (
        <div className="text-center py-12 text-danger">Pesanan tidak ditemukan.</div>
      ) : (
        <div className="space-y-6">
          <div className="bg-surface border border-line rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium text-ink">#{order.id}</p>
              <p className="text-sm text-muted">
                {new Date(order.created_at).toLocaleDateString('id-ID')}
              </p>
              <p className="text-wine font-medium">{formatRupiah(order.total)}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          {order.tracking_number && (
            <p className="text-sm text-muted">Resi: {order.tracking_number}</p>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="font-heading text-xl mb-4">Detail Pesanan</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.product_id}
                    className="bg-surface border border-line rounded-lg p-4 flex items-center gap-4"
                  >
                    <div className="w-20 h-20 bg-cream rounded-md flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-heading text-3xl text-wine/30">{item.name?.[0] || 'P'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-lg text-ink truncate">{item.name}</p>
                      <p className="text-xs text-muted">Qty: {item.qty}</p>
                      <p className="text-wine font-medium">{formatRupiah(item.price)}</p>
                    </div>
                    <p className="text-right font-medium">{formatRupiah(item.price * item.qty)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-line rounded-lg p-6">
              <h2 className="font-heading text-xl mb-4">Informasi</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Alamat</span>
                  <span className="text-ink truncate">{order.shipping_address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Kurir</span>
                  <span className="text-ink">{order.courier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Metode Bayar</span>
                  <span className="text-ink">{order.payment_method}</span>
                </div>
                <div className="flex justify-between border-t border-line mt-3 pt-3">
                  <span className="font-medium text-wine">Total</span>
                  <span className="font-medium text-wine">{formatRupiah(order.total)}</span>
                </div>
              </div>

              {order.status === 'shipped' && (
                <button
                  className="bg-success text-white px-6 py-2 rounded-full hover:bg-green-600 mt-6"
                  onClick={confirmReceived}
                >
                  Konfirmasi Penerimaan
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
