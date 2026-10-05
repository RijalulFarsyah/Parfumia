import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await register(username, password, role);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-surface border border-line rounded-lg p-8">
      <h1 className="font-heading text-3xl text-center mb-6">Daftar Akun</h1>
      <form onSubmit={handleSubmit}>
        <label className="block text-sm mb-1">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-cream border border-line rounded-md px-3 py-2 mb-4 focus:outline-none focus:border-wine"
          required
        />
        <label className="block text-sm mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-cream border border-line rounded-md px-3 py-2 mb-4 focus:outline-none focus:border-wine"
          required
        />
        <label className="block text-sm mb-1">Daftar sebagai</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full bg-cream border border-line rounded-md px-3 py-2 mb-4 focus:outline-none focus:border-wine"
        >
          <option value="buyer">Pembeli</option>
          <option value="seller">Penjual</option>
        </select>
        {error && <p className="text-danger text-sm mb-2">{error}</p>}
        <button type="submit" className="w-full bg-wine text-white py-2.5 rounded-full hover:bg-wineDark">
          Daftar
        </button>
      </form>
      <p className="text-center text-sm text-muted mt-4">
        Sudah punya akun? <Link to="/login" className="text-wine">Masuk</Link>
      </p>
    </div>
  );
}
