import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

export default function Store() {
  const navigate = useNavigate();

  const [store, setStore] = useState({
    name: '',
    logo: '',
    description: '',
    address: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api('/seller/store')
      .then((d) => {
        const s = d.store || {};
        setStore({
          name: s.name || '',
          logo: s.logo || '',
          description: s.description || '',
          address: s.address || '',
        });
      })
      .catch((e) => setMessage(e.message));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await api('/seller/store', { method: 'PUT', body: store });
      setMessage('Tersimpan');
      setTimeout(() => navigate('/seller'), 1500);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="font-heading text-3xl mb-6">Profil Toko</h1>

      {message && <p className={`mb-4 text-sm ${message.includes('Tersimpan') ? 'text-success' : 'text-danger'}`}>{message}</p>}

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
        <input name="name" placeholder="Nama Toko" defaultValue={store.name} className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine" />
        <input name="logo" placeholder="URL Logo" defaultValue={store.logo} className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine" />

        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Deskripsi</label>
          <textarea name="description" rows={3} defaultValue={store.description} className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Alamat</label>
          <textarea name="address" rows={3} defaultValue={store.address} className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine" />
        </div>

        <button type="submit" className="bg-wine text-white px-8 py-2.5 rounded-full hover:bg-wineDark">
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </div>
  );
}
