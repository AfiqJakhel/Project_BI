# Rencana Implementasi Visualisasi BI ARAW Film

Rencana ini memetakan 14 usulan wawasan (insight) ke dalam struktur *dashboard* aplikasi, membaginya menjadi tiga area utama agar rapi dan tidak menumpuk.

## Pembagian Halaman Dashboard

Untuk mengakomodasi 14 wawasan, kita akan memecahnya ke dalam tiga halaman *dashboard* yang sudah tersedia di frontend: `Penjualan/Keuangan`, `Produk/Inventaris`, dan `Supplier/Pengeluaran` (halaman baru).

---

### 1. Halaman Keuangan & Penjualan (`/dashboard/penjualan` & `/dashboard/laporan`)
Halaman ini fokus pada aliran kas (cashflow), tren omzet harian/bulanan, dan rasio biaya operasional.

**Wawasan yang Dicover:**
*   **Poin 1:** Tren Pendapatan Tahunan Menurun (Bar/Line Chart membandingkan Bruto 2022-2026).
*   **Poin 2:** Pola Musiman (Heatmap atau Line Chart rata-rata Bruto/Nett per bulan).
*   **Poin 8:** Rasio Kas Tunai vs Non-Tunai (Stacked Bar Chart membandingkan persentase pembayaran per bulan).
*   **Poin 8b:** Biaya Operasional Harian (Line Chart tren `biaya_keluar_harian` dan rasionya terhadap `bruto`).
*   **Poin 11:** Analisis "Net Tunai" Negatif (Indikator KPI atau kalender yang menyoroti hari-hari di mana net tunai < 0).
*   **Poin 14:** Korelasi Omzet vs Barang Masuk (Dual Axis Line Chart: satu garis Omzet, satu garis Nilai Barang Masuk).

**Pekerjaan Backend (FastAPI):**
*   Membuat endpoint `/sales/seasonality` dari view `mv_penjualan_summary_monthly`.
*   Membuat endpoint `/sales/cash-ratio` untuk membedah tunai vs non-tunai.
*   Membuat endpoint `/sales/operational-ratio` membandingkan bruto vs biaya harian.

**Pekerjaan Frontend (Next.js & Recharts):**
*   Komponen `<YearlyRevenueChart />`
*   Komponen `<SeasonalityHeatmap />` atau `<SeasonalityLineChart />`
*   Komponen `<CashVsNonCashChart />`

---

### 2. Halaman Produk & Inventaris (`/dashboard/produk`)
Halaman ini fokus pada stok barang, perputaran produk, dan peringatan *restock*.

**Wawasan yang Dicover:**
*   **Poin 5:** Model Mobil Terpopuler (Pie/Donut Chart jumlah transaksi/barang masuk per model kendaraan).
*   **Poin 6:** Fast-moving items (Tabel/Bar Chart top item berdasarkan `qty_keluar` tertinggi).
*   **Poin 7:** Nilai Modal Stok (KPI Card menghitung total nilai aset persediaan dari `nilai_modal_sisa`).
*   **Poin 9:** Peringatan Barang Habis (Tabel notifikasi "Stockout Alert" untuk item dengan `qty_sisa = 0` tapi pernah terjual).

**Pekerjaan Backend (FastAPI):**
*   Endpoint `/stock/valuation` menjumlahkan total modal aset.
*   Endpoint `/stock/fast-moving` mengambil dari view `mv_stock_reorder_candidate`.
*   Endpoint `/stock/stockouts` mengambil item dengan sisa 0 dari view yang sama.

**Pekerjaan Frontend (Next.js & Recharts):**
*   Komponen `<TopCarModelsChart />`
*   Komponen `<FastMovingItemsTable />`
*   Komponen `<StockoutAlertList />`
*   Komponen KPI Card `<TotalAssetValue />`

---

### 3. Halaman Supplier & Pengeluaran (`/dashboard/supplier` - Halaman Baru)
Halaman ini akan khusus membedah ke mana uang toko keluar, baik untuk pembelian stok (barang masuk) maupun operasional (pengeluaran lain).

**Wawasan yang Dicover:**
*   **Poin 3:** Analisis Pengeluaran (Bar Chart pengeluaran berdasarkan kategori dari `Dim_KategoriBiaya`).
*   **Poin 4:** Ketergantungan Supplier (Tree Map atau Pie Chart transaksi supplier berdasar `mv_supplier_purchase_rank`).
*   **Poin 12:** Lead Time & Jatuh Tempo Bon (Tabel/Timeline menunjukkan proyeksi utang jatuh tempo per bulan).
*   **Poin 13:** Perbandingan Harga Beli / Inflasi (Line chart melacak historis `harga_per_unit` barang spesifik seiring waktu).
*   **Poin 15:** Top 10 Pengeluaran Terbesar (Tabel menyoroti transaksi tunggal terbesar dari tabel `Fakta_Pengeluaran`).

**Pekerjaan Backend (FastAPI):**
*   Endpoint `/expenses/by-category` mengambil dari view `mv_pengeluaran_summary_monthly`.
*   Endpoint `/supplier/concentration` mengambil top supplier dari `mv_supplier_purchase_rank`.
*   Endpoint `/supplier/payables` merangkum utang berdasar status "GIRO / JATUH TEMPO".
*   Endpoint `/expenses/top-10` menyeleksi limit 10 terbesar.

**Pekerjaan Frontend (Next.js & Recharts):**
*   Komponen `<SupplierDependencyChart />`
*   Komponen `<ExpenseCategoryChart />`
*   Komponen `<UpcomingPayablesTable />`
*   Komponen `<TopExpensesTable />`

---

> [!IMPORTANT]
> **User Review Required**
> 1. Apakah Anda setuju dengan pembagian tiga halaman ini?
> 2. Dari 3 halaman di atas, **halaman mana yang ingin kita prioritaskan untuk dibangun pertama kali?** (Misal: "Fokus ke Keuangan/Penjualan dulu").
> 3. Apakah Anda ingin kita menambahkan halaman `/dashboard/supplier` ke navigasi samping (*sidebar*)?
