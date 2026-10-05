import { Link } from 'react-router-dom';
import { formatRupiah } from '../api/client';

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-surface border border-line rounded-lg overflow-hidden hover:shadow-md transition-shadow block"
    >
      <div className="aspect-square bg-cream flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <span className="font-heading text-5xl text-wine/30">{product.name?.[0] || 'P'}</span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wider text-muted">{product.brand || '—'}</p>
        <h3 className="font-heading text-lg text-ink mt-1 line-clamp-1">{product.name}</h3>
        <p className="text-wine font-medium mt-2">{formatRupiah(product.price)}</p>
      </div>
    </Link>
  );
}
