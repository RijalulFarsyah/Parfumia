import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client';

const concentrations = ['Parfum', 'Eau de Parfum', 'Eau de Toilette', 'Eau de Cologne'];
const genders = ['Men', 'Women', 'Unisex'];

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    brand: '',
    gender: 'Men',
    concentration: 'Parfum',
    volume_ml: '',
    price: '',
    stock: '',
    image: '',
    description: '',
    top_notes: '',
    middle_notes: '',
    base_notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (isEdit) {
      api(`/seller/products/${id}`)
        .then((d) => {
          const p = d.product;
          setForm({
            name: p.name,
            brand: p.brand,
            gender: p.gender,
            concentration: p.concentration,
            volume_ml: p.volume_ml || '',
            price: p.price,
            stock: p.stock,
            image: p.image || '',
            description: p.description || '',
            top_notes: p.top_notes || '',
            middle_notes: p.middle_notes || '',
            base_notes: p.base_notes || '',
          });
        })
        .catch((e) => setMessage(e.message));
    }
  }, [id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      name: form.name,
      brand: form.brand,
      gender: form.gender,
      concentration: form.concentration,
      volume_ml: form.volume_ml ? Number(form.volume_ml) : undefined,
      price: Number(form.price),
      stock: Number(form.stock),
      image: form.image,
      description: form.description,
      top_notes: form.top_notes,
      middle_notes: form.middle_notes,
      base_notes: form.base_notes,
    };

    try {
      if (isEdit) {
        await api(`/seller/products/${id}`, { method: 'PUT', body: payload });
        setMessage('Produk tersimpan');
      } else {
        await api('/seller/products', { method: 'POST', body: payload });
        setMessage('Produk ditambahkan');
      }
      setTimeout(() => navigate('/seller/products'), 1500);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="font-heading text-3xl mb-6">{isEdit ? 'Edit Produk' : 'Tambah Produk'}</h1>

      {message && <p className={`mb-4 text-sm ${message.includes('tersimpan') ? 'text-success' : 'text-danger'}`}>{message}</p>}

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
        <input name="name" placeholder="Nama produk" className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine" required />
        <input name="brand" placeholder="Brand" className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine" required />

        <select name="gender" className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine">
          {genders.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select name="concentration" className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine">
          {concentrations.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input name="volume_ml" type="number" placeholder="Volume (ml)" className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine" />
        <div className="flex gap-4">
          <input name="price" type="number" placeholder="Harga" className="flex-1 bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine" required />
          <input name="stock" type="number" placeholder="Stok" className="w-40 bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine" required />
        </div>

        <input name="image" placeholder="URL Gambar" className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine" />

        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Deskripsi</label>
          <textarea name="description" rows={4} className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Top Notes</label>
          <input name="top_notes" className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Middle Notes</label>
          <input name="middle_notes" className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Base Notes</label>
          <input name="base_notes" className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine" />
        </div>

        <button
          type="submit"
          className="bg-wine text-white px-8 py-2.5 rounded-full hover:bg-wineDark"
        >
          {saving ? 'Menyimpan...' : isEdit ? 'Simpan' : 'Buat Produk'}
        </button>
      </form>
    </div>
  );
}
