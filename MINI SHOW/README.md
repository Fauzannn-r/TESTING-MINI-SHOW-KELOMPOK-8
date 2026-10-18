# NetFix — Game Edukasi Troubleshooting Jaringan Komputer (SMK TKJ)

Prototype aplikasi web interaktif **NetFix** untuk mata pelajaran **Administrasi Infrastruktur Jaringan (AIJ)** Kelas XI SMK TKJ, dikembangkan oleh **Kelompok 8**:
1. **Fauzan Raditiya** (2513025024) — Spesialis Referensi & Materi
2. **Jeni Anggraini** (2513025040) — Manajer Proyek & Analis Kebutuhan
3. **Nadia Valentina** (2513025044) — Game Designer & Scenario Writer
4. **Ahmad Avicena Komarov** (2513025058) — Web Developer & Editor Teknis

## Struktur File Terpisah (Modular)
- `index.html` — Struktur utama halaman & antarmuka aplikasi web (Beranda, Pilih Kasus, Simulation Dashboard, Summary Report).
- `style.css` — Desain antarmuka bertema *Cyber Network Blue*, responsif di desktop maupun perangkat mobile.
- `cases.js` — Data modul & skenario bercabang (*Branching Scenario*) untuk 3 kasus *troubleshooting* jaringan (Layer Fisik, Default Gateway/Subnet, dan DNS Resolver).
- `audio.js` — Modul *Audio Feedback* berbasis *Web Audio API* (tanpa ketergantungan file MP3 eksternal).
- `script.js` — *Game Engine*, visualisasi animasi paket data pada `<canvas>`, serta logika siklus keputusan **Amati → Duga → Uji → Simpulkan → Evaluasi**.

## Cara Menjalankan
1. Ekstrak seluruh file (`index.html`, `style.css`, `cases.js`, `audio.js`, `script.js`) ke dalam satu folder yang sama.
2. Klik dua kali `index.html` untuk membukanya langsung di browser (Chrome, Edge, Firefox), atau jalankan melalui ekstensi **Live Server** di VS Code.
