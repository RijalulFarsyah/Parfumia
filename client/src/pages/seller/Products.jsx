import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatRupiah } from '../../api/client';

const statusColors = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/seller/products')
      .then((d) => setProducts(d.products || []))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!confirm('Hapus produk ini?')) return;
    try {
      await api(`/seller/products/${id}`, { method: 'DELETE' });
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
        <Link to="/seller/products" className="mt-4 text-wine underline">
          Coba lagi
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl">Produk</h1>
        <Link
          to="/seller/products/new"
          className="bg-wine text-white px-4 py-2 rounded-full hover:bg-wineDark text-sm"
        >
          + Tambah Produk
        </Link>
      </div>

      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream">
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Gambar</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Nama</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Harga</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Stok</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Status</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-4 py-3 text-muted">{p.image ? <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded" /> : <span className="font-heading text-lg text-wine/30">{p.name?.[0]}</span>}</td>
                <td className="px-4 py-3 font-heading text-ink">{p.name}</td>
                <td className="px-4 py-3 text-wine font-medium">{formatRupiah(p.price)}</td>
                <td className="px-4 py-3 text-ink">{p.stock}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-3 py-1 rounded-full ${statusColors[p.status] || 'bg-gray-100'}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link to={`/seller/products/${p.id}/edit`} className="text-wine text-sm hover:underline">
                      Edit
                    </Link>
                    <button
                      className="text-danger text-sm hover:underline"
                      onClick={() => handleDelete(p.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
