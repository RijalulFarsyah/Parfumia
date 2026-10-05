import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function Categories() {
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('brand');

  useEffect(() => {
    api('/admin/categories')
      .then((d) => {
        const map = {};
        (d.categories || []).forEach((c) => {
          if (!map[c.type]) map[c.type] = [];
          map[c.type].push(c);
        });
        setCategories(map);
      })
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api('/admin/categories', { method: 'POST', body: { name: name.trim(), type } });
      setName('');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus kategori ini?')) return;
    try {
      await api(`/admin/categories/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function load() {
    api('/admin/categories')
      .then((d) => {
        const map = {};
        (d.categories || []).forEach((c) => {
          if (!map[c.type]) map[c.type] = [];
          map[c.type].push(c);
        });
        setCategories(map);
        setError(null);
      })
      .catch((e) => setError(e));
  }

  const typeLabels = {
    brand: 'Brand',
    gender: 'Gender',
    concentration: 'Concentration',
    aroma: 'Aroma',
  };

  return (
    <div>
      <h1 className="font-heading text-3xl mb-6">Kategori</h1>

      <form onSubmit={handleAdd} className="flex gap-3 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama kategori"
          className="flex-1 bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine"
        >
          <option value="brand">brand</option>
          <option value="gender">gender</option>
          <option value="concentration">concentration</option>
          <option value="aroma">aroma</option>
        </select>
        <button type="submit" className="bg-wine text-white px-4 py-2 rounded-full hover:bg-wineDark">
          Tambah
        </button>
      </form>

      {error && <p className="text-danger mb-4">{error.message}</p>}

      {Object.entries(categories).map(([typeKey, items]) => (
        <div key={typeKey}>
          <h2 className="font-heading text-xl mt-6 mb-3">
            {typeLabels[typeKey] || typeKey}
          </h2>
          <div className="flex flex-wrap gap-2">
            {items.map((c) => (
              <span
                key={c.id}
                className="bg-surface border border-line rounded-full px-3 py-1 text-sm flex items-center gap-2"
              >
                {c.name}
                <button
                  className="text-danger hover:underline"
                  onClick={() => handleDelete(c.id)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      ))}

      {Object.entries(categories).map(([typeKey, items]) => (
        <div key={typeKey}>
          <h2 className="font-heading text-xl mt-6 mb-3">
            {typeLabels[typeKey] || typeKey}
          </h2>
          <div className="flex flex-wrap gap-2">
            {items.map((c) => (
              <span
                key={c.id}
                className="bg-surface border border-line rounded-full px-3 py-1 text-sm flex items-center gap-2"
              >
                {c.name}
                <button
                  className="text-danger hover:underline"
                  onClick={() => handleDelete(c.id)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
