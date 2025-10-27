'use client';

import { useState } from 'react';
import { User, Upload, X } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function StaffAvatar({
  photo,
  name,
  size = 'md',
  editable = false,
  onChange
}) {
  const [isHovering, setIsHovering] = useState(false);
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !onChange) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, WebP, or GIF)');
      return;
    }

    // Check file size (1MB = 1,048,576 bytes)
    const maxSize = 1048576; // 1MB
    if (file.size > maxSize) {
      const sizeMB = (file.size / 1048576).toFixed(2);
      toast.error(`Image is too large (${sizeMB}MB). Maximum size is 1MB`);
      return;
    }

    // Read and convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result);
      toast.success('Photo uploaded successfully');
    };
    reader.onerror = () => {
      toast.error('Failed to upload photo. Please try again');
    };
    reader.readAsDataURL(file);
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
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 border-2 border-slate-200 cursor-pointer relative block group`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {avatarContent}

        {/* Hover overlay */}
        {isHovering && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Upload className="w-6 h-6 text-white" />
          </div>
        )}

        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* Remove button */}
      {photo && (
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
