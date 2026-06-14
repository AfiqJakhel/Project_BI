export const mockProduk = [
  // KACA FILM
  { id: 'P001', nama: 'Kaca Film 3M Crystalline 70%', sku: 'KF-3M-CR-70', kategori: 'Kaca Film',
    stok: 15, harga: 1500000, qty_sold: 120, revenue: 180000000 },
  { id: 'P002', nama: 'Kaca Film 3M Crystalline 40%', sku: 'KF-3M-CR-40', kategori: 'Kaca Film',
    stok: 8, harga: 1200000, qty_sold: 85, revenue: 102000000 },
  { id: 'P003', nama: 'Kaca Film V-Kool VK40', sku: 'KF-VK-40', kategori: 'Kaca Film',
    stok: 12, harga: 2800000, qty_sold: 42, revenue: 117600000 },
  { id: 'P004', nama: 'Kaca Film SolarGard Quantum', sku: 'KF-SG-QT', kategori: 'Kaca Film',
    stok: 3, harga: 2200000, qty_sold: 38, revenue: 83600000 },
  { id: 'P005', nama: 'Kaca Film Llumar ATR 35', sku: 'KF-LL-ATR', kategori: 'Kaca Film',
    stok: 20, harga: 1800000, qty_sold: 55, revenue: 99000000 },

  // PERAWATAN
  { id: 'P006', nama: 'Poles Body Nano Ceramic Coating', sku: 'PR-NANO-01', kategori: 'Perawatan',
    stok: 5, harga: 3000000, qty_sold: 95, revenue: 285000000 },
  { id: 'P007', nama: 'Cuci & Detailing Eksterior', sku: 'PR-DETAIL-EX', kategori: 'Perawatan',
    stok: 999, harga: 250000, qty_sold: 210, revenue: 52500000 },
  { id: 'P008', nama: 'Poles Headlamp Buram', sku: 'PR-LAMP-01', kategori: 'Perawatan',
    stok: 999, harga: 150000, qty_sold: 145, revenue: 21750000 },
  { id: 'P009', nama: 'Anti Karat Underseal', sku: 'PR-RUST-01', kategori: 'Perawatan',
    stok: 18, harga: 450000, qty_sold: 62, revenue: 27900000 },

  // ELEKTRONIK
  { id: 'P010', nama: 'Dashcam 70mai Pro Plus+', sku: 'EL-70MAI-PR', kategori: 'Elektronik',
    stok: 0, harga: 800000, qty_sold: 80, revenue: 64000000 },
  { id: 'P011', nama: 'Head Unit Android 10" 2 DIN', sku: 'EL-HU-AND10', kategori: 'Elektronik',
    stok: 7, harga: 2500000, qty_sold: 45, revenue: 112500000 },
  { id: 'P012', nama: 'Kamera Mundur HD 170°', sku: 'EL-CAM-RV', kategori: 'Elektronik',
    stok: 14, harga: 350000, qty_sold: 98, revenue: 34300000 },
  { id: 'P013', nama: 'Sensor Parkir 4 Titik', sku: 'EL-PARK-4', kategori: 'Elektronik',
    stok: 11, harga: 280000, qty_sold: 115, revenue: 32200000 },

  // INTERIOR
  { id: 'P014', nama: 'Karpet Dasar Mie Comfort Full Set', sku: 'IN-KMC-FS', kategori: 'Interior',
    stok: 22, harga: 500000, qty_sold: 65, revenue: 32500000 },
  { id: 'P015', nama: 'Cover Jok Kulit Premium Avanza', sku: 'IN-JOKAVZ', kategori: 'Interior',
    stok: 9, harga: 1800000, qty_sold: 48, revenue: 86400000 },
  { id: 'P016', nama: 'Dashboard Cover Anti Panas', sku: 'IN-DASH-01', kategori: 'Interior',
    stok: 30, harga: 180000, qty_sold: 130, revenue: 23400000 },

  // EKSTERIOR
  { id: 'P017', nama: 'Wiper Bosch Aero Twin 20"', sku: 'EK-WIP-BA20', kategori: 'Eksterior',
    stok: 25, harga: 180000, qty_sold: 160, revenue: 28800000 },
  { id: 'P018', nama: 'Lampu LED H4 Philips Ultinon', sku: 'EK-LED-H4', kategori: 'Eksterior',
    stok: 18, harga: 420000, qty_sold: 88, revenue: 36960000 },
  { id: 'P019', nama: 'Alarm System Viper 3100V', sku: 'EK-ALS-V31', kategori: 'Eksterior',
    stok: 6, harga: 650000, qty_sold: 31, revenue: 20150000 },
  { id: 'P020', nama: 'Spoiler Belakang Universal', sku: 'EK-SPL-UNV', kategori: 'Eksterior',
    stok: 4, harga: 850000, qty_sold: 22, revenue: 18700000 },
]

