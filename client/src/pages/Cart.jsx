import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, formatRupiah } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    api('/cart')
      .then((d) => {
        setItems(d.items || []);
        setCount(d.count || 0);
        setTotal(d.total || 0);
      })
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  function reload() {
    api('/cart')
      .then((d) => {
        setItems(d.items || []);
        setCount(d.count || 0);
        setTotal(d.total || 0);
      })
      .catch((e) => setError(e));
  }

  async function changeQty(productId, delta) {
    const next = Math.max(1, (items.find((i) => i.product_id === productId)?.qty || 1) + delta);
    await api('/cart', { method: 'PUT', body: { productId, qty: next } });
    reload();
  }

  async function removeItem(productId) {
    await api(`/cart/${productId}`, { method: 'DELETE' });
    reload();
  }

  if (error) {
    return (
      <div className="text-center py-12 text-danger">
        <p>Error: {error.message}</p>
        <button className="mt-4 text-wine underline" onClick={() => reload()}>
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl mb-6">Keranjang</h1>

      {items.length === 0 ? (
        <div className="bg-surface border border-line rounded-lg p-10 text-center">
          <p className="text-muted">Keranjang kosong</p>
          <Link
            to="/"
            className="inline-block bg-wine text-white px-6 py-2 rounded-full mt-4 hover:bg-wineDark"
          >
            Mulai belanja
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {items.map((item) => (
              <div key={item.product_id} className="bg-surface border border-line rounded-lg p-4 flex items-center gap-4 mb-3">
                <div className="w-20 h-20 bg-cream rounded-md flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-heading text-3xl text-wine/30">{item.name?.[0] || 'P'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading text-lg text-ink">{item.name}</p>
                  <p className="text-xs text-muted">{item.brand}</p>
                  <p className="text-wine font-medium">{formatRupiah(item.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="w-8 h-8 border border-line rounded hover:bg-cream"
                      onClick={() => changeQty(item.product_id, -1)}
                      aria-label="Kurangi"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.qty}</span>
                    <button
                      className="w-8 h-8 border border-line rounded hover:bg-cream"
                      onClick={() => changeQty(item.product_id, 1)}
                      aria-label="Tambah"
                    >
                      +
                    </button>
                    <button
                      className="text-danger text-sm hover:underline"
                      onClick={() => removeItem(item.product_id)}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                <p className="w-24 text-right font-medium text-wine">{formatRupiah(item.price * item.qty)}</p>
              </div>
            ))}
          </div>

          <div className="md:col-span-1">
            <div className="bg-surface border border-line rounded-lg p-6 sticky top-24">
              <h2 className="font-heading text-xl mb-4">Ringkasan</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-medium">{formatRupiah(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Pengiriman</span>
                  <span className="text-muted">Dihitung saat checkout</span>
                </div>
                <hr className="border-line my-4" />
                <div className="flex justify-between">
                  <span className="font-medium text-wine text-lg">Total</span>
                  <span className="font-heading text-2xl text-wine">{formatRupiah(total)}</span>
                </div>
              </div>
              <Link
                to="/checkout"
                className="block bg-wine text-white text-center py-3 rounded-full hover:bg-wineDark mt-6"
              >
                Lanjut ke Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
