'use client';

import { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Calendar, Briefcase } from 'lucide-react';
import { useTranslations } from 'next-intl';
import useSetupWizardStore from '@/stores/setupWizardStore';
import StaffAvatar from '@/components/shared/StaffAvatar';
import StaffModal from '@/components/modals/StaffModal';

function StaffCard({ staffMember, onEdit, onDelete }) {
  const t = useTranslations('settings.staff.availability');

  const getAvailabilitySummary = (availability) => {
    if (availability?.useBusinessHours !== false) {
      return t('businessHours');
    }
    if (!availability?.custom) return t('notSet');

    const activeDays = Object.entries(availability.custom)
      .filter(([_, hours]) => !hours.closed)
      .map(([day, _]) => day);

    if (activeDays.length === 0) return t('noAvailability');
    if (activeDays.length === 7) return t('allWeek');
    return t('daysPerWeek', { count: activeDays.length });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <StaffAvatar
          photo={staffMember.photo}
          name={staffMember.name}
          size="lg"
        />

        {/* Info */}
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 text-lg">{staffMember.name}</h3>
          {staffMember.specialty && (
            <div className="flex items-center gap-1.5 text-sm text-orange-600 mt-1">
              <Briefcase className="w-4 h-4" />
              <span>{staffMember.specialty}</span>
            </div>
          )}
          {staffMember.description && (
            <p className="text-sm text-slate-600 mt-2">{staffMember.description}</p>
          )}
          <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-2">
            <Calendar className="w-4 h-4" />
            <span>{getAvailabilitySummary(staffMember.availability)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(staffMember)}
            className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(staffMember.id)}
            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StaffStep() {
  const t = useTranslations('settings.staff');
  const staff = useSetupWizardStore((state) => state.staff);
  const addStaff = useSetupWizardStore((state) => state.addStaff);
  const updateStaff = useSetupWizardStore((state) => state.updateStaff);
  const deleteStaff = useSetupWizardStore((state) => state.deleteStaff);

  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const handleSave = (staffData) => {
    if (editingStaff) {
      updateStaff(editingStaff.id, staffData);
    } else {
      addStaff(staffData);
    }
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStaff(null);
  };

  const handleAddClick = () => {
    setEditingStaff(null);
    setShowModal(true);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{t('title')}</h2>
                <p className="text-orange-50 text-sm mt-1">
                  {t('subtitle')}
                </p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white font-semibold">{t('count', { count: staff.length })}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Info */}
          {staff.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {t('emptyTitle')}
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {t('emptyDescription')}
              </p>
            </div>
          )}

          {/* Staff list */}
          {staff.length > 0 && (
            <div className="space-y-3">
              {staff.map((member) => (
                <StaffCard
                  key={member.id}
                  staffMember={member}
                  onEdit={handleEdit}
                  onDelete={deleteStaff}
                />
              ))}
            </div>
          )}

          {/* Add button */}
          <button
            onClick={handleAddClick}
            className="w-full border-2 border-dashed border-slate-300 rounded-xl px-6 py-4 text-slate-600 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            {t('addButton')}
          </button>
        </div>
      </div>

      {/* Staff Modal */}
      <StaffModal
        isOpen={showModal}
        onClose={handleCloseModal}
        staffMember={editingStaff}
        onSave={handleSave}
      />
    </div>
  );
}
