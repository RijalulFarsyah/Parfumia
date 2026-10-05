import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatRupiah } from '../../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState({
    productCount: 0,
    pendingOrders: 0,
    completedOrders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/seller/dashboard')
      .then((d) => setStats(d.stats || d))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-muted">Memuat dashboard...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-danger">
        <p>Error: {error.message}</p>
        <Link to="/seller" className="mt-4 text-wine underline">
          Kembali
        </Link>
      </div>
    );
  }

  const cards = [
    { label: 'Produk', value: stats.productCount },
    { label: 'Pesanan Ditunggu', value: stats.pendingOrders },
    { label: 'Selesai', value: stats.completedOrders },
    { label: 'Pendapatan', value: stats.revenue },
  ];

  return (
    <div>
      <h1 className="font-heading text-3xl mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-surface border border-line rounded-lg p-5">
            <p className="text-xs uppercase tracking-wider text-muted">{card.label}</p>
            <p className="font-heading text-3xl text-wine mt-2">
              {card.label === 'Pendapatan' ? formatRupiah(card.value) : String(card.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
