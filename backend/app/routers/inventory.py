from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.schemas.inventory import (
    InventoryKPIResponse, InventoryKategoriResponse, KategoriItem,
    InventoryAlertResponse, AlertItem, InventoryAnalysisResponse, ScatterItem, MutasiItem
)

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])

# [FIX 2] Konstanta threshold stok
STOK_MINIMUM_THRESHOLD = 10   # batas "hampir habis"
STOK_HABIS_THRESHOLD = 0      # batas "out of stock"

@router.get("/kpi", response_model=InventoryKPIResponse)
def get_inventory_kpi(db: Session = Depends(get_db)):
    # [FIX 3] Gabung 4 query menjadi 1 query atomik
    sql = """
        SELECT
            COUNT(DISTINCT b.barang_id) AS total_sku_aktif,
            SUM(fs.nilai_modal_sisa) AS total_nilai_inventori,
            SUM(CASE WHEN fs.qty_sisa <= 0 THEN 1 ELSE 0 END) AS out_of_stock,
            SUM(CASE WHEN fs.qty_sisa > 0 AND fs.qty_sisa <= :threshold THEN 1 ELSE 0 END) AS hampir_habis
        FROM dim_barang b
        JOIN fakta_stokbarang fs ON b.barang_id = fs.barang_id
        WHERE b.status_aktif = 1
    """
    result = db.execute(text(sql), {"threshold": STOK_MINIMUM_THRESHOLD}).mappings().first()
    
    return InventoryKPIResponse(
        total_sku_aktif=result["total_sku_aktif"] or 0,
        total_nilai_inventori=float(result["total_nilai_inventori"] or 0.0),
        produk_hampir_habis=result["hampir_habis"] or 0,
        produk_out_of_stock=result["out_of_stock"] or 0
    )

@router.get("/kategori", response_model=InventoryKategoriResponse)
def get_inventory_kategori(db: Session = Depends(get_db)):
    sql = """
        SELECT 
            COALESCE(b.kategori_barang, SUBSTRING_INDEX(b.nama_barang, ' ', 1)) as kategori,
            COUNT(DISTINCT b.barang_id) as jumlah_sku,
            SUM(fs.nilai_modal_sisa) as nilai_inventori
        FROM dim_barang b
        LEFT JOIN fakta_stokbarang fs ON b.barang_id = fs.barang_id
        WHERE b.status_aktif = 1
        GROUP BY COALESCE(b.kategori_barang, SUBSTRING_INDEX(b.nama_barang, ' ', 1))
    """
    result = db.execute(text(sql)).mappings().fetchall()
    data = [
        KategoriItem(
            kategori=row["kategori"] if row["kategori"] else "Lain-lain",
            jumlah_sku=row["jumlah_sku"] or 0,
            nilai_inventori=float(row["nilai_inventori"] or 0)
        ) for row in result
    ]
    return InventoryKategoriResponse(data=data)

@router.get("/alert", response_model=InventoryAlertResponse)
def get_inventory_alert(limit: int = Query(100), db: Session = Depends(get_db)):
    sql = """
        SELECT 
            b.barang_id as id,
            b.nama_barang as nama_produk,
            COALESCE(b.kategori_barang, SUBSTRING_INDEX(b.nama_barang, ' ', 1)) as kategori,
            COALESCE(fs.qty_sisa, 0) as stok_tersedia
        FROM dim_barang b
        JOIN fakta_stokbarang fs ON b.barang_id = fs.barang_id
        WHERE b.status_aktif = 1 AND fs.qty_sisa <= :threshold
        ORDER BY fs.qty_sisa ASC
        LIMIT :limit
    """
    result = db.execute(text(sql), {"limit": limit, "threshold": STOK_MINIMUM_THRESHOLD}).mappings().fetchall()
    data = []
    for row in result:
        qty = float(row["stok_tersedia"])
        status = "out_of_stock" if qty <= STOK_HABIS_THRESHOLD else "hampir_habis"
        data.append(AlertItem(
            id=str(row["id"]),
            nama_produk=row["nama_produk"],
            kategori=row["kategori"],
            stok_tersedia=int(qty),
            stok_minimum=STOK_MINIMUM_THRESHOLD,
            status=status
        ))
    return InventoryAlertResponse(data=data)

