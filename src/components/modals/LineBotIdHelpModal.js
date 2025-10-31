/**
 * LineBotIdHelpModal Component
 * Instructional modal to help users find their LINE Bot Basic ID
 */

'use client';

import { X, ExternalLink, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ModalPortal from '@/components/portal/ModalPortal';

export default function LineBotIdHelpModal({ isOpen, onClose }) {
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
                How to Find Your Bot Basic ID
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
                <p className="text-slate-700 leading-relaxed">
                  Your <strong>Bot Basic ID</strong> is a unique identifier for your LINE Official Account.
                  It's used to create the "Add Friend" link that allows customers to connect with your bot.
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Follow these steps:</h3>

                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">
                      Go to LINE Developers Console
                    </h4>
                    <p className="text-sm text-slate-600 mb-2">
                      Open the LINE Developers Console in a new tab
                    </p>
                    <a
                      href="https://developers.line.biz/console/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Open LINE Console
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
                      Select Your Provider
                    </h4>
                    <p className="text-sm text-slate-600">
                      Click on the provider that contains your Messaging API channel
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
                      Select Your Messaging API Channel
                    </h4>
                    <p className="text-sm text-slate-600">
                      Choose the channel associated with your business bot
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
                      Go to "Messaging API" Tab
                    </h4>
                    <p className="text-sm text-slate-600">
                      Click on the "Messaging API" tab in the navigation
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
                      Find Your Bot Basic ID
                    </h4>
                    <p className="text-sm text-slate-600 mb-2">
                      Scroll down to find the "Bot basic ID" field. It will look like this:
                    </p>
                    <div className="bg-slate-100 border border-slate-300 rounded-lg p-3 font-mono text-sm">
                      <span className="text-slate-500">Bot basic ID:</span>{' '}
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
                      Copy and Paste
                    </h4>
                    <p className="text-sm text-slate-600">
                      Copy the Bot Basic ID (including the @ symbol) and paste it into the input field
                    </p>
                  </div>
                </div>
              </div>

              {/* Format Example */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Format</h4>
                    <p className="text-sm text-blue-800">
                      The Bot Basic ID always starts with <code className="bg-blue-100 px-1.5 py-0.5 rounded">@</code> followed by alphanumeric characters.
                    </p>
                    <p className="text-sm text-blue-800 mt-2">
                      Example: <code className="bg-blue-100 px-2 py-1 rounded font-mono">@abc1234</code>
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Help */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Need More Help?</h4>
                <p className="text-sm text-slate-600 mb-3">
                  If you're having trouble finding your Bot Basic ID, check out the official LINE documentation:
                </p>
                <a
                  href="https://developers.line.biz/en/docs/messaging-api/getting-started/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  LINE Messaging API Documentation
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
                Got It!
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </ModalPortal>
  );
}
