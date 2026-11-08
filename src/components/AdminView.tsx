import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Building2,
  Search,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  FileSpreadsheet,
  RotateCcw,
  ExternalLink,
  Plus,
  MapPin,
  Save,
  UserMinus,
  Sparkles,
} from 'lucide-react';
import {
  AttendanceRecord,
  Employee,
  OfficeSettings,
} from '../types/attendance';
import {
  getEmployees,
  saveEmployees,
  addEmployee,
  getAttendanceLogs,
  getOfficeSettings,
  saveOfficeSettings,
  getTodayDateString,
  resetAllToSampleData,
} from '../services/storage';
import { PhotoModal } from './PhotoModal';
import { formatDistance, getGoogleMapsUrl } from '../utils/geo';
import { downloadStandaloneHtmlFile } from '../utils/exportHtml';

interface AdminViewProps {
  onLogout: () => void;
  onSwitchToEmployee?: (emp: Employee) => void;
}

type AdminTab = 'dashboard' | 'logs' | 'employees' | 'settings' | 'export';

export const AdminView: React.FC<AdminViewProps> = ({ onLogout, onSwitchToEmployee }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [officeSettings, setOfficeSettings] = useState<OfficeSettings>(getOfficeSettings());

  // Filters for logs
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('today');

  // Photo modal
  const [selectedPhoto, setSelectedPhoto] = useState<{
    record: AttendanceRecord;
    type: 'in' | 'out';
  } | null>(null);

  // New Employee Modal
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpNik, setNewEmpNik] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('Teknologi Informasi (IT)');
  const [newEmpPosition, setNewEmpPosition] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');

  // Settings form
  const [settingsForm, setSettingsForm] = useState<OfficeSettings>(officeSettings);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  const loadData = () => {
    setEmployees(getEmployees());
    setAttendanceLogs(getAttendanceLogs());
    const settings = getOfficeSettings();
    setOfficeSettings(settings);
    setSettingsForm(settings);
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayStr = getTodayDateString();

  // Calculate statistics for today
  const todayLogs = attendanceLogs.filter((l) => l.date === todayStr);
  const totalEmployeesCount = employees.length;
  const hadirCount = todayLogs.filter(
    (l) => l.status === 'Tepat Waktu' || l.status === 'Terlambat'
  ).length;
  const telatCount = todayLogs.filter((l) => l.status === 'Terlambat').length;
  const tepatWaktuCount = todayLogs.filter((l) => l.status === 'Tepat Waktu').length;
  const izinCutiCount = todayLogs.filter(
    (l) => l.status === 'Izin' || l.status === 'Cuti' || l.status === 'Sakit'
  ).length;
  const belumHadirCount = Math.max(0, totalEmployeesCount - hadirCount - izinCutiCount);

  // Filter logs for table
  const filteredLogs = attendanceLogs.filter((record) => {
    // Search query
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeNik.includes(searchQuery);

    // Status filter
    const matchesStatus =
      filterStatus === 'all' || record.status.toLowerCase() === filterStatus.toLowerCase();

    // Date filter
    let matchesDate = true;
    if (filterDate === 'today') {
      matchesDate = record.date === todayStr;
    } else if (filterDate === 'all') {
      matchesDate = true;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'ID',
      'NIK',
      'Nama Karyawan',
      'Departemen',
      'Tanggal',
      'Jam Masuk',
      'Jam Keluar',
      'Status',
      'Latitude',
      'Longitude',
      'Jarak Kantor (m)',
      'Dalam Radius',
      'Catatan',
    ];

    const rows = filteredLogs.map((l) => [
      l.id,
      l.employeeNik,
      `"${l.employeeName}"`,
      `"${l.department}"`,
      l.date,
      l.clockInTime || '-',
      l.clockOutTime || '-',
      l.status,
      l.locationIn?.lat || '',
      l.locationIn?.lng || '',
      l.distanceFromOfficeMeters,
      l.isWithinOfficeRadius ? 'Ya' : 'Tidak',
      `"${l.notes || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_absensi_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add new employee
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;

    addEmployee({
      name: newEmpName.trim(),
      nik: newEmpNik.trim() || `202401${String(employees.length + 1).padStart(2, '0')}`,
      department: newEmpDept,
      position: newEmpPosition.trim() || 'Staff',
      email: newEmpEmail.trim() || `${newEmpName.toLowerCase().replace(/\s+/g, '.')}@presensipro.id`,
      phone: newEmpPhone.trim() || '0812-0000-0000',
      status: 'Aktif',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      joinDate: todayStr,
    });

    setIsAddEmployeeOpen(false);
    setNewEmpName('');
    setNewEmpNik('');
    setNewEmpPosition('');
    setNewEmpEmail('');
    setNewEmpPhone('');
    loadData();
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveOfficeSettings(settingsForm);
    setOfficeSettings(settingsForm);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  // Reset to initial sample data
  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh data absensi ke sampel awal?')) {
      resetAllToSampleData();
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-5 flex flex-col justify-between shrink-0 shadow-lg">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-3 text-white pb-6 border-b border-slate-800">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">PresensiPro</h1>
              <p className="text-[11px] text-slate-400">Admin Control Panel</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard Ringkasan</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'logs'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span>Log Kehadiran Karyawan</span>
            </button>

            <button
              onClick={() => setActiveTab('employees')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'employees'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Data Karyawan ({employees.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Pengaturan Kantor & Jam</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'export'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>Ekspor & Kode Mandiri</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-slate-800 space-y-2 mt-6">
          <div className="px-3 py-2 rounded-lg bg-slate-800/50 text-[11px] text-slate-400">
            <span className="block font-semibold text-slate-200">Admin HR Active</span>
            <span className="truncate">admin@presensipro.id</span>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar / Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              {activeTab === 'dashboard' && 'Ringkasan Kehadiran Hari Ini'}
              {activeTab === 'logs' && 'Log Absensi Karyawan Lengkap'}
              {activeTab === 'employees' && 'Manajemen Data Karyawan'}
              {activeTab === 'settings' && 'Konfigurasi Jam Kerja & Geofence GPS'}
              {activeTab === 'export' && 'Ekspor Rekapitulasi & File Standalone'}
            </h2>
            <p className="text-xs text-slate-500">
              {officeSettings.officeName} · {todayStr}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadStandaloneHtmlFile}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
              title="Unduh single-file standalone HTML siap pakai"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Download index.html</span>
            </button>

            {onSwitchToEmployee && employees.length > 0 && (
              <button
                onClick={() => onSwitchToEmployee(employees[0])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition"
                title="Buka tampilan Karyawan untuk mencoba absensi selfie"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Tes Mode Karyawan</span>
              </button>
            )}
          </div>
        </header>

        {/* Tab 1: Dashboard View */}
        {activeTab === 'dashboard' && (
          <main className="p-6 space-y-6 max-w-6xl">
            {/* KPI Stat Cards (Widget Statistik) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Hadir */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Hadir Hari Ini</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold font-mono text-emerald-600 tabular-nums">
                    {hadirCount}{' '}
                    <span className="text-xs font-sans font-medium text-slate-400">
                      / {totalEmployeesCount}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {totalEmployeesCount > 0
                      ? `${Math.round((hadirCount / totalEmployeesCount) * 100)}% kehadiran`
                      : '0%'}
                  </p>
                </div>
              </div>

              {/* Terlambat */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Terlambat</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold font-mono text-amber-500 tabular-nums">
                    {telatCount}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Batas jam masuk: {officeSettings.workStartTime} WIB
                  </p>
                </div>
              </div>

              {/* Izin / Cuti */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Izin / Cuti / Sakit</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold font-mono text-blue-600 tabular-nums">
                    {izinCutiCount}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Pengajuan online tercatat</p>
                </div>
              </div>

              {/* Belum Hadir */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Belum Hadir / Alpa</span>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <UserMinus className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold font-mono text-rose-600 tabular-nums">
                    {belumHadirCount}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Staf belum melakukan clock-in</p>
                </div>
              </div>
            </div>

            {/* Department Breakdown & Quick Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Department Distribution */}
              <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="font-bold text-sm text-slate-900 mb-4">Kehadiran per Departemen</h3>
                <div className="space-y-3">
                  {['Teknologi Informasi (IT)', 'Human Resources (HR)', 'Operasional', 'Keuangan & Akuntansi', 'Pemasaran & Kreatif'].map(
                    (dept) => {
                      const deptTotal = employees.filter((e) => e.department === dept).length;
                      const deptHadir = todayLogs.filter(
                        (l) =>
                          l.department === dept &&
                          (l.status === 'Tepat Waktu' || l.status === 'Terlambat')
                      ).length;
                      const pct = deptTotal > 0 ? Math.round((deptHadir / deptTotal) * 100) : 0;

                      return (
                        <div key={dept} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-700">{dept}</span>
                            <span className="font-mono text-slate-500">
                              {deptHadir}/{deptTotal} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Right: Live Feed Today */}
              <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-slate-900">Aktivitas Absensi Terbaru</h3>
                    <button
                      onClick={() => setActiveTab('logs')}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Lihat Semua ({todayLogs.length})
                    </button>
                  </div>

                  <div className="space-y-3">
                    {todayLogs.slice(0, 4).map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition border border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={rec.photoIn}
                            alt={rec.employeeName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-800 leading-tight">
                              {rec.employeeName}
                            </p>
                            <p className="text-[11px] text-slate-500">{rec.department}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-xs font-bold text-slate-800 block">
                            {rec.clockInTime} WIB
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              rec.status === 'Tepat Waktu'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {todayLogs.length === 0 && (
                      <p className="text-xs text-slate-400 py-6 text-center">
                        Belum ada aktivitas presensi tercatat hari ini.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Geofencing: Radius {officeSettings.radiusMeters}m</span>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Ubah Lokasi Kantor
                  </button>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* Tab 2: Logs Table (Tabel Log Kehadiran Karyawan) */}
        {activeTab === 'logs' && (
          <main className="p-6 space-y-6 max-w-7xl">
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 space-y-4">
              {/* Filter Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama, NIK, atau divisi..."
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Date Filter */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setFilterDate('today')}
                      className={`px-3 py-1 rounded-md font-semibold transition ${
                        filterDate === 'today'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Hari Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterDate('all')}
                      className={`px-3 py-1 rounded-md font-semibold transition ${
                        filterDate === 'all'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Semua Tanggal
                    </button>
                  </div>

                  {/* Status Filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="all">Semua Status</option>
                    <option value="tepat waktu">Tepat Waktu</option>
                    <option value="terlambat">Terlambat</option>
                    <option value="izin">Izin / Sakit</option>
                  </select>

                  {/* Export CSV button */}
                  <button
                    onClick={handleExportCsv}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={handleResetData}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition"
                    title="Reset ke Sampel Data Awal"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto -mx-5 sm:mx-0">
                <table className="w-full text-xs text-left min-w-[850px]">
                  <thead className="bg-slate-50 text-slate-600 border-y sm:border sm:rounded-lg border-slate-200">
                    <tr>
                      <th className="p-3 font-semibold">Foto Selfie</th>
                      <th className="p-3 font-semibold">Karyawan</th>
                      <th className="p-3 font-semibold">Tanggal</th>
                      <th className="p-3 font-semibold">Jam Masuk</th>
                      <th className="p-3 font-semibold">Jam Keluar</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold">Lokasi GPS & Radius</th>
                      <th className="p-3 font-semibold">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          Tidak ditemukan catatan absensi yang sesuai kriteria filter.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition">
                          {/* Foto Selfie (Thumbnail with Modal preview) */}
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              {log.photoIn ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedPhoto({ record: log, type: 'in' })}
                                  className="relative group p-0.5 rounded-lg border border-slate-200 hover:border-blue-400 transition"
                                  title="Klik untuk memperbesar foto masuk"
                                >
                                  <img
                                    src={log.photoIn}
                                    alt="Foto Masuk"
                                    className="w-9 h-9 rounded-md object-cover"
                                  />
                                </button>
                              ) : (
                                <div className="w-9 h-9 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 text-[10px]">
                                  No Pic
                                </div>
                              )}

                              {log.photoOut && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedPhoto({ record: log, type: 'out' })}
                                  className="relative group p-0.5 rounded-lg border border-slate-200 hover:border-rose-400 transition"
                                  title="Klik untuk memperbesar foto keluar"
                                >
                                  <img
                                    src={log.photoOut}
                                    alt="Foto Keluar"
                                    className="w-9 h-9 rounded-md object-cover"
                                  />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Karyawan */}
                          <td className="p-3">
                            <div className="font-bold text-slate-900 leading-tight">
                              {log.employeeName}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {log.employeeNik} · {log.department}
                            </div>
                          </td>

                          {/* Tanggal */}
                          <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                            {log.date}
                          </td>

                          {/* Jam Masuk */}
                          <td className="p-3 font-mono font-bold text-emerald-600 whitespace-nowrap tabular-nums">
                            {log.clockInTime ? `${log.clockInTime} WIB` : '-'}
                          </td>

                          {/* Jam Keluar */}
                          <td className="p-3 font-mono text-slate-600 whitespace-nowrap tabular-nums">
                            {log.clockOutTime ? `${log.clockOutTime} WIB` : '-'}
                          </td>

                          {/* Status */}
                          <td className="p-3 whitespace-nowrap">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                                log.status === 'Tepat Waktu'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : log.status === 'Terlambat'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>

                          {/* Lokasi GPS */}
                          <td className="p-3">
                            {log.locationIn ? (
                              <div className="space-y-0.5">
                                <a
                                  href={getGoogleMapsUrl(log.locationIn.lat, log.locationIn.lng)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 font-mono text-[11px] text-blue-600 hover:underline"
                                >
                                  <MapPin className="w-3 h-3 text-red-500" />
                                  {log.locationIn.lat.toFixed(4)}, {log.locationIn.lng.toFixed(4)}
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                                <p className="text-[10px] text-slate-500">
                                  {formatDistance(log.distanceFromOfficeMeters)}{' '}
                                  <span
                                    className={
                                      log.isWithinOfficeRadius
                                        ? 'text-emerald-600 font-semibold'
                                        : 'text-amber-600 font-semibold'
                                    }
                                  >
                                    ({log.isWithinOfficeRadius ? 'Kantor' : 'Luar Radius'})
                                  </span>
                                </p>
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          {/* Catatan */}
                          <td className="p-3 text-[11px] text-slate-500 max-w-xs truncate">
                            {log.notes || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        )}

        {/* Tab 3: Data Karyawan (Employees Directory) */}
        {activeTab === 'employees' && (
          <main className="p-6 space-y-6 max-w-6xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Daftar Karyawan Aktif</h3>
                <p className="text-xs text-slate-500">
                  Total {employees.length} staf terdaftar di sistem presensi
                </p>
              </div>

              <button
                onClick={() => setIsAddEmployeeOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Karyawan Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-200 transition"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 text-sm truncate leading-tight">
                        {emp.name}
                      </h4>
                      <p className="text-xs text-blue-600 font-medium truncate">{emp.position}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        NIK: {emp.nik} · {emp.department}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">{emp.phone}</span>
                    {onSwitchToEmployee && (
                      <button
                        onClick={() => onSwitchToEmployee(emp)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Login Karyawan Ini →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* Tab 4: Pengaturan Kantor & Jam Kerja (Settings) */}
        {activeTab === 'settings' && (
          <main className="p-6 space-y-6 max-w-4xl">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h3 className="font-bold text-base text-slate-900 mb-1">
                Pengaturan Kantor & Geofencing GPS
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Tentukan koordinat pusat kantor dan radius toleransi jarak absensi karyawan
              </p>

              {settingsSavedMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Pengaturan kantor berhasil disimpan ke LocalStorage!
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Kantor</label>
                  <input
                    type="text"
                    value={settingsForm.officeName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, officeName: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alamat Kantor</label>
                  <input
                    type="text"
                    value={settingsForm.officeAddress}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, officeAddress: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Latitude Kantor
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={settingsForm.latitude}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          latitude: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Longitude Kantor
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={settingsForm.longitude}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          longitude: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Radius Geofence (Meter)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.radiusMeters}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          radiusMeters: parseInt(e.target.value, 10) || 100,
                        })
                      }
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Jam Kerja */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="font-bold text-slate-800 text-xs mb-3">Jadwal Jam Kerja Standar</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Jam Masuk (WIB)</label>
                      <input
                        type="time"
                        value={settingsForm.workStartTime}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, workStartTime: e.target.value })
                        }
                        className="w-full p-2.5 rounded-lg border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Jam Pulang (WIB)</label>
                      <input
                        type="time"
                        value={settingsForm.workEndTime}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, workEndTime: e.target.value })
                        }
                        className="w-full p-2.5 rounded-lg border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Toleransi Telat (Menit)
                      </label>
                      <input
                        type="number"
                        value={settingsForm.lateThresholdMinutes}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            lateThresholdMinutes: parseInt(e.target.value, 10) || 15,
                          })
                        }
                        className="w-full p-2.5 rounded-lg border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-sm transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Pengaturan</span>
                  </button>
                </div>
              </form>
            </div>
          </main>
        )}

        {/* Tab 5: Ekspor & Standalone File Generator */}
        {activeTab === 'export' && (
          <main className="p-6 space-y-6 max-w-4xl">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Unduh File Mandiri (Single-File Standalone HTML)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sesuai instruksi khusus: Aplikasi lengkap dalam satu file HTML utuh siap pakai di browser
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <p className="font-semibold text-slate-800">Petunjuk Menjalankan di Komputer Lokal:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>Klik tombol <strong>"Unduh File index.html Standalone"</strong> di bawah.</li>
                  <li>Simpan file di folder komputer Anda (misal di Desktop atau folder Dokumen).</li>
                  <li>Klik dua kali file <code>sistem-absensi-karyawan-modern.html</code> untuk membukanya langsung di Google Chrome atau Microsoft Edge.</li>
                  <li>Saat browser meminta izin Kamera & Lokasi GPS, klik <strong>"Allow" / "Izinkan"</strong>.</li>
                </ol>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={downloadStandaloneHtmlFile}
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File index.html Standalone</span>
                </button>

                <button
                  onClick={handleExportCsv}
                  className="px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Ekspor Data ke Excel / CSV</span>
                </button>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* Add Employee Modal */}
      {isAddEmployeeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Tambah Karyawan Baru</h3>
              <button
                onClick={() => setIsAddEmployeeOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateEmployee} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  placeholder="Contoh: Muhammad Reza"
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Induk Karyawan (NIK)</label>
                <input
                  type="text"
                  value={newEmpNik}
                  onChange={(e) => setNewEmpNik(e.target.value)}
                  placeholder="20240107"
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Departemen / Divisi</label>
                <select
                  value={newEmpDept}
                  onChange={(e) => setNewEmpDept(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Teknologi Informasi (IT)">Teknologi Informasi (IT)</option>
                  <option value="Human Resources (HR)">Human Resources (HR)</option>
                  <option value="Operasional">Operasional</option>
                  <option value="Keuangan & Akuntansi">Keuangan & Akuntansi</option>
                  <option value="Pemasaran & Kreatif">Pemasaran & Kreatif</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jabatan</label>
                <input
                  type="text"
                  value={newEmpPosition}
                  onChange={(e) => setNewEmpPosition(e.target.value)}
                  placeholder="Contoh: Quality Assurance Engineer"
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmpEmail}
                    onChange={(e) => setNewEmpEmail(e.target.value)}
                    placeholder="nama@presensipro.id"
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    placeholder="0812-..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition"
                >
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal
          record={selectedPhoto.record}
          photoType={selectedPhoto.type}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
};
