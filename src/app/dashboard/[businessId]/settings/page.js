/**
 * Settings Page
 * Tabbed interface for editing business configuration (non-wizard)
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Save, Info, Briefcase, Users, FileText } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import BusinessInfoStep from '@/components/wizard/BusinessInfoStep';
import ServicesStep from '@/components/wizard/ServicesStep';
import StaffStep from '@/components/wizard/StaffStep';
import PageBuilderStep from '@/components/wizard/PageBuilderStep';
import { useSetupWizardStore } from '@/stores/setupWizardStore';
import { useToast } from '@/contexts/ToastContext';

const tabs = [
  { id: 'business', label: 'Business Info', icon: Info },
  { id: 'services', label: 'Services', icon: Briefcase },
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'pages', label: 'Booking Form', icon: FileText },
];

export default function SettingsPage() {
  const params = useParams();
  const businessId = params.businessId;
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('business');
  const [saving, setSaving] = useState(false);

  // Zustand store for wizard data
  const store = useSetupWizardStore();

  useEffect(() => {
    loadData();
  }, [businessId]);

  async function loadData() {
    try {
      // Load user session
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      if (!sessionData.user) {
        window.location.href = '/api/auth/login';
        return;
      }
      setUser(sessionData.user);

      // Load businesses
      const bizRes = await fetch('/api/businesses');
      const bizData = await bizRes.json();
      setBusinesses(bizData.businesses || []);

      // Load current business data
      const businessRes = await fetch(`/api/businesses/${businessId}`);
      const businessData = await businessRes.json();

      // Populate store with business data
      store.setBusinessName(businessData.businessName || '');
      store.setLogoUrl(businessData.logoUrl || '');
      store.setBusinessHours(businessData.businessHours || { mode: '24/7' });
      store.setDefaultAppointmentDuration(businessData.defaultDuration || 30);
      store.setAppointmentOnly(businessData.appointmentOnly || false);
      store.setRequiresApproval(businessData.requiresApproval || false);
      store.setRichMenu(businessData.richMenu || {});
      store.setContactInfo(businessData.contactInfo || {});

      // Services
      store.setServices(businessData.services || []);

      // Staff
      const staffWithPhotos = (businessData.staff || []).map((s) => ({
        ...s,
        photo: null, // Photos are already uploaded, we just have URLs
      }));
      store.setStaff(staffWithPhotos);

      // Pages
      store.setPages(businessData.pages || []);

      // Preset pages config
      const hasServicesPage = businessData.pages?.some((p) => p.type === 'preset-services');
      const hasStaffPage = businessData.pages?.some((p) => p.type === 'preset-staff');
      const hasDateTimePage = businessData.pages?.some((p) => p.type === 'preset-datetime');

      store.setPresetPagesConfig({
        services: hasServicesPage,
        staff: hasStaffPage,
        dateTime: hasDateTimePage,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);

    try {
      // Validate current tab
      let isValid = false;
      switch (activeTab) {
        case 'business':
          isValid = store.businessName.length >= 3 && store.defaultAppointmentDuration >= 5;
          break;
        case 'services':
          isValid = store.services.every(
            (s) => s.name.length >= 3 && s.duration >= 5
          );
          break;
        case 'staff':
          isValid = store.staff.every((s) => s.name.length >= 3);
          break;
        case 'pages':
          isValid =
            store.pages.length > 0 &&
            store.pages.every((p) => {
              if (p.type === 'custom') {
                return (
                  p.title &&
                  p.components.every((c) => c.label && (c.type !== 'select' || c.options?.length > 0))
                );
              }
              return true;
            });
          break;
      }

      if (!isValid) {
        toast.error('Please check all required fields');
        setSaving(false);
        return;
      }

      // Prepare update data based on active tab
      let updateData = {};

      if (activeTab === 'business') {
        updateData = {
          businessName: store.businessName,
          logoUrl: store.logoUrl,
          businessHours: store.businessHours,
          defaultDuration: store.defaultAppointmentDuration,
          appointmentOnly: store.appointmentOnly,
          requiresApproval: store.requiresApproval,
          richMenu: store.richMenu,
          contactInfo: store.contactInfo,
        };
      } else if (activeTab === 'services') {
        updateData = {
          services: store.services.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            duration: s.duration,
            price: s.price,
            order: s.order,
            isActive: s.isActive ?? true,
          })),
        };
      } else if (activeTab === 'staff') {
        // Handle photo uploads for new staff
        const staffData = [];
        for (const member of store.staff) {
          let photoUrl = member.photoUrl;

          // If there's a new photo to upload
          if (member.photo && typeof member.photo !== 'string') {
            const formData = new FormData();
            formData.append('file', member.photo);
            formData.append('folder', 'staff');

            const uploadRes = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });

            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              photoUrl = uploadData.url;
            }
          }

          staffData.push({
            id: member.id,
            name: member.name,
            specialty: member.specialty,
            description: member.description,
            photoUrl,
            availability: member.availability,
            order: member.order,
            isActive: member.isActive ?? true,
          });
        }

        updateData = { staff: staffData };
      } else if (activeTab === 'pages') {
        updateData = {
          pages: store.pages.map((p) => ({
            id: p.id,
            type: p.type,
            title: p.title,
            order: p.order,
            components: p.components || [],
          })),
        };
      }

      // Update business
      const response = await fetch(`/api/businesses/${businessId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      toast.success('Settings saved successfully!');

      // Reload data to refresh
      await loadData();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user} businesses={businesses} currentBusinessId={businessId}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">Manage your business configuration</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-slate-200 overflow-x-auto">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600 bg-orange-50'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'business' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Business Information</h2>
                  <p className="text-slate-600">
                    Update your business name, logo, hours, and contact information
                  </p>
                </div>
                <BusinessInfoStep />
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Services</h2>
                  <p className="text-slate-600">
                    Manage the services you offer to customers
                  </p>
                </div>
                <ServicesStep />
              </div>
            )}

            {activeTab === 'staff' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Staff Members</h2>
                  <p className="text-slate-600">
                    Manage your team members and their availability
                  </p>
                </div>
                <StaffStep />
              </div>
            )}

            {activeTab === 'pages' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Booking Form</h2>
                  <p className="text-slate-600">
                    Configure the pages and fields customers see when booking
                  </p>
                </div>
                <PageBuilderStep />
              </div>
            )}
          </div>

          {/* Save Button Footer */}
          <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
