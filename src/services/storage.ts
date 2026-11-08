import { AttendanceRecord, Employee, OfficeSettings } from '../types/attendance';
import { DEFAULT_OFFICE_COORDS } from '../utils/geo';

const STORAGE_KEYS = {
  EMPLOYEES: 'presensipro_employees_v1',
  ATTENDANCE: 'presensipro_attendance_v1',
  OFFICE: 'presensipro_office_settings_v1',
  CURRENT_USER: 'presensipro_current_user_v1',
  INITIALIZED: 'presensipro_initialized_v1',
};

export const INITIAL_OFFICE_SETTINGS: OfficeSettings = {
  officeName: 'Kantor Pusat PT Digital Presensi Nusantara',
  officeAddress: 'Menara Sudirman Lt. 18, Jl. Jend. Sudirman Kav. 60, Jakarta Selatan',
  latitude: DEFAULT_OFFICE_COORDS.lat,
  longitude: DEFAULT_OFFICE_COORDS.lng,
  radiusMeters: 150,
  workStartTime: '08:30',
  lateThresholdMinutes: 15,
  workEndTime: '17:00',
};

// Generates a self-contained SVG portrait data URI for employee avatars & selfies
export function generateSelfieDataUri(
  name: string,
  timeStr: string,
  status: string,
  accentColor = '#2563EB'
): string {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1E293B" />
        <stop offset="100%" stop-color="#0F172A" />
      </linearGradient>
      <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${accentColor}" />
        <stop offset="100%" stop-color="#1D4ED8" />
      </linearGradient>
    </defs>
    <!-- Background simulate office / camera view -->
    <rect width="400" height="400" fill="url(#bg)" />
    <!-- Grid overlay subtle -->
    <path d="M0 100 H400 M0 200 H400 M0 300 H400 M100 0 V400 M200 0 V400 M300 0 V400" stroke="#334155" stroke-width="0.7" opacity="0.3" />
    
    <!-- User portrait silhouette -->
    <circle cx="200" cy="150" r="70" fill="url(#avatarGrad)" />
    <path d="M80 340 C80 260 140 240 200 240 C260 240 320 260 320 340 Z" fill="url(#avatarGrad)" opacity="0.9" />
    <text x="200" y="165" font-family="Arial, sans-serif" font-size="44" font-weight="bold" fill="#ffffff" text-anchor="middle">${initials}</text>
    
    <!-- Camera viewfinder indicators -->
    <path d="M20 50 V20 H50 M350 20 H380 V50 M20 350 V380 H50 M350 380 H380 V350" stroke="#38BDF8" stroke-width="3" fill="none" opacity="0.8" />
    
    <!-- Watermark timestamp badge -->
    <rect x="20" y="325" width="360" height="55" rx="8" fill="#020617" opacity="0.88" />
    <circle cx="38" cy="352" r="6" fill="#10B981" />
    <text x="52" y="347" font-family="Courier, monospace" font-size="12" font-weight="bold" fill="#38BDF8">LIVE VERIFIED SELFIE</text>
    <text x="52" y="365" font-family="Courier, monospace" font-size="13" font-weight="bold" fill="#F8FAFC">${timeStr} • ${status}</text>
    <text x="365" y="356" font-family="Courier, monospace" font-size="11" fill="#94A3B8" text-anchor="end">GPS GEO-TAGGED</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-001',
    nik: '20240101',
    name: 'Ahmad Pratama',
    email: 'ahmad.pratama@presensipro.id',
    department: 'Teknologi Informasi (IT)',
    position: 'Senior Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'Aktif',
    phone: '0812-3456-7890',
    joinDate: '2023-01-15',
  },
  {
    id: 'EMP-002',
    nik: '20240102',
    name: 'Siti Rahmawati',
    email: 'siti.rahmawati@presensipro.id',
    department: 'Human Resources (HR)',
    position: 'HR People Operations',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    status: 'Aktif',
    phone: '0813-8899-7711',
    joinDate: '2023-03-01',
  },
  {
    id: 'EMP-003',
    nik: '20240103',
    name: 'Budi Santoso',
    email: 'budi.santoso@presensipro.id',
    department: 'Operasional',
    position: 'Operations Manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'Aktif',
    phone: '0819-1234-5678',
    joinDate: '2022-08-10',
  },
  {
    id: 'EMP-004',
    nik: '20240104',
    name: 'Dewi Lestari',
    email: 'dewi.lestari@presensipro.id',
    department: 'Keuangan & Akuntansi',
    position: 'Financial Analyst',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'Aktif',
    phone: '0857-7788-9900',
    joinDate: '2023-06-20',
  },
  {
    id: 'EMP-005',
    nik: '20240105',
    name: 'Rizky Firmansyah',
    email: 'rizky.firmansyah@presensipro.id',
    department: 'Pemasaran & Kreatif',
    position: 'Digital Marketing Lead',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'Aktif',
    phone: '0878-1122-3344',
    joinDate: '2023-11-01',
  },
  {
    id: 'EMP-006',
    nik: '20240106',
    name: 'Nadya Putri',
    email: 'nadya.putri@presensipro.id',
    department: 'Teknologi Informasi (IT)',
    position: 'UI/UX Product Designer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'Aktif',
    phone: '0821-5566-7788',
    joinDate: '2024-02-15',
  },
];

