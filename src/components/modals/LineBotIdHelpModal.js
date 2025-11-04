/**
 * LineBotIdHelpModal Component
 * Instructional modal to help users find their LINE Bot Basic ID
 */

'use client';

import { X, ExternalLink, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import ModalPortal from '@/components/portal/ModalPortal';

export default function LineBotIdHelpModal({ isOpen, onClose }) {
  const t = useTranslations('dashboard.messaging.helpModals.botId');

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-slate-900">
                {t('title')}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Introduction */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4">
                <p className="text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('introduction') }} />
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{t('followSteps')}</h3>

                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">
                      {t('step1Title')}
                    </h4>
                    <p className="text-sm text-slate-600 mb-2">
                      {t('step1Description')}
                    </p>
                    <a
                      href="https://developers.line.biz/console/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      {t('step1Button')}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">
                      {t('step2Title')}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {t('step2Description')}
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">
                      {t('step3Title')}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {t('step3Description')}
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                    4
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">
                      {t('step4Title')}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {t('step4Description')}
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                    5
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">
                      {t('step5Title')}
                    </h4>
                    <p className="text-sm text-slate-600 mb-2">
                      {t('step5Description')}
                    </p>
                    <div className="bg-slate-100 border border-slate-300 rounded-lg p-3 font-mono text-sm">
                      <span className="text-slate-500">{t('step5Example')}</span>{' '}
                      <span className="text-orange-600 font-semibold">@abc1234</span>
                    </div>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                    6
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">
                      {t('step6Title')}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {t('step6Description')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Format Example */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">{t('formatTitle')}</h4>
                    <p className="text-sm text-blue-800" dangerouslySetInnerHTML={{ __html: t('formatDescription') }} />
                    <p className="text-sm text-blue-800 mt-2">
                      {t('formatExample')} <code className="bg-blue-100 px-2 py-1 rounded font-mono">@abc1234</code>
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Help */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-2">{t('needHelpTitle')}</h4>
                <p className="text-sm text-slate-600 mb-3">
                  {t('needHelpDescription')}
                </p>
                <a
                  href="https://developers.line.biz/en/docs/messaging-api/getting-started/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  {t('needHelpLink')}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 rounded-b-2xl">
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/30"
              >
                {t('gotItButton')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </ModalPortal>
  );
}
