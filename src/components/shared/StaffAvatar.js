'use client';

import { useState } from 'react';
import { User, Upload, X } from 'lucide-react';

export default function StaffAvatar({
  photo,
  name,
  size = 'md',
  editable = false,
  onChange
}) {
  const [isHovering, setIsHovering] = useState(false);

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

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onChange) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
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
    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 text-white font-semibold">
      {name ? getInitials(name) : <User className={iconSizes[size]} />}
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
          accept="image/*"
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
