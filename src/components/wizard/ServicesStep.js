'use client';

import { useState } from 'react';
import { Scissors, Plus, Edit2, Trash2, Clock, DollarSign } from 'lucide-react';
import { useTranslations } from 'next-intl';
import useSetupWizardStore from '@/stores/setupWizardStore';
import ServiceModal from '@/components/modals/ServiceModal';

function ServiceCard({ service, onEdit, onDelete }) {
  const t = useTranslations('settings.services');

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 text-lg">{service.name}</h3>
          {service.description && (
            <p className="text-sm text-slate-600 mt-1">{service.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              <span>{service.duration} {t('durationUnit')}</span>
            </div>
            {service.price && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <DollarSign className="w-4 h-4" />
                <span>{service.price.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(service)}
            className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(service.id)}
            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ServicesStep() {
  const t = useTranslations('settings.services');
  const services = useSetupWizardStore((state) => state.services);
  const addService = useSetupWizardStore((state) => state.addService);
  const updateService = useSetupWizardStore((state) => state.updateService);
  const deleteService = useSetupWizardStore((state) => state.deleteService);

  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const handleSave = (serviceData) => {
    if (editingService) {
      updateService(editingService.id, serviceData);
    } else {
      addService(serviceData);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
  };

  const handleAddClick = () => {
    setEditingService(null);
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
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{t('title')}</h2>
                <p className="text-orange-50 text-sm mt-1">
                  {t('subtitle')}
                </p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white font-semibold">{t('count', { count: services.length })}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Info */}
          {services.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scissors className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {t('emptyTitle')}
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {t('emptyDescription')}
              </p>
            </div>
          )}

          {/* Service list */}
          {services.length > 0 && (
            <div className="space-y-3">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onEdit={handleEdit}
                  onDelete={deleteService}
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

      {/* Service Modal */}
      <ServiceModal
        isOpen={showModal}
        onClose={handleCloseModal}
        service={editingService}
        onSave={handleSave}
      />
    </div>
  );
}
