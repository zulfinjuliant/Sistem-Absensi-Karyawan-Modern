import React, { useState } from 'react';
import { X, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, Employee } from '../types/attendance';
import { getTodayDateString, addAttendanceRecord, generateSelfieDataUri } from '../services/storage';
import { DEFAULT_OFFICE_COORDS } from '../utils/geo';
import { playChime } from '../utils/audio';

interface LeaveModalProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export const LeaveModal: React.FC<LeaveModalProps> = ({
  employee,
  isOpen,
  onClose,
  onSubmitted,
}) => {
  const [type, setType] = useState<AttendanceStatus>('Izin');
  const [date, setDate] = useState(getTodayDateString());
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const record: AttendanceRecord = {
      id: `ATT-LEAVE-${Date.now()}`,
      employeeId: employee.id,
      employeeNik: employee.nik,
      employeeName: employee.name,
      department: employee.department,
      date: date,
      clockInTime: timeStr,
      clockOutTime: timeStr,
      status: type,
      photoIn: generateSelfieDataUri(employee.name, `${date} ${timeStr}`, `STATUS: ${type.toUpperCase()}`, '#64748B'),
      photoOut: null,
      locationIn: {
        lat: DEFAULT_OFFICE_COORDS.lat,
        lng: DEFAULT_OFFICE_COORDS.lng,
        address: 'Permohonan Daring',
      },
      locationOut: null,
      distanceFromOfficeMeters: 0,
      isWithinOfficeRadius: true,
      notes: `${type}: ${reason}`,
      deviceInfo: navigator.userAgent.slice(0, 30),
    };

    setTimeout(() => {
      addAttendanceRecord(record);
      playChime('success');
      setIsSubmitting(false);
      onSubmitted();
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pengajuan Izin / Sakit / Cuti</h3>
              <p className="text-xs text-slate-500">{employee.name} ({employee.nik})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Jenis Permohonan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Izin', 'Sakit', 'Cuti'] as AttendanceStatus[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition ${
                    type === t
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Efektif
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs p-2.5 pl-9 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alasan / Keterangan Lengkap
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan alasan izin atau melampirkan keterangan..."
              rows={3}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isSubmitting ? 'Mengirim...' : 'Kirim Permohonan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
