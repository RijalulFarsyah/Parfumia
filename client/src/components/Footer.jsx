export default function Footer() {
  return (
    <footer className="bg-surface border-t border-line py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        <div>
          <p className="font-heading italic text-wine text-xl">Parfumia</p>
          <p className="text-sm text-muted mt-2">Temukan aroma yang mewakili dirimu.</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted mb-3">Kategori</p>
          <ul className="text-sm space-y-1 text-muted">
            <li>Floral</li>
            <li>Woody</li>
            <li>Citrus</li>
            <li>Oriental</li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted mb-3">Bantuan</p>
          <ul className="text-sm space-y-1 text-muted">
            <li>Tentang</li>
            <li>Kontak</li>
            <li>Kebijakan</li>
          </ul>
        </div>
      </div>
      <p className="text-xs text-muted text-center mt-6">© 2026 Parfumia</p>
    </footer>
  );
}
