import React, { useState, useRef } from 'react';
import { Upload, Link2 } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

/**
 * Shared Product Image Upload & URL Field Component
 * Supports direct device file upload (PNG, JPG, WEBP, GIF), drag-and-drop, live preview, and URL fallback
 */
export default function ProductImageUploadField({ label = 'Cover Image', value, onChange, required = false }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const handleFileProcess = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast?.('Please select a valid image file (PNG, JPG, WEBP, GIF)', 'error');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      showToast?.('Image size exceeds 15MB limit', 'error');
      return;
    }

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;
        try {
          // Attempt server upload
          const res = await api.admin.uploadImage({
            image: base64Data,
            filename: file.name,
          });
          if (res?.success && res.url) {
            onChange(res.url);
            showToast?.('Image uploaded successfully!', 'success');
          } else {
            // Fallback directly to base64 Data URL so user is never blocked
            onChange(base64Data);
            showToast?.('Image loaded successfully', 'info');
          }
        } catch (apiErr) {
          // Fallback to base64 Data URL
          onChange(base64Data);
          showToast?.('Image loaded directly', 'info');
        } finally {
          setUploading(false);
        }
      };
      reader.onerror = () => {
        showToast?.('Failed to read image file', 'error');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showToast?.(err.message || 'Image processing failed', 'error');
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-slate-300 font-semibold text-xs tracking-wide">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold transition-colors cursor-pointer"
          >
            Clear Image
          </button>
        )}
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const files = e.dataTransfer.files;
          if (files && files[0]) handleFileProcess(files[0]);
        }}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
          dragOver
            ? 'border-purple-500 bg-purple-500/10'
            : value
            ? 'border-emerald-500/40 bg-[#090e1c]'
            : 'border-white/10 hover:border-purple-500/40 bg-[#070b16]'
        }`}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileProcess(file);
          }}
        />

        {value ? (
          <div className="flex items-center gap-4 w-full">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-black/60 border border-white/10 shrink-0 shadow-md">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/card-rockstar-hd.png';
                }}
              />
            </div>
            <div className="flex-1 text-left min-w-0">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-block mb-1">
                ✓ Image Ready
              </span>
              <p className="text-xs text-slate-300 truncate font-mono">{value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Click box to browse a different image file or paste URL below
              </p>
            </div>
          </div>
        ) : (
          <div className="py-2 space-y-1">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-2">
              {uploading ? (
                <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
            </div>
            <p className="text-xs font-bold text-white">
              {uploading ? 'Uploading & Processing Image...' : 'Click to Upload Image from Device or Drag & Drop'}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">Supports PNG, JPG, WEBP, GIF</p>
          </div>
        )}
      </div>

      {/* Or Paste Direct Image URL */}
      <div className="relative">
        <input
          type="text"
          value={value}
          required={required && !value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste image URL (https://... or /uploads/...)"
          className="w-full pl-9 pr-4 py-2 bg-[#06080F] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all font-mono"
        />
        <Link2 className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
}
