-- ============================================================
-- DDL: ARAW Film Data Warehouse / Data Mart
-- Metode: Kimball Star Schema
-- Database: araw_film
-- ============================================================

-- ============================================================
-- DIMENSION TABLES
-- ============================================================

-- Dim_Waktu
CREATE TABLE IF NOT EXISTS Dim_Waktu (
    date_id         INT             NOT NULL,   -- Format YYYYMMDD
    tanggal         DATE            NOT NULL,
    hari            TINYINT         NOT NULL,   -- 1-31
    nama_hari       VARCHAR(15)     NULL,       -- Senin, Selasa, dst
    bulan           TINYINT         NOT NULL,   -- 1-12
    nama_bulan      VARCHAR(15)     NOT NULL,   -- Januari, dst
    tahun           SMALLINT        NOT NULL,
    kuartal         TINYINT         NOT NULL,   -- 1-4
    periode_laporan VARCHAR(20)     NULL,       -- "Jan 2022", dst
    PRIMARY KEY (date_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dim_Barang
CREATE TABLE IF NOT EXISTS Dim_Barang (
    barang_id       INT             NOT NULL AUTO_INCREMENT,
    nama_barang     VARCHAR(200)    NOT NULL,
    model_kendaraan VARCHAR(100)    NULL,
    satuan          VARCHAR(20)     NULL,       -- PCS, SET, ROL, dll
    kategori_barang VARCHAR(100)    NULL,
    status_aktif    BOOLEAN         NOT NULL DEFAULT TRUE,
    PRIMARY KEY (barang_id),
    UNIQUE KEY uq_nama_barang (nama_barang(100), model_kendaraan(50), satuan(20))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dim_Supplier
CREATE TABLE IF NOT EXISTS Dim_Supplier (
    supplier_id     INT             NOT NULL AUTO_INCREMENT,
    nama_supplier   VARCHAR(150)    NOT NULL,
    tipe_supplier   VARCHAR(50)     NULL,
    status_aktif    BOOLEAN         NOT NULL DEFAULT TRUE,
    PRIMARY KEY (supplier_id),
-- Dim_KategoriBiaya
CREATE TABLE IF NOT EXISTS Dim_KategoriBiaya (
    kategori_biaya_id INT           NOT NULL AUTO_INCREMENT,
    nama_kategori   VARCHAR(100)    NOT NULL,
    keterangan_biaya VARCHAR(255)   NULL,
    PRIMARY KEY (kategori_biaya_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dim_StatusTempo
CREATE TABLE IF NOT EXISTS Dim_StatusTempo (
    status_tempo_id INT             NOT NULL AUTO_INCREMENT,
    status_bon      VARCHAR(50)     NULL,       -- LUNAS, GIRO, JATUH TEMPO, dll
    bulan_jatuh_tempo VARCHAR(20)   NULL,
    keterangan      VARCHAR(200)    NULL,
    PRIMARY KEY (status_tempo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dim_SumberFile
CREATE TABLE IF NOT EXISTS Dim_SumberFile (
    source_id       INT             NOT NULL AUTO_INCREMENT,
    nama_file       VARCHAR(100)    NOT NULL,
    tahun_file      SMALLINT        NULL,
    sheet_bulan     VARCHAR(20)     NULL,
    tipe_file       VARCHAR(50)     NULL,   -- 'LAPORAN', 'BARANG_MASUK', 'STOK'
    PRIMARY KEY (source_id),
    UNIQUE KEY uq_file_sheet (nama_file, sheet_bulan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- FACT TABLES
-- ============================================================

-- Fakta_PenjualanHarian
CREATE TABLE IF NOT EXISTS Fakta_PenjualanHarian (
    penjualan_id            BIGINT          NOT NULL AUTO_INCREMENT,
    date_id                 INT             NOT NULL,
    source_id               INT             NOT NULL,
    pemasukan_non_tunai     DECIMAL(18,2)   NULL DEFAULT 0,
    pemasukan_tunai         DECIMAL(18,2)   NULL DEFAULT 0,
    bruto                   DECIMAL(18,2)   NULL DEFAULT 0,
    biaya_keluar_harian     DECIMAL(18,2)   NULL DEFAULT 0,
    nett                    DECIMAL(18,2)   NULL DEFAULT 0,
    net_tunai               DECIMAL(18,2)   NULL DEFAULT 0,
    PRIMARY KEY (penjualan_id),
    KEY idx_penjualan_date (date_id),
    KEY idx_penjualan_source (source_id),
    CONSTRAINT fk_penjualan_waktu   FOREIGN KEY (date_id)   REFERENCES Dim_Waktu(date_id),
    CONSTRAINT fk_penjualan_source  FOREIGN KEY (source_id) REFERENCES Dim_SumberFile(source_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Fakta_Pengeluaran
CREATE TABLE IF NOT EXISTS Fakta_Pengeluaran (
    pengeluaran_id          BIGINT          NOT NULL AUTO_INCREMENT,
    date_id                 INT             NOT NULL,
    kategori_biaya_id       INT             NULL,
    source_id               INT             NOT NULL,
    keterangan              VARCHAR(300)    NULL,
    jumlah_pengeluaran      DECIMAL(18,2)   NULL DEFAULT 0,
    PRIMARY KEY (pengeluaran_id),
    KEY idx_pengeluaran_date (date_id),
    CONSTRAINT fk_pengeluaran_waktu     FOREIGN KEY (date_id)           REFERENCES Dim_Waktu(date_id),
    CONSTRAINT fk_pengeluaran_kategori  FOREIGN KEY (kategori_biaya_id) REFERENCES Dim_KategoriBiaya(kategori_biaya_id),
    CONSTRAINT fk_pengeluaran_source    FOREIGN KEY (source_id)         REFERENCES Dim_SumberFile(source_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Fakta_BarangMasuk
CREATE TABLE IF NOT EXISTS Fakta_BarangMasuk (
    barang_masuk_id         BIGINT          NOT NULL AUTO_INCREMENT,
    date_id                 INT             NOT NULL,
    barang_id               INT             NOT NULL,
    supplier_id             INT             NULL,
    status_tempo_id         INT             NULL,
    source_id               INT             NOT NULL,
    qty                     DECIMAL(12,2)   NULL DEFAULT 0,
    harga_per_unit          DECIMAL(18,2)   NULL DEFAULT 0,
    jumlah                  DECIMAL(18,2)   NULL DEFAULT 0,
    total_faktur            DECIMAL(18,2)   NULL DEFAULT 0,
    jumlah_bon              DECIMAL(18,2)   NULL DEFAULT 0,
    PRIMARY KEY (barang_masuk_id),
    KEY idx_bm_date (date_id),
    KEY idx_bm_barang (barang_id),
    KEY idx_bm_supplier (supplier_id),
    CONSTRAINT fk_bm_waktu      FOREIGN KEY (date_id)       REFERENCES Dim_Waktu(date_id),
    CONSTRAINT fk_bm_barang     FOREIGN KEY (barang_id)     REFERENCES Dim_Barang(barang_id),
    CONSTRAINT fk_bm_supplier   FOREIGN KEY (supplier_id)   REFERENCES Dim_Supplier(supplier_id),
    CONSTRAINT fk_bm_tempo      FOREIGN KEY (status_tempo_id) REFERENCES Dim_StatusTempo(status_tempo_id),
    CONSTRAINT fk_bm_source     FOREIGN KEY (source_id)     REFERENCES Dim_SumberFile(source_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Fakta_StokBarang
CREATE TABLE IF NOT EXISTS Fakta_StokBarang (
    stok_id                 BIGINT          NOT NULL AUTO_INCREMENT,
    barang_id               INT             NOT NULL,
    source_id               INT             NOT NULL,
    model_kendaraan         VARCHAR(100)    NULL,
    tahun_kendaraan         VARCHAR(10)     NULL,
    qty_masuk               DECIMAL(12,2)   NULL DEFAULT 0,
    qty_keluar              DECIMAL(12,2)   NULL DEFAULT 0,
    qty_sisa                DECIMAL(12,2)   NULL DEFAULT 0,
    modal                   DECIMAL(18,2)   NULL DEFAULT 0,
    nilai_modal_sisa        DECIMAL(18,2)   NULL DEFAULT 0,
    PRIMARY KEY (stok_id),
    KEY idx_stok_barang (barang_id),
    CONSTRAINT fk_stok_barang   FOREIGN KEY (barang_id)     REFERENCES Dim_Barang(barang_id),
    CONSTRAINT fk_stok_source   FOREIGN KEY (source_id)     REFERENCES Dim_SumberFile(source_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- VIEWS (Pengganti Materialized View di MySQL)
-- ============================================================

-- mv_penjualan_summary_monthly
CREATE OR REPLACE VIEW mv_penjualan_summary_monthly AS
SELECT
    w.tahun,
    w.bulan,
    w.nama_bulan,
    COUNT(p.penjualan_id)               AS jumlah_hari_transaksi,
    SUM(p.bruto)                        AS total_bruto,
    SUM(p.pemasukan_tunai)              AS total_tunai,
    SUM(p.pemasukan_non_tunai)          AS total_non_tunai,
    SUM(p.biaya_keluar_harian)          AS total_biaya_harian,
    SUM(p.nett)                         AS total_nett,
    SUM(p.net_tunai)                    AS total_net_tunai
FROM Fakta_PenjualanHarian p
JOIN Dim_Waktu w ON p.date_id = w.date_id
GROUP BY w.tahun, w.bulan, w.nama_bulan
ORDER BY w.tahun, w.bulan;

-- mv_pengeluaran_summary_monthly
CREATE OR REPLACE VIEW mv_pengeluaran_summary_monthly AS
SELECT
    w.tahun,
    w.bulan,
    w.nama_bulan,
    k.nama_kategori,
    COUNT(e.pengeluaran_id)             AS jumlah_transaksi,
    SUM(e.jumlah_pengeluaran)           AS total_pengeluaran
FROM Fakta_Pengeluaran e
JOIN Dim_Waktu w           ON e.date_id = w.date_id
LEFT JOIN Dim_KategoriBiaya k ON e.kategori_biaya_id = k.kategori_biaya_id
GROUP BY w.tahun, w.bulan, w.nama_bulan, k.nama_kategori
ORDER BY w.tahun, w.bulan;

-- mv_supplier_purchase_rank
CREATE OR REPLACE VIEW mv_supplier_purchase_rank AS
SELECT
    s.nama_supplier,
    COUNT(bm.barang_masuk_id)           AS jumlah_transaksi,
    SUM(bm.qty)                         AS total_qty,
    SUM(bm.jumlah)                      AS total_nilai_pembelian
FROM Fakta_BarangMasuk bm
JOIN Dim_Supplier s ON bm.supplier_id = s.supplier_id
GROUP BY s.supplier_id, s.nama_supplier
ORDER BY total_nilai_pembelian DESC;

-- mv_stock_reorder_candidate
CREATE OR REPLACE VIEW mv_stock_reorder_candidate AS
SELECT
    b.nama_barang,
    b.model_kendaraan,
    b.satuan,
    SUM(st.qty_masuk)                   AS total_qty_masuk,
    SUM(st.qty_keluar)                  AS total_qty_keluar,
    SUM(st.qty_sisa)                    AS total_qty_sisa,
    SUM(st.modal)                       AS harga_modal,
    SUM(st.nilai_modal_sisa)            AS nilai_modal_sisa
FROM Fakta_StokBarang st
JOIN Dim_Barang b ON st.barang_id = b.barang_id
GROUP BY b.barang_id, b.nama_barang, b.model_kendaraan, b.satuan
ORDER BY total_qty_sisa ASC;

-- mv_cashflow_yearly
CREATE OR REPLACE VIEW mv_cashflow_yearly AS
SELECT
    w.tahun,
    COALESCE(SUM(p.bruto), 0)                       AS total_bruto,
    COALESCE(SUM(p.nett), 0)                        AS total_nett,
    COALESCE(SUM(p.biaya_keluar_harian), 0)         AS total_biaya_harian,
    COALESCE((SELECT SUM(e.jumlah_pengeluaran)
              FROM Fakta_Pengeluaran e
              JOIN Dim_Waktu we ON e.date_id = we.date_id
              WHERE we.tahun = w.tahun), 0)         AS total_pengeluaran,
    COALESCE((SELECT SUM(bm.jumlah)
              FROM Fakta_BarangMasuk bm
              JOIN Dim_Waktu wb ON bm.date_id = wb.date_id
              WHERE wb.tahun = w.tahun), 0)         AS total_pembelian_barang
FROM Fakta_PenjualanHarian p
JOIN Dim_Waktu w ON p.date_id = w.date_id
GROUP BY w.tahun
ORDER BY w.tahun;
