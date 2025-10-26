'use client';

import { useState } from 'react';
import { Scissors, Plus, Edit2, Trash2, Clock, DollarSign, FileText } from 'lucide-react';
import useSetupWizardStore from '@/stores/setupWizardStore';
import DurationPicker from '@/components/shared/DurationPicker';

function ServiceForm({ service, onSave, onCancel }) {
  const [formData, setFormData] = useState(
    service || {
      name: '',
      duration: 60,
      description: '',
      price: '',
    }
  );

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Service name must be at least 3 characters';
    }

    if (!formData.duration || formData.duration < 5) {
      newErrors.duration = 'Duration must be at least 5 minutes';
    }

    if (formData.description && formData.description.length > 100) {
      newErrors.description = 'Description must be at most 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...formData,
        price: formData.price ? parseFloat(formData.price) : undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
      {/* Service Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Service Name <span className="text-orange-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Haircut, Massage, Math Tutoring"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Duration <span className="text-orange-500">*</span>
        </label>
        <DurationPicker
          value={formData.duration}
          onChange={(duration) => setFormData({ ...formData, duration })}
        />
        {errors.duration && (
          <p className="text-sm text-red-600 mt-1">{errors.duration}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Description <span className="text-slate-400 text-xs">(optional)</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the service..."
          rows={3}
          maxLength={100}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
        />
        <div className="flex justify-between items-center mt-1">
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description}</p>
          )}
          <p className="text-xs text-slate-500 ml-auto">
            {formData.description.length}/100 characters
          </p>
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Price <span className="text-slate-400 text-xs">(optional)</span>
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="0.00"
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all"
        >
          {service ? 'Update Service' : 'Add Service'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ServiceCard({ service, onEdit, onDelete }) {
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
              <span>{service.duration} min</span>
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
  const services = useSetupWizardStore((state) => state.services);
  const addService = useSetupWizardStore((state) => state.addService);
  const updateService = useSetupWizardStore((state) => state.updateService);
  const deleteService = useSetupWizardStore((state) => state.deleteService);

  const [isAdding, setIsAdding] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const handleSave = (serviceData) => {
    if (editingService) {
      updateService(editingService.id, serviceData);
      setEditingService(null);
    } else {
      addService(serviceData);
      setIsAdding(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingService(null);
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
                <h2 className="text-2xl font-bold text-white">Services</h2>
                <p className="text-orange-50 text-sm mt-1">
                  Add the services you offer (optional)
                </p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white font-semibold">{services.length} service{services.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Info */}
          {services.length === 0 && !isAdding && !editingService && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scissors className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No services yet
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Add the services you offer. Services are optional - if you only offer one service, you can skip this step.
              </p>
            </div>
          )}

          {/* Service list */}
          {services.length > 0 && (
            <div className="space-y-3">
              {services.map((service) =>
                editingService?.id === service.id ? (
                  <ServiceForm
                    key={service.id}
                    service={editingService}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                ) : (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onEdit={handleEdit}
                    onDelete={deleteService}
                  />
                )
              )}
            </div>
          )}

          {/* Add service form */}
          {isAdding && !editingService && (
            <ServiceForm onSave={handleSave} onCancel={handleCancel} />
          )}

          {/* Add button */}
          {!isAdding && !editingService && (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full border-2 border-dashed border-slate-300 rounded-xl px-6 py-4 text-slate-600 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Service
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
