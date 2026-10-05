import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, formatRupiah } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState({ items: [], count: 0, total: 0 });
  const [vouchers, setVouchers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    api('/cart')
      .then((d) => setCart(d))
      .catch((e) => setError(e));
    api('/vouchers').then((d) => setVouchers(d.vouchers || [])).catch(() => {});
    api('/addresses')
      .then((d) => setAddresses(d.addresses || []))
      .catch(() => {});
    setLoading(false);
  }, [user, navigate]);

  if (!user) return null;

  if (done) return null;

  const voucherOptions = vouchers.map((v) => v.code).join(', ') || 'kosong';

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const form = e.target;
    const address = form.address.value.trim();
    const courier = form.courier.value;
    const paymentMethod = form.payment_method.value;
    const voucherCode = form.voucher_code.value.trim();

    if (!address || !courier || !paymentMethod) {
      setError('Alamat, kurir, dan metode pembayaran wajib diisi.');
      return;
    }

    try {
      const res = await api('/orders', {
        method: 'POST',
        body: { address, courier, paymentMethod, voucherCode },
      });
      navigate(`/orders/${res.order.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-muted">Memuat checkout...</div>;
  }

  if (cart.items?.length === 0) {
    return <div className="text-center py-12 text-danger">Keranjang kosong. <Link to="/cart">Keluar ke keranjang</Link></div>;
  }

  const shipping = 'Dihitung saat checkout';

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <h1 className="font-heading text-3xl mb-6">Checkout</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm mb-1">Alamat Pengiriman</label>
          <textarea
            name="address"
            rows={3}
            className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine"
            required
          />

          <label className="block text-sm mb-1">Kurir</label>
          <select
            name="courier"
            className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine"
            required
          >
            <option value="JNE">JNE</option>
            <option value="J&T">J&T</option>
            <option value="SiCepat">SiCepat</option>
            <option value="AnterAja">AnterAja</option>
          </select>

          <label className="block text-sm mb-1">Metode Pembayaran</label>
          <select
            name="payment_method"
            className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine"
            required
          >
            <option value="transfer">Transfer</option>
            <option value="COD">COD</option>
            <option value="ewallet">Ewallet</option>
          </select>

          <label className="block text-sm mb-1">Kode Voucher (opsional)</label>
          <input
            name="voucher_code"
            className="w-full bg-cream border border-line rounded-md px-3 py-2 focus:outline-none focus:border-wine"
          />
          <p className="text-xs text-muted">Kode tersedia: {voucherOptions}</p>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-wine text-white py-3 rounded-full hover:bg-wineDark mt-4"
          >
            Buat Pesanan
          </button>
        </form>
      </div>

      <div className="md:col-span-1">
        <div className="bg-surface border border-line rounded-lg p-6 sticky top-24">
          <h2 className="font-heading text-xl mb-4">Ringkasan Pesanan</h2>
          <div className="space-y-3">
            {cart.items?.map((item) => (
              <div key={item.product_id} className="flex justify-between text-sm">
                <span className="text-muted truncate">{item.name} × {item.qty}</span>
                <span>{formatRupiah(item.price * item.qty)}</span>
              </div>
            ))}
            <hr className="border-line my-4" />
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span>{formatRupiah(cart.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-wine text-lg">Total</span>
              <span className="font-heading text-2xl text-wine">{formatRupiah(cart.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
