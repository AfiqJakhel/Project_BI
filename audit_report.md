# Laporan Audit Menyeluruh Dashboard BI

Berikut adalah hasil audit komprehensif terhadap frontend (Next.js) dan backend (FastAPI) untuk mengidentifikasi status data dari setiap komponen dan endpoint yang digunakan.

## 1. Keuangan & Penjualan

| Halaman | Komponen | Endpoint yang dipanggil | Status Data | Detail Temuan | Rekomendasi Perbaikan |
|---------|----------|-------------------------|-------------|---------------|-----------------------|
| Dashboard / Overview | `<OverviewGrid />` | `/api/kpi/summary` | **REAL / DUMMY** | Nilai Total Pendapatan, Net Profit, dan Pengeluaran berasal dari API (REAL). Namun, nilai "Pelanggan Aktif" (856) & "Produk Aktif" (124) di-hardcode. Grafik *sparkline* di dalam card KPI juga menggunakan data array DUMMY `[10, 15, 12, ...]`. | Buat endpoint KPI Pelanggan & Produk. Integrasikan *sparkline* agar membaca *trend* dari API, bukan *array hardcoded*. |
| Dashboard / Penjualan | `<RevenueLineChart />` | `/api/sales/monthly` | **KOSONG / DUMMY** | Endpoint terpanggil, namun mereturn `{"data": []}`. Hal ini disebabkan *fallback* tahun pada query backend (`SELECT MAX(tahun)`) menunjuk ke tahun berjalan yang datanya belum ada di tabel fakta. Selain itu, nilai **"Target"** dihitung DUMMY di komponen (`gross_revenue * 1.1`). | Perbaiki logika *fallback* tahun di backend agar menunjuk ke *latest year* yang memilki data riil. Tambahkan logika *Target* yang benar dari *database*. |
| Penjualan | `<YearlyRevenueChart />` | `/api/sales/yearly` | **REAL** | Data berjalan sempurna dan berhasil mendapatkan riwayat data tahunan riil dari *database*. | Sudah benar, tidak perlu dikerjakan ulang. |
| Penjualan | `<CashVsNonCashChart />` | `/api/sales/cash-ratio` | **KOSONG** | Sama seperti `sales/monthly`, API mereturn array kosong `[]` karena logika *fallback default year* gagal menemukan data penjualan. | Perbaiki *fallback* filter `w.tahun` di router `sales.py`. |
| Penjualan | `<OperationalRatioChart />` | `/api/sales/operational-ratio` | **KOSONG** | Kasus serupa: return data `[]`. | Perbaiki *fallback* filter tahun di router `sales.py`. |
| Dashboard / Penjualan | `<SalesHeatmap />` | *TIDAK ADA* | **DUMMY** | Memakai fungsi `generateMockHeatmap()` untuk menghasilkan data secara acak di lokal. | Buat endpoint khusus (misal: `/api/sales/heatmap`) untuk mereturn aktivitas transaksi harian. |
| Dashboard / Penjualan | `<RecentTransactions />` | *TIDAK ADA* | **DUMMY** | Transaksi memakai *array* statis yang ditulis manual di komponen (`TRX-1092` dsb). | Buat endpoint `/api/sales/recent` dan hubungkan ke tabel. |

## 2. Produk, Inventaris & Pelanggan

| Halaman | Komponen | Endpoint yang dipanggil | Status Data | Detail Temuan | Rekomendasi Perbaikan |
|---------|----------|-------------------------|-------------|---------------|-----------------------|
| Dashboard | `<TopProductsTable />` | *TIDAK ADA* | **DUMMY** | Data produk (Kaca Film 3M, dsb) bersifat *hardcoded* di dalam komponen. | Buat endpoint `/api/sales/top-products` di backend. |
| Produk | `<ProductBarChart />` | *TIDAK ADA* | **DUMMY** | Menggunakan variabel statis `mockTopProduk`. | Hubungkan dengan endpoint top produk. |
| Produk | Tabel Inventori / `ProdukPage` | *TIDAK ADA* | **DUMMY** | Seluruh tabel menggunakan statis `mockProduk` dari `lib/mock-data.ts`. Padahal di `api.ts`, *hook* `useStockSummary` dan `useLowStock` sudah tersedia dan backend sudah mengimplementasikannya, tetapi belum dipakai. | Terapkan *hook* `useStockSummary` dan `useLowStock` di halaman ini agar tabel membaca data riil dari PostgreSQL. |
| Pelanggan | `PelangganPage` (Segmentasi) | *TIDAK ADA* | **DUMMY** | Seluruh tabel pelanggan, *Metric* Pelanggan Baru, dan daftar Segmentasi (VIP/Regular) sepenuhnya menggunakan logika *dummy* lokal (`mockPelanggan`). | Buat *router* `/api/customers` dengan logika segmentasi di SQL / Pandas. |