export const VIP_RULES = {
  min_total_spend: 10000000,  // Total belanja minimal Rp 10 juta
  min_total_order: 5,         // ATAU minimal 5x transaksi
}

export function getSegment(pelanggan: { total_spend: number; total_order: number }): 'vip' | 'regular' {
  return pelanggan.total_spend >= VIP_RULES.min_total_spend ||
         pelanggan.total_order >= VIP_RULES.min_total_order
    ? 'vip'
    : 'regular'
}

const basePelanggan = [
  { id: 'C001', nama: 'Budi Santoso',      no_hp: '0812-3456-7890', total_order: 5,  total_spend: 15500000, last_purchase: '2026-06-13' },
  { id: 'C002', nama: 'Andi Wijaya',       no_hp: '0811-9876-5432', total_order: 2,  total_spend: 4500000,  last_purchase: '2026-06-10' },
  { id: 'C003', nama: 'Siti Rahma',        no_hp: '0856-1234-5678', total_order: 8,  total_spend: 25000000, last_purchase: '2026-06-12' },
  { id: 'C004', nama: 'Riko Putra',        no_hp: '0821-5678-9012', total_order: 12, total_spend: 48000000, last_purchase: '2026-06-11' },
  { id: 'C005', nama: 'Dewi Lestari',      no_hp: '0813-2345-6789', total_order: 1,  total_spend: 800000,   last_purchase: '2026-05-28' },
  { id: 'C006', nama: 'Hendri Saputra',    no_hp: '0852-3456-7890', total_order: 3,  total_spend: 7200000,  last_purchase: '2026-06-09' },
  { id: 'C007', nama: 'Yuliana Fitri',     no_hp: '0877-4567-8901', total_order: 7,  total_spend: 21000000, last_purchase: '2026-06-08' },
  { id: 'C008', nama: 'Doni Kurniawan',    no_hp: '0819-5678-9012', total_order: 2,  total_spend: 3600000,  last_purchase: '2026-06-05' },
  { id: 'C009', nama: 'Rina Marlina',      no_hp: '0823-6789-0123', total_order: 4,  total_spend: 9800000,  last_purchase: '2026-06-03' },
  { id: 'C010', nama: 'Fauzan Akbar',      no_hp: '0815-7890-1234', total_order: 9,  total_spend: 32500000, last_purchase: '2026-06-13' },
  { id: 'C011', nama: 'Nurul Hidayah',     no_hp: '0858-8901-2345', total_order: 1,  total_spend: 500000,   last_purchase: '2026-05-15' },
  { id: 'C012', nama: 'Irwan Syahputra',   no_hp: '0812-9012-3456', total_order: 6,  total_spend: 18000000, last_purchase: '2026-06-10' },
  { id: 'C013', nama: 'Mega Wulandari',    no_hp: '0853-0123-4567', total_order: 2,  total_spend: 2800000,  last_purchase: '2026-06-01' },
  { id: 'C014', nama: 'Taufik Hidayat',    no_hp: '0816-1234-5678', total_order: 3,  total_spend: 5400000,  last_purchase: '2026-05-30' },
  { id: 'C015', nama: 'Winda Puspita',     no_hp: '0821-2345-6789', total_order: 10, total_spend: 38000000, last_purchase: '2026-06-12' },
  { id: 'C016', nama: 'Rizki Aditya',      no_hp: '0811-1234-5678', total_order: 4,  total_spend: 9500000,  last_purchase: '2026-05-25' },
  { id: 'C017', nama: 'Nina Karina',       no_hp: '0852-9876-5432', total_order: 1,  total_spend: 150000,   last_purchase: '2026-06-02' },
  { id: 'C018', nama: 'Adi Gunawan',       no_hp: '0812-1111-2222', total_order: 15, total_spend: 65000000, last_purchase: '2026-06-11' },
  { id: 'C019', nama: 'Diana Putri',       no_hp: '0813-3333-4444', total_order: 2,  total_spend: 1200000,  last_purchase: '2026-05-18' },
  { id: 'C020', nama: 'Eko Prasetyo',      no_hp: '0819-5555-6666', total_order: 5,  total_spend: 9000000,  last_purchase: '2026-06-08' }, // VIP by total_order
  { id: 'C021', nama: 'Siska Amelia',      no_hp: '0856-7777-8888', total_order: 1,  total_spend: 2800000,  last_purchase: '2026-04-20' },
  { id: 'C022', nama: 'Reza Pahlevi',      no_hp: '0821-9999-0000', total_order: 3,  total_spend: 11000000, last_purchase: '2026-06-05' }, // VIP by total_spend
  { id: 'C023', nama: 'Ratna Sari',        no_hp: '0878-1212-3434', total_order: 7,  total_spend: 23000000, last_purchase: '2026-06-10' },
  { id: 'C024', nama: 'Hendra Wijaya',     no_hp: '0811-5656-7878', total_order: 2,  total_spend: 450000,   last_purchase: '2026-06-01' },
  { id: 'C025', nama: 'Anita Kusuma',      no_hp: '0852-9090-1212', total_order: 4,  total_spend: 8500000,  last_purchase: '2026-05-29' },
  { id: 'C026', nama: 'Joko Widodo',       no_hp: '0812-3434-5656', total_order: 8,  total_spend: 31000000, last_purchase: '2026-06-12' },
  { id: 'C027', nama: 'Santi Susanti',     no_hp: '0813-7878-9090', total_order: 1,  total_spend: 350000,   last_purchase: '2026-05-15' },
  { id: 'C028', nama: 'Agus Salim',        no_hp: '0819-1234-9876', total_order: 6,  total_spend: 14000000, last_purchase: '2026-06-07' },
  { id: 'C029', nama: 'Melati Indah',      no_hp: '0856-4321-8765', total_order: 2,  total_spend: 5000000,  last_purchase: '2026-06-04' },
  { id: 'C030', nama: 'Firman Utina',      no_hp: '0821-8765-4321', total_order: 11, total_spend: 42000000, last_purchase: '2026-06-13' },
]

