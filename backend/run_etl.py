"""
run_etl.py - ETL Orchestrator
==============================
Script utama untuk menjalankan seluruh pipeline ETL:
  Extract → Transform → Load

Cara menjalankan:
  cd c:\Data Afiq\Project\BI\backend
  python run_etl.py

  Opsi tambahan:
  python run_etl.py --skip-ddl       (lewati pembuatan tabel, jika sudah ada)
  python run_etl.py --verify-only    (hanya verifikasi data yang sudah ada)
"""

import sys
import time
import argparse
from pathlib import Path

# Tambahkan path backend ke sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from etl.extract import extract_laporan_keuangan, extract_barang_masuk, extract_stok
from etl.transform import transform
from etl.load import get_engine, run_ddl, load_all, verify_load


def print_banner():
    print("=" * 60)
    print("  ARAW Film BI - ETL Pipeline")
    print("  Milestone 4 | Star Schema Data Mart")
    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(description="ARAW Film ETL Runner")
    parser.add_argument("--skip-ddl",    action="store_true", help="Lewati pembuatan tabel DDL")
    parser.add_argument("--verify-only", action="store_true", help="Hanya verifikasi data")
    args = parser.parse_args()

    print_banner()
    start_time = time.time()

    engine = get_engine()

    # Test koneksi
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("\n[OK] Koneksi MySQL berhasil!")
    except Exception as e:
        print(f"\n[GAGAL] Koneksi MySQL GAGAL: {e}")
        print("    Pastikan XAMPP MySQL sudah berjalan.")
        sys.exit(1)

    # Mode verify-only
    if args.verify_only:
        verify_load(engine)
        return

    # ---- STEP 1: DDL ----
    if not args.skip_ddl:
        print("\n[STEP 1/4] Membuat tabel database ...")
        run_ddl(engine)
    else:
        print("\n[STEP 1/4] DDL dilewati (--skip-ddl)")

    # ---- STEP 2: EXTRACT ----
    print("\n[STEP 2/4] Mengekstrak data dari Excel ...")
    t0 = time.time()

    raw_laporan    = extract_laporan_keuangan()
    raw_barang_masuk = extract_barang_masuk()
    raw_stok       = extract_stok()

    print(f"\n  Ekstrak selesai dalam {time.time()-t0:.1f}s")
    print(f"  - Laporan keuangan : {len(raw_laporan)} sheet")
    print(f"  - Barang masuk     : {len(raw_barang_masuk)} sheet")
    print(f"  - Stok             : {'OK' if raw_stok else 'GAGAL'}")

    # ---- STEP 3: TRANSFORM ----
    print("\n[STEP 3/4] Mentransformasi data ...")
    t0 = time.time()

    transformed = transform(raw_laporan, raw_barang_masuk, raw_stok)

    print(f"\n  Transform selesai dalam {time.time()-t0:.1f}s")
    print(f"  - dim_waktu         : {len(transformed['dim_waktu'])} records")
    print(f"  - dim_barang        : {len(transformed['dim_barang'])} records")
    print(f"  - dim_supplier      : {len(transformed['dim_supplier'])} records")
    print(f"  - dim_status_tempo  : {len(transformed['dim_status_tempo'])} records")
    print(f"  - dim_kategori_biaya: {len(transformed['dim_kategori_biaya'])} records")
    print(f"  - dim_sumber_file   : {len(transformed['dim_sumber_file'])} records")
    print(f"  - fact_penjualan    : {len(transformed['fact_penjualan'])} records")
    print(f"  - fact_pengeluaran  : {len(transformed['fact_pengeluaran'])} records")
    print(f"  - fact_barang_masuk : {len(transformed['fact_barang_masuk'])} records")
    print(f"  - fact_stok         : {len(transformed['fact_stok'])} records")

    # ---- STEP 4: LOAD ----
    print("\n[STEP 4/4] Memuat data ke MySQL ...")
    t0 = time.time()

    summary = load_all(transformed)

    print(f"\n  Load selesai dalam {time.time()-t0:.1f}s")

    # ---- VERIFIKASI ----
    verify_load(engine)

    elapsed = time.time() - start_time
    print(f"\n{'='*60}")
    print(f"  ETL Pipeline SELESAI dalam {elapsed:.1f} detik")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
