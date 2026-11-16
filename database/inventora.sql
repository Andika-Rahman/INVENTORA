DROP TABLE IF EXISTS transaction_items CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS restock_order_items CASCADE;
DROP TABLE IF EXISTS restock_orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('admin', 'warehouse_manager', 'staff_gudang', 'supplier')),
    status VARCHAR(20) NOT NULL DEFAULT 'Approved' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    company_name VARCHAR(150),
    phone VARCHAR(30),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    purchase_price NUMERIC(15, 2) NOT NULL CHECK (purchase_price >= 0),
    selling_price NUMERIC(15, 2) NOT NULL CHECK (selling_price >= 0),
    min_stock INTEGER NOT NULL CHECK (min_stock >= 0),
    low_stock INTEGER NOT NULL CHECK (low_stock > min_stock),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    unit VARCHAR(30) NOT NULL DEFAULT 'pcs',
    rack_location VARCHAR(50) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE restock_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE NOT NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Rejected', 'In Transit', 'Received')),
    status_notes TEXT,
    supplier_rating INTEGER CHECK (supplier_rating BETWEEN 1 AND 5),
    supplier_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE restock_order_items (
    id SERIAL PRIMARY KEY,
    restock_order_id INTEGER NOT NULL REFERENCES restock_orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('IN', 'OUT')),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    restock_order_id INTEGER REFERENCES restock_orders(id) ON DELETE RESTRICT,
    supplier_id INTEGER REFERENCES users(id) ON DELETE RESTRICT,
    customer_name VARCHAR(150),
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Shipped')),
    rejection_reason TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_unique_active_po_transaction
ON transactions (restock_order_id)
WHERE restock_order_id IS NOT NULL AND status <> 'Rejected';

CREATE TABLE transaction_items (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);


