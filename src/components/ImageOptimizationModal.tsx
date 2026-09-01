'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ImageOptimizationReport, MAX_WEBP_SIZE_BYTES } from '@/lib/utils/imageCompressor';

interface ImageOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAutoOptimizeConfirm?: () => void;
  reports: ImageOptimizationReport[];
  title?: string;
}

export default function ImageOptimizationModal({
  isOpen,
  onClose,
  reports,
}: ImageOptimizationModalProps) {
  if (!isOpen || !reports || reports.length === 0) return null;

  const totalOriginal = reports.reduce((acc, r) => acc + r.originalSize, 0);
  const maxAllowedTotal = reports.length * MAX_WEBP_SIZE_BYTES;
  const excessBytes = Math.max(0, totalOriginal - maxAllowedTotal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-150">
        
        {/* Close Icon Top Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. Yellow File Size Too Large Notice Card */}
        <div className="p-4 bg-amber-50/90 border-2 border-amber-300/80 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-amber-950 font-black text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            File Size Too Large — Action Required
          </div>
          
          <p className="text-xs text-amber-900 leading-relaxed">
            Your uploaded file size is <strong>{formatFileSize(totalOriginal)}</strong>, which exceeds the maximum allowed limit of <strong>300 KB</strong> by <strong>+{formatFileSize(excessBytes)}</strong>.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-200 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-amber-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Required Format</span>
              <span className="font-extrabold text-emerald-800">WebP (.webp)</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-amber-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Maximum Allowed</span>
              <span className="font-extrabold text-slate-900">200 KB – 300 KB</span>
            </div>
          </div>
        </div>

        {/* 2. Uploaded Image Diagnostics Section */}
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Uploaded Image Diagnostics ({reports.length} {reports.length === 1 ? 'file' : 'files'})
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {reports.map((report, idx) => {
              const fileExcess = Math.max(0, report.originalSize - MAX_WEBP_SIZE_BYTES);
              const singleReduction = report.originalSize > 0
                ? Math.round(((report.originalSize - 240 * 1024) / report.originalSize) * 100)
                : 0;

              return (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                      {report.dataUrl ? (
                        <img
                          src={report.dataUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                        {report.fileName || `Image ${idx + 1}`}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Uploaded Size: <span className="text-rose-600 font-bold">{report.originalSizeFormatted}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-rose-200 px-3 py-1.5 rounded-xl text-right shrink-0 w-full sm:w-auto">
                    <span className="text-[10px] uppercase font-black text-rose-600 block">
                      Exceeds limit by +{formatFileSize(fileExcess)}
                    </span>
                    <span className="text-xs font-black text-slate-800">
                      Reduce by ~{Math.max(10, singleReduction)}% to &lt;300KB WebP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition shadow-md flex items-center justify-center"
          >
            Got it, I will reduce & re-upload
          </button>
        </div>

      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