export const mockPelanggan = basePelanggan.map(p => ({
  ...p,
  segment: getSegment({ total_spend: p.total_spend, total_order: p.total_order })
}))

// Deterministic pseudo-random number generator for stable mock data (prevents hydration mismatch)
let seed = 12345;
function pseudoRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

// Generate 50 mock transactions
const statusOptions = ['lunas', 'proses', 'batal'] as const;
const statusWeights = [0.75, 0.15, 0.10];

function getRandomStatus() {
  const r = pseudoRandom();
  if (r < statusWeights[0]) return statusOptions[0];
  if (r < statusWeights[0] + statusWeights[1]) return statusOptions[1];
  return statusOptions[2];
}

const generatedTransactions = [];
for (let i = 1; i <= 50; i++) {
  const customer = basePelanggan[Math.floor(pseudoRandom() * basePelanggan.length)];
  const produk = mockProduk[Math.floor(pseudoRandom() * mockProduk.length)];
  const status = getRandomStatus();
  
  // Random date within the last 30 days of Jun 2026
  const day = Math.floor(pseudoRandom() * 30) + 1;
  const hour = Math.floor(pseudoRandom() * 10) + 9; // 9 AM to 6 PM
  const minute = Math.floor(pseudoRandom() * 60);
  const dateStr = `2026-06-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  
  generatedTransactions.push({
    id: `TRX-${2000 - i}`,
    waktu: dateStr,
    pelanggan: customer.nama,
    produk: produk.nama,
    total: produk.harga,
    status: status
  });
}

// Sort by date descending
generatedTransactions.sort((a, b) => b.waktu.localeCompare(a.waktu));

export const mockTransaksi = generatedTransactions;
