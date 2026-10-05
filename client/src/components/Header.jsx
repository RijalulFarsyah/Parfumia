import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-surface border-b border-line sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
        <Link to="/" className="font-heading italic text-wine text-2xl">
          Parfumia
        </Link>

        <input
          type="search"
          placeholder="Cari parfum..."
          className="flex-1 max-w-md bg-cream border border-line rounded-full px-4 py-2 text-sm focus:outline-none focus:border-wine"
        />

        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="hover:text-wine">
            Katalog
          </Link>

          {user?.role === 'buyer' && (
            <>
              <Link to="/wishlist" className="hover:text-wine">
                Wishlist
              </Link>
              <Link to="/cart" className="hover:text-wine">
                Keranjang
              </Link>
            </>
          )}

          {user?.role === 'seller' && (
            <Link to="/seller" className="hover:text-wine">Dashboard Toko</Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="hover:text-wine">Admin Panel</Link>
          )}

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1 hover:text-wine"
              >
                {user.username}
                <span className="text-xs">▾</span>
              </button>

              {open && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 bg-surface border border-line rounded-lg shadow-lg py-1 min-w-[160px] z-50">
                    <Link
  			to={user.role === 'seller' ? '/seller/store' : user.role === 'admin' ? '/admin' : '/profile'}
  			onClick={() => setOpen(false)}
  			className="block px-4 py-2 hover:bg-cream"
			>
  			{user.role === 'seller' ? 'Profil Toko' : user.role === 'admin' ? 'Admin Panel' : 'Profil'}
		    </Link>
                    {user.role === 'buyer' && (
                      <Link
                        to="/orders"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 hover:bg-cream"
                      >
                        Pesanan Saya
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => { setOpen(false); logout(); }}
                      className="block w-full text-left px-4 py-2 hover:bg-cream text-danger"
                    >
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-wine">
                Masuk
              </Link>
              <Link
                to="/register"
                className="bg-wine text-white px-4 py-1.5 rounded-full hover:bg-wineDark"
              >
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}