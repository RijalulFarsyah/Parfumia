import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';

export default function Wishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      return;
    }
    api('/wishlist')
      .then((d) => {
        setItems(d.items || []);
        setCount(d.count || 0);
      })
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  async function removeFromWishlist(productId) {
    try {
      await api(`/wishlist/${productId}`, { method: 'PUT' });
      setItems((prev) => prev.filter((i) => i.product_id !== productId));
      setCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="font-heading text-3xl mb-6">Wishlist</h1>

      {loading && <p className="text-muted">Memuat wishlist...</p>}

      {!loading && error && <p className="text-danger">Error: {error.message}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="bg-surface border border-line rounded-lg p-10 text-center">
          <p className="text-muted">Wishlist kosong.</p>
          <Link to="/" className="inline-block bg-wine text-white px-6 py-2 rounded-full mt-4 hover:bg-wineDark">
            Mulai belanja
          </Link>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.product_id} className="relative">
              <ProductCard product={item} />
              <button
                className="absolute top-2 right-2 bg-surface border border-line text-danger text-sm hover:text-danger/70"
                onClick={() => removeFromWishlist(item.product_id)}
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
