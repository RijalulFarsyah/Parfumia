import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/admin/products/pending')
      .then((d) => setProducts(d.products || []))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, []);

  async function handleModerate(id, action) {
    try {
      await api(`/admin/products/${id}/moderate`, {
        method: 'PUT',
        body: { status: action },
      });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-muted">Memuat produk...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-danger">
        <p>Error: {error.message}</p>
        <a href="/admin/products" className="mt-4 text-wine underline">
          Coba lagi
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl mb-6">Moderasi Produk</h1>

      {products.length === 0 ? (
        <div className="bg-surface border border-line rounded-lg p-10 text-center">
          <p className="text-muted">Tidak ada produk menunggu moderasi.</p>
        </div>
      ) : (
        <div className="bg-surface border border-line rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream">
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Gambar</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Nama</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Brand</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Harga</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="px-4 py-3 text-muted">{p.image ? <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded" /> : <span className="font-heading text-lg text-wine/30">{p.name?.[0]}</span>}</td>
                  <td className="px-4 py-3 font-heading text-ink">{p.name}</td>
                  <td className="px-4 py-3 text-ink">{p.brand}</td>
                  <td className="px-4 py-3 text-wine font-medium">Rp {p.price}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="bg-success text-white text-xs px-3 py-1 rounded-full hover:bg-green-600"
                        onClick={() => handleModerate(p.id, 'approved')}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-danger text-white text-xs px-3 py-1 rounded-full hover:bg-red-600"
                        onClick={() => handleModerate(p.id, 'rejected')}
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
