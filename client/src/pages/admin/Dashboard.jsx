import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/admin/reports')
      .then((d) => {
        const s = d.stats || {};
        setStats({
          users: s.users ?? 0,
          products: s.products ?? 0,
          orders: s.orders ?? 0,
          revenue: s.revenue ?? 0,
        });
      })
      .catch(() => {
        Promise.all([api('/admin/users'), api('/admin/orders'), api('/admin/products')])
          .then(([usersRes, ordersRes, productsRes]) => {
            setStats({
              users: usersRes.users?.length ?? 0,
              products: productsRes.products?.length ?? 0,
              orders: ordersRes.orders?.length ?? 0,
              revenue: 0,
            });
          })
          .catch((e) => setError(e));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-muted">Memuat panel...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-danger">
        <p>Error: {error.message}</p>
        <Link to="/admin" className="mt-4 text-wine underline">
          Kembali
        </Link>
      </div>
    );
  }

  const cards = [
    { label: 'Pengguna', value: stats.users },
    { label: 'Produk', value: stats.products },
    { label: 'Pesanan', value: stats.orders },
    { label: 'Pendapatan', value: stats.revenue },
  ];

  return (
    <div>
      <h1 className="font-heading text-3xl mb-6">Admin Panel</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-surface border border-line rounded-lg p-5">
            <p className="text-xs uppercase tracking-wider text-muted">{card.label}</p>
            <p className="font-heading text-3xl text-wine mt-2">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