@router.get("/analysis", response_model=InventoryAnalysisResponse)
def get_inventory_analysis(period: str = Query("bulanan"), db: Session = Depends(get_db)):
    sql_scatter = """
        SELECT 
            b.nama_barang as nama,
            COALESCE(fs.qty_sisa, 0) as stok,
            COALESCE(fs.qty_keluar, 0) as laju_jual,
            COALESCE(b.kategori_barang, SUBSTRING_INDEX(b.nama_barang, ' ', 1)) as kategori
        FROM dim_barang b
        JOIN fakta_stokbarang fs ON b.barang_id = fs.barang_id
        WHERE b.status_aktif = 1 AND (fs.qty_sisa > 0 OR fs.qty_keluar > 0)
        # [FIX 1] Tambahkan ORDER BY dan LIMIT 200
        ORDER BY (fs.qty_keluar + fs.qty_sisa) DESC
        LIMIT 200
    """
    res_scatter = db.execute(text(sql_scatter)).mappings().fetchall()
    scatter_data = [
        ScatterItem(
            nama=r["nama"],
            stok=int(r["stok"]),
            laju_jual=float(r["laju_jual"]),
            kategori=r["kategori"]
        ) for r in res_scatter
    ]

    if period == "tahunan":
        sql_mutasi = """
            WITH periods AS (
                SELECT DISTINCT w.tahun as label_tahun
                FROM dim_waktu w
                ORDER BY w.tahun DESC
                LIMIT 5
            ),
            masuk AS (
                SELECT w.tahun, SUM(bm.qty) as qty_masuk, SUM(bm.jumlah) as nilai_masuk
                FROM fakta_barangmasuk bm
                JOIN dim_waktu w ON bm.date_id = w.date_id
                GROUP BY w.tahun
            ),
            keluar AS (
                SELECT w.tahun, SUM(td.qty) as qty_keluar
                FROM fakta_transaksidetail td
                JOIN fakta_transaksi t ON td.transaksi_id = t.transaksi_id
                JOIN dim_waktu w ON t.date_id = w.date_id
                GROUP BY w.tahun
            )
            SELECT 
                p.label_tahun as label,
                COALESCE(masuk.qty_masuk, 0) as qty_masuk, 
                COALESCE(masuk.nilai_masuk, 0) as nilai_masuk,
                COALESCE(keluar.qty_keluar, 0) as qty_keluar
            FROM periods p
            LEFT JOIN masuk ON p.label_tahun = masuk.tahun
            LEFT JOIN keluar ON p.label_tahun = keluar.tahun
            ORDER BY p.label_tahun ASC
        """
    else:
        sql_mutasi = """
            WITH periods AS (
                SELECT DISTINCT w.bulan, w.nama_bulan, w.tahun
                FROM dim_waktu w
                ORDER BY w.tahun DESC, w.bulan DESC
                LIMIT 6
            ),
            masuk AS (
                SELECT w.bulan, w.tahun, SUM(bm.qty) as qty_masuk, SUM(bm.jumlah) as nilai_masuk
                FROM fakta_barangmasuk bm
                JOIN dim_waktu w ON bm.date_id = w.date_id
                GROUP BY w.bulan, w.tahun
            ),
            keluar AS (
                SELECT w.bulan, w.tahun, SUM(td.qty) as qty_keluar
                FROM fakta_transaksidetail td
                JOIN fakta_transaksi t ON td.transaksi_id = t.transaksi_id
                JOIN dim_waktu w ON t.date_id = w.date_id
                GROUP BY w.bulan, w.tahun
            )
            SELECT 
                p.nama_bulan as label, p.tahun, 
                COALESCE(masuk.qty_masuk, 0) as qty_masuk, 
                COALESCE(masuk.nilai_masuk, 0) as nilai_masuk,
                COALESCE(keluar.qty_keluar, 0) as qty_keluar
            FROM periods p
            LEFT JOIN masuk ON p.bulan = masuk.bulan AND p.tahun = masuk.tahun
            LEFT JOIN keluar ON p.bulan = keluar.bulan AND p.tahun = keluar.tahun
            ORDER BY p.tahun ASC, p.bulan ASC
        """

    try:
        res_mutasi = db.execute(text(sql_mutasi)).mappings().fetchall()
        mutasi_data = []
        for r in res_mutasi:
            label_val = str(r["label"])[:3] if period == "bulanan" else str(r["label"])
            mutasi_data.append(MutasiItem(
                bulan=label_val,
                stok_masuk=float(r["qty_masuk"]),
                stok_keluar=float(r["qty_keluar"]),
                nilai_masuk=float(r["nilai_masuk"])
            ))
    except Exception:
        mutasi_data = []

    if not mutasi_data:
        mutasi_data = [MutasiItem(bulan="Jan", stok_masuk=0, stok_keluar=0, nilai_masuk=0)]

    return InventoryAnalysisResponse(scatter_data=scatter_data, mutasi_data=mutasi_data)
