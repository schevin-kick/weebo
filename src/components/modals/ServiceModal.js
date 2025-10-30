/**
 * ServiceModal Component
 * Modal wrapper for adding/editing services
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Clock, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ModalPortal from '@/components/portal/ModalPortal';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import DurationPicker from '@/components/shared/DurationPicker';

export default function ServiceModal({ isOpen, onClose, service, onSave }) {
  const [formData, setFormData] = useState(
    service || {
      name: '',
      duration: 60,
      description: '',
      price: '',
    }
  );

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // Reset form when service changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData(
        service || {
          name: '',
          duration: 60,
          description: '',
          price: '',
        }
      );
      setErrors({});
    }
  }, [isOpen, service]);

  // Check if form has unsaved changes
  const isDirty = () => {
    if (!service) {
      // New service - check if any field has been filled
      return (
        formData.name.trim() !== '' ||
        formData.duration !== 60 ||
        formData.description.trim() !== '' ||
        formData.price !== ''
      );
    }
    // Editing - check if any field has changed
    return (
      formData.name !== service.name ||
      formData.duration !== service.duration ||
      formData.description !== (service.description || '') ||
      formData.price !== (service.price || '')
    );
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSaving(true);
      try {
        await onSave({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : undefined,
        });
        onClose();
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleClose = () => {
    if (isDirty()) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50"
              onClick={handleBackdropClick}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1] // Custom easing for smooth animation
                }}
                className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-slate-900">
                {service ? 'Edit Service' : 'Add Service'}
              </h2>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
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
              </form>
            </div>

            {/* Footer - Sticky */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {isSaving ? 'Saving...' : service ? 'Update Service' : 'Add Service'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            </div>
              </motion.div>
            </div>
          </div>

          {/* Unsaved Changes Confirmation */}
          <ConfirmDialog
            isOpen={showCloseConfirm}
            onClose={() => setShowCloseConfirm(false)}
            onConfirm={() => {
              setShowCloseConfirm(false);
              onClose();
            }}
            title="Discard Changes?"
            confirmText="Discard"
            cancelText="Keep Editing"
            confirmColor="red"
          >
            <p className="text-slate-600 mt-2">
              You have unsaved changes. Are you sure you want to close without saving?
            </p>
          </ConfirmDialog>
        </ModalPortal>
      )}
    </AnimatePresence>
  );
}