// Helper to get today's date formatted as YYYY-MM-DD in local time
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createSampleAttendanceRecords(): AttendanceRecord[] {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  return [
    {
      id: 'ATT-TODAY-001',
      employeeId: 'EMP-001',
      employeeNik: '20240101',
      employeeName: 'Ahmad Pratama',
      department: 'Teknologi Informasi (IT)',
      date: today,
      clockInTime: '08:14:22',
      clockOutTime: null,
      status: 'Tepat Waktu',
      photoIn: generateSelfieDataUri('Ahmad Pratama', `${today} 08:14:22`, 'TEPAT WAKTU', '#2563EB'),
      photoOut: null,
      locationIn: {
        lat: -6.22381,
        lng: 106.80935,
        accuracy: 12,
        address: 'Menara Sudirman Lt. 18 (Area Kantor)',
      },
      locationOut: null,
      distanceFromOfficeMeters: 28,
      isWithinOfficeRadius: true,
      notes: 'Hadir tepat waktu, siap sprint planning mingguan',
      deviceInfo: 'Chrome / Windows 11',
    },
    {
      id: 'ATT-TODAY-002',
      employeeId: 'EMP-002',
      employeeNik: '20240102',
      employeeName: 'Siti Rahmawati',
      department: 'Human Resources (HR)',
      date: today,
      clockInTime: '08:26:05',
      clockOutTime: null,
      status: 'Tepat Waktu',
      photoIn: generateSelfieDataUri('Siti Rahmawati', `${today} 08:26:05`, 'TEPAT WAKTU', '#059669'),
      photoOut: null,
      locationIn: {
        lat: -6.2239,
        lng: 106.80928,
        accuracy: 15,
        address: 'Lobi Menara Sudirman',
      },
      locationOut: null,
      distanceFromOfficeMeters: 45,
      isWithinOfficeRadius: true,
      notes: 'Interview kandidat batch 4',
      deviceInfo: 'Safari / iPhone 15 Pro',
    },
    {
      id: 'ATT-TODAY-003',
      employeeId: 'EMP-003',
      employeeNik: '20240103',
      employeeName: 'Budi Santoso',
      department: 'Operasional',
      date: today,
      clockInTime: '08:52:19',
      clockOutTime: null,
      status: 'Terlambat',
      photoIn: generateSelfieDataUri('Budi Santoso', `${today} 08:52:19`, 'TERLAMBAT (+22m)', '#D97706'),
      photoOut: null,
      locationIn: {
        lat: -6.22375,
        lng: 106.80942,
        accuracy: 20,
        address: 'Menara Sudirman Lantai 18',
      },
      locationOut: null,
      distanceFromOfficeMeters: 35,
      isWithinOfficeRadius: true,
      notes: 'Terlambat karena kendala armada transportasi pagi',
      deviceInfo: 'Chrome / Android 14',
    },
    {
      id: 'ATT-TODAY-004',
      employeeId: 'EMP-004',
      employeeNik: '20240104',
      employeeName: 'Dewi Lestari',
      department: 'Keuangan & Akuntansi',
      date: today,
      clockInTime: '08:05:40',
      clockOutTime: null,
      status: 'Tepat Waktu',
      photoIn: generateSelfieDataUri('Dewi Lestari', `${today} 08:05:40`, 'TEPAT WAKTU', '#7C3AED'),
      photoOut: null,
      locationIn: {
        lat: -6.22382,
        lng: 106.80931,
        accuracy: 10,
        address: 'Menara Sudirman Lt. 18',
      },
      locationOut: null,
      distanceFromOfficeMeters: 18,
      isWithinOfficeRadius: true,
      notes: 'Rekonsiliasi invoice vendor bulanan',
      deviceInfo: 'Edge / Windows 11',
    },
    {
      id: 'ATT-YEST-001',
      employeeId: 'EMP-001',
      employeeNik: '20240101',
      employeeName: 'Ahmad Pratama',
      department: 'Teknologi Informasi (IT)',
      date: yesterday,
      clockInTime: '08:20:11',
      clockOutTime: '17:15:44',
      status: 'Tepat Waktu',
      photoIn: generateSelfieDataUri('Ahmad Pratama', `${yesterday} 08:20:11`, 'MASUK', '#2563EB'),
      photoOut: generateSelfieDataUri('Ahmad Pratama', `${yesterday} 17:15:44`, 'PULANG', '#1E40AF'),
      locationIn: {
        lat: -6.22384,
        lng: 106.80932,
        accuracy: 14,
        address: 'Menara Sudirman Lt. 18',
      },
      locationOut: {
        lat: -6.22388,
        lng: 106.8093,
        accuracy: 16,
        address: 'Menara Sudirman Lantai 18',
      },
      distanceFromOfficeMeters: 22,
      isWithinOfficeRadius: true,
      notes: 'Selesai tugas deployment sprint v2.4',
      deviceInfo: 'Chrome / Windows 11',
    },
    {
      id: 'ATT-YEST-002',
      employeeId: 'EMP-005',
      employeeNik: '20240105',
      employeeName: 'Rizky Firmansyah',
      department: 'Pemasaran & Kreatif',
      date: yesterday,
      clockInTime: '08:18:30',
      clockOutTime: '17:02:10',
      status: 'Tepat Waktu',
      photoIn: generateSelfieDataUri('Rizky Firmansyah', `${yesterday} 08:18:30`, 'MASUK', '#0D9488'),
      photoOut: generateSelfieDataUri('Rizky Firmansyah', `${yesterday} 17:02:10`, 'PULANG', '#0F766E'),
      locationIn: {
        lat: -6.2238,
        lng: 106.80935,
        accuracy: 18,
        address: 'Menara Sudirman Lt. 18',
      },
      locationOut: {
        lat: -6.22385,
        lng: 106.8093,
        accuracy: 15,
        address: 'Menara Sudirman Lt. 18',
      },
      distanceFromOfficeMeters: 30,
      isWithinOfficeRadius: true,
      notes: 'Campaign launching kuartal 4',
      deviceInfo: 'Chrome / MacOS',
    },
  ];
}