## 3. Supplier, Pengeluaran & Laporan

| Halaman | Komponen | Endpoint yang dipanggil | Status Data | Detail Temuan | Rekomendasi Perbaikan |
|---------|----------|-------------------------|-------------|---------------|-----------------------|
| Dashboard / Pengeluaran | `<CategoryDonutChart />` | `/api/expenses/categories` | **REAL** *(bersyarat)* | Pada halaman Pengeluaran/Dashboard, komponen ini mereturn data REAL dengan baik. Namun komponen ini di-*reuse* secara *hardcoded* (DUMMY) di halaman Pelanggan untuk memvisualisasikan data Segmentasi VIP. | Pertahankan fungsi *API fetching* jika *props* data tidak di-*pass*, dan gunakan chart terpisah jika logika datanya sangat berbeda. |
| Laporan | `LaporanPage` | *TIDAK ADA* | **DUMMY** | Seluruh UI untuk download (seperti "1,245 rows", "~145 KB") hanyalah UI *placeholder*. Tombol belum memicu *download* file asli. | Buat layanan API (*reporting layer*) yang mengekspor *DataFrame* ke CSV/PDF sungguhan. |

---

## 📌 Ringkasan Prioritas

### 🔴 PALING URGENT DIPERBAIKI (Sangat menyesatkan jika dibiarkan)
Karena *dashboard* ini merupakan instrumen intelijen bisnis, *dummy data* yang dikira data *real* sangat berisiko:
1. **Target Penjualan** pada `<RevenueLineChart />` (Perhitungan `revenue * 1.1` sepenuhnya dibuat-buat dan bukan cerminan KPI perusahaan sesungguhnya).
2. **Dashboard `<SalesHeatmap />` & `<RecentTransactions />`** (Masih memutar *random script*, sehingga visualisasi terlihat padat tapi fiktif).
3. **KPI Card Pelanggan Aktif & Produk Aktif** di Overview (Data mutlak di-*hardcode* 856 & 124).
4. **Halaman Produk** (Backend API `/api/stock/summary` dan `/api/stock/low-stock` sebenarnya **SUDAH JADI**, namun *frontend* sama sekali belum memakainya dan masih asik *render* `mock-data.ts`. Harus segera disinkronkan!).

### 🟠 HARUS DIBUAT/DIPERBAIKI DI BACKEND DULU
1. **Perbaikan BUG *Fallback Year* (Penting!)**
   Endpoint `/api/sales/monthly`, `/api/sales/cash-ratio`, dan `/api/sales/operational-ratio` me-return *data KOSONG / NULL* karena `MAX(tahun)` otomatis menangkap tahun 2026 dari tabel dimensi Waktu, di mana pada tahun 2026 belum ada data transaksi yang tercatat. *Backend* perlu dimodifikasi agar mencari tahun terbaru *yang benar-benar ada di tabel Fakta*.
2. **Pembuatan Endpoint Baru**:
   - `GET /api/sales/top-products`
   - `GET /api/sales/recent-transactions`
   - `GET /api/sales/heatmap`
   - `GET /api/customers` (dan segmentasi)

### 🟢 SUDAH BENAR & AMAN (Tinggalkan, jangan dikerjakan ulang)
- **`<YearlyRevenueChart />`**: Endpoint `/api/sales/yearly` membalikkan data agregasi yang tepat dan langsung bekerja dengan baik.
- **`<CategoryDonutChart />`**: (Untuk Pengeluaran) Endpoint `/api/expenses/categories` sukses mengekstrak SQL data *category*.
- **KPI Pendapatan & Net Profit**: Secara garis besar sudah berjalan dengan baik karena Endpoint `mv_cashflow_yearly` mereturn data yang absolut.