INSERT INTO users (name, email, password, role, status, company_name, phone, address) VALUES
('Andika Rahman (Admin)', 'admin@inventora.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Approved', 'INVENTORA Warehouse HQ', '081234567801', 'Jl. Perintis Kemerdekaan KM 10, Makassar'),
('Budi Santoso (Manager)', 'manager@inventora.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'warehouse_manager', 'Approved', 'INVENTORA Warehouse HQ', '081234567802', 'Jl. Perintis Kemerdekaan KM 10, Makassar'),
('Citra Lestari (Staff)', 'staff@inventora.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff_gudang', 'Approved', 'INVENTORA Warehouse HQ', '081234567803', 'Jl. Perintis Kemerdekaan KM 10, Makassar'),
('PT Nusantara Silikon', 'supplier.silikon@inventora.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'supplier', 'Approved', 'PT Nusantara Silikon Indonesia', '0215550192', 'Kawasan Industri Jababeka, Cikarang'),
('CV Mega Part Laptop', 'supplier.laptop@inventora.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'supplier', 'Pending', 'CV Mega Part Laptop Jaya', '0215550884', 'Mangga Dua Mall Lt. 3, Jakarta Pusat');

INSERT INTO categories (name, description, image_url) VALUES
('Processor & Motherboard', 'CPU desktop Intel/AMD serta motherboard berbagai chipset', '/uploads/categories/cpu-mobo.png'),
('Memory (RAM)', 'Modul RAM DDR4 dan DDR5 untuk PC desktop maupun SODIMM laptop', '/uploads/categories/ram.png'),
('Storage (SSD & NVMe)', 'Penyimpanan internal SSD SATA, M.2 NVMe Gen4, dan HDD', '/uploads/categories/storage.png'),
('Graphics Card (GPU)', 'Kartu grafis diskrit untuk workstation, gaming, dan rendering', '/uploads/categories/gpu.png'),
('Laptop Replacement Parts', 'Baterai internal, layar LCD/IPS, keyboard, dan adaptor laptop', '/uploads/categories/laptop-parts.png'),
('Cooling & Power Supply', 'PSU modular, thermal paste, heatsink, dan kipas casing/laptop', '/uploads/categories/cooling-psu.png');

INSERT INTO products (sku, name, category_id, description, purchase_price, selling_price, min_stock, low_stock, stock, unit, rack_location, image_url) VALUES
('CPU-INT-14700K', 'Intel Core i7-14700K Box LGA1700', 1, 'Processor 20-Core (8P+12E) hingga 5.6 GHz untuk workstation & gaming', 5800000, 6450000, 3, 8, 15, 'pcs', 'RAK-A1-01', '/uploads/products/i7-14700k.png'),
('RAM-DDR5-16G56', 'Corsair Vengeance 16GB (1x16GB) DDR5 5600MHz', 2, 'Modul memori desktop DDR5 UDIMM heatsink hitam', 720000, 865000, 5, 12, 10, 'pcs', 'RAK-B1-04', '/uploads/products/ram-ddr5.png'),
('SSD-NVME-1TB990', 'Samsung 990 PRO 1TB PCIe 4.0 NVMe M.2', 3, 'SSD NVMe kecepatan baca hingga 7450 MB/s untuk PC dan laptop', 1350000, 1590000, 4, 10, 3, 'pcs', 'RAK-B2-02', '/uploads/products/ssd-990pro.png'),
('GPU-RTX-4060TI', 'ASUS Dual GeForce RTX 4060 Ti OC 8GB GDDR6', 4, 'Kartu grafis dual-fan PCIe 4.0 HDMI 2.1a & DisplayPort 1.4a', 6100000, 6750000, 2, 5, 0, 'unit', 'RAK-C1-01', '/uploads/products/rtx-4060ti.png'),
('LPT-BAT-LOQ15', 'Baterai Original Lenovo LOQ 15IRX9 / 15APH8 60Wh', 5, 'Baterai pengganti internal 4-cell Li-Polymer 15.44V 60Wh', 680000, 850000, 3, 7, 6, 'pcs', 'RAK-D1-03', '/uploads/products/bat-loq15.png'),
('LPT-LCD-156FHD', 'Panel Layar Laptop 15.6 Inch FHD IPS 144Hz 40-Pin', 5, 'Layar pengganti slim matte IPS 1920x1080 sRGB 100%', 950000, 1180000, 2, 6, 9, 'pcs', 'RAK-D2-01', '/uploads/products/lcd-156.png'),
('CLG-THM-MX6', 'Arctic MX-6 Thermal Paste 4g High Performance', 6, 'Pasta termal non-konduktif untuk CPU, GPU, dan chipset laptop', 95000, 135000, 10, 25, 42, 'tube', 'RAK-E1-02', '/uploads/products/mx6.png');

INSERT INTO restock_orders (po_number, supplier_id, created_by, order_date, expected_delivery_date, notes, status) VALUES
('PO-202611-0001', 4, 2, '2026-11-14', '2026-11-18', 'Restock mendesak GPU RTX 4060 Ti dan SSD Samsung 990 PRO', 'Received'),
('PO-202611-0002', 4, 2, '2026-11-16', '2026-11-21', 'Penambahan stok RAM DDR5 untuk persiapan akhir bulan', 'Pending');

INSERT INTO restock_order_items (restock_order_id, product_id, quantity) VALUES
(1, 3, 10),
(1, 4, 6),
(2, 2, 15);

INSERT INTO transactions (transaction_number, type, transaction_date, restock_order_id, supplier_id, customer_name, notes, status, created_by) VALUES
('TRX-IN-202611-0001', 'IN', '2026-11-16', 1, 4, NULL, 'Barang tiba dari PT Nusantara Silikon sesuai PO-202611-0001, menunggu approval Manager', 'Pending', 3),
('TRX-OUT-202611-0001', 'OUT', '2026-11-16', NULL, NULL, 'Toko Rakit PC Makassar', 'Pengiriman part rakitan 2 unit CPU i7 dan thermal paste', 'Pending', 3);

INSERT INTO transaction_items (transaction_id, product_id, quantity) VALUES
(1, 3, 10),
(1, 4, 6),
(2, 1, 2),
(2, 7, 4);