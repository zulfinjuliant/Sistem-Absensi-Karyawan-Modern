import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Calendar,
  ExternalLink,
  RefreshCw,
  FileText,
  Building2,
  Sparkles,
  Download,
} from 'lucide-react';
import { AttendanceRecord, Employee, OfficeSettings } from '../types/attendance';
import { CameraView, CameraViewHandle } from './CameraView';
import { PhotoModal } from './PhotoModal';
import { LeaveModal } from './LeaveModal';
import {
  getTodayDateString,
  getTodayAttendanceForEmployee,
  getAttendanceLogs,
  addAttendanceRecord,
  updateAttendanceRecord,
  getOfficeSettings,
} from '../services/storage';
import {
  calculateDistanceMeters,
  getCurrentPositionAsync,
  formatDistance,
  getGoogleMapsUrl,
} from '../utils/geo';
import { playChime } from '../utils/audio';
import { downloadStandaloneHtmlFile } from '../utils/exportHtml';

interface EmployeeViewProps {
  employee: Employee;
  onLogout: () => void;
}

export const EmployeeView: React.FC<EmployeeViewProps> = ({ employee, onLogout }) => {
  const cameraRef = useRef<CameraViewHandle | null>(null);

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [officeSettings, setOfficeSettings] = useState<OfficeSettings>(getOfficeSettings());
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | undefined>(undefined);
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);

  // Geolocation state
  const [currentGps, setCurrentGps] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
    distance: number;
    isWithinRadius: boolean;
    address?: string;
  }>({
    lat: -6.22384,
    lng: 106.80932,
    accuracy: 15,
    distance: 25,
    isWithinRadius: true,
    address: 'Menara Sudirman Lt. 18, Jakarta',
  });
  const [isLoadingGps, setIsLoadingGps] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modals
  const [selectedPhotoRecord, setSelectedPhotoRecord] = useState<{
    record: AttendanceRecord;
    type: 'in' | 'out';
  } | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Load records
  const refreshRecords = () => {
    const today = getTodayAttendanceForEmployee(employee.id);
    setTodayRecord(today);
    const all = getAttendanceLogs();
    const myHistory = all.filter((r) => r.employeeId === employee.id);
    setHistoryRecords(myHistory);
  };

  // Real-time clock interval
  useEffect(() => {
    refreshRecords();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [employee.id]);

  // Fetch GPS on mount
  const updateGpsLocation = async () => {
    setIsLoadingGps(true);
    try {
      const pos = await getCurrentPositionAsync(6000);
      const settings = getOfficeSettings();
      setOfficeSettings(settings);

      const distance = calculateDistanceMeters(
        pos.lat,
        pos.lng,
        settings.latitude,
        settings.longitude
      );
      const isWithinRadius = distance <= settings.radiusMeters;

      setCurrentGps({
        lat: pos.lat,
        lng: pos.lng,
        accuracy: pos.accuracy,
        distance,
        isWithinRadius,
        address: pos.address,
      });
    } finally {
      setIsLoadingGps(false);
    }
  };

  useEffect(() => {
    updateGpsLocation();
  }, []);

  // Format real-time clock
  const timeFormatted = `${String(currentTime.getHours()).padStart(2, '0')}:${String(
    currentTime.getMinutes()
  ).padStart(2, '0')}:${String(currentTime.getSeconds()).padStart(2, '0')}`;

  const dateFormattedIndonesian = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Handle Clock In
  const handleClockIn = async () => {
    if (todayRecord) {
      alert('Anda sudah melakukan Absen Masuk hari ini.');
      return;
    }

    setIsProcessing(true);

    try {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      // Calculate Late / On-Time status
      // Standard: 08:30 + tolerance
      const [startH, startM] = officeSettings.workStartTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const isLate = currentMinutes > startMinutes;
      const status = isLate ? 'Terlambat' : 'Tepat Waktu';

      // Capture selfie photo with watermark
      const photoBase64 = cameraRef.current
        ? cameraRef.current.capturePhoto({
            employeeName: employee.name,
            timestamp: `${getTodayDateString()} ${timeStr}`,
            status: `ABSEN MASUK (${status.toUpperCase()})`,
            locationText: `${currentGps.distance}m dari kantor`,
          })
        : '';

      const record: AttendanceRecord = {
        id: `ATT-${Date.now()}`,
        employeeId: employee.id,
        employeeNik: employee.nik,
        employeeName: employee.name,
        department: employee.department,
        date: getTodayDateString(),
        clockInTime: timeStr,
        clockOutTime: null,
        status: status,
        photoIn: photoBase64,
        photoOut: null,
        locationIn: {
          lat: currentGps.lat,
          lng: currentGps.lng,
          accuracy: currentGps.accuracy,
          address: currentGps.isWithinRadius
            ? `${officeSettings.officeName} (${currentGps.distance}m)`
            : `Luar Kantor / WFH (${formatDistance(currentGps.distance)})`,
        },
        locationOut: null,
        distanceFromOfficeMeters: currentGps.distance,
        isWithinOfficeRadius: currentGps.isWithinRadius,
        notes: isLate
          ? `Terlambat ${currentMinutes - startMinutes} menit`
          : 'Hadir tepat waktu di area kerja',
        deviceInfo: navigator.userAgent.slice(0, 40),
      };

      addAttendanceRecord(record);
      playChime('success');
      refreshRecords();

      setSuccessToast(
        `Berhasil Absen Masuk pukul ${timeStr} WIB! Status: ${status} (${
          currentGps.isWithinRadius ? 'Dalam Radius Kantor' : 'Luar Kantor'
        })`
      );
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err) {
      console.error('Error during clock in:', err);
      alert('Terjadi kesalahan saat memproses absensi.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Clock Out
  const handleClockOut = async () => {
    if (!todayRecord) {
      alert('Anda belum melakukan Absen Masuk hari ini.');
      return;
    }
    if (todayRecord.clockOutTime) {
      alert('Anda sudah melakukan Absen Keluar hari ini.');
      return;
    }

    setIsProcessing(true);

    try {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const photoBase64 = cameraRef.current
        ? cameraRef.current.capturePhoto({
            employeeName: employee.name,
            timestamp: `${getTodayDateString()} ${timeStr}`,
            status: 'ABSEN KELUAR',
            locationText: `${currentGps.distance}m dari kantor`,
          })
        : '';

      const updatedRecord: AttendanceRecord = {
        ...todayRecord,
        clockOutTime: timeStr,
        photoOut: photoBase64,
        locationOut: {
          lat: currentGps.lat,
          lng: currentGps.lng,
          accuracy: currentGps.accuracy,
          address: currentGps.isWithinRadius
            ? `${officeSettings.officeName} (${currentGps.distance}m)`
            : `Luar Kantor (${formatDistance(currentGps.distance)})`,
        },
      };

      updateAttendanceRecord(updatedRecord);
      playChime('checkout');
      refreshRecords();

      setSuccessToast(`Berhasil Absen Keluar pukul ${timeStr} WIB. Selamat beristirahat!`);
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err) {
      console.error('Error clocking out:', err);
      alert('Terjadi kendala saat absen keluar.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                PresensiPro
              </span>
              <span className="hidden sm:inline-block text-slate-300">|</span>
              <span className="hidden sm:inline-block text-xs font-semibold text-blue-600">
                Portal Karyawan
              </span>
            </div>
            <p className="text-[11px] text-slate-500">PT Digital Presensi Nusantara</p>
          </div>
        </div>

        {/* User profile & actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={downloadStandaloneHtmlFile}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs"
            title="Download Single File HTML siap jalan di browser"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Unduh File HTML</span>
          </button>

          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs border border-blue-200">
              {employee.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{employee.name}</p>
              <p className="text-[11px] text-slate-500">{employee.nik} · {employee.department}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition flex items-center gap-1.5"
            title="Keluar dari akun"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Toast Notification */}
        {successToast && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl shadow-sm flex items-center justify-between text-xs sm:text-sm animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-medium">{successToast}</span>
            </div>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Real-time Big Clock Card */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold tracking-wide uppercase mb-3">
              <Calendar className="w-3.5 h-3.5" />
              <span>{dateFormattedIndonesian}</span>
            </div>

            {/* Huge live ticking clock */}
            <div className="text-5xl sm:text-7xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {timeFormatted}
              <span className="text-sm sm:text-base font-sans font-medium text-slate-400 ml-2">WIB</span>
            </div>

            <p className="text-xs text-slate-500 mt-3 flex items-center justify-center gap-2 flex-wrap">
              <span>Jam Masuk Standar: <strong className="text-slate-700">{officeSettings.workStartTime} WIB</strong></span>
              <span>·</span>
              <span>Jam Pulang: <strong className="text-slate-700">{officeSettings.workEndTime} WIB</strong></span>
              <span>·</span>
              <span>Toleransi: <strong className="text-slate-700">{officeSettings.lateThresholdMinutes} menit</strong></span>
            </p>
          </div>
        </section>

        {/* Live Attendance Action Grid (Camera + Geolocation + Buttons) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Live Camera Feed */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Kamera Verifikasi Wajah (Live Selfie)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Foto selfie otomatis tersimpan dengan watermark waktu & koordinat GPS
                </p>
              </div>
            </div>

            {/* Live Camera View Component */}
            <CameraView ref={cameraRef} employeeName={employee.name} isCapturing={isProcessing} />

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
              <span>Pastikan pencahayaan cukup dan wajah terlihat jelas.</span>
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(true)}
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                Ajukan Izin / Sakit
              </button>
            </div>
          </div>

          {/* Right Column: GPS Geotagging & Attendance Action Buttons */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Status Lokasi & Presensi
                </h3>
                <button
                  type="button"
                  onClick={updateGpsLocation}
                  disabled={isLoadingGps}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition text-xs font-semibold flex items-center gap-1"
                  title="Perbarui GPS"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGps ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh GPS</span>
                </button>
              </div>

              {/* Geotagging Status Box */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Koordinat Anda:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {currentGps.lat.toFixed(5)}, {currentGps.lng.toFixed(5)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Jarak ke Kantor:</span>
                  <span className="font-semibold text-slate-800">
                    {formatDistance(currentGps.distance)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                  <span className="text-slate-500">Status Geofencing:</span>
                  <div className="flex items-center gap-1.5 font-semibold">
                    {currentGps.isWithinRadius ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Dalam Radius Kantor ({officeSettings.radiusMeters}m)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Luar Kantor / WFH
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-1 text-right">
                  <a
                    href={getGoogleMapsUrl(currentGps.lat, currentGps.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Lihat Lokasi di Google Maps
                  </a>
                </div>
              </div>

              {/* Today's Status Banner */}
              <div className="rounded-xl p-4 border text-xs">
                {!todayRecord ? (
                  <div className="bg-blue-50/70 border-blue-200 text-blue-900 rounded-lg p-3">
                    <p className="font-semibold mb-1">Status Hari Ini: Belum Melakukan Absensi</p>
                    <p className="text-[11px] text-blue-700">
                      Silakan tekan tombol <strong>Absen Masuk</strong> di bawah ini untuk memulai jam kerja Anda.
                    </p>
                  </div>
                ) : !todayRecord.clockOutTime ? (
                  <div className="bg-emerald-50/80 border-emerald-200 text-emerald-900 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Sudah Absen Masuk
                      </span>
                      <span className="font-mono font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px]">
                        {todayRecord.clockInTime} WIB
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Status: <strong>{todayRecord.status}</strong> · {todayRecord.isWithinOfficeRadius ? 'Dalam Kantor' : 'Luar Kantor'}.
                      Lakukan Absen Keluar saat jam kerja Anda berakhir.
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-100 border-slate-200 text-slate-800 rounded-lg p-3">
                    <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Presensi Hari Ini Selesai
                    </p>
                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <p>Masuk: <strong className="font-mono text-slate-800">{todayRecord.clockInTime} WIB</strong> ({todayRecord.status})</p>
                      <p>Keluar: <strong className="font-mono text-slate-800">{todayRecord.clockOutTime} WIB</strong></p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons: Clock In & Clock Out */}
            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
              {/* Absen Masuk Button (Hijau) */}
              <button
                type="button"
                onClick={handleClockIn}
                disabled={Boolean(todayRecord) || isProcessing}
                className={`py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 shadow-sm transition ${
                  todayRecord
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white shadow-emerald-600/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ABSEN MASUK</span>
                </div>
                <span className="text-[10px] font-normal opacity-90">
                  {todayRecord ? 'Sudah Tercatat' : 'Ambil Selfie & GPS'}
                </span>
              </button>

              {/* Absen Keluar Button (Merah) */}
              <button
                type="button"
                onClick={handleClockOut}
                disabled={!todayRecord || Boolean(todayRecord?.clockOutTime) || isProcessing}
                className={`py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 shadow-sm transition ${
                  !todayRecord || todayRecord?.clockOutTime
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white shadow-rose-600/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>ABSEN KELUAR</span>
                </div>
                <span className="text-[10px] font-normal opacity-90">
                  {todayRecord?.clockOutTime
                    ? 'Sudah Selesai'
                    : !todayRecord
                    ? 'Belum Masuk'
                    : 'Selesai Jam Kerja'}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Riwayat Absensi Saya Table */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Riwayat Absensi Saya
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar catatan kehadiran Anda di sistem PresensiPro
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 self-start sm:self-auto">
              Total {historyRecords.length} Catatan
            </span>
          </div>

          <div className="overflow-x-auto -mx-5 sm:mx-0">
            <table className="w-full text-xs text-left min-w-[640px]">
              <thead className="bg-slate-50 text-slate-600 border-y sm:border sm:rounded-lg border-slate-200">
                <tr>
                  <th className="p-3.5 font-semibold">Tanggal</th>
                  <th className="p-3.5 font-semibold">Jam Masuk</th>
                  <th className="p-3.5 font-semibold">Jam Keluar</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 font-semibold">Lokasi GPS</th>
                  <th className="p-3.5 font-semibold text-center">Foto Selfie</th>
                  <th className="p-3.5 font-semibold">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Belum ada riwayat absensi. Silakan lakukan absen masuk di atas.
                    </td>
                  </tr>
                ) : (
                  historyRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5 font-semibold text-slate-800">
                        {rec.date === getTodayDateString() ? (
                          <span className="text-blue-600 font-bold">Hari Ini ({rec.date})</span>
                        ) : (
                          rec.date
                        )}
                      </td>
                      <td className="p-3.5 font-mono font-semibold text-emerald-600 tabular-nums">
                        {rec.clockInTime ? `${rec.clockInTime} WIB` : '-'}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 tabular-nums">
                        {rec.clockOutTime ? `${rec.clockOutTime} WIB` : '-'}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                            rec.status === 'Tepat Waktu'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : rec.status === 'Terlambat'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <span className="font-mono text-[11px] text-slate-700">
                            {rec.locationIn?.lat?.toFixed(4)}, {rec.locationIn?.lng?.toFixed(4)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDistance(rec.distanceFromOfficeMeters)} dari kantor
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {rec.photoIn && (
                            <button
                              type="button"
                              onClick={() => setSelectedPhotoRecord({ record: rec, type: 'in' })}
                              className="relative group p-0.5 rounded-lg border border-slate-200 hover:border-blue-400 transition"
                              title="Lihat Foto Masuk"
                            >
                              <img
                                src={rec.photoIn}
                                alt="Selfie In"
                                className="w-8 h-8 rounded-md object-cover"
                              />
                            </button>
                          )}
                          {rec.photoOut && (
                            <button
                              type="button"
                              onClick={() => setSelectedPhotoRecord({ record: rec, type: 'out' })}
                              className="relative group p-0.5 rounded-lg border border-slate-200 hover:border-rose-400 transition"
                              title="Lihat Foto Keluar"
                            >
                              <img
                                src={rec.photoOut}
                                alt="Selfie Out"
                                className="w-8 h-8 rounded-md object-cover"
                              />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-500 max-w-xs truncate text-[11px]">
                        {rec.notes || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Photo Modal */}
      {selectedPhotoRecord && (
        <PhotoModal
          record={selectedPhotoRecord.record}
          photoType={selectedPhotoRecord.type}
          onClose={() => setSelectedPhotoRecord(null)}
        />
      )}

      {/* Leave Application Modal */}
      <LeaveModal
        employee={employee}
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSubmitted={() => refreshRecords()}
      />
    </div>
  );
};
