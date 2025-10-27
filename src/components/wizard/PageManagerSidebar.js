'use client';

import {
  FileText,
  List,
  Users,
  Calendar,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Sparkles,
} from 'lucide-react';
import useSetupWizardStore from '@/stores/setupWizardStore';
import { generateId } from '@/utils/fieldNameHelper';

const PAGE_TYPE_ICONS = {
  custom: { icon: FileText, color: 'bg-blue-500' },
  'preset-services': { icon: List, color: 'bg-orange-500' },
  'preset-staff': { icon: Users, color: 'bg-pink-500' },
  'preset-datetime': { icon: Calendar, color: 'bg-indigo-500' },
};

const PAGE_TYPE_LABELS = {
  custom: 'Custom Form',
  'preset-services': 'Services',
  'preset-staff': 'Staff Selection',
  'preset-datetime': 'Date & Time',
};

export default function PageManagerSidebar() {
  const pages = useSetupWizardStore((state) => state.pages);
  const currentEditingPageId = useSetupWizardStore((state) => state.currentEditingPageId);
  const addPage = useSetupWizardStore((state) => state.addPage);
  const deletePage = useSetupWizardStore((state) => state.deletePage);
  const movePageUp = useSetupWizardStore((state) => state.movePageUp);
  const movePageDown = useSetupWizardStore((state) => state.movePageDown);
  const setCurrentEditingPageId = useSetupWizardStore(
    (state) => state.setCurrentEditingPageId
  );

  const customPagesCount = pages.filter((p) => p.type === 'custom').length;
  const canAddCustomPage = customPagesCount < 10;

  const sortedPages = [...pages].sort((a, b) => a.order - b.order);

  const handleAddCustomPage = () => {
    if (!canAddCustomPage) return;

    const newPage = {
      id: generateId(),
      type: 'custom',
      title: `Page ${customPagesCount + 1}`,
      components: [],
    };

    addPage(newPage);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900 mb-1">Pages</h3>
        <p className="text-xs text-slate-600">
          Build your booking flow
        </p>
      </div>

      {/* Add custom page button */}
      <button
        onClick={handleAddCustomPage}
        disabled={!canAddCustomPage}
        className={`
          w-full mb-4 px-4 py-3 rounded-xl border-2 border-dashed font-medium text-sm transition-all
          ${
            canAddCustomPage
              ? 'border-orange-300 text-orange-600 hover:border-orange-400 hover:bg-orange-50'
              : 'border-slate-200 text-slate-400 cursor-not-allowed'
          }
        `}
      >
        <div className="flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Add Custom Page
        </div>
        <div className="text-xs mt-1">
          {customPagesCount}/10 custom pages
        </div>
      </button>

      {/* Pages list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {sortedPages.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-orange-500" />
            </div>
            <p className="text-sm text-slate-600 mb-2">No pages yet</p>
            <p className="text-xs text-slate-500">
              Add a custom page or preset page to get started
            </p>
          </div>
        ) : (
          sortedPages.map((page, index) => {
            const { icon: Icon, color } = PAGE_TYPE_ICONS[page.type];
            const label = PAGE_TYPE_LABELS[page.type];
            const isActive = page.id === currentEditingPageId;
            const isPreset = page.type.startsWith('preset-');

            return (
              <div
                key={page.id}
                className={`
                  group rounded-xl border-2 p-3 transition-all cursor-pointer
                  ${
                    isActive
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-orange-300 hover:shadow-sm'
                  }
                `}
                onClick={() => setCurrentEditingPageId(page.id)}
              >
                <div className="flex items-start gap-2">
                  {/* Order number */}
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {index + 1}
                    </span>
                  </div>

                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 ${color} rounded-lg flex items-center justify-center`}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-sm truncate">
                      {page.title}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {isPreset ? label : `${page.components.length} fields`}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-200">
                  {/* Reorder buttons */}
                  <div className="flex gap-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        movePageUp(page.id);
                      }}
                      disabled={index === 0}
                      className={`p-1 rounded ${
                        index === 0
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50'
                      } transition-colors`}
                      title="Move up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        movePageDown(page.id);
                      }}
                      disabled={index === sortedPages.length - 1}
                      className={`p-1 rounded ${
                        index === sortedPages.length - 1
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50'
                      } transition-colors`}
                      title="Move down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex-1"></div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(
                          `Are you sure you want to delete "${page.title}"?`
                        )
                      ) {
                        deletePage(page.id);
                      }
                    }}
                    className="p-1 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete page"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info */}
      {sortedPages.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-900">
            <p>
              <strong>{sortedPages.length}</strong> page{sortedPages.length !== 1 ? 's' : ''} in
              your flow
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
