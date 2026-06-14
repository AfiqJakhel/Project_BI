"""
ETL - Transform Module
======================
Membersihkan dan mentransformasi DataFrame mentah hasil Extract
menjadi tabel-tabel siap masuk ke Data Mart (star schema).
"""

import os
import re
import csv
import pandas as pd
from datetime import date, datetime


# ============================================================
# HELPERS
# ============================================================

def clean_rupiah(val) -> float:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return 0.0
    s = str(val).strip()
    s = re.sub(r"[Rp\s]", "", s)          # hapus "Rp" dan spasi
    s = re.sub(r"\.", "", s)              # hapus titik ribuan
    s = s.replace(",", ".")               # ganti koma desimal
    try:
        return float(s)
    except ValueError:
        return 0.0


def clean_qty(val) -> float:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return 0.0
    try:
        return float(str(val).replace(",", ".").strip())
    except ValueError:
        return 0.0


def normalize_name(name: str) -> str:
    if not isinstance(name, str):
        return ""
    return re.sub(r"\s+", " ", name.strip().upper())


def parse_date(val) -> date | None:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None
    if isinstance(val, (datetime, pd.Timestamp)):
        return val.date()
    if isinstance(val, date):
        return val
    s = str(val).strip()
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d", "%d/%m/%y"):
        try:
            return datetime.strptime(s[:10], fmt).date()
        except ValueError:
            continue
    return None

MONTH_MAP = {
    "JAN": 1, "JANUARI": 1, "FEB": 2, "FEBRUARI": 2, "MAR": 3, "MARET": 3,
    "APR": 4, "APRIL": 4, "MEI": 5, "JUN": 6, "JUNI": 6, "JUL": 7, "JULI": 7,
    "AGU": 8, "AGUS": 8, "AGUSTUS": 8, "SEP": 9, "SEPT": 9, "SEPTEMBER": 9,
    "OKT": 10, "OKTOBER": 10, "NOV": 11, "NOVEMBER": 11, "DES": 12, "DESEMBER": 12
}

def normalize_transaction_date(raw_date, source_year, sheet_month, last_valid_date=None):
    if raw_date is None or (isinstance(raw_date, float) and pd.isna(raw_date)):
        return last_valid_date, {
            "is_corrected": False,
            "reason": "filled_from_previous_date" if last_valid_date else "missing_date"
        }

    is_corrected = False
    reason = None
    tgl = parse_date(raw_date)
    
    if tgl is None and isinstance(raw_date, str):
        s = raw_date.strip().upper()
        m = re.match(r"^(\d{1,2})[/.-](\d{1,2})$", s)
        if m:
            day, month = int(m.group(1)), int(m.group(2))
            try:
                tgl = date(source_year, month, day)
                is_corrected = True
                reason = "parsed_from_partial_string"
            except ValueError:
                pass
        else:
            for m_str, m_num in MONTH_MAP.items():
                if m_str in s:
                    nums = re.findall(r"\d+", s)
                    if nums:
                        day = int(nums[0])
                        try:
                            tgl = date(source_year, m_num, day)
                            is_corrected = True
                            reason = "parsed_from_partial_string"
                        except ValueError:
                            pass
                    break
                    
    if tgl is None:
        try:
            day = int(float(str(raw_date).strip()))
            tgl = date(source_year, sheet_month, day)
            is_corrected = True
            reason = "parsed_from_day_number"
        except (ValueError, TypeError):
            pass

    if tgl is None:
        return None, {
            "is_corrected": False,
            "reason": "invalid_date_format"
        }

    if sheet_month and tgl.month == sheet_month and source_year and tgl.year != source_year:
        try:
            tgl = tgl.replace(year=source_year)
            is_corrected = True
            reason = "year_corrected_from_source_file"
        except ValueError:
            pass
            
    if tgl.year < 2020 or tgl.year > 2026:
        if source_year and 2020 <= source_year <= 2026:
            try:
                tgl = tgl.replace(year=source_year)
                is_corrected = True
                reason = "year_forced_to_source_year"
            except ValueError:
                pass

    return tgl, {
        "is_corrected": is_corrected,
        "reason": reason
    }

