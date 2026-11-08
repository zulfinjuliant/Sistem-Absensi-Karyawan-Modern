import React from 'react';
import { X, MapPin, Calendar, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import { AttendanceRecord } from '../types/attendance';
import { getGoogleMapsUrl, formatDistance } from '../utils/geo';

interface PhotoModalProps {
  record: AttendanceRecord | null;
  photoType: 'in' | 'out';
  onClose: () => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({ record, photoType, onClose }) => {
  if (!record) return null;

  const photo = photoType === 'in' ? record.photoIn : record.photoOut;
  const time = photoType === 'in' ? record.clockInTime : record.clockOutTime;
  const location = photoType === 'in' ? record.locationIn : record.locationOut;
  const typeLabel = photoType === 'in' ? 'Absen Masuk' : 'Absen Keluar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Bukti Foto Selfie ({typeLabel})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {record.employeeName} · {record.department}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Container */}
        <div className="p-5 flex flex-col items-center">
          <div className="w-full aspect-square max-w-sm rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm relative">
            {photo ? (
              <img
                src={photo}
                alt={`Selfie ${record.employeeName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                Foto tidak tersedia
              </div>
            )}
          </div>

          {/* Verification Details */}
          <div className="w-full mt-4 space-y-2.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="w-4 h-4 text-blue-500" /> Tanggal
              </span>
              <span className="font-semibold text-slate-800">{record.date}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Clock className="w-4 h-4 text-blue-500" /> Waktu Presensi
              </span>
              <span className="font-semibold text-slate-800 font-mono">{time || '-'} WIB</span>
            </div>

            {location && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="w-4 h-4 text-emerald-500" /> Koordinat GPS
                </span>
                <span className="font-mono text-slate-800">
                  {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Jarak dari Kantor:</span>
              <span className="font-medium text-slate-800">
                {formatDistance(record.distanceFromOfficeMeters)}{' '}
                <span
                  className={
                    record.isWithinOfficeRadius
                      ? 'text-emerald-600 font-semibold'
                      : 'text-amber-600 font-semibold'
                  }
                >
                  ({record.isWithinOfficeRadius ? 'Dalam Radius' : 'Di Luar Radius'})
                </span>
              </span>
            </div>

            {record.notes && (
              <div className="pt-2 border-t border-slate-200/60 text-slate-600">
                <span className="font-medium text-slate-700">Catatan:</span> {record.notes}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          {location ? (
            <a
              href={getGoogleMapsUrl(location.lat, location.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Buka di Google Maps
            </a>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