export function initStorage(): void {
  try {
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!initialized) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(createSampleAttendanceRecords()));
      localStorage.setItem(STORAGE_KEYS.OFFICE, JSON.stringify(INITIAL_OFFICE_SETTINGS));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  } catch (err) {
    console.error('LocalStorage init error:', err);
  }
}

export function getEmployees(): Employee[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return data ? JSON.parse(data) : INITIAL_EMPLOYEES;
  } catch {
    return INITIAL_EMPLOYEES;
  }
}

export function saveEmployees(employees: Employee[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  } catch (e) {
    console.error('Error saving employees:', e);
  }
}

export function addEmployee(newEmp: Omit<Employee, 'id'>): Employee {
  const employees = getEmployees();
  const idNum = employees.length + 1;
  const created: Employee = {
    ...newEmp,
    id: `EMP-${String(idNum).padStart(3, '0')}`,
  };
  employees.push(created);
  saveEmployees(employees);
  return created;
}

export function getAttendanceLogs(): AttendanceRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveAttendanceLogs(logs: AttendanceRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving attendance logs:', e);
  }
}

export function addAttendanceRecord(record: AttendanceRecord): void {
  const logs = getAttendanceLogs();
  // Prepend so latest appears first
  logs.unshift(record);
  saveAttendanceLogs(logs);
}

export function updateAttendanceRecord(updated: AttendanceRecord): void {
  const logs = getAttendanceLogs();
  const index = logs.findIndex((l) => l.id === updated.id);
  if (index !== -1) {
    logs[index] = updated;
    saveAttendanceLogs(logs);
  }
}

export function getTodayAttendanceForEmployee(employeeId: string): AttendanceRecord | undefined {
  const today = getTodayDateString();
  const logs = getAttendanceLogs();
  return logs.find((l) => l.employeeId === employeeId && l.date === today);
}

export function getOfficeSettings(): OfficeSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.OFFICE);
    return data ? JSON.parse(data) : INITIAL_OFFICE_SETTINGS;
  } catch {
    return INITIAL_OFFICE_SETTINGS;
  }
}

export function saveOfficeSettings(settings: OfficeSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.OFFICE, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving office settings:', e);
  }
}

export function resetAllToSampleData(): void {
  localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(createSampleAttendanceRecords()));
  localStorage.setItem(STORAGE_KEYS.OFFICE, JSON.stringify(INITIAL_OFFICE_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}
