/**
 * LineTokenHelpModal Component
 * Instructional modal to help users get their LINE Channel Access Token
 */

'use client';

import { X, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import ModalPortal from '@/components/portal/ModalPortal';

export default function LineTokenHelpModal({ isOpen, onClose }) {
  const t = useTranslations('dashboard.messaging.helpModals.token');

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
                    <p className="text-sm text-slate-600 mb-2">
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
                    <div className="bg-slate-100 border border-slate-300 rounded-lg p-3 font-mono text-xs break-all">
                      eyJhbGciOiJIUzI1NiJ9.eXl1dW9TS0VXM3E4VUdxdTk3d3dsdExIUWI...
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

                {/* Step 7 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                    7
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">
                      {t('step7Title')}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {t('step7Description')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 mb-1">{t('securityTitle')}</h4>
                    <p className="text-sm text-red-800">
                      {t('securityDescription')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Note */}
              {/* <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 mb-1">Important Security Note</h4>
                    <p className="text-sm text-red-800">
                      Keep your Channel Access Token secure! Do not share it publicly or commit it to version control.
                      Anyone with this token can send messages as your bot.
                    </p>
                  </div>
                </div>
              </div> */}

              {/* Token Type Info */}
              {/* <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Long-lived vs Short-lived</h4>
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>Long-lived tokens</strong> (recommended): Do not expire and are easier to manage
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>Short-lived tokens</strong>: Expire after 30 days but can be automatically refreshed using OAuth (requires LINE Login enabled)
                    </p>
                  </div>
                </div>
              </div> */}

              {/* Additional Help */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-2">{t('needHelpTitle')}</h4>
                <p className="text-sm text-slate-600 mb-3">
                  {t('needHelpDescription')}
                </p>
                <a
                  href="https://developers.line.biz/en/docs/messaging-api/channel-access-tokens/"
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
