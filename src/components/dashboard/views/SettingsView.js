/**
 * SettingsView Component
 * Comprehensive business settings with tabbed interface
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Save, Building2, Briefcase, Users, Layout, Eye } from 'lucide-react';
import { useBusiness } from '@/hooks/useDashboardData';
import { useUpdateBusinessSettings } from '@/hooks/useDashboardMutations';
import useSetupWizardStore from '@/stores/setupWizardStore';
import useSettingsStore from '@/stores/settingsStore';
import { useToast } from '@/contexts/ToastContext';
import Skeleton from '@/components/loading/Skeleton';
import PreviewModal from '@/components/preview/PreviewModal';
import BookingFlowPreview from '@/components/preview/BookingFlowPreview';

// Import wizard step components
import BusinessInfoStep from '@/components/wizard/BusinessInfoStep';
import ServicesStep from '@/components/wizard/ServicesStep';
import StaffStep from '@/components/wizard/StaffStep';
import PageBuilderStep from '@/components/wizard/PageBuilderStep';

const tabs = [
  { id: 'business', name: 'Business Info', icon: Building2 },
  { id: 'services', name: 'Services', icon: Briefcase },
  { id: 'staff', name: 'Staff', icon: Users },
  { id: 'pages', name: 'Booking Form', icon: Layout },
];

export default function SettingsView({ businessId }) {
  const router = useRouter();
  const toast = useToast();

  // Fetch business data
  const { business, isLoading, mutate } = useBusiness(businessId);
  const updateBusinessSettings = useUpdateBusinessSettings();

  // Settings store for tab management
  const { activeTab, isDirty, isSaving, setActiveTab, setIsDirty, setIsSaving, reset } = useSettingsStore();

  // Track if data has been loaded into wizard store
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load business data into wizard store
  useEffect(() => {
    if (business && !dataLoaded) {
      const store = useSetupWizardStore.getState();

      // Populate wizard store with business data
      store.setBusinessName(business.businessName);
      store.setLogoUrl(business.logoUrl || '');
      store.setBusinessHours(business.businessHours || {});
      store.setDefaultAppointmentDuration(business.defaultDuration || 60);
      store.setAppointmentOnly(business.appointmentOnly || false);
      store.setRequiresApproval(business.requiresApproval || false);
      store.setContactInfo({
        phone: business.phone || '',
        email: business.email || '',
        address: business.address || '',
        website: business.website || '',
      });

      // Load services
      if (business.services && business.services.length > 0) {
        store.setServices(business.services.map(service => ({
          id: service.id,
          name: service.name,
          description: service.description || '',
          duration: service.duration,
          price: service.price || 0,
        })));
      }

      // Load staff
      if (business.staff && business.staff.length > 0) {
        store.setStaff(business.staff.map(member => ({
          id: member.id,
          name: member.name,
          specialty: member.specialty || '',
          description: member.description || '',
          photo: member.photoUrl || '',
          availability: member.availability || {},
        })));
      }

      // Load pages
      if (business.pages && business.pages.length > 0) {
        store.setPages(business.pages.map(page => ({
          id: page.id,
          type: page.type,
          title: page.title,
          order: page.order,
          components: page.components || [],
        })));
      }

      setDataLoaded(true);
    }
  }, [business, dataLoaded]);

  // Mark as dirty when wizard store changes
  useEffect(() => {
    if (dataLoaded) {
      const unsubscribe = useSetupWizardStore.subscribe(() => {
        setIsDirty(true);
      });
      return unsubscribe;
    }
  }, [dataLoaded, setIsDirty]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const store = useSetupWizardStore.getState();

      const businessData = {
        businessName: store.businessName,
        logoUrl: store.logoUrl || null,
        businessHours: store.businessHours,
        defaultDuration: store.defaultAppointmentDuration,
        appointmentOnly: store.appointmentOnly,
        requiresApproval: store.requiresApproval,
        phone: store.contactInfo.phone || null,
        email: store.contactInfo.email || null,
        address: store.contactInfo.address,
        website: store.contactInfo.website || null,
      };

      const servicesData = store.services.map((service, index) => ({
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        order: index,
        isActive: true,
      }));

      const staffData = store.staff.map((member, index) => ({
        name: member.name,
        specialty: member.specialty,
        description: member.description,
        photoUrl: member.photo,
        availability: member.availability,
        order: index,
        isActive: true,
      }));

      const pagesData = store.pages.map((page) => ({
        type: page.type,
        title: page.title,
        order: page.order,
        components: page.components,
      }));

      const payload = {
        business: businessData,
        services: servicesData,
        staff: staffData,
        pages: pagesData,
      };

      await updateBusinessSettings(businessId, payload);

      toast.success('Settings saved successfully');
      setIsDirty(false);

      // Revalidate business data
      mutate();
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
    mutate();
    setDataLoaded(false);
  };

  // Loading state
  if (isLoading || !dataLoaded) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">Manage your business configuration</p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12" rounded="lg" />
          <Skeleton className="h-96" rounded="xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">Manage your business configuration</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {isDirty && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            You have unsaved changes. Click "Save Changes" to persist your modifications.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Tab Headers */}
        <div className="border-b border-slate-200">
          <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                    ${
                      isActive
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'business' && <BusinessInfoStep />}
          {activeTab === 'services' && <ServicesStep />}
          {activeTab === 'staff' && <StaffStep />}
          {activeTab === 'pages' && <PageBuilderStep />}
        </div>
      </div>

      {/* Save Button (Bottom) */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {/* Preview Modal */}
      <PreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)}>
        <BookingFlowPreview />
      </PreviewModal>
    </div>
  );
}
