/**
 * BusinessPicker Component
 * Dropdown to switch between businesses in the navbar
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Store, Plus, Search, Loader2 } from 'lucide-react';

export default function BusinessPicker({ businesses, currentBusinessId }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const dropdownRef = useRef(null);
  const searchTimerRef = useRef(null);

  const currentBusiness = businesses.find((b) => b.id === currentBusinessId);

  // Determine which businesses to display
  const displayedBusinesses = searchQuery.trim().length > 0 ? searchResults : businesses.slice(0, 5);
  const showingCount = displayedBusinesses.length;
  const totalBusinesses = searchQuery.trim().length > 0 ? totalCount : businesses.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Debounced search function
  const performSearch = async (query) => {
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      setTotalCount(0);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(`/api/businesses/list?q=${encodeURIComponent(query)}&limit=5`);

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.businesses || []);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.error('Business search error:', error);
      setSearchResults([]);
      setTotalCount(0);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // Show loading state immediately when user types
    if (value.trim().length > 0) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }

    // Debounce search by 300ms
    searchTimerRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleSelectBusiness = (businessId) => {
    setIsOpen(false);
    setSearchQuery('');
    router.push(`/dashboard/${businessId}`);
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    setSearchQuery('');
    router.push('/setup/new');
  };

  if (!currentBusiness) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <div className="w-14 h-14 flex items-center justify-center overflow-hidden rounded-lg flex-shrink-0">
          {currentBusiness.logoUrl ? (
            <img
              src={currentBusiness.logoUrl}
              alt={currentBusiness.businessName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Store className="w-6 h-6 text-slate-400" />
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
        <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 left-0">
          <div className="px-4 py-3 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
              Your Businesses
            </p>
            {/* Search input - always visible */}
            <div className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by name or address..."
                className="w-full px-3 py-2 pl-9 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                autoComplete="off"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              {isSearching && (
                <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 animate-spin" />
              )}
            </div>
            {/* Count indicator - show when more than displayed */}
            {totalBusinesses > displayedBusinesses.length && (
              <p className="text-xs text-slate-500">
                Showing {showingCount} of {totalBusinesses} {totalBusinesses === 1 ? 'business' : 'businesses'}
              </p>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isSearching ? (
              // Skeleton loader while searching
              <div className="space-y-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-4">
                    {/* Logo skeleton */}
                    <div className="w-14 h-14 bg-slate-200 rounded-lg animate-pulse flex-shrink-0" />
                    {/* Content skeleton */}
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-slate-200 rounded animate-pulse w-1/2" />
                      <div className="h-3 bg-slate-200 rounded animate-pulse w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayedBusinesses.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <Store className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  {searchQuery.trim().length > 0 ? 'No businesses found' : 'No businesses yet'}
                </p>
              </div>
            ) : (
              displayedBusinesses.map((business) => (
                <button
                  key={business.id}
                  onClick={() => handleSelectBusiness(business.id)}
                  className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 transition-colors ${business.id === currentBusinessId ? 'bg-orange-50' : ''
                    }`}
                >
                <div className="w-14 h-14 flex items-center justify-center overflow-hidden rounded-lg flex-shrink-0">
                  {business.logoUrl ? (
                    <img
                      src={business.logoUrl}
                      alt={business.businessName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p
                    className={`text-base font-medium truncate ${business.id === currentBusinessId
                      ? 'text-orange-600'
                      : 'text-slate-900'
                      }`}
                  >
                    {business.businessName}
                  </p>
                  {business.address && (
                    <p className="text-sm text-slate-500 truncate">
                      {business.address}
                    </p>
                  )}
                  <p className="text-sm text-slate-500">
                    {business._count?.services || 0} services,{' '}
                    {business._count?.staff || 0} staff
                  </p>
                </div>
                {business.id === currentBusinessId && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                )}
              </button>
              ))
            )}
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
