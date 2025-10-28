'use client';

import { useState } from 'react';
import { User, Upload, X } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { optimizeImage, validateImageFile } from '@/lib/imageOptimizer';

export default function StaffAvatar({
  photo,
  name,
  size = 'md',
  editable = false,
  onChange
}) {
  const [isHovering, setIsHovering] = useState(false);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-16 h-16 text-xl',
    lg: 'w-24 h-24 text-3xl',
    xl: 'w-32 h-32 text-4xl',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !onChange) return;

    // Validate file
    const validation = validateImageFile(file, 1);
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
      formData.append('folder', 'staff-photos');

      const response = await fetch('/api/upload', {
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
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload photo. Please try again');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange('');
    }
  };

  const avatarContent = photo ? (
    <img
      src={photo}
      alt={name || 'Staff'}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 text-white">
      <User className={iconSizes[size]} />
    </div>
  );

  if (!editable) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 border-2 border-slate-200`}>
        {avatarContent}
      </div>
    );
  }

  return (
    <div className="relative">
      <label
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 border-2 border-slate-200 ${uploading ? 'cursor-wait' : 'cursor-pointer'} relative block group`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {avatarContent}

        {/* Uploading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Hover overlay */}
        {isHovering && !uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Upload className="w-6 h-6 text-white" />
          </div>
        )}

        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {/* Remove button */}
      {photo && !uploading && (
        <button
          onClick={handleRemove}
          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
          title="Remove photo"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
