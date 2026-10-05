import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/products')
      .then((d) => setProducts(d.products || []))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="py-16 text-center">
        <h1 className="font-heading text-5xl text-ink mb-4">Temukan Parfum yang Mewakili Dirimu</h1>
        <p className="text-muted max-w-xl mx-auto mb-8">Koleksi parfum pilihan dari brand terbaik dunia.</p>
        <a
          href="#catalog"
          className="inline-block bg-wine text-white px-8 py-3 rounded-full hover:bg-wineDark transition"
        >
          Jelajahi Katalog
        </a>
      </section>

      <section id="catalog" className="pt-8">
        <h2 className="font-heading text-3xl mb-6">Katalog</h2>

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-cream animate-pulse rounded-lg" />
            ))}
          </div>
        )}

        {!loading && error?.status === 401 && (
          <div className="text-center py-12 bg-surface border border-line rounded-lg">
            <p className="text-muted">Silakan masuk untuk melihat katalog</p>
            <Link
              to="/login"
              className="inline-block bg-wine text-white px-6 py-2 rounded-full mt-4 hover:bg-wineDark"
            >
              Masuk
            </Link>
          </div>
        )}

        {!loading && error && error.status !== 401 && <p className="text-danger text-center">{error.message}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
