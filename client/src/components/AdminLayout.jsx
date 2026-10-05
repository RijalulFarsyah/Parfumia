import { NavLink, Outlet, useLocation } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/users', label: 'Pengguna' },
  { to: '/admin/sellers', label: 'Penjual' },
  { to: '/admin/products', label: 'Produk' },
  { to: '/admin/categories', label: 'Kategori' },
  { to: '/admin/orders', label: 'Pesanan' },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-[calc(100vh-200px)]">
      <aside className="w-56 bg-surface border-r border-line p-4 flex-shrink-0">
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive =
              location.pathname === link.to || location.pathname.startsWith(link.to + '/');
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`block px-3 py-2 rounded text-sm transition ${
                  isActive ? 'text-wine font-medium bg-cream' : 'hover:bg-cream'
                }`}
              >
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
}
