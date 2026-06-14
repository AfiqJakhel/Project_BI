"""
ETL - Extract Module
====================
Membaca semua file Excel dari folder data/ dan mengembalikan
DataFrame mentah per jenis file (laporan, barang masuk, stok).

Struktur file yang didukung:
- Laporan Keuangan: 2022.xlsx, 2023.xlsx, 2024.xlsx, 2025.xlsx, 2026..xlsx
- Barang Masuk    : BARANG MASUK 2021.xlsx ... BARANG MASUK 2026.xlsx
- Stok            : STOK ARAW.xlsx
"""

import os
import pandas as pd
from pathlib import Path

# Direktori data
DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# Nama bulan valid yang diakui sebagai sheet data
BULAN_VALID = {
    "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
    "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
}

# Mapping nama bulan ke nomor
BULAN_MAP = {
    "JANUARI": 1, "FEBRUARI": 2, "MARET": 3, "APRIL": 4,
    "MEI": 5, "JUNI": 6, "JULI": 7, "AGUSTUS": 8,
    "SEPTEMBER": 9, "OKTOBER": 10, "NOVEMBER": 11, "DESEMBER": 12
}


def _find_header_row(df_raw: pd.DataFrame, keyword: str = "TGL") -> int:
    """
    Cari baris header dengan mencari keyword tertentu.
    Mengembalikan index baris header, atau -1 jika tidak ditemukan.
    """
    for i, row in df_raw.iterrows():
        for val in row:
            if isinstance(val, str) and keyword.upper() in val.upper():
                return i
    return -1


# ============================================================
# 1. EXTRACT LAPORAN KEUANGAN
# ============================================================

def extract_laporan_keuangan() -> list[dict]:
    """
    Membaca semua file laporan keuangan (2022–2026).
    Setiap sheet bulanan mengandung 2 tabel:
      - Tabel KIRI  : Penjualan Harian (TGL, NON TUNAI, TUNAI, BRUTO, BY. KELUAR, NETT, NET TUNAI)
      - Tabel KANAN : Pengeluaran (TGL, KETERANGAN, JUMLAH)

    Returns:
        List of dict dengan keys:
          - 'nama_file', 'tahun', 'sheet', 'bulan_no'
          - 'df_penjualan' : DataFrame penjualan harian mentah
          - 'df_pengeluaran': DataFrame pengeluaran mentah
    """
    laporan_files = sorted([
        f for f in os.listdir(DATA_DIR)
        if f.endswith(".xlsx") and not f.upper().startswith("BARANG") and not f.upper().startswith("STOK")
    ])

    results = []
    for filename in laporan_files:
        filepath = DATA_DIR / filename
        # Ekstrak tahun dari nama file
        tahun_str = "".join(filter(str.isdigit, filename))[:4]
        tahun = int(tahun_str) if tahun_str else None

        print(f"  [EXTRACT] Laporan: {filename} (tahun={tahun})")

        try:
            xl = pd.ExcelFile(filepath, engine="openpyxl")
        except Exception as e:
            print(f"    [ERROR] Gagal buka {filename}: {e}")
            continue

        for sheet in xl.sheet_names:
            if sheet.upper().strip() not in BULAN_VALID:
                continue

            bulan_no = BULAN_MAP.get(sheet.upper().strip(), 0)

            try:
                df_raw = pd.read_excel(xl, sheet_name=sheet, header=None)
            except Exception as e:
                print(f"    [ERROR] Sheet {sheet}: {e}")
                continue

            # Temukan baris header (cari "TGL")
            header_row = _find_header_row(df_raw, "TGL")
            if header_row < 0:
                print(f"    [SKIP] {sheet}: header TGL tidak ditemukan")
                continue

            # Baris header sebenarnya ada di 2 baris (merged header)
            # row header_row   : TGL | PEMASUKAN | _ | BRUTO | BY.KELUAR | NETT | NET TUNAI | _ | PENGELUARAN | _ | _
            # row header_row+1 : _   | NON TUNAI | TUNAI | _ | _ | _ | _ | _ | TGL | KETERANGAN | JUMLAH
            # Data mulai dari header_row + 2

            data_start = header_row + 2

            if data_start >= len(df_raw):
                continue

            df_data = df_raw.iloc[data_start:].reset_index(drop=True)

            # Deteksi jumlah kolom
            ncols = len(df_data.columns)

            # --- Tabel KIRI: Penjualan (kolom 0-6) ---
            # Col 0: TGL
            # Col 1: NON TUNAI
            # Col 2: TUNAI
            # Col 3: BRUTO
            # Col 4: BY. KELUAR HARIAN
            # Col 5: NETT
            # Col 6: NET TUNAI
            penjualan_cols = list(range(min(7, ncols)))
            df_penj = df_data.iloc[:, penjualan_cols].copy()
            df_penj.columns = ["tgl", "non_tunai", "tunai", "bruto",
                                "by_keluar_harian", "nett", "net_tunai"][:len(penjualan_cols)]

            # --- Tabel KANAN: Pengeluaran ---
            # Cek di header_row+1 di mana kolom KETERANGAN muncul
            header2 = df_raw.iloc[header_row + 1] if (header_row + 1) < len(df_raw) else None
            pengeluaran_offset = None
            if header2 is not None:
                for col_idx, val in enumerate(header2):
                    if isinstance(val, str) and "KETERANGAN" in val.upper():
                        # Kolom TGL pengeluaran = col_idx - 1
                        pengeluaran_offset = col_idx - 1
                        break

            df_peng = pd.DataFrame()
            if pengeluaran_offset is not None and pengeluaran_offset >= 0:
                peng_cols = list(range(pengeluaran_offset, min(pengeluaran_offset + 3, ncols)))
                if len(peng_cols) == 3:
                    df_peng = df_data.iloc[:, peng_cols].copy()
                    df_peng.columns = ["tgl_pengeluaran", "keterangan", "jumlah_pengeluaran"]

            results.append({
                "nama_file": filename,
                "tahun": tahun,
                "sheet": sheet.upper().strip(),
                "bulan_no": bulan_no,
                "df_penjualan": df_penj,
                "df_pengeluaran": df_peng,
            })

            print(f"    [OK] Sheet {sheet}: {len(df_penj)} baris penjualan, {len(df_peng)} baris pengeluaran")

    return results


