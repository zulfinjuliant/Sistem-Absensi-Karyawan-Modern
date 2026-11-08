import React, { useState } from 'react';
import {
  Fingerprint,
  User,
  ShieldCheck,
  ArrowRight,
  Lock,
  Building2,
  Sparkles,
} from 'lucide-react';
import { Employee, UserRole } from '../types/attendance';
import { getEmployees } from '../services/storage';

interface LoginViewProps {
  onLoginSuccess: (role: UserRole, employee?: Employee) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [role, setRole] = useState<UserRole>('karyawan');
  const [employees] = useState<Employee[]>(getEmployees());
  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    employees.length > 0 ? employees[0].id : ''
  );
  const [password, setPassword] = useState('123456');

  // Admin credentials
  const [adminUser, setAdminUser] = useState('admin');
  const [adminPass, setAdminPass] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');

  const handleKaryawanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const targetEmp = employees.find((emp) => emp.id === selectedEmpId);
    if (!targetEmp) {
      setErrorMsg('Silakan pilih akun karyawan yang valid.');
      return;
    }
    onLoginSuccess('karyawan', targetEmp);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (adminUser.toLowerCase() === 'admin' && adminPass === 'admin123') {
      onLoginSuccess('admin');
    } else {
      setErrorMsg('Username atau password admin salah (Gunakan admin / admin123).');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle modern corporate ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-8 sm:p-9 flex flex-col">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-600/25">
            <Fingerprint className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">PresensiPro</h1>
          <p className="text-xs text-slate-500 mt-1">
            Sistem Absensi Karyawan Modern · Selfie & Geotagging GPS
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setRole('karyawan');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              role === 'karyawan'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Karyawan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('admin');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              role === 'admin'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin HR</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Form Karyawan */}
        {role === 'karyawan' && (
          <form onSubmit={handleKaryawanSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pilih Akun Karyawan
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} — {emp.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">PIN / Password</label>
                <span className="text-[11px] text-slate-400">Default: 123456</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs p-3 pl-9 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition"
            >
              <span>Masuk ke Presensi Karyawan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Form Admin */}
        {role === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username Admin
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full text-xs p-3 pl-9 rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <span className="text-[11px] text-slate-400">Default: admin123</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full text-xs p-3 pl-9 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md shadow-slate-900/20 flex items-center justify-center gap-2 transition"
            >
              <span>Masuk Dashboard Admin</span>
              <ShieldCheck className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer Demo Notes */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            PT Digital Presensi
          </span>
          <span className="flex items-center gap-1 font-mono">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Demo Mode Siap Pakai
          </span>
        </div>
      </div>
    </div>
  );
};
