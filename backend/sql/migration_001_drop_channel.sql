-- Migration 001: Drop Dim_Channel (Defensive)
-- Script ini dirancang agar tidak error jika FK/tabel tidak ada.

-- Catatan:
-- Karena penamaan constraint foreign key tidak ditentukan secara eksplisit saat 
-- channel_id dihubungkan sebelumnya (atau karena channel_id tidak ada di file create_tables.sql saat ini),
-- maka script ini mencoba melakukan pengecekan FK secara manual jika dibutuhkan.

-- Jika di masa lalu Anda pernah membuat channel_id dan fk_penjualan_channel, eksekusi line berikut:
-- ALTER TABLE Fakta_PenjualanHarian DROP FOREIGN KEY fk_penjualan_channel;
-- ALTER TABLE Fakta_PenjualanHarian DROP COLUMN channel_id;

-- Drop Dim_Channel tabel
DROP TABLE IF EXISTS Dim_Channel;
