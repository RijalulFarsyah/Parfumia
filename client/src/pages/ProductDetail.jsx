import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, formatRupiah } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);
  const [wishlist, setWishlist] = useState(false);

  useEffect(() => {
    api(`/products/${id}`)
      .then((d) => setProduct(d.product))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddToCart(e) {
    e.preventDefault();
    try {
      await api('/cart', { method: 'POST', body: { productId: Number(id), qty: 1 } });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleWishlist() {
    try {
      const res = await api(`/wishlist/${id}`, { method: 'PUT' });
      setWishlist(res.added);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square bg-cream animate-pulse rounded-lg" />
        <div className="space-y-4">
          <div className="h-4 bg-cream animate-pulse rounded w-1/3" />
          <div className="h-12 bg-cream animate-pulse rounded w-full" />
          <div className="h-4 bg-cream animate-pulse rounded w-1/4" />
        </div>
      </div>
    );
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
    <div className="grid md:grid-cols-2 gap-10">
      <div className="aspect-square bg-cream rounded-lg overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="font-heading text-7xl text-wine/30">{product.name?.[0] || 'P'}</span>
        )}
      </div>

      <div className="flex flex-col justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">{product.brand || '—'}</p>
          <h1 className="font-heading text-4xl text-ink mt-1">{product.name}</h1>

          <p className="text-wine text-2xl font-medium mt-4">{formatRupiah(product.price)}</p>
          <p className="text-sm text-muted mt-1">Stok: {product.stock}</p>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-wider text-muted mb-3">Notes</p>
            <div className="space-y-3">
              <div className="bg-surface border border-line rounded-lg p-4">
                <p className="text-xs uppercase tracking-wider text-muted">Top Notes</p>
                <p className="text-ink mt-1">{product.top_notes || '—'}</p>
              </div>
              <div className="bg-surface border border-line rounded-lg p-4">
                <p className="text-xs uppercase tracking-wider text-muted">Middle Notes</p>
                <p className="text-ink mt-1">{product.middle_notes || '—'}</p>
              </div>
              <div className="bg-surface border border-line rounded-lg p-4">
                <p className="text-xs uppercase tracking-wider text-muted">Base Notes</p>
                <p className="text-ink mt-1">{product.base_notes || '—'}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleAddToCart} className="flex-1">
              <label className="block text-sm mb-1">Jumlah</label>
              <input
                type="number"
                min={1}
                max={product.stock}
                defaultValue={1}
                className="w-20 text-center bg-cream border border-line rounded-md py-2"
              />
              <button
                type="submit"
                className="w-full bg-wine text-white px-8 py-3 rounded-full hover:bg-wineDark mt-3 flex items-center justify-center"
              >
                Tambah ke Keranjang
              </button>
              {added && <p className="text-success text-sm mt-2">Ditambahkan</p>}
            </form>

            <button
              onClick={toggleWishlist}
              className="border border-wine text-wine px-6 py-3 rounded-full hover:bg-wine/5 flex items-center gap-2"
            >
              {wishlist ? '✕' : '+'}
              {wishlist ? 'Hapus dari Wishlist' : 'Wishlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