def calculate_sales_measures(non_tunai, tunai, biaya_keluar_harian, bruto_raw=None, nett_raw=None, net_tunai_raw=None):
    non_tunai = non_tunai or 0.0
    tunai = tunai or 0.0
    biaya = biaya_keluar_harian or 0.0

    bruto_calc = non_tunai + tunai
    nett_calc = bruto_calc - biaya
    net_tunai_calc = tunai - biaya

    mismatch = {
        "bruto": bruto_raw is not None and abs(bruto_raw - bruto_calc) > 1,
        "nett": nett_raw is not None and abs(nett_raw - nett_calc) > 1,
        "net_tunai": net_tunai_raw is not None and abs(net_tunai_raw - net_tunai_calc) > 1,
    }

    return {
        "bruto": bruto_calc,
        "nett": nett_calc,
        "net_tunai": net_tunai_calc,
        "is_formula_mismatch": any(mismatch.values()),
        "formula_mismatch_fields": [k for k, v in mismatch.items() if v],
    }


def make_date_id(d: date) -> int:
    return int(d.strftime("%Y%m%d"))


NAMA_BULAN = {
    1: "Januari", 2: "Februari", 3: "Maret", 4: "April",
    5: "Mei", 6: "Juni", 7: "Juli", 8: "Agustus",
    9: "September", 10: "Oktober", 11: "November", 12: "Desember"
}

NAMA_HARI = {
    0: "Senin", 1: "Selasa", 2: "Rabu", 3: "Kamis",
    4: "Jumat", 5: "Sabtu", 6: "Minggu"
}


def build_dim_waktu_row(d: date) -> dict:
    return {
        "date_id": make_date_id(d),
        "tanggal": d,
        "hari": d.day,
        "nama_hari": NAMA_HARI[d.weekday()],
        "bulan": d.month,
        "nama_bulan": NAMA_BULAN[d.month],
        "tahun": d.year,
        "kuartal": (d.month - 1) // 3 + 1,
        "periode_laporan": f"{NAMA_BULAN[d.month]} {d.year}",
    }


def classify_kategori_biaya(keterangan: str) -> str:
    if not isinstance(keterangan, str):
        return "LAIN-LAIN"
    k = normalize_name(keterangan)
    
    # Specific keywords from top 50
    if re.search(r"(JAYA KREASI|JKI|OTOPROJEC|KACA FILM|KC\. FILM|KC FILM|ACCESSORIES|ACESSORIES|GREAT|HENDRIK|TJM|VICTORY GOLD|VG|WINCOS|MR BOSS|PRIMA INOVASINDO|SUKSES PERKASA|ALBANI|YAN FARIZON|OVI DIANA|FRANS SUGIHARJA)", k):
        return "PEMBAYARAN ACCESSORIES"
        
    if re.search(r"(TOKEN|LISTRIK|AIR|INTERNET)", k):
        return "UTILITAS"
        
    if re.search(r"(GIRO|BAYAR UANG|PELUNASAN MOTOR|MANDIRI|BCA|KUR|UTANG|HUTANG|PINJAMAN|CICILAN|ANGSURAN|BNI|BRI|BANK)", k):
        return "PINJAMAN & KREDIT"
        
    # Legacy ones
    if re.search(r"(LAMPU|AKSESORIS|ASESORIS|ACECORIES|SARUNG JOK|KARPET|AUDIO|ACC MOBIL|AKSESORI|JOK)", k):
        return "PEMBAYARAN ACCESSORIES"
    if any(x in k for x in ["GAJI", "THR", "BONUS"]):
        return "GAJI & TUNJANGAN"
    if any(x in k for x in ["SEWA", "KONTRAK", "TEMPAT"]):
        return "SEWA TEMPAT"
    if any(x in k for x in ["BELI", "BELANJA", "BAHAN"]):
        return "PEMBELIAN OPERASIONAL"
    if any(x in k for x in ["MAKAN", "MINUM", "KONSUMSI"]):
        return "KONSUMSI"
    if any(x in k for x in ["TRANSPORT", "BENSIN", "BBM", "PARKIR"]):
        return "TRANSPORTASI"
    if any(x in k for x in ["SERVICE", "SERVIS", "PERBAIKAN", "REPAIR", "BEROBAT", "BROBAT"]):
        return "PERBAIKAN & MAINTENANCE"
    return "LAIN-LAIN"


