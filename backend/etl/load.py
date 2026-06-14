"""
ETL - Load Module
=================
Memuat hasil transform ke MySQL database menggunakan SQLAlchemy.
Menggunakan INSERT IGNORE untuk idempotency (bisa dijalankan ulang).
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# Load .env dari folder backend/
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(ENV_PATH)

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "araw_film_dw")

# URL tanpa nama database (untuk CREATE DATABASE)
DB_URL_ROOT = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}?charset=utf8mb4"
# URL dengan nama database
DB_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"


def ensure_database_exists():
    """Buat database jika belum ada."""
    engine_root = create_engine(DB_URL_ROOT, echo=False)
    with engine_root.connect() as conn:
        conn.execute(text(
            f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` "
            f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        ))
        conn.commit()
    engine_root.dispose()
    print(f"[DB] Database '{DB_NAME}' siap.")


def get_engine():
    ensure_database_exists()
    return create_engine(DB_URL, echo=False, pool_pre_ping=True)


def _bulk_insert(conn, table: str, rows: list[dict], chunk_size: int = 500):
    """
    Insert rows ke tabel secara bulk dengan INSERT IGNORE.
    Dibagi per chunk untuk menghindari packet terlalu besar.
    """
    if not rows:
        return 0

    total = 0
    for i in range(0, len(rows), chunk_size):
        chunk = rows[i:i + chunk_size]
        cols = list(chunk[0].keys())
        col_str = ", ".join(f"`{c}`" for c in cols)
        val_str = ", ".join(f":{c}" for c in cols)
        sql = text(f"INSERT IGNORE INTO `{table}` ({col_str}) VALUES ({val_str})")
        conn.execute(sql, chunk)
        total += len(chunk)

    return total


def run_ddl(engine):
    """Jalankan DDL SQL dari file create_tables.sql."""
    sql_path = Path(__file__).resolve().parent.parent / "sql" / "create_tables.sql"
    if not sql_path.exists():
        print(f"[ERROR] File DDL tidak ditemukan: {sql_path}")
        return False

    sql_content = sql_path.read_text(encoding="utf-8")

    # Pisahkan per statement berdasarkan semicolon
    raw_statements = sql_content.split(";")
    statements = []
    for s in raw_statements:
        # Bersihkan komentar dan spasi
        lines = [l for l in s.splitlines() if l.strip() and not l.strip().startswith("--")]
        cleaned = "\n".join(lines).strip()
        if cleaned:
            statements.append(cleaned)

    print(f"[DDL] Menjalankan {len(statements)} statement SQL ...")
    success, failed = 0, 0

    for stmt in statements:
        first_line = stmt.splitlines()[0][:60]
        try:
            with engine.begin() as conn:
                conn.execute(text(stmt))
            success += 1
            print(f"  [OK] {first_line}")
        except SQLAlchemyError as e:
            err_msg = str(e.orig) if hasattr(e, "orig") else str(e)
            # Pesan "already exists" bukan error fatal
            if "already exists" in err_msg.lower() or "1050" in err_msg or "1061" in err_msg:
                print(f"  [SKIP] {first_line} (sudah ada)")
                success += 1
            else:
                print(f"  [WARN] {first_line}")
                print(f"         {err_msg[:120]}")
                failed += 1

    print(f"[DDL] Selesai: {success} sukses, {failed} gagal.")
    return failed == 0


def load_all(transformed: dict) -> dict:
    """
    Load semua data hasil transform ke MySQL.

    Args:
        transformed: dict output dari transform.transform()

    Returns:
        dict dengan jumlah baris yang berhasil di-insert per tabel
    """
    engine = get_engine()
    summary = {}

    print("\n[LOAD] Memulai proses load ke MySQL ...")

    with engine.begin() as conn:
        print("  Membersihkan data lama (TRUNCATE) agar idempotent...")
        conn.execute(text("SET FOREIGN_KEY_CHECKS=0;"))
        tables_to_truncate = [
            "Fakta_PenjualanHarian", "Fakta_Pengeluaran",
            "Fakta_BarangMasuk", "Fakta_StokBarang",
            "Dim_Waktu", "Dim_Barang", "Dim_Supplier",
            "Dim_StatusTempo", "Dim_KategoriBiaya", "Dim_SumberFile"
        ]
        for t in tables_to_truncate:
            conn.execute(text(f"TRUNCATE TABLE `{t}`;"))
        conn.execute(text("SET FOREIGN_KEY_CHECKS=1;"))

        # ---- DIMENSI ----

        print("  Loading Dim_Waktu ...")
        n = _bulk_insert(conn, "Dim_Waktu", transformed["dim_waktu"])
        summary["Dim_Waktu"] = n
        print(f"    -> {n} baris")

        print("  Loading Dim_Barang ...")
        n = _bulk_insert(conn, "Dim_Barang", transformed["dim_barang"])
        summary["Dim_Barang"] = n
        print(f"    -> {n} baris")

        print("  Loading Dim_Supplier ...")
        n = _bulk_insert(conn, "Dim_Supplier", transformed["dim_supplier"])
        summary["Dim_Supplier"] = n
        print(f"    -> {n} baris")

        print("  Loading Dim_StatusTempo ...")
        n = _bulk_insert(conn, "Dim_StatusTempo", transformed["dim_status_tempo"])
        summary["Dim_StatusTempo"] = n
        print(f"    -> {n} baris")

        print("  Loading Dim_KategoriBiaya ...")
        n = _bulk_insert(conn, "Dim_KategoriBiaya", transformed["dim_kategori_biaya"])
        summary["Dim_KategoriBiaya"] = n
        print(f"    -> {n} baris")

        print("  Loading Dim_SumberFile ...")
        n = _bulk_insert(conn, "Dim_SumberFile", transformed["dim_sumber_file"])
        summary["Dim_SumberFile"] = n
        print(f"    -> {n} baris")

        # ---- FAKTA ----

        print("  Loading Fakta_PenjualanHarian ...")
        n = _bulk_insert(conn, "Fakta_PenjualanHarian", transformed["fact_penjualan"])
        summary["Fakta_PenjualanHarian"] = n
        print(f"    -> {n} baris")

        print("  Loading Fakta_Pengeluaran ...")
        n = _bulk_insert(conn, "Fakta_Pengeluaran", transformed["fact_pengeluaran"])
        summary["Fakta_Pengeluaran"] = n
        print(f"    -> {n} baris")

        print("  Loading Fakta_BarangMasuk ...")
        n = _bulk_insert(conn, "Fakta_BarangMasuk", transformed["fact_barang_masuk"])
        summary["Fakta_BarangMasuk"] = n
        print(f"    -> {n} baris")

        print("  Loading Fakta_StokBarang ...")
        n = _bulk_insert(conn, "Fakta_StokBarang", transformed["fact_stok"])
        summary["Fakta_StokBarang"] = n
        print(f"    -> {n} baris")

    print("\n[LOAD] Selesai!")
    return summary


def verify_load(engine=None) -> None:
    """Verifikasi jumlah data yang berhasil di-load per tabel."""
    if engine is None:
        engine = get_engine()

    tables = [
        "Dim_Waktu", "Dim_Barang", "Dim_Supplier",
        "Dim_KategoriBiaya", "Dim_StatusTempo", "Dim_SumberFile",
        "Fakta_PenjualanHarian", "Fakta_Pengeluaran",
        "Fakta_BarangMasuk", "Fakta_StokBarang",
    ]

    print("\n[VERIFY] Jumlah data per tabel:")
    print(f"  {'Tabel':<30} {'Row Count':>10}")
    print("  " + "-" * 42)

    with engine.connect() as conn:
        for t in tables:
            try:
                result = conn.execute(text(f"SELECT COUNT(*) FROM `{t}`"))
                count = result.scalar()
                print(f"  {t:<30} {count:>10,}")
            except Exception as e:
                print(f"  {t:<30} ERROR: {str(e)[:40]}")


# ============================================================
# MAIN - untuk testing load saja
# ============================================================
if __name__ == "__main__":
    engine = get_engine()
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[OK] Koneksi MySQL berhasil!")
        verify_load(engine)
    except Exception as e:
        print(f"[ERROR] Koneksi gagal: {e}")
