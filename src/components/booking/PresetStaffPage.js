'use client';

import { Check } from 'lucide-react';
import StaffAvatar from '@/components/shared/StaffAvatar';
import { useTranslations } from 'next-intl';

export default function PresetStaffPage({ page, staff, selectedStaffId, onSelect }) {
  const t = useTranslations('booking.staff');
  const allStaffOptions = [
    ...staff,
    {
      id: 'any',
      name: t('anyStaff'),
      specialty: t('anyStaffDescription'),
      photo: '',
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">{page.title}</h2>

      <div className="space-y-3">
        {allStaffOptions.map((member) => {
          const isSelected = selectedStaffId === member.id;

          return (
            <button
              key={member.id}
              onClick={() => onSelect(member.id)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-orange-500 bg-orange-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-orange-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Selection indicator */}
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-orange-500 bg-orange-500'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>

                {/* Avatar */}
                <StaffAvatar photo={member.photoUrl || member.photo} name={member.name} size="lg" />

                {/* Staff details */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 text-lg">
                    {member.name}
                  </div>
                  {member.specialty && (
                    <p className="text-sm text-slate-600">{member.specialty}</p>
                  )}
                  {member.description && (
                    <p className="text-sm text-slate-500 mt-1">{member.description}</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