def parse_status_tempo(ket: str) -> dict:
    if not isinstance(ket, str) or not ket.strip():
        return {"status_bon": "TIDAK DIKETAHUI", "bulan_jatuh_tempo": None, "keterangan": None}
    k = ket.strip().upper()
    if "LUNAS" in k:
        return {"status_bon": "LUNAS", "bulan_jatuh_tempo": None, "keterangan": ket.strip()}
    if "GIRO" in k:
        return {"status_bon": "GIRO", "bulan_jatuh_tempo": None, "keterangan": ket.strip()}
    if "CASH" in k or "TUNAI" in k:
        return {"status_bon": "CASH", "bulan_jatuh_tempo": None, "keterangan": ket.strip()}
    bulan_list = ["JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
                  "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"]
    for b in bulan_list:
        if b in k:
            return {"status_bon": "JATUH TEMPO", "bulan_jatuh_tempo": b.capitalize(), "keterangan": ket.strip()}
    return {"status_bon": "LAINNYA", "bulan_jatuh_tempo": None, "keterangan": ket.strip()}


# ============================================================
# DIMENSION BUILDERS (incremental, pakai dict sebagai lookup)
# ============================================================

class DimWaktuBuilder:
    def __init__(self):
        self.data: dict[int, dict] = {}

    def add(self, d: date) -> int:
        did = make_date_id(d)
        if did not in self.data:
            self.data[did] = build_dim_waktu_row(d)
        return did

    def to_list(self) -> list[dict]:
        return list(self.data.values())


class DimLookupBuilder:
    def __init__(self):
        self.data: dict[str, dict] = {}
        self._counter = 1

    def get_or_create(self, key, extra: dict = None, display_name: str = None) -> int:
        if isinstance(key, tuple):
            k = tuple(normalize_name(str(x)) if x else "" for x in key)
            if not display_name:
                display_name = str(key[0]) if key[0] else ""
        else:
            k = normalize_name(str(key))
            if not display_name:
                display_name = str(key)

        if not k or (isinstance(k, tuple) and not any(k)):
            return None
            
        if k not in self.data:
            row = {"id": self._counter, "name": display_name}
            if extra:
                row.update(extra)
            self.data[k] = row
            self._counter += 1
        return self.data[k]["id"]

    def to_list(self) -> list[dict]:
        return list(self.data.values())


class DimSumberFileBuilder:
    def __init__(self):
        self.data: dict[tuple, dict] = {}
        self._counter = 1

    def get_or_create(self, nama_file: str, tahun: int, sheet: str, tipe: str) -> int:
        key = (nama_file, sheet or "")
        if key not in self.data:
            self.data[key] = {
                "source_id": self._counter,
                "nama_file": nama_file,
                "tahun_file": tahun,
                "sheet_bulan": sheet,
                "tipe_file": tipe,
            }
            self._counter += 1
        return self.data[key]["source_id"]

    def to_list(self) -> list[dict]:
        return list(self.data.values())


# ============================================================
# MAIN TRANSFORM
# ============================================================

