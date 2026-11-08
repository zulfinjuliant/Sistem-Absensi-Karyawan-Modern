export type UserRole = 'admin' | 'karyawan';

export interface Employee {
  id: string;
  name: string;
  nik: string;
  email: string;
  department: string;
  position: string;
  avatar: string;
  status: 'Aktif' | 'Cuti' | 'Nonaktif';
  phone: string;
  joinDate: string;
}

export type AttendanceStatus = 'Tepat Waktu' | 'Terlambat' | 'Izin' | 'Cuti' | 'Sakit';

export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  address?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeNik: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  clockInTime: string; // HH:mm:ss
  clockOutTime: string | null; // HH:mm:ss or null
  status: AttendanceStatus;
  photoIn: string; // base64 or SVG data URI
  photoOut: string | null;
  locationIn: GeoLocation;
  locationOut: GeoLocation | null;
  distanceFromOfficeMeters: number;
  isWithinOfficeRadius: boolean;
  notes: string;
  deviceInfo: string;
}

export interface OfficeSettings {
  officeName: string;
  officeAddress: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  workStartTime: string; // HH:mm e.g. "08:30"
  lateThresholdMinutes: number; // e.g. 15
  workEndTime: string; // HH:mm e.g. "17:00"
}
