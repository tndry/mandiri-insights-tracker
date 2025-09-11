# m.it (Mandiri Insight Tracker)

Aplikasi web internal berbasis Next.js untuk analisis dan visualisasi data performa merchant Bank Mandiri.

---

## Deskripsi

m.it (Mandiri Insight Tracker) adalah aplikasi dashboard interaktif yang membantu tim internal Bank Mandiri dalam menganalisis performa merchant, memantau tren transaksi, dan mengekspor laporan berbasis data. Aplikasi ini memudahkan visualisasi data merchant secara real-time dan mendukung pengambilan keputusan berbasis data.

---

## Prasyarat (Prerequisites)

Sebelum memulai instalasi, pastikan Anda sudah meng-install perangkat lunak berikut di komputer Windows Anda:

- [ ] **Git**  
	Digunakan untuk mengambil (clone) kode sumber dari repositori.  
	Download: [https://git-scm.com/download/win](https://git-scm.com/download/win)

- [ ] **Node.js (LTS)**  
	Diperlukan untuk menjalankan aplikasi berbasis JavaScript/TypeScript. Pilih versi LTS (Long-Term Support).  
	Download: [https://nodejs.org/en/download/](https://nodejs.org/en/download/)  
	> **Catatan:** npm (Node Package Manager) akan otomatis ter-install bersama Node.js.

- [ ] **Visual Studio Code** (disarankan)  
	Editor kode yang mudah digunakan untuk pengembangan web.  
	Download: [https://code.visualstudio.com/](https://code.visualstudio.com/)

---

## Langkah-langkah Instalasi

1. **Buka Visual Studio Code**

2. **Buka Terminal**
	 - Tekan tombol `Ctrl + `` (tombol backtick/di bawah Esc) untuk membuka terminal terintegrasi di VS Code.

3. **Clone Repositori**
	 - Jalankan perintah berikut di terminal:
		 ```bash
		 git clone https://github.com/username/repo.git
		 ```

4. **Masuk ke Folder Proyek**
	 - Ganti `nama-folder-proyek` sesuai nama folder hasil clone.
		 ```bash
		 cd nama-folder-proyek
		 ```

5. **Install Dependensi**
	 - Jalankan perintah berikut untuk mengunduh semua "bahan" yang dibutuhkan proyek:
		 ```bash
		 npm install
		 ```

---

## Menjalankan Aplikasi

- Jalankan server development dengan perintah:
	```bash
	npm run dev
	```
- Setelah server berjalan, buka browser dan akses: [http://localhost:3000](http://localhost:3000)

---

## Cara Penggunaan Dasar

1. Buka aplikasi di browser, Anda akan melihat halaman sambutan.
2. Unggah file CSV data merchant melalui area upload yang tersedia.
3. Setelah data berhasil dimuat, dashboard interaktif akan muncul secara otomatis.
4. Gunakan filter di bagian atas dashboard untuk menganalisis data berdasarkan cabang atau segmen.
5. Lihat visualisasi grafik, tabel peringkat, dan insight performa merchant secara real-time.

---

## Format Data CSV

Aplikasi ini membutuhkan file CSV dengan format kolom yang sesuai. Pastikan file Anda memiliki beberapa kolom kunci berikut agar aplikasi dapat berjalan dengan baik:

- `mid_new` (ID Merchant)
- `nama cabang rek` (Nama Cabang)
- `segmen` (Segmen Merchant)
- `trx w...` (Transaksi per minggu, misal: `trx w30 '25`, `trx w31 '25`, dst.)
- `sv w...` (Sales Volume per minggu, misal: `sv w30 '25`, dst.)
- `ytd trx...` (Year-to-date transaksi, misal: `ytd trx w33 25`)
- Kolom lain yang umum: `jml edc`, `area`, `mdfg w...`, dll.

> **Tips:**
> - Pastikan nama kolom tidak typo dan sesuai dengan format di atas.
> - File CSV harus menggunakan delimiter koma (`,`).

---

Selamat menggunakan m.it! Jika mengalami kendala, silakan hubungi tim pengembang internal.
