# INVENTORA
### PC & Laptop Warehouse Management System

INVENTORA merupakan aplikasi manajemen inventaris gudang berbasis web yang dirancang untuk membantu proses pengelolaan persediaan komponen komputer dan laptop secara terstruktur, terintegrasi, dan efisien.

Aplikasi ini menyediakan pengelolaan produk, kategori, supplier, *Purchase Order* (PO), transaksi barang masuk dan keluar, manajemen pengguna, serta pelaporan inventaris. INVENTORA juga menerapkan sistem **Role-Based Access Control (RBAC)** untuk membatasi akses pengguna berdasarkan tanggung jawab dan kewenangan masing-masing.

---

## 📌 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [User Roles & Permissions](#-user-roles--permissions)
5. [Application Workflow](#-application-workflow)
6. [Project Structure](#-project-structure)
7. [Installation & Setup](#-installation--setup)
8. [Running the Application](#-running-the-application)
9. [Database Configuration](#-database-configuration)
10. [Reporting & Export](#-reporting--export)
11. [Security](#-security)
12. [Future Development](#-future-development)
13. [License](#-license)

---

## 📖 Project Overview

INVENTORA dikembangkan sebagai solusi digital untuk pengelolaan operasional gudang yang berfokus pada penyimpanan dan distribusi komponen PC serta laptop.

Sistem ini membantu administrator, manajer gudang, dan staf gudang dalam mengelola data persediaan, memantau ketersediaan produk, melakukan pemesanan kepada supplier, serta mencatat setiap aktivitas barang masuk dan keluar.

Dengan memanfaatkan PostgreSQL sebagai sistem manajemen basis data, INVENTORA dirancang untuk menjaga konsistensi data dan mendukung pencatatan aktivitas operasional gudang.

### Project Objectives

- Mengoptimalkan pengelolaan persediaan produk dan komponen komputer.
- Mempermudah pemantauan stok barang secara terpusat.
- Mengelola proses pemesanan dan penerimaan barang dari supplier.
- Meningkatkan akurasi pencatatan transaksi barang masuk dan keluar.
- Menerapkan pembatasan akses berdasarkan peran pengguna.
- Menyediakan laporan inventaris dalam format Microsoft Excel.

---

## ✨ Key Features

### 1. Dashboard Management

Menyediakan halaman utama yang menjadi pusat informasi operasional gudang.

Fitur ini mencakup:
- Ringkasan informasi inventaris.
- Informasi ketersediaan stok produk.
- Pemantauan aktivitas transaksi.
- Informasi proses restock dan Purchase Order.
- Akses navigasi ke seluruh modul aplikasi.

### 2. Product Management

Digunakan untuk mengelola seluruh data produk dan komponen komputer yang tersimpan di gudang.

Fitur:
- Create, Read, Update, Delete (CRUD) produk.
- Pengelolaan SKU atau kode produk.
- Pengelolaan harga beli dan harga jual.
- Pengaturan jumlah stok.
- Penentuan batas minimum persediaan (*minimum stock*).
- Identifikasi produk dengan stok rendah (*low stock*).
- Pengaturan lokasi rak penyimpanan.
- Unggah dan pengelolaan gambar produk.

### 3. Category Management

Mengelola pengelompokan produk berdasarkan jenis atau kategori komponen.

Fitur:
- Penambahan kategori produk.
- Pengubahan informasi kategori.
- Penghapusan kategori.
- Pengelolaan gambar kategori.
- Pengorganisasian produk berdasarkan kategori.

### 4. Supplier Management

Menyediakan pengelolaan data supplier sebagai pihak penyedia produk dan komponen komputer.

Fitur:
- Pengelolaan data supplier.
- Pemantauan informasi supplier.
- Integrasi supplier dengan proses restock dan Purchase Order.

### 5. Restock & Purchase Order Management

Mengelola proses pengadaan barang dari supplier hingga barang diterima oleh gudang.

Fitur:
- Pembuatan Purchase Order.
- Pemilihan supplier.
- Pemantauan status pemesanan.
- Pemeriksaan kedatangan barang.
- Unggah foto dokumentasi penerimaan barang.
- Pengajuan refund apabila terdapat permasalahan pesanan.
- Pengajuan pemesanan ulang (*reorder*).

### 6. Inventory Transactions

Mengelola seluruh aktivitas pergerakan persediaan barang melalui dua jenis transaksi utama.

**Incoming Transaction (IN)**

Digunakan untuk mencatat barang yang masuk ke gudang, termasuk penerimaan barang dari supplier berdasarkan Purchase Order.

**Outgoing Transaction (OUT)**

Digunakan untuk mencatat pengajuan pengeluaran barang kepada pelanggan atau divisi tujuan.

Fitur:
- Pencatatan transaksi barang masuk.
- Pengajuan transaksi barang keluar.
- Validasi ketersediaan stok.
- Persetujuan transaksi oleh warehouse manager.
- Pemantauan status pengiriman.
- Pembaruan data persediaan berdasarkan transaksi.

### 7. Staff & Account Management

Mengelola akun internal yang memiliki akses terhadap sistem INVENTORA.

Fitur:
- Penambahan akun pengguna.
- Pengelolaan informasi pengguna.
- Pengaturan status akun.
- Penonaktifan akun menggunakan status `Terminated`.
- Pengaktifan kembali akun.
- Mempertahankan riwayat aktivitas transaksi dan Purchase Order pengguna.

### 8. Notification Management

Mendukung penyampaian informasi terkait aktivitas operasional gudang melalui sistem notifikasi.

Informasi yang berkaitan dengan proses operasional dapat membantu pengguna memantau aktivitas dan perubahan status dalam sistem.

### 9. Excel Report Export

Menyediakan fasilitas ekspor data operasional ke dalam format Microsoft Excel (`.xlsx`).

Jenis laporan:
- Laporan persediaan produk.
- Laporan transaksi barang masuk dan keluar.
- Laporan Restock dan Purchase Order.

Format laporan dilengkapi dengan:
- Judul laporan.
- Format tabel terstruktur.
- Pewarnaan berdasarkan status.
- Pengaturan *wrap text*.
- Fitur *auto filter*.

---

## 🛠 Technology Stack

INVENTORA dibangun menggunakan beberapa teknologi utama berikut:

| Technology | Description |
|---|---|
| Next.js | Framework aplikasi berbasis React menggunakan App Router |
| React.js | Library untuk membangun antarmuka pengguna |
| JavaScript | Bahasa pemrograman utama aplikasi |
| PostgreSQL | Sistem manajemen basis data relasional |
| Tailwind CSS | Framework styling antarmuka |
| Lucide React | Library ikon antarmuka |
| ExcelJS | Pembuatan dan ekspor laporan Excel |
| Server Actions | Pemrosesan operasi server pada Next.js |
| Session Cookie | Pengelolaan sesi autentikasi pengguna |

---

## 👥 User Roles & Permissions

INVENTORA menerapkan konsep *Role-Based Access Control* (RBAC) untuk mengatur hak akses pengguna.

### 1. Admin

Administrator memiliki kewenangan dalam pengelolaan akun internal dan pengaturan akses pengguna.

### 2. Warehouse Manager

Warehouse Manager bertanggung jawab terhadap pengawasan aktivitas gudang, termasuk proses persetujuan transaksi barang keluar.

### 3. Staff Gudang

Staff Gudang bertanggung jawab terhadap aktivitas operasional inventaris, termasuk pengelolaan persediaan dan proses transaksi sesuai kewenangan yang diberikan sistem.

### 4. Supplier

Supplier berperan sebagai mitra penyedia komponen komputer dan laptop yang terlibat dalam proses pengadaan barang. Supplier menjadi pihak yang menerima dan menindaklanjuti Purchase Order dari gudang hingga proses pemenuhan pesanan.

---

## 🔄 Application Workflow

INVENTORA memiliki beberapa alur operasional utama.

### Incoming Goods Workflow

1. Barang dipesan melalui proses Purchase Order.
2. Supplier memproses pesanan.
3. Barang tiba di gudang.
4. Petugas melakukan pemeriksaan barang.
5. Dokumentasi penerimaan dapat diunggah ke sistem.
6. Transaksi barang masuk diproses.
7. Data persediaan diperbarui sesuai hasil penerimaan.

### Outgoing Goods Workflow

1. Pengguna mengajukan permintaan barang keluar.
2. Sistem melakukan validasi ketersediaan stok.
3. Warehouse Manager melakukan pemeriksaan dan persetujuan.
4. Barang diproses untuk pengiriman.
5. Status pengiriman diperbarui.
6. Riwayat transaksi tersimpan dalam sistem.

### Restock Workflow

1. Pengguna membuat pengajuan restock.
2. Supplier dipilih berdasarkan kebutuhan pengadaan.
3. Purchase Order dibuat.
4. Status pesanan dipantau.
5. Barang diterima dan diperiksa.
6. Proses penerimaan diselesaikan atau ditindaklanjuti melalui pengajuan refund maupun reorder apabila diperlukan.

---

## 📁 Project Structure

Berikut merupakan struktur direktori utama proyek INVENTORA.

```text
inventora/
│
├── database/
│   └── schema.sql
│
├── public/
│   └── uploads/
│       ├── categories/
│       ├── products/
│       └── restocks/
│
├── src/
│   ├── actions/
│   │
│   ├── app/
│   │   ├── (auth)/
│   │   ├── api/
│   │   │   ├── export/
│   │   │   └── upload/
│   │   │
│   │   └── dashboard/
│   │       ├── categories/
│   │       ├── products/
│   │       ├── profile/
│   │       ├── restocks/
│   │       ├── staff/
│   │       ├── suppliers/
│   │       └── transactions/
│   │
│   ├── components/
│   │   ├── categories/
│   │   ├── layout/
│   │   ├── products/
│   │   ├── profile/
│   │   ├── restocks/
│   │   ├── staff/
│   │   ├── suppliers/
│   │   ├── theme/
│   │   ├── transactions/
│   │   └── ui/
│   │
│   └── lib/
│
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── jsconfig.json
├── next.config.mjs
├── package.json
├── package-lock.json
└── README.md
```

**Directory Description**

| Directory | Description |
|---|---|
| `database/` | Berisi skema basis data PostgreSQL |
| `public/uploads/` | Penyimpanan gambar dan dokumentasi |
| `src/actions/` | Server Actions untuk pemrosesan data |
| `src/app/` | Halaman aplikasi dan API routes |
| `src/components/` | Komponen antarmuka pengguna |
| `src/lib/` | Helper, koneksi database, dan autentikasi |

---

## ⚙️ Installation & Setup

Pastikan perangkat telah memiliki perangkat lunak berikut:

- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
```

Masuk ke direktori proyek:

```bash
cd inventora
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Buat file `.env.local` pada direktori utama proyek.

Sesuaikan konfigurasi environment dengan kebutuhan aplikasi.

Contoh konfigurasi:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/inventra_db"

JWT_SECRET="your_jwt_secret_key"
```

**Note:**
- Sesuaikan `username`, `password`, dan konfigurasi koneksi PostgreSQL dengan lingkungan pengembangan masing-masing.
- `JWT_SECRET` digunakan sebagai secret key untuk kebutuhan verifikasi token autentikasi.
- Gunakan secret key yang kuat dan jangan membagikan file `.env.local` ke repositori publik.
- Pastikan nama variabel environment sesuai dengan yang digunakan dalam kode sumber aplikasi.

### 4. Database Setup

Pastikan PostgreSQL telah berjalan.

Buat database dengan nama:

```sql
CREATE DATABASE inventra_db;
```

Kemudian jalankan skema SQL yang tersedia pada:

```text
database/schema.sql
```

Pastikan seluruh tabel, relasi, dan constraint berhasil dibuat sebelum menjalankan aplikasi.

---

## 🚀 Running the Application

Jalankan server pengembangan menggunakan perintah:

```bash
npm run dev
```

Setelah server berhasil berjalan, buka browser dan akses:

```text
http://localhost:3000
```

Untuk menjalankan aplikasi dalam mode produksi:

```bash
npm run build
```

Kemudian:

```bash
npm run start
```

---

## 🗄 Database Configuration

INVENTORA menggunakan PostgreSQL sebagai sistem penyimpanan data utama.

Nama database yang digunakan:

```text
inventra_db
```

Skema database didefinisikan dalam file:

```text
database/schema.sql
```

Database digunakan untuk menyimpan informasi terkait:

- Data pengguna dan autentikasi.
- Produk dan kategori.
- Supplier.
- Persediaan barang.
- Purchase Order dan restock.
- Transaksi barang masuk dan keluar.
- Status dan riwayat aktivitas operasional.

Pengelolaan data dilakukan melalui mekanisme pemrosesan server pada aplikasi Next.js.

---

## 📊 Reporting & Export

Fitur pelaporan INVENTORA menggunakan library **ExcelJS** untuk menghasilkan dokumen Excel dengan format tabel yang terstruktur.

Laporan dirancang agar mempermudah proses pemantauan dan evaluasi aktivitas gudang.

Format keluaran:

```text
.xlsx
```

Jenis laporan meliputi:

1. Product Inventory Report.
2. Incoming & Outgoing Transaction Report.
3. Restock & Purchase Order Report.

---

## 🔐 Security

Keamanan aplikasi menjadi salah satu aspek penting dalam pengelolaan data inventaris.

INVENTORA menggunakan beberapa mekanisme keamanan, antara lain:

- Session Cookie untuk pengelolaan sesi pengguna.
- Verifikasi token melalui `verifySessionToken`.
- Penggunaan `JWT_SECRET` untuk kebutuhan verifikasi token.
- Pembatasan akses berdasarkan role pengguna.
- Validasi data pada proses pengolahan informasi.
- Pengelolaan status akun tanpa menghilangkan riwayat aktivitas.
- Pemisahan proses server dan antarmuka pengguna.

---

## 🔮 Future Development

Pengembangan INVENTORA dapat diarahkan pada peningkatan kapabilitas sistem melalui beberapa pengembangan berikut:

- Dashboard analitik inventaris yang lebih komprehensif.
- Grafik pergerakan stok berdasarkan periode.
- Riwayat perubahan stok secara terperinci.
- Sistem audit aktivitas pengguna.
- Peningkatan sistem notifikasi.
- Pengembangan laporan analitik.
- Optimalisasi responsivitas antarmuka.
- Peningkatan mekanisme keamanan dan validasi data.

---

## 📄 License

Proyek INVENTORA dikembangkan sebagai aplikasi manajemen inventaris gudang PC dan laptop.

Informasi lisensi dan ketentuan penggunaan dapat disesuaikan dengan kebijakan pemilik proyek.

---

**INVENTORA — Smart Inventory Management for PC & Laptop Warehouse.**

*Organize Inventory. Monitor Stock. Manage Operations.*