export interface KPIData {
  total_revenue: number;
  total_transaksi: number;
  avg_order_value: number;
  gross_margin_pct: number;
  active_customers: number;
  top_product: { nama: string; qty: number };
  period_label: string;
  revenue_change_pct: number;
  transaksi_change_pct: number;
}

export interface PenjualanData {
  tanggal: string;
  revenue: number;
  transaksi: number;
  target?: number;
}

export interface ProdukData {
  id: string;
  nama: string;
  sku: string;
  kategori: string;
  stok: number;
  harga: number;
  qty_sold: number;
  revenue: number;
}

export interface PelangganData {
  id: string;
  nama: string;
  no_hp: string;
  total_order: number;
  total_spend: number;
  last_purchase: string;
  segment: "regular" | "vip";
}

export interface TopProdukData {
  id: string;
  nama: string;
  qty_sold: number;
  revenue: number;
}