# ============================================================
# 2. EXTRACT BARANG MASUK
# ============================================================

def extract_barang_masuk() -> list[dict]:
    """
    Membaca semua file BARANG MASUK (2021–2026).
    Setiap sheet berisi:
      - Tabel KIRI : Barang masuk dari supplier
        (TGL MASUK, NAMA BARANG, SUPLIER, QTY, SAT, HARGA/PCS/SET, JUMLAH, TOTAL FAKTUR, KET)
      - Tabel KANAN: Bon jatuh tempo (diabaikan, sudah ada di Dim_StatusTempo)

    Returns:
        List of dict dengan keys:
          - 'nama_file', 'tahun', 'sheet', 'bulan_no'
          - 'df_barang_masuk': DataFrame barang masuk mentah
    """
    bm_files = sorted([
        f for f in os.listdir(DATA_DIR)
        if f.upper().startswith("BARANG MASUK") and f.endswith(".xlsx")
    ])

    results = []
    for filename in bm_files:
        filepath = DATA_DIR / filename
        tahun_str = "".join(filter(str.isdigit, filename))[:4]
        tahun = int(tahun_str) if tahun_str else None

        print(f"  [EXTRACT] Barang Masuk: {filename} (tahun={tahun})")

        try:
            xl = pd.ExcelFile(filepath, engine="openpyxl")
        except Exception as e:
            print(f"    [ERROR] Gagal buka {filename}: {e}")
            continue

        for sheet in xl.sheet_names:
            if sheet.upper().strip() not in BULAN_VALID:
                continue

            bulan_no = BULAN_MAP.get(sheet.upper().strip(), 0)

            try:
                df_raw = pd.read_excel(xl, sheet_name=sheet, header=None)
            except Exception as e:
                print(f"    [ERROR] Sheet {sheet}: {e}")
                continue

            # Cari baris header (cari "NAMA BARANG" atau "TGL MASUK")
            header_row = _find_header_row(df_raw, "NAMA BARANG")
            if header_row < 0:
                header_row = _find_header_row(df_raw, "TGL MASUK")
            if header_row < 0:
                print(f"    [SKIP] {sheet}: header tidak ditemukan")
                continue

            data_start = header_row + 1
            df_data = df_raw.iloc[data_start:].reset_index(drop=True)
            ncols = len(df_data.columns)

            # Cari batas kolom kiri (sebelum bagian BON JATUH TEMPO)
            # Kolom barang masuk: TGL MASUK(0), NAMA BARANG(1), SUPLIER(2),
            #                     QTY(3), SAT(4), HARGA(5), JUMLAH(6), TOTAL FAKTUR(7), KET(8)
            # Kolom bon jatuh tempo mulai sekitar kolom 10-11
            bm_end_col = min(9, ncols)  # ambil maksimal 9 kolom kiri

            df_bm = df_data.iloc[:, :bm_end_col].copy()
            col_names = ["tgl_masuk", "nama_barang", "supplier",
                         "qty", "satuan", "harga_per_unit",
                         "jumlah", "total_faktur", "ket"]
            df_bm.columns = col_names[:bm_end_col]

            results.append({
                "nama_file": filename,
                "tahun": tahun,
                "sheet": sheet.upper().strip(),
                "bulan_no": bulan_no,
                "df_barang_masuk": df_bm,
            })

            print(f"    [OK] Sheet {sheet}: {len(df_bm)} baris barang masuk")

    return results


