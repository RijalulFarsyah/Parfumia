import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, formatRupiah } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    api('/profile')
      .then((d) => setProfile(d.user))
      .catch((e) => setError(e));

    api('/addresses')
      .then((d) => setAddresses(d.addresses || []))
      .catch(() => {});

    setLoading(false);
  }, [user, navigate]);

  if (authLoading || loading) {
    return <div className="text-center py-12 text-muted">Memuat profil...</div>;
  }

  async function handleSaveAccount(e) {
    e.preventDefault();
    setError(null);
    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value.trim();

    try {
      const res = await api('/profile', { method: 'PUT', body: { username: username || undefined, password: password || undefined } });
      setProfile(res.user);
      setSaved('Akun tersimpan');
      setTimeout(() => setSaved(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddAddress(e) {
    e.preventDefault();
    setError(null);
    const form = e.target;
    const label = form.label.value.trim();
    const fullAddress = form.fullAddress.value.trim();
    const city = form.city.value.trim();
    const postalCode = form.postalCode.value.trim();

    if (!label || !fullAddress || !city || !postalCode) {
      setError('Semua kolom alamat wajib diisi.');
      return;
    }

    try {
      const res = await api('/addresses', { method: 'POST', body: { label, fullAddress, city, postalCode } });
      setAddresses([res.address, ...addresses]);
      form.reset();
      setSaved('Alamat tersimpan');
      setTimeout(() => setSaved(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="font-heading text-3xl mb-6">Profil Saya</h1>

      {saved && <p className="text-success text-sm mb-4">{saved}</p>}
      {error && <p className="text-danger text-sm mb-4">{error}</p>}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-surface border border-line rounded-lg p-6">
          <h2 className="font-heading text-2xl mb-4">Akun</h2>
          <form onSubmit={handleSaveAccount} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm mb-1">Username</label>
                <input
                  name="username"
                  defaultValue={profile?.username || ''}
                  className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1">Password (biarkan kosong untuk tidak mengubah)</label>
                <input
                  type="password"
                  name="password"
                  className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-wine text-white px-8 py-2.5 rounded-full hover:bg-wineDark"
            >
              Simpan
            </button>
            <p className="text-xs text-muted">{profile?.role === 'buyer' ? 'Pembeli' : profile?.role === 'seller' ? 'Penjual' : 'Admin'}</p>
          </form>
        </div>

        <div className="bg-surface border border-line rounded-lg p-6">
          <h2 className="font-heading text-2xl mb-4">Alamat</h2>
          <form onSubmit={handleAddAddress} className="mb-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input name="label" placeholder="Label (contoh: rumah)" className="bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine" required />
              <input name="city" placeholder="Kota" className="bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine" required />
            </div>
            <div className="mt-3">
              <label className="block text-sm mb-1">Alamat Lengkap</label>
              <textarea name="fullAddress" rows={2} className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine" required />
            </div>
            <div className="mt-3">
              <label className="block text-sm mb-1">Kode Pos</label>
              <input name="postalCode" type="text" className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine" required />
            </div>
            <button type="submit" className="bg-wine text-white px-4 py-2 rounded-full hover:bg-wineDark">
              Tambah Alamat
            </button>
          </form>

          {addresses.length === 0 ? (
            <p className="text-muted">Belum ada alamat.</p>
          ) : (
            <ul className="space-y-3">
              {addresses.map((addr) => (
                <li key={addr.id} className="bg-cream border border-line rounded-md p-4">
                  <p className="font-medium text-ink">{addr.label}</p>
                  <p className="text-sm text-muted">{addr.fullAddress}, {addr.city} {addr.postalCode}</p>
                  <Link
                    to={`/orders?address=${encodeURIComponent(addr.fullAddress)}`}
                    className="text-xs text-wine hover:underline"
                  >
                    Gunakan
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
