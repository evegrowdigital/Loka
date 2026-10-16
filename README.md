# LOKA

Platform toko digital: satu tautan untuk menjual produk digital, jasa, dan mengelola penghasilan.
Dibuat dengan Next.js 14 (App Router). Warna brand biru.

## Isi versi ini (tahap 1: prototipe yang bisa dipakai)

| Area | Halaman |
|---|---|
| Publik | `/` landing page, `/login`, `/register`, `/[username]` toko publik dengan checkout |
| Kreator | `/dashboard` ringkasan, `/dashboard/produk`, `/dashboard/pesanan`, `/dashboard/toko`, `/dashboard/statistik`, `/dashboard/saldo` |
| Admin | `/admin` (ringkasan, pengguna, penarikan, transaksi, pengaturan biaya) |

Fitur yang sudah berjalan: daftar/masuk, toko dengan link unik dan warna sendiri, produk (tambah/ubah/sembunyikan/hapus),
checkout dan pengiriman tautan produk otomatis, saldo, penarikan dengan biaya Free 5% dan Pro 2%, riwayat penarikan,
statistik dengan filter periode, grafik, sumber pengunjung (`?ref=instagram`), dan dashboard admin.

**Penting:** di tahap 1 semua data disimpan di `localStorage` browser, dan pembayaran hanya simulasi.
Artinya data tidak tersimpan di server dan tidak terbagi antar perangkat. Ini cocok untuk demo dan uji tampilan,
**belum aman untuk uang dan pengguna sungguhan.**

Akun demo: `demo@loka.id` / `demo123` (kreator), `admin@loka.id` / `admin123` (admin).

## Menjalankan di komputer

```bash
npm install
npm run dev
```
Buka http://localhost:3000

## Unggah ke GitHub

```bash
git init
git add .
git commit -m "LOKA tahap 1"
git branch -M main
git remote add origin https://github.com/USERNAME/loka.git
git push -u origin main
```

## Deploy ke Vercel

1. Buka vercel.com, masuk dengan akun GitHub.
2. Klik **Add New > Project**, pilih repository `loka`.
3. Framework otomatis terbaca sebagai **Next.js**. Biarkan pengaturan default, klik **Deploy**.
4. Setelah selesai, kamu mendapat alamat `loka-xxxx.vercel.app`. Domain sendiri bisa dipasang di **Settings > Domains**.

## Tahap 2: dari prototipe menjadi produk sungguhan

Semua akses data ada di satu file, `lib/db.js`. Gantilah isinya secara bertahap:

1. **Database dan login**: Supabase (Postgres + Auth). Buat tabel `profiles`, `stores`, `products`, `orders`, `withdrawals`, `visits`, `settings`.
   Aktifkan Row Level Security supaya setiap kreator hanya bisa membaca dan mengubah data tokonya sendiri (syarat "sistem multi-toko" di rancangan LOKA).
2. **Pembayaran**: Xendit atau Midtrans. Status pesanan menjadi `paid` hanya setelah **webhook** dari penyedia pembayaran diverifikasi di server (Route Handler `app/api/webhook/route.js`), bukan dari browser.
3. **Penyimpanan file produk**: Supabase Storage dengan tautan unduhan bertanda waktu, supaya file tidak bisa dibagikan bebas.
4. **Penarikan dana**: hitung saldo dan potongan di server (transaksi database), cegah penarikan ganda dengan kunci atau constraint, dan catat setiap perubahan saldo di tabel buku besar (ledger). Pencairan ke rekening lewat fitur disbursement penyedia pembayaran.
5. **Email**: kirim bukti pembelian dan tautan produk (Resend atau sejenisnya).
6. **Admin**: batasi dengan kolom `role` di database, jangan dengan kata sandi di kode.

## Catatan biaya penarikan

Potongan 5% (Free) dan 2% (Pro) ditampilkan sebagai **biaya layanan pencairan LOKA**, bukan pajak.
Perlakuan pajak sebenarnya perlu ditentukan sesuai ketentuan yang berlaku.
Nilai persen bisa diubah admin di `/admin` pada tab Pengaturan.

## Struktur

```
app/            halaman (landing, auth, toko publik, dashboard, admin)
components/     Logo, BarChart, DashShell, FeeCalc
lib/db.js       lapisan data (demo: localStorage) + perhitungan saldo dan statistik
public/logo.png logo LOKA
```
