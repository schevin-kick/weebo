/**
 * BusinessPicker Component
 * Dropdown to switch between businesses in the navbar
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Store, Plus } from 'lucide-react';

export default function BusinessPicker({ businesses, currentBusinessId }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentBusiness = businesses.find((b) => b.id === currentBusinessId);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelectBusiness = (businessId) => {
    setIsOpen(false);
    router.push(`/dashboard/${businessId}`);
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    router.push('/setup/new');
  };

  if (!currentBusiness) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center overflow-hidden" style={{ height: '40px', width: 'auto' }}>
          {currentBusiness.logoUrl ? (
            <img
              src={currentBusiness.logoUrl}
              alt={currentBusiness.businessName}
              className="h-full w-auto object-contain"
            />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
        <span className="font-medium text-slate-900 hidden sm:block">
          {currentBusiness.businessName}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''
            }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 left-0">
          <div className="px-3 py-2 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Your Businesses
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {businesses.map((business) => (
              <button
                key={business.id}
                onClick={() => handleSelectBusiness(business.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 transition-colors ${business.id === currentBusinessId ? 'bg-orange-50' : ''
                  }`}
              >
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center overflow-hidden flex-shrink-0" style={{ height: '40px', width: 'auto' }}>
                  {business.logoUrl ? (
                    <img
                      src={business.logoUrl}
                      alt={business.businessName}
                      className="h-full w-auto object-contain"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p
                    className={`font-medium truncate ${business.id === currentBusinessId
                      ? 'text-orange-600'
                      : 'text-slate-900'
                      }`}
                  >
                    {business.businessName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {business._count?.services || 0} services,{' '}
                    {business._count?.staff || 0} staff
                  </p>
                </div>
                {business.id === currentBusinessId && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-200 mt-2 pt-2">
            <button
              onClick={handleCreateNew}
              className="w-full flex items-center gap-2 px-3 py-2 text-orange-600 hover:bg-orange-50 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Create New Business
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
