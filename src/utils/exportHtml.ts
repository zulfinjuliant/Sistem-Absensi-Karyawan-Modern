/**
 * Generates the complete, standalone single-file HTML code
 * combining HTML, Tailwind CDN, FontAwesome, WebRTC camera, Geolocation, and LocalStorage.
 */
export function generateSingleFileHtml(): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sistem Absensi Karyawan Modern</title>
  <!-- Tailwind CSS via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- FontAwesome Icons via CDN -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen">

  <!-- ==================== HALAMAN 1: LOGIN ==================== -->
  <div id="page-login" class="min-h-screen flex items-center justify-center p-4 bg-slate-900">
    <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-100">
      <div class="text-center mb-6">
        <div class="w-14 h-14 bg-blue-600 rounded-2xl text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
          <i class="fa-solid fa-fingerprint text-2xl"></i>
        </div>
        <h1 class="text-2xl font-bold text-slate-900">PresensiPro</h1>
        <p class="text-slate-500 text-xs mt-1">Sistem Absensi Karyawan & Geotagging Modern</p>
      </div>

      <div class="flex rounded-xl bg-slate-100 p-1 mb-6">
        <button id="role-tab-emp" onclick="switchLoginRole('karyawan')" class="flex-1 py-2 text-xs font-semibold rounded-lg bg-white text-blue-700 shadow-sm transition">
          <i class="fa-solid fa-user mr-1.5"></i> Karyawan
        </button>
        <button id="role-tab-adm" onclick="switchLoginRole('admin')" class="flex-1 py-2 text-xs font-semibold rounded-lg text-slate-600 transition">
          <i class="fa-solid fa-shield-halved mr-1.5"></i> Admin HR
        </button>
      </div>

      <!-- Karyawan Login Form -->
      <form id="form-login-emp" onsubmit="handleEmployeeLogin(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-700 mb-1">Pilih Akun Karyawan</label>
          <select id="login-emp-select" class="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
            <option value="EMP-001">Ahmad Pratama (IT - Senior Engineer)</option>
            <option value="EMP-002">Siti Rahmawati (HR People Ops)</option>
            <option value="EMP-003">Budi Santoso (Operasional)</option>
            <option value="EMP-004">Dewi Lestari (Keuangan)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-700 mb-1">PIN / Password</label>
          <input type="password" value="123456" class="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
        </div>
        <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2">
          <span>Masuk ke Presensi</span> <i class="fa-solid fa-arrow-right"></i>
        </button>
      </form>

      <!-- Admin Login Form -->
      <form id="form-login-adm" onsubmit="handleAdminLogin(event)" class="space-y-4 hidden">
        <div>
          <label class="block text-xs font-medium text-slate-700 mb-1">Username Admin</label>
          <input type="text" id="admin-user" value="admin" class="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-700 mb-1">Password</label>
          <input type="password" id="admin-pass" value="admin123" class="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
        </div>
        <button type="submit" class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2">
          <span>Masuk Dashboard Admin</span> <i class="fa-solid fa-lock"></i>
        </button>
      </form>
    </div>
  </div>

  <!-- ==================== HALAMAN 2: KARYAWAN ==================== -->
  <div id="page-employee" class="min-h-screen hidden flex-col">
    <header class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-600 rounded-xl text-white flex items-center justify-center font-bold">
          <i class="fa-solid fa-fingerprint"></i>
        </div>
        <div>
          <h2 class="font-bold text-slate-900 text-sm" id="emp-nav-name">Ahmad Pratama</h2>
          <p class="text-xs text-slate-500" id="emp-nav-dept">IT Department</p>
        </div>
      </div>
      <button onclick="handleLogout()" class="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 rounded-lg hover:bg-slate-100 transition">
        <i class="fa-solid fa-right-from-bracket mr-1"></i> Keluar
      </button>
    </header>

    <main class="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
      <!-- Real-time Big Clock Card -->
      <div class="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-200">
        <p class="text-xs font-semibold text-blue-600 uppercase tracking-widest" id="realtime-date">Senin, 09 November 2026</p>
        <div class="text-5xl sm:text-6xl font-bold font-mono text-slate-900 tracking-tight my-2" id="realtime-clock">08:00:00</div>
        <p class="text-xs text-slate-500">Waktu Indonesia Barat (WIB) · Jam Kerja: 08:30 - 17:00</p>
      </div>

      <!-- Camera & Geotagging Action Panel -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        <!-- Live Camera Box -->
        <div class="md:col-span-7 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-xs uppercase tracking-wider text-slate-700">
              <i class="fa-solid fa-camera text-blue-600 mr-1.5"></i> Live Camera (Selfie)
            </h3>
            <span class="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono">
              <i class="fa-solid fa-circle text-[8px] text-emerald-500 animate-pulse mr-1"></i> Ready
            </span>
          </div>

          <div class="relative w-full aspect-4/3 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center">
            <video id="webcam-video" autoplay playsinline muted class="w-full h-full object-cover"></video>
            <canvas id="snapshot-canvas" class="hidden"></canvas>
            <!-- Face frame guide -->
            <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div class="w-44 h-56 border-2 border-dashed border-white/40 rounded-full"></div>
            </div>
          </div>
          <p class="text-[11px] text-slate-400 mt-2 text-center">Posisikan wajah Anda di dalam lingkaran panduan</p>
        </div>

        <!-- Action Panel & GPS Info -->
        <div class="md:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 class="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">
              <i class="fa-solid fa-location-dot text-rose-500 mr-1.5"></i> Lokasi & Presensi
            </h3>

            <!-- GPS Box -->
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 mb-4">
              <div class="flex justify-between">
                <span class="text-slate-500">Koordinat:</span>
                <span class="font-mono font-medium text-slate-800" id="gps-coords">Mendeteksi...</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Status Area:</span>
                <span class="font-semibold text-emerald-600" id="gps-status">Dalam Radius Kantor</span>
              </div>
              <div class="pt-1 border-t border-slate-200 text-right">
                <a id="gps-map-link" href="#" target="_blank" class="text-blue-600 hover:underline text-[11px]">
                  <i class="fa-solid fa-arrow-up-right-from-square mr-1"></i> Buka Google Maps
                </a>
              </div>
            </div>

            <!-- Today's Status Banner -->
            <div id="today-status-box" class="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 mb-4">
              Anda belum melakukan presensi hari ini.
            </div>
          </div>

          <!-- Buttons -->
          <div class="grid grid-cols-2 gap-3 pt-2">
            <button id="btn-clock-in" onclick="processAttendance('masuk')" class="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex flex-col items-center justify-center gap-1">
              <i class="fa-solid fa-right-to-bracket text-base"></i>
              <span>ABSEN MASUK</span>
            </button>
            <button id="btn-clock-out" onclick="processAttendance('keluar')" class="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition flex flex-col items-center justify-center gap-1">
              <i class="fa-solid fa-right-from-bracket text-base"></i>
              <span>ABSEN KELUAR</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Riwayat Absensi Saya -->
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <h3 class="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
          <i class="fa-solid fa-clock-rotate-left text-blue-600"></i> Riwayat Absensi Saya
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="p-3">Tanggal</th>
                <th class="p-3">Jam Masuk</th>
                <th class="p-3">Jam Keluar</th>
                <th class="p-3">Status</th>
                <th class="p-3">Lokasi GPS</th>
                <th class="p-3">Foto Selfie</th>
              </tr>
            </thead>
            <tbody id="emp-history-tbody" class="divide-y divide-slate-100">
              <!-- Loaded via JavaScript -->
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>

  <!-- ==================== HALAMAN 3: ADMIN DASHBOARD ==================== -->
  <div id="page-admin" class="min-h-screen hidden flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 text-slate-300 p-5 flex flex-col justify-between shrink-0">
      <div>
        <div class="flex items-center gap-3 text-white mb-8">
          <div class="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold">
            <i class="fa-solid fa-fingerprint"></i>
          </div>
          <span class="font-bold text-base">PresensiPro</span>
        </div>
        <nav class="space-y-1">
          <button class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold bg-blue-600 text-white">
            <i class="fa-solid fa-chart-pie w-4"></i> Dashboard
          </button>
          <button onclick="alert('Daftar data staf telah tersinkronisasi di tabel log kehadiran.')" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold hover:bg-slate-800 transition">
            <i class="fa-solid fa-users w-4"></i> Data Karyawan
          </button>
        </nav>
      </div>
      <button onclick="handleLogout()" class="flex items-center gap-3 px-3 py-2.5 text-xs text-rose-400 hover:bg-slate-800 rounded-lg transition">
        <i class="fa-solid fa-right-from-bracket w-4"></i> Logout
      </button>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 bg-slate-50">
      <header class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h2 class="font-bold text-slate-900 text-base">Dashboard Admin HR</h2>
        <span class="text-xs text-slate-500 font-mono" id="admin-header-date">Jakarta</span>
      </header>

      <main class="p-6 space-y-6 flex-1 overflow-y-auto">
        <!-- Statistik Widgets -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p class="text-xs text-slate-500">Total Hadir Hari Ini</p>
            <h4 class="text-2xl font-bold text-emerald-600 mt-1" id="stat-hadir">0</h4>
          </div>
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p class="text-xs text-slate-500">Terlambat</p>
            <h4 class="text-2xl font-bold text-amber-500 mt-1" id="stat-telat">0</h4>
          </div>
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p class="text-xs text-slate-500">Izin / Cuti</p>
            <h4 class="text-2xl font-bold text-blue-600 mt-1" id="stat-izin">0</h4>
          </div>
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p class="text-xs text-slate-500">Belum Hadir</p>
            <h4 class="text-2xl font-bold text-slate-500 mt-1" id="stat-alpa">0</h4>
          </div>
        </div>

        <!-- Log Kehadiran Karyawan -->
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 class="font-bold text-sm text-slate-900 flex items-center gap-2">
              <i class="fa-solid fa-list-check text-blue-600"></i> Log Kehadiran Karyawan
            </h3>
            <input type="text" id="admin-search" oninput="filterAdminLogs()" placeholder="Cari nama karyawan..." class="text-xs p-2 rounded-lg border border-slate-200 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th class="p-3">Foto</th>
                  <th class="p-3">Nama Karyawan</th>
                  <th class="p-3">Waktu Masuk</th>
                  <th class="p-3">Waktu Keluar</th>
                  <th class="p-3">Status</th>
                  <th class="p-3">Koordinat GPS</th>
                </tr>
              </thead>
              <tbody id="admin-logs-tbody" class="divide-y divide-slate-100">
                <!-- Loaded via JS -->
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </div>

  <!-- JAVASCRIPT LOGIC (Vanilla JS & LocalStorage) -->
  <script>
    // --- KOMENTAR BAGIAN: DATA AWAL & LOCALSTORAGE ---
    const STORAGE_KEY = 'presensipro_standalone_data';
    const DEFAULT_DATA = [
      { id: '1', empId: 'EMP-001', name: 'Ahmad Pratama', timeIn: '08:14:20', timeOut: '17:05:12', status: 'Tepat Waktu', lat: -6.2238, lng: 106.8093, photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
      { id: '2', empId: 'EMP-002', name: 'Siti Rahmawati', timeIn: '08:25:40', timeOut: '-', status: 'Tepat Waktu', lat: -6.2239, lng: 106.8092, photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100' },
      { id: '3', empId: 'EMP-003', name: 'Budi Santoso', timeIn: '08:52:10', timeOut: '-', status: 'Terlambat', lat: -6.2237, lng: 106.8094, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    ];

    function getLogs() {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_DATA;
    }

    function saveLogs(logs) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    }

    let currentUser = null;
    let currentRole = 'karyawan';
    let currentCoords = { lat: -6.22384, lng: 106.80932 };

    // --- KOMENTAR BAGIAN: KAMERA (WebRTC API) ---
    let cameraStream = null;

    async function initCamera() {
      const video = document.getElementById('webcam-video');
      if (!video) return;
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        video.srcObject = cameraStream;
      } catch (err) {
        console.warn('Camera error/denied:', err);
      }
    }

    function captureSnapshot() {
      const video = document.getElementById('webcam-video');
      const canvas = document.getElementById('snapshot-canvas');
      if (video && canvas && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.8);
      }
      return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
    }

    // --- KOMENTAR BAGIAN: GPS (Geolocation API) ---
    function initGPS() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            currentCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            updateGPSUI();
          },
          err => {
            console.warn('GPS denied, using default:', err);
            updateGPSUI();
          }
        );
      } else {
        updateGPSUI();
      }
    }

    function updateGPSUI() {
      const coordsEl = document.getElementById('gps-coords');
      const mapLink = document.getElementById('gps-map-link');
      if (coordsEl) coordsEl.innerText = currentCoords.lat.toFixed(4) + ', ' + currentCoords.lng.toFixed(4);
      if (mapLink) mapLink.href = 'https://www.google.com/maps/search/?api=1&query=' + currentCoords.lat + ',' + currentCoords.lng;
    }

    // --- JAM DIGITAL REAL-TIME ---
    function startRealTimeClock() {
      setInterval(() => {
        const now = new Date();
        const timeStr = String(now.getHours()).padStart(2, '0') + ':' +
                        String(now.getMinutes()).padStart(2, '0') + ':' +
                        String(now.getSeconds()).padStart(2, '0');
        const clockEl = document.getElementById('realtime-clock');
        if (clockEl) clockEl.innerText = timeStr;
      }, 1000);
    }

    // --- AUTHENTICATION & SWITCH PAGE ---
    function switchLoginRole(role) {
      currentRole = role;
      const tabEmp = document.getElementById('role-tab-emp');
      const tabAdm = document.getElementById('role-tab-adm');
      const formEmp = document.getElementById('form-login-emp');
      const formAdm = document.getElementById('form-login-adm');

      if (role === 'karyawan') {
        tabEmp.className = 'flex-1 py-2 text-xs font-semibold rounded-lg bg-white text-blue-700 shadow-sm transition';
        tabAdm.className = 'flex-1 py-2 text-xs font-semibold rounded-lg text-slate-600 transition';
        formEmp.classList.remove('hidden');
        formAdm.classList.add('hidden');
      } else {
        tabAdm.className = 'flex-1 py-2 text-xs font-semibold rounded-lg bg-white text-blue-700 shadow-sm transition';
        tabEmp.className = 'flex-1 py-2 text-xs font-semibold rounded-lg text-slate-600 transition';
        formAdm.classList.remove('hidden');
        formEmp.classList.add('hidden');
      }
    }

    function handleEmployeeLogin(e) {
      e.preventDefault();
      const select = document.getElementById('login-emp-select');
      const id = select.value;
      const name = select.options[select.selectedIndex].text.split('(')[0].trim();
      currentUser = { id, name, role: 'karyawan' };

      document.getElementById('page-login').classList.add('hidden');
      document.getElementById('page-employee').classList.remove('hidden');
      document.getElementById('emp-nav-name').innerText = name;

      initCamera();
      initGPS();
      renderEmployeeHistory();
    }

    function handleAdminLogin(e) {
      e.preventDefault();
      currentUser = { role: 'admin' };
      document.getElementById('page-login').classList.add('hidden');
      document.getElementById('page-admin').classList.remove('hidden');
      renderAdminDashboard();
    }

    function handleLogout() {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
      currentUser = null;
      document.getElementById('page-employee').classList.add('hidden');
      document.getElementById('page-admin').classList.add('hidden');
      document.getElementById('page-login').classList.remove('hidden');
    }

    // --- PROSES ABSENSI ---
    function processAttendance(type) {
      const now = new Date();
      const timeStr = String(now.getHours()).padStart(2, '0') + ':' +
                      String(now.getMinutes()).padStart(2, '0') + ':' +
                      String(now.getSeconds()).padStart(2, '0');
      const photo = captureSnapshot();
      const logs = getLogs();

      if (type === 'masuk') {
        const isLate = (now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 30));
        logs.unshift({
          id: Date.now().toString(),
          empId: currentUser.id,
          name: currentUser.name,
          timeIn: timeStr,
          timeOut: '-',
          status: isLate ? 'Terlambat' : 'Tepat Waktu',
          lat: currentCoords.lat,
          lng: currentCoords.lng,
          photo: photo
        });
        alert('Berhasil Absen Masuk pukul ' + timeStr);
      } else {
        const existing = logs.find(l => l.empId === currentUser.id);
        if (existing) {
          existing.timeOut = timeStr;
          alert('Berhasil Absen Keluar pukul ' + timeStr);
        } else {
          alert('Silakan lakukan absen masuk terlebih dahulu.');
          return;
        }
      }
      saveLogs(logs);
      renderEmployeeHistory();
    }

    function renderEmployeeHistory() {
      const logs = getLogs().filter(l => l.empId === currentUser.id);
      const tbody = document.getElementById('emp-history-tbody');
      if (!tbody) return;
      tbody.innerHTML = logs.map(l => \`
        <tr class="hover:bg-slate-50">
          <td class="p-3 font-medium text-slate-800">Hari Ini</td>
          <td class="p-3 font-mono font-semibold text-emerald-600">\${l.timeIn}</td>
          <td class="p-3 font-mono text-slate-600">\${l.timeOut}</td>
          <td class="p-3"><span class="px-2 py-0.5 rounded text-[11px] font-semibold \${l.status === 'Tepat Waktu' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">\${l.status}</span></td>
          <td class="p-3 font-mono text-[11px]">\${l.lat.toFixed(4)}, \${l.lng.toFixed(4)}</td>
          <td class="p-3"><img src="\${l.photo}" class="w-8 h-8 rounded-full object-cover border border-slate-200"></td>
        </tr>
      \`).join('');
    }

    function renderAdminDashboard() {
      const logs = getLogs();
      document.getElementById('stat-hadir').innerText = logs.length;
      document.getElementById('stat-telat').innerText = logs.filter(l => l.status === 'Terlambat').length;
      document.getElementById('stat-izin').innerText = '0';
      document.getElementById('stat-alpa').innerText = '1';

      filterAdminLogs();
    }

    function filterAdminLogs() {
      const search = (document.getElementById('admin-search')?.value || '').toLowerCase();
      const logs = getLogs().filter(l => l.name.toLowerCase().includes(search));
      const tbody = document.getElementById('admin-logs-tbody');
      if (!tbody) return;
      tbody.innerHTML = logs.map(l => \`
        <tr class="hover:bg-slate-50">
          <td class="p-3"><img src="\${l.photo}" class="w-8 h-8 rounded-full object-cover border border-slate-200"></td>
          <td class="p-3 font-semibold text-slate-800">\${l.name}</td>
          <td class="p-3 font-mono text-emerald-600 font-semibold">\${l.timeIn}</td>
          <td class="p-3 font-mono text-slate-600">\${l.timeOut}</td>
          <td class="p-3"><span class="px-2 py-0.5 rounded text-[11px] font-semibold \${l.status === 'Tepat Waktu' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">\${l.status}</span></td>
          <td class="p-3 font-mono text-[11px]"><a href="https://www.google.com/maps/search/?api=1&query=\${l.lat},\${l.lng}" target="_blank" class="text-blue-600 hover:underline">\${l.lat.toFixed(4)}, \${l.lng.toFixed(4)}</a></td>
        </tr>
      \`).join('');
    }

    // Start Realtime Clock on load
    startRealTimeClock();
  </script>
</body>
</html>`;
}

export function downloadStandaloneHtmlFile() {
  const content = generateSingleFileHtml();
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sistem-absensi-karyawan-modern.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
