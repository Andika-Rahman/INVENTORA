import Link from 'next/link';
import {
    Cpu,
    LogIn,
    UserPlus,
    Package,
    ArrowLeftRight,
    QrCode,
    FileSpreadsheet,
    ShieldCheck,
    Truck,
    CheckCircle2,
    LayoutDashboard,
    BarChart3,
    Layers,
} from 'lucide-react';
import { getSession } from '@/lib/auth';

export default async function HomePage() {
    const session = await getSession();

    const features = [
      {
        icon: Package,
        title: 'Tracking Stok & Lokasi Rak',
        description:
          'Pantau stok komponen PC & laptop real-time lengkap dengan kode SKU unik, lokasi rak fisik, dan peringatan otomatis status Low hingga Out of Stock.',
      },
      {
        icon: ArrowLeftRight,
        title: 'Transaksi Masuk & Keluar Tervalidasi',
        description:
          'Setiap pencatatan barang masuk dan keluar oleh Staff Gudang melewati validasi Warehouse Manager dengan pembaruan stok atomik yang akurat.',
      },
      {
        icon: Truck,
        title: 'Purchase Order & Portal Supplier',
        description:
          'Kelola pengajuan restock ke mitra supplier terverifikasi mulai dari status Pending, Confirmed, In Transit, Received, hingga penilaian performa.',
      },
      {
        icon: QrCode,
        title: 'Barcode Label & Export CSV',
        description:
          'Cetak label Barcode & QR untuk setiap rak komponen, lakukan Quick Scan SKU instan, dan unduh laporan inventori ke format spreadsheet CSV.',
      },
    ];

    const roles = [
      {
        role: 'Administrator',
        summary:
          'Kontrol penuh master data, manajemen kategori, dan verifikasi pendaftaran mitra supplier baru.',
      },
      {
        role: 'Warehouse Manager',
        summary:
          'Validasi transaksi harian, pengawasan stok kritis, pembuatan Restock PO, dan rating supplier.',
      },
      {
        role: 'Staff Gudang',
        summary:
          'Pencatatan cepat barang masuk dari PO, barang keluar ke customer, serta pembaruan status pengiriman.',
      },
      {
        role: 'Mitra Supplier',
        summary:
          'Portal khusus untuk mengkonfirmasi pesanan restock gudang dan memantau riwayat pengiriman.',
      },
    ];

    const trafficBars = [
      { day: 'Sen', inHeight: 'h-12', outHeight: 'h-8' },
      { day: 'Sel', inHeight: 'h-16', outHeight: 'h-10' },
      { day: 'Rab', inHeight: 'h-10', outHeight: 'h-14' },
      { day: 'Kam', inHeight: 'h-20', outHeight: 'h-12' },
      { day: 'Jum', inHeight: 'h-14', outHeight: 'h-9' },
      { day: 'Sab', inHeight: 'h-18', outHeight: 'h-11' },
    ];

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white tracking-tight block leading-none">
                  INVENTORA
                </span>
                <span className="text-[11px] text-slate-400">
                  PC & Laptop Warehouse System
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-400">
              <a href="#tentang" className="hover:text-white transition">
                Tentang Sistem
              </a>
              <a href="#fitur" className="hover:text-white transition">
                Fitur Utama
              </a>
              <a href="#peran" className="hover:text-white transition">
                Alur Pengguna
              </a>
            </nav>

            <div className="flex items-center gap-2.5">
              {session ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Buka Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition"
                  >
                    <LogIn className="w-3.5 h-3.5 text-slate-400" />
                    <span>Masuk</span>
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Daftar Akun</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1">
          <section
            id="tentang"
            className="relative overflow-hidden border-b border-slate-800/80 py-16 sm:py-24"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sistem Manajemen Gudang Komponen Komputer & Laptop</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Kendali Stok Komponen{' '}
                  <span className="text-blue-400">Presisi & Terintegrasi</span> dalam Satu Platform.
                </h1>

                <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
                  INVENTORA membantu operasional gudang perangkat keras mencatat arus masuk dan
                  keluar komponen PC maupun laptop secara akurat, memantau batas stok kritis di
                  setiap rak, serta menghubungkan manajemen gudang langsung dengan mitra supplier.
                </p>

                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-lg">
                  <div>
                    <p className="text-xl font-bold text-white">4 Peran</p>
                    <p className="text-xs text-slate-400">Akses berbasis RBAC</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">Real-Time</p>
                    <p className="text-xs text-slate-400">Mutasi stok atomik</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">QR & CSV</p>
                    <p className="text-xs text-slate-400">Label rak & laporan</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      <span className="ml-2 px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-400">
                        inventora / workspace
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      System Online
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-slate-400">
                            Akurasi Mutasi Stok
                          </span>
                          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <Layers className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-white tracking-tight">100% Atomik</p>
                        <p className="text-[11px] text-emerald-400 font-medium">
                          Validasi approval sebelum update stok
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-slate-400">
                            Kontrol Akses Pengguna
                          </span>
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-white tracking-tight">4 Role RBAC</p>
                        <p className="text-[11px] text-slate-400">
                          Admin • Manager • Staff • Supplier
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-blue-400" />
                          <span className="text-xs font-semibold text-white">
                            Sirkulasi Barang Masuk vs Keluar
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="inline-flex items-center gap-1.5 text-slate-300">
                            <span className="w-2 h-2 rounded-xs bg-emerald-500" />
                            Masuk (IN)
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-slate-300">
                            <span className="w-2 h-2 rounded-xs bg-blue-500" />
                            Keluar (OUT)
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-6 gap-2.5 pt-2 items-end h-28 border-b border-slate-800/80 pb-2 px-1">
                        {trafficBars.map((bar) => (
                          <div key={bar.day} className="flex flex-col items-center gap-1.5">
                            <div className="flex items-end gap-1 h-20">
                              <div
                                className={`w-2.5 sm:w-3 rounded-t-sm bg-emerald-500/85 ${bar.inHeight}`}
                              />
                              <div
                                className={`w-2.5 sm:w-3 rounded-t-sm bg-blue-500/85 ${bar.outHeight}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-6 gap-2.5 text-center text-[10px] font-mono text-slate-500">
                        {trafficBars.map((bar) => (
                          <span key={bar.day}>{bar.day}</span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">
                          Alur Restock Purchase Order
                        </span>
                        <span className="font-mono text-[11px] text-blue-400">
                          4 Tahap Terpantau
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 text-[10px] font-semibold text-center">
                        <div className="py-1.5 px-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                          1. Pending
                        </div>
                        <div className="py-1.5 px-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                          2. Confirmed
                        </div>
                        <div className="py-1.5 px-1 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/40">
                          3. In Transit
                        </div>
                        <div className="py-1.5 px-1 rounded-lg bg-slate-900 text-slate-500 border border-slate-800">
                          4. Received
                        </div>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Barcode & QR SKU Siap Cetak
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                        Export Laporan CSV
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="fitur" className="py-16 sm:py-20 border-b border-slate-800/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-white">
                  Dirancang Khusus untuk Operasional Gudang Hardware
                </h2>
                <p className="text-sm text-slate-400 mt-2">
                  Seluruh alur pencatatan barang dirancang untuk meminimalkan selisih stok dan
                  mempercepat proses pengadaan ulang komponen.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {features.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={feat.title}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-white text-sm">{feat.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section id="peran" className="py-16 sm:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-white">
                  Kolaborasi Empat Peran dalam Satu Alur Kerja
                </h2>
                <p className="text-sm text-slate-400 mt-2">
                  Setiap pengguna memiliki hak akses dan tampilan kerja yang disesuaikan dengan
                  tanggung jawab operasionalnya.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {roles.map((item, idx) => (
                  <div
                    key={item.role}
                    className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-2.5"
                  >
                    <span className="text-xs font-mono font-bold text-blue-400">
                      0{idx + 1}
                    </span>
                    <h3 className="font-bold text-white text-sm">{item.role}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-slate-800/80 py-6 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-slate-300">INVENTORA</span>
              <span>— Warehouse Management System</span>
            </div>
            <p>Sistem Informasi Manajemen Inventori Komponen PC & Laptop</p>
          </div>
        </footer>
      </div>
    );
}