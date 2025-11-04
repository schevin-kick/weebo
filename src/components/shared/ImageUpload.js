'use client';

import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { optimizeImage, validateImageFile } from '@/lib/imageOptimizer';
import { fetchWithCSRF } from '@/hooks/useCSRF';
import { useTranslations } from 'next-intl';

/**
 * Generic image upload component for logos, banners, etc.
 */
export default function ImageUpload({
  imageUrl,
  onChange,
  folder = 'uploads',
  label = 'Upload Image',
  aspectRatio = 'square', // 'square', 'wide', 'tall'
  maxSizeMB = 1,
  size = 'md', // 'sm', 'md', 'lg'
}) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const toast = useToast();
  const t = useTranslations('shared.imageUpload');

  const aspectRatioClasses = {
    square: 'aspect-square',
    wide: 'aspect-video',
    tall: 'aspect-[3/4]',
  };

  const sizeClasses = {
    sm: 'max-w-xs', // 320px
    md: 'max-w-md', // 448px
    lg: 'max-w-lg', // 512px
  };

  const handleFileChange = async (file) => {
    if (!file || !onChange) return;

    // Validate file
    const validation = validateImageFile(file, maxSizeMB);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      setUploading(true);

      // Optimize image before upload
      const optimizedFile = await optimizeImage(file);

      // Upload to R2 via API
      const formData = new FormData();
      formData.append('file', optimizedFile);
      formData.append('folder', folder);

      const response = await fetchWithCSRF('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();

      // Call onChange with R2 public URL
      onChange(data.url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image. Please try again');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    if (onChange) {
      onChange('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>

      <div
        className={`relative ${aspectRatioClasses[aspectRatio]} w-full ${sizeClasses[size]} border-2 ${
          isDragging ? 'border-orange-500 bg-orange-50' : 'border-dashed border-slate-300'
        } rounded-xl overflow-hidden ${uploading ? 'cursor-wait' : 'cursor-pointer'} group`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt="Uploaded"
              className="w-full h-full object-cover"
            />

            {/* Uploading overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* Hover overlay */}
            {!uploading && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="w-8 h-8 text-white" />
              </div>
            )}

            {/* Remove button */}
            {!uploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleRemove();
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg z-10"
                title="Remove image"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleInputChange}
              disabled={uploading}
              className="absolute inset-0 opacity-0 cursor-pointer z-0"
            />
          </>
        ) : (
          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
            {uploading ? (
              <>
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-slate-600">{t('uploading')}</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                  <ImageIcon className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  {t('clickOrDrag')}
                </p>
                <p className="text-xs text-slate-500">
                  {t('fileTypes', { maxSizeMB })}
                </p>
              </>
            )}

            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleInputChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      <p className="text-xs text-slate-500 mt-2">
        {t('optimizationNote')}
      </p>
    </div>
  );
}
