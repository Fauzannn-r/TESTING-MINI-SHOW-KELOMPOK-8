/* ==========================================================================
   NetFix — Data Studi Kasus Troubleshooting Jaringan (Mata Pelajaran AIJ)
   Kelompok 8 — SMK Teknik Komputer dan Jaringan (TKJ) Kelas XI
   File: cases.js
   ========================================================================== */

window.NETFIX_CASES = [
  {
    id: "case-01",
    code: "KASUS 01 • LAYER FISIK",
    title: "Gangguan Perangkat Fisik: PC Lab Tidak Terdeteksi di Switch",
    difficulty: "Mudah",
    diffClass: "diff-easy",
    kompetensi: "AIJ Kelas XI — Diagnosis Konektivitas Lapisan Fisik (OSI Layer 1)",
    symptomReport: "Siswa di PC-Client-01 melaporkan ikon jaringan silang merah (Network Cable Unplugged). Lampu indikator LED pada port Switch-Lab-01 yang menuju PC-Client-01 tampak padam total, sedangkan PC lain normal.",
    brokenLink: "switch-pc",
    brokenNodeLabel: "Kabel UTP / RJ45 Rusak",
    observeClues: [
      "Indikator LED Port FastEthernet0/1 pada Switch-Lab-01 mati (Off).",
      "Status NIC pada PC-Client-01 menampilkan 'Media State: Media disconnected'.",
      "Komputer lain pada Switch yang sama dapat mengakses Server dan Internet dengan lancar."
    ],
    hypotheses: [
      {
        id: "h1",
        text: "Terjadi kerusakan fisik pada kabel UTP / konektor RJ45 yang kendor atau putus di jalur Switch ke PC-Client-01.",
        correct: true,
        feedback: "Tepat! Matinya lampu LED indikator port Switch dan pesan 'Media disconnected' adalah gejala khas gangguan Lapisan Fisik (Layer 1)."
      },
      {
        id: "h2",
        text: "Server DNS mengalami kegagalan resolusi nama domain.",
        correct: false,
        feedback: "Kurang tepat. Gangguan DNS tidak akan menyebabkan lampu LED port Switch mati atau status kabel terputus."
      },
      {
        id: "h3",
        text: "Alamat Default Gateway pada Router belum dikonfigurasi.",
        correct: false,
        feedback: "Kurang tepat. Kesalahan konfigurasi Gateway terjadi di Layer 3 (Network), sedangkan gejala saat ini menunjukkan link fisik belum tersambung."
      }
    ],
    tests: [
      {
        id: "t-cable",
        label: "Inspeksi Fisik & LAN Tester (Kabel UTP)",
        cmd: "lan-tester --check eth0",
        essential: true,
        output: "[LAN TESTER] Pin 1, 2, 3, 6 pada konektor RJ45 PC-Client-01 TIDAK TERHUBUNG (Open Circuit). Konektor kendor/rusak."
      },
      {
        id: "t-ipconfig",
        label: "Cek Konfigurasi IP (ipconfig)",
        cmd: "ipconfig /all",
        essential: false,
        output: "Ethernet adapter Local Area Connection:\n   Media State . . . . . . . : Media disconnected"
      },
      {
        id: "t-ping",
        label: "Uji Koneksi Ping ke Gateway (192.168.10.1)",
        cmd: "ping 192.168.10.1",
        essential: false,
        output: "PING: transmit failed. General failure. (Antarmuka fisik belum aktif)."
      }
    ],
    solutions: [
      {
        id: "s1",
        text: "Melakukan crimping ulang konektor RJ45 / mengganti kabel UTP Straight-Through antara Switch-Lab-01 dan PC-Client-01 hingga LED port menyala hijau.",
        correct: true,
        explanation: "Solusi tepat! Setelah konektor RJ45 diperbaiki dan kabel UTP terpasang rapat, sinyal elektrik pada pin 1, 2, 3, dan 6 pulih sehingga link fisik aktif kembali."
      },
      {
        id: "s2",
        text: "Mengubah alamat IP PC-Client-01 menjadi DHCP Otomatis tanpa memeriksa kabel.",
        correct: false,
        explanation: "Belum menyelesaikan akar masalah. Selama kabel fisik terputus, DHCP Client tidak akan bisa mengirim paket DHCP Discover ke jaringan."
      },
      {
        id: "s3",
        text: "Me-restart layanan Web Server sekolah.",
        correct: false,
        explanation: "Tidak tepat karena gangguan berada pada jalur kabel PC-Client-01, bukan pada Server."
      }
    ]
  },
  {
    id: "case-02",
    code: "KASUS 02 • PENGATURAN KELIRU",
    title: "Pengaturan Sederhana Keliru: Salah Default Gateway & Subnet",
    difficulty: "Sedang",
    diffClass: "diff-med",
    kompetensi: "AIJ Kelas XI — Diagnosis Pengalamatan IPv4 & Default Gateway (OSI Layer 3)",
    symptomReport: "Lampu indikator fisik PC-Client-01 dan Switch menyala hijau. PC-Client-01 (192.168.10.25) berhasil melakukan ping ke sesama PC lokal di lab, tetapi GAGAL mengakses Router Gateway maupun jaringan luar.",
    brokenLink: "router-switch",
    brokenNodeLabel: "Gateway Misconfigured (192.168.99.1)",
    observeClues: [
      "Lampu indikator link fisik pada PC-Client-01 dan Switch menyala normal (Hijau).",
      "Koneksi ke sesama host satu segmen LAN (192.168.10.x) berjalan normal.",
      "Saat membuka layanan di luar segmen lokal, muncul pesan 'Destination Network Unreachable'."
    ],
    hypotheses: [
      {
        id: "h1",
        text: "Kabel serat optik dari ISP putus total sehingga seluruh komputer lab mati.",
        correct: false,
        feedback: "Kurang tepat. Gejala menunjukkan PC-Client-01 bahkan belum bisa menjangkau Router Gateway lokal karena kesalahan pengaturan di PC tersebut."
      },
      {
        id: "h2",
        text: "Konfigurasi Default Gateway pada PC-Client-01 keliru (berada di luar subnet 192.168.10.0/24).",
        correct: true,
        feedback: "Analisis tepat! Jika komunikasi lokal sesama LAN berhasil tetapi tidak bisa keluar jaringan, penyebab utamanya adalah kesalahan pengalamatan Default Gateway."
      },
      {
        id: "h3",
        text: "Kartu jaringan (NIC) pada PC-Client-01 terbakar.",
        correct: false,
        feedback: "Kurang tepat. Jika NIC rusak fisik, PC tidak akan bisa melakukan ping ke sesama komputer lokal."
      }
    ],
    tests: [
      {
        id: "t-ipconfig",
        label: "Periksa Parameter TCP/IP (ipconfig /all)",
        cmd: "ipconfig /all",
        essential: true,
        output: "IPv4 Address. . . . . . : 192.168.10.25\nSubnet Mask . . . . . . : 255.255.255.0\nDefault Gateway . . . . : 192.168.99.1  <-- [ANOMALI SUBNET]"
      },
      {
        id: "t-ping-gw",
        label: "Ping ke IP Router Sebenarnya (192.168.10.1)",
        cmd: "ping 192.168.10.1",
        essential: true,
        output: "Reply from 192.168.10.1: bytes=32 time=1ms TTL=64 (Router aktif di 192.168.10.1, bukan 192.168.99.1)."
      },
      {
        id: "t-traceroute",
        label: "Lacak Jalur Paket (tracert 8.8.8.8)",
        cmd: "tracert -d 8.8.8.8",
        essential: false,
        output: "1  Transmit error: code 1231. Paket gagal diteruskan karena Default Gateway 192.168.99.1 tidak berada di subnet lokal."
      }
    ],
    solutions: [
      {
        id: "s1",
        text: "Memperbaiki pengaturan Default Gateway pada PC-Client-01 dari 192.168.99.1 menjadi 192.168.10.1 sesuai IP interface Router lokal.",
        correct: true,
        explanation: "Tepat sekali! Default Gateway harus berada pada network ID yang sama dengan host (192.168.10.0/24). Setelah diubah ke 192.168.10.1, paket dapat dirutekan keluar jaringan."
      },
      {
        id: "s2",
        text: "Mengganti Switch laboratorium dengan Switch baru.",
        correct: false,
        explanation: "Tidak tepat. Switch bekerja di Layer 2 dan sudah berfungsi normal; masalahnya murni kesalahan input Default Gateway."
      },
      {
        id: "s3",
        text: "Menonaktifkan Firewall Windows tanpa mengubah alamat Gateway.",
        correct: false,
        explanation: "Tidak menyelesaikan masalah routing karena paket tetap diarahkan ke alamat gateway yang salah."
      }
    ]
  },
  {
    id: "case-03",
    code: "KASUS 03 • KONEKSI & DNS",
    title: "Koneksi Tidak Stabil & Kegagalan Resolusi Nama Domain (DNS)",
    difficulty: "Sulit",
    diffClass: "diff-hard",
    kompetensi: "AIJ Kelas XI — Diagnosis Layanan DNS & Kualitas Transmisi Jaringan",
    symptomReport: "Siswa melaporkan browser menampilkan 'DNS_PROBE_FINISHED_NXDOMAIN' saat membuka portal e-learning sekolah, padahal uji ping ke alamat IP Server (10.10.10.2) berhasil meskipun terdapat jeda latensi.",
    brokenLink: "router-server",
    brokenNodeLabel: "DNS Resolver Error & High Jitter",
    observeClues: [
      "Ping langsung ke alamat IP 10.10.10.2 mendapat balasan (Reply), tetapi akses menggunakan nama domain gagal.",
      "Alamat Preferred DNS Server pada PC-Client-01 tercatat mengarah ke IP 10.10.10.254 yang tidak memiliki layanan DNS.",
      "Terdapat lonjakan waktu respons (latency) akibat antrean trafik pada link server."
    ],
    hypotheses: [
      {
        id: "h1",
        text: "Konfigurasi alamat DNS Server pada klien mengarah ke IP yang salah sehingga proses penerjemahan domain ke IP gagal.",
        correct: true,
        feedback: "Tepat! Ketika ping ke alamat IP berhasil namun akses domain gagal (NXDOMAIN / Server Not Found), akar masalah berada pada layanan atau konfigurasi DNS."
      },
      {
        id: "h2",
        text: "Komputer klien belum memiliki alamat IPv4 sama sekali.",
        correct: false,
        feedback: "Kurang tepat. Jika klien tidak memiliki IPv4, uji ping ke IP 10.10.10.2 tidak mungkin berhasil."
      },
      {
        id: "h3",
        text: "Monitor komputer siswa mengalami kerusakan layar.",
        correct: false,
        feedback: "Tidak relevan dengan gejala protokol jaringan."
      }
    ],
    tests: [
      {
        id: "t-nslookup",
        label: "Uji Resolusi Domain (nslookup portal.smktkj.sch.id)",
        cmd: "nslookup portal.smktkj.sch.id",
        essential: true,
        output: "DNS request timed out. Server: UnKnown (10.10.10.254). Layanan DNS aktif sebenarnya berada di 10.10.10.2."
      },
      {
        id: "t-ping-ip",
        label: "Uji Ping ke IP Server (ping 10.10.10.2)",
        cmd: "ping 10.10.10.2",
        essential: true,
        output: "Reply from 10.10.10.2: bytes=32 time=14ms TTL=63 (Konektivitas Layer 3 ke Server normal)."
      },
      {
        id: "t-flush",
        label: "Periksa Cache DNS Lokal (ipconfig /displaydns)",
        cmd: "ipconfig /displaydns",
        essential: false,
        output: "Record portal.smktkj.sch.id tidak ditemukan di cache karena query ke 10.10.10.254 selalu timeout."
      }
    ],
    solutions: [
      {
        id: "s1",
        text: "Mengatur Preferred DNS Server ke IP DNS Server aktif (10.10.10.2 / 8.8.8.8) lalu menjalankan perintah 'ipconfig /flushdns'.",
        correct: true,
        explanation: "Solusi akurat! Mengarahkan DNS ke server aktif (10.10.10.2) dan membersihkan cache DNS memastikan nama domain berhasil diterjemahkan menjadi alamat IP."
      },
      {
        id: "s2",
        text: "Menginstal ulang sistem operasi pada komputer klien.",
        correct: false,
        explanation: "Tidak efisien dan tidak diperlukan karena masalah hanya terletak pada pengaturan alamat DNS Server."
      },
      {
        id: "s3",
        text: "Mematikan Switch utama laboratorium.",
        correct: false,
        explanation: "Justru akan memutuskan koneksi seluruh komputer di laboratorium."
      }
    ]
  }
];
