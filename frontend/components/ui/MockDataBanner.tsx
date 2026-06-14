export function MockDataBanner() {
  if (process.env.NEXT_PUBLIC_MOCK_DATA !== 'true') return null;

  return (
    <div style={{
      background: 'var(--color-accent-amber)',
      color: 'var(--color-ink)',
      padding: '6px 24px',
      fontSize: 12,
      fontFamily: 'var(--font-body)',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }}>
      <span>⚠</span>
      <span>
        <strong>Mode Demo</strong> — Data yang ditampilkan adalah data contoh,
        bukan data transaksi Araw Film yang sebenarnya.
        Sambungkan ke FastAPI untuk data real.
      </span>
    </div>
  );
}