# ============================================================
# 3. EXTRACT STOK
# ============================================================

def extract_stok() -> dict:
    """
    Membaca file STOK ARAW.xlsx.
    Sheet 'OKE FINISH' berisi:
      NAMA BARANG | TANGGAL MASUK | _ | UNIT | KETERANGAN | SUPPLIER |
      QTY MASUK | SAT | MODAL | QYT KELUAR | JUMLAH (sisa)

    Returns:
        Dict dengan keys:
          - 'nama_file', 'sheet'
          - 'df_stok': DataFrame stok mentah
    """
    stok_file = DATA_DIR / "STOK ARAW.xlsx"
    if not stok_file.exists():
        print("  [WARNING] File STOK ARAW.xlsx tidak ditemukan!")
        return {}

    print(f"  [EXTRACT] Stok: STOK ARAW.xlsx")

    xl = pd.ExcelFile(stok_file, engine="openpyxl")
    sheet = xl.sheet_names[0]  # 'OKE FINISH'

    df_raw = pd.read_excel(xl, sheet_name=sheet, header=None)

    # Cari baris header
    header_row = _find_header_row(df_raw, "NAMA BARANG")
    if header_row < 0:
        header_row = _find_header_row(df_raw, "QTY MASUK")
    if header_row < 0:
        print("  [ERROR] Header stok tidak ditemukan")
        return {}

    data_start = header_row + 1
    df_data = df_raw.iloc[data_start:].reset_index(drop=True)
    ncols = len(df_data.columns)

    # Kolom: NAMA BARANG(0), TANGGAL MASUK(1), _(2), UNIT(3),
    #        KETERANGAN(4), SUPPLIER(5), QTY MASUK(6), SAT(7),
    #        MODAL(8), QYT KELUAR(9), JUMLAH(10)
    stok_cols = min(11, ncols)
    df_stok = df_data.iloc[:, :stok_cols].copy()
    col_names = ["nama_barang", "tanggal_masuk", "col2", "unit",
                 "keterangan", "supplier", "qty_masuk", "satuan",
                 "modal", "qty_keluar", "jumlah_sisa"]
    df_stok.columns = col_names[:stok_cols]

    print(f"    [OK] Sheet {sheet}: {len(df_stok)} baris stok")

    return {
        "nama_file": "STOK ARAW.xlsx",
        "sheet": sheet,
        "df_stok": df_stok,
    }


# ============================================================
# MAIN - untuk testing
# ============================================================
if __name__ == "__main__":
    print("=" * 60)
    print("TESTING EXTRACT MODULE")
    print("=" * 60)

    print("\n[1] LAPORAN KEUANGAN")
    laporan = extract_laporan_keuangan()
    print(f"  Total sheet berhasil: {len(laporan)}")

    print("\n[2] BARANG MASUK")
    bm = extract_barang_masuk()
    print(f"  Total sheet berhasil: {len(bm)}")

    print("\n[3] STOK ARAW")
    stok = extract_stok()
    if stok:
        print(f"  Total baris stok: {len(stok['df_stok'])}")
        print(stok["df_stok"].head(3).to_string())