def transform(
    raw_laporan: list[dict],
    raw_barang_masuk: list[dict],
    raw_stok: dict,
) -> dict:

    wb_waktu    = DimWaktuBuilder()
    wb_barang   = DimLookupBuilder()
    wb_supplier = DimLookupBuilder()
    wb_tempo    = DimLookupBuilder()
    wb_kategori = DimLookupBuilder()
    wb_source   = DimSumberFileBuilder()

    fact_penjualan:    list[dict] = []
    fact_pengeluaran:  list[dict] = []
    fact_bm:           list[dict] = []
    fact_stok:         list[dict] = []
    
    rejects = []
    date_corrections = []
    formula_mismatches = []
    
    stock_stats = {
        "total_qty_masuk_raw_including_total": 0.0,
        "total_qty_masuk_excluding_total": 0.0,
        "total_qty_keluar_raw_including_total": 0.0,
        "total_qty_keluar_excluding_total": 0.0,
        "total_qty_sisa_raw_including_total": 0.0,
        "total_qty_sisa_excluding_total": 0.0,
        "skipped_header_rows": 0,
        "skipped_total_rows": 0,
        "skipped_empty_rows": 0,
        "inserted_stock_rows": 0,
    }

    # ============================================================
    # A. TRANSFORM LAPORAN KEUANGAN
    # ============================================================
    for item in raw_laporan:
        source_id = wb_source.get_or_create(
            item["nama_file"], item["tahun"], item["sheet"], "LAPORAN"
        )
        source_year = item["tahun"]
        sheet_month = item["bulan_no"]

        # --- A1. Penjualan Harian ---
        df_p = item["df_penjualan"].copy()
        last_date: date | None = None

        for idx, row in df_p.iterrows():
            raw_date = row.get("tgl")
            tgl, date_info = normalize_transaction_date(raw_date, source_year, sheet_month, last_date)
            
            if tgl is not None:
                last_date = tgl

            if date_info["is_corrected"]:
                date_corrections.append({
                    "source_file": item["nama_file"],
                    "sheet_name": item["sheet"],
                    "raw_date": raw_date,
                    "normalized_date": tgl,
                    "source_year": source_year,
                    "sheet_month": sheet_month,
                    "reason": date_info["reason"]
                })

            bruto_raw = clean_rupiah(row.get("bruto"))
            ntt       = clean_rupiah(row.get("non_tunai"))
            tun       = clean_rupiah(row.get("tunai"))
            byk       = clean_rupiah(row.get("by_keluar_harian"))
            nett_raw  = clean_rupiah(row.get("nett"))
            nett_t_raw= clean_rupiah(row.get("net_tunai"))

            if bruto_raw == 0 and ntt == 0 and tun == 0 and byk == 0:
                continue

            if tgl is None:
                rejects.append({
                    "source_file": item["nama_file"],
                    "sheet_name": item["sheet"],
                    "type": "PENJUALAN",
                    "reason": "invalid_date_format",
                    "raw_data": str(row.to_dict())
                })
                continue

            if not (2020 <= tgl.year <= 2026):
                rejects.append({
                    "source_file": item["nama_file"],
                    "sheet_name": item["sheet"],
                    "type": "PENJUALAN",
                    "reason": "date_out_of_range",
                    "raw_data": str(row.to_dict()),
                    "date": str(tgl)
                })
                continue
                
            kpi_res = calculate_sales_measures(ntt, tun, byk, bruto_raw, nett_raw, nett_t_raw)
            if kpi_res["is_formula_mismatch"]:
                formula_mismatches.append({
                    "source_file": item["nama_file"],
                    "sheet_name": item["sheet"],
                    "date": str(tgl),
                    "fields": kpi_res["formula_mismatch_fields"],
                    "raw": {"bruto": bruto_raw, "nett": nett_raw, "net_tunai": nett_t_raw},
                    "calc": {"bruto": kpi_res["bruto"], "nett": kpi_res["nett"], "net_tunai": kpi_res["net_tunai"]}
                })

            date_id = wb_waktu.add(tgl)
            fact_penjualan.append({
                "date_id": date_id,
                "source_id": source_id,
                "pemasukan_non_tunai": ntt,
                "pemasukan_tunai": tun,
                "bruto": kpi_res["bruto"],
                "biaya_keluar_harian": byk,
                "nett": kpi_res["nett"],
                "net_tunai": kpi_res["net_tunai"],
            })

        # --- A2. Pengeluaran ---
        df_e = item["df_pengeluaran"]
        if df_e is None or len(df_e) == 0:
            continue
            
        last_date_e: date | None = None

        for _, row in df_e.iterrows():
            raw_date = row.get("tgl_pengeluaran")
            tgl, date_info = normalize_transaction_date(raw_date, source_year, sheet_month, last_date_e)
            if tgl is not None:
                last_date_e = tgl

            ket = str(row.get("keterangan", "")).strip()
            jml = clean_rupiah(row.get("jumlah_pengeluaran"))

            if jml == 0 or not ket or ket.upper() in ("NAN", ""):
                continue
                
            if re.match(r"^(TOTAL PENGELUARAN|PENGELUARAN BULANAN|PENGELUARAN HARIAN|PENDAPATAN KOTOR)", ket.upper()):
                continue
                
            if tgl is None:
                rejects.append({
                    "source_file": item["nama_file"],
                    "sheet_name": item["sheet"],
                    "type": "PENGELUARAN",
                    "reason": "invalid_date_format",
                    "raw_data": str(row.to_dict())
                })
                continue
                
            if not (2020 <= tgl.year <= 2026):
                rejects.append({
                    "source_file": item["nama_file"],
                    "sheet_name": item["sheet"],
                    "type": "PENGELUARAN",
                    "reason": "date_out_of_range",
                    "raw_data": str(row.to_dict()),
                    "date": str(tgl)
                })
                continue

            nama_kat = classify_kategori_biaya(ket)
            kat_id   = wb_kategori.get_or_create(nama_kat)

            date_id = wb_waktu.add(tgl)
            fact_pengeluaran.append({
                "date_id": date_id,
                "kategori_biaya_id": kat_id,
                "source_id": source_id,
                "keterangan": ket[:300],
                "jumlah_pengeluaran": jml,
            })

    # ============================================================
    # B. TRANSFORM BARANG MASUK
    # ============================================================
    for item in raw_barang_masuk:
        source_id = wb_source.get_or_create(
            item["nama_file"], item["tahun"], item["sheet"], "BARANG_MASUK"
        )
        source_year = item["tahun"]
        sheet_month = item["bulan_no"]

        df_bm = item["df_barang_masuk"].copy()
        last_date: date | None = None

        for _, row in df_bm.iterrows():
            raw_date = row.get("tgl_masuk")
            tgl, date_info = normalize_transaction_date(raw_date, source_year, sheet_month, last_date)
            if tgl is not None:
                last_date = tgl
                
            nama_barang = normalize_name(str(row.get("nama_barang", "")))
            supplier    = normalize_name(str(row.get("supplier", "")))
            qty         = clean_qty(row.get("qty"))
            satuan      = normalize_name(str(row.get("satuan", "")))
            harga       = clean_rupiah(row.get("harga_per_unit"))
            jumlah      = clean_rupiah(row.get("jumlah"))
            total_fak   = clean_rupiah(row.get("total_faktur"))
            ket         = str(row.get("ket", "")).strip()

            if not nama_barang or nama_barang in ("NAN", "NAMA BARANG", ""):
                continue
            if re.match(r"^(TOTAL|JUMLAH|SUBTOTAL)", nama_barang):
                continue

            if tgl is None:
                rejects.append({
                    "source_file": item["nama_file"],
                    "sheet_name": item["sheet"],
                    "type": "BARANG_MASUK",
                    "reason": "invalid_date_format",
                    "raw_data": str(row.to_dict())
                })
                continue
                
            if not (2020 <= tgl.year <= 2026):
                rejects.append({
                    "source_file": item["nama_file"],
                    "sheet_name": item["sheet"],
                    "type": "BARANG_MASUK",
                    "reason": "date_out_of_range",
                    "raw_data": str(row.to_dict()),
                    "date": str(tgl)
                })
                continue

            date_id  = wb_waktu.add(tgl)
            barang_id = wb_barang.get_or_create(
                nama_barang,
                {"satuan": satuan if satuan and satuan != "NAN" else None}
            )
            sup_id = wb_supplier.get_or_create(supplier) if supplier and supplier not in ("NAN", "") else None

            tempo_info = parse_status_tempo(ket)
            tempo_key  = tempo_info["status_bon"] + (tempo_info["bulan_jatuh_tempo"] or "")
            tempo_id   = wb_tempo.get_or_create(tempo_key, tempo_info)

            fact_bm.append({
                "date_id": date_id,
                "barang_id": barang_id,
                "supplier_id": sup_id,
                "status_tempo_id": tempo_id,
                "source_id": source_id,
                "qty": qty,
                "harga_per_unit": harga,
                "jumlah": jumlah,
                "total_faktur": total_fak,
                "jumlah_bon": 0.0,
            })

    # ============================================================
    # C. TRANSFORM STOK
    # ============================================================
    if raw_stok and "df_stok" in raw_stok:
        source_id = wb_source.get_or_create(
            raw_stok["nama_file"], None, raw_stok["sheet"], "STOK"
        )

        df_s = raw_stok["df_stok"].copy()
        stock_map = {}

        for _, row in df_s.iterrows():
            nama_barang_asli = str(row.get("nama_barang", ""))
            nama_barang = normalize_name(nama_barang_asli)
            
            qty_m = clean_qty(row.get("qty_masuk"))
            qty_k = clean_qty(row.get("qty_keluar"))
            qty_s = clean_qty(row.get("jumlah_sisa"))
            modal = clean_rupiah(row.get("modal"))
            
            stock_stats["total_qty_masuk_raw_including_total"] += qty_m
            stock_stats["total_qty_keluar_raw_including_total"] += qty_k
            stock_stats["total_qty_sisa_raw_including_total"] += qty_s
            
            if not nama_barang or nama_barang in ("NAN", ""):
                stock_stats["skipped_empty_rows"] += 1
                continue
                
            if re.match(r"^(TOTAL|JUMLAH|SUBTOTAL|NAMA BARANG|STOCK BARANG ARAW)", nama_barang):
                stock_stats["skipped_total_rows"] += 1
                continue

            unit_asli = str(row.get("unit", ""))
            satuan_asli = str(row.get("satuan", ""))
            unit = normalize_name(unit_asli)
            satuan = normalize_name(satuan_asli)

            stock_key = (nama_barang, unit, satuan)
            
            if stock_key not in stock_map:
                stock_map[stock_key] = {
                    "nama_barang_asli": nama_barang_asli,
                    "unit_asli": unit_asli,
                    "satuan_asli": satuan_asli,
                    "qty_m": 0.0,
                    "qty_k": 0.0,
                    "qty_s": 0.0,
                    "modal": 0.0
                }
                
            stock_map[stock_key]["qty_m"] += qty_m
            stock_map[stock_key]["qty_k"] += qty_k
            stock_map[stock_key]["qty_s"] += qty_s  
            
            # Use last valid modal
            if modal > 0:
                stock_map[stock_key]["modal"] = modal
            
            stock_stats["total_qty_masuk_excluding_total"] += qty_m
            stock_stats["total_qty_keluar_excluding_total"] += qty_k
            stock_stats["inserted_stock_rows"] += 1

        for stock_key, s_data in stock_map.items():
            nilai_modal_sisa = s_data["qty_s"] * s_data["modal"]
            
            barang_id = wb_barang.get_or_create(
                stock_key,
                extra={"model_kendaraan": s_data["unit_asli"] if s_data["unit_asli"] and s_data["unit_asli"].upper() != "NAN" else None,
                       "satuan": s_data["satuan_asli"] if s_data["satuan_asli"] and s_data["satuan_asli"].upper() != "NAN" else None},
                display_name=s_data["nama_barang_asli"]
            )

            fact_stok.append({
                "barang_id": barang_id,
                "source_id": source_id,
                "model_kendaraan": s_data["unit_asli"] if s_data["unit_asli"] and s_data["unit_asli"].upper() != "NAN" else None,
                "qty_masuk": s_data["qty_m"],
                "qty_keluar": s_data["qty_k"],
                "qty_sisa": s_data["qty_s"],
                "modal": s_data["modal"],
                "nilai_modal_sisa": nilai_modal_sisa,
            })
            
            stock_stats["total_qty_sisa_excluding_total"] += s_data["qty_s"]

    # ============================================================
    # WRITE REPORTS
    # ============================================================
    os.makedirs('reports', exist_ok=True)
    
    # Reject Report
    with open('reports/etl_reject_report.md', 'w', encoding='utf-8') as f:
        f.write("# ETL Reject Report\n\n")
        f.write(f"Total Rejects: {len(rejects)}\n\n")
        if rejects:
            for r in rejects:
                f.write(f"- **{r['type']}** | File: {r['source_file']} ({r['sheet_name']}) | Reason: {r['reason']}\n")
                f.write(f"  Raw: `{r['raw_data']}`\n\n")
                
    # Date Corrections
    with open('reports/date_correction_audit.csv', 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["Source File", "Sheet", "Raw Date", "Normalized Date", "Source Year", "Sheet Month", "Reason"])
        for d in date_corrections:
            writer.writerow([d["source_file"], d["sheet_name"], d["raw_date"], d["normalized_date"], d["source_year"], d["sheet_month"], d["reason"]])

    # Stock Audit CSV
    with open('reports/stock_audit_summary.csv', 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["Metric", "Value"])
        for k, v in stock_stats.items():
            writer.writerow([k, v])

    # ============================================================
    # COMPILE DIMENSION TABLES
    # ============================================================
    dim_barang_list = []
    for name, row in wb_barang.data.items():
        dim_barang_list.append({
            "barang_id": row["id"],
            "nama_barang": row["name"],
            "model_kendaraan": row.get("model_kendaraan"),
            "satuan": row.get("satuan"),
            "kategori_barang": None,
            "status_aktif": True,
        })

    dim_supplier_list = []
    for name, row in wb_supplier.data.items():
        dim_supplier_list.append({
            "supplier_id": row["id"],
            "nama_supplier": row["name"],
            "tipe_supplier": None,
            "status_aktif": True,
        })

    dim_tempo_list = []
    for name, row in wb_tempo.data.items():
        dim_tempo_list.append({
            "status_tempo_id": row["id"],
            "status_bon": row.get("status_bon"),
            "bulan_jatuh_tempo": row.get("bulan_jatuh_tempo"),
            "keterangan": row.get("keterangan"),
        })

    dim_kategori_list = []
    for name, row in wb_kategori.data.items():
        dim_kategori_list.append({
            "kategori_biaya_id": row["id"],
            "nama_kategori": row["name"],
            "keterangan_biaya": None,
        })

    return {
        "dim_waktu":         wb_waktu.to_list(),
        "dim_barang":        dim_barang_list,
        "dim_supplier":      dim_supplier_list,
        "dim_status_tempo":  dim_tempo_list,
        "dim_kategori_biaya":dim_kategori_list,
        "dim_sumber_file":   wb_source.to_list(),
        "fact_penjualan":    fact_penjualan,
        "fact_pengeluaran":  fact_pengeluaran,
        "fact_barang_masuk": fact_bm,
        "fact_stok":         fact_stok,
    }
