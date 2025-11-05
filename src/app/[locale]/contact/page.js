'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageSelector from '@/components/shared/LanguageSelector';
import { Link } from '@/i18n/routing';

export default function ContactPage() {
  const t = useTranslations('contact');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    website: '', // Honeypot field
  });

  const [formTimestamp] = useState(Date.now());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [characterCount, setCharacterCount] = useState(0);

  const MAX_MESSAGE_LENGTH = 400;

  // Update character count
  useEffect(() => {
    setCharacterCount(formData.message.length);
  }, [formData.message]);

  // Validate email format
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('validation.nameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('validation.emailRequired');
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = t('validation.emailInvalid');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('validation.messageRequired');
    } else if (formData.message.length > MAX_MESSAGE_LENGTH) {
      newErrors.message = t('validation.messageTooLong');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Limit message length
    if (name === 'message' && value.length > MAX_MESSAGE_LENGTH) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: formTimestamp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          name: '',
          email: '',
          message: '',
          website: '',
        });
        setCharacterCount(0);
      } else {
        setSubmitStatus('error');
        if (response.status === 429) {
          setErrors({ submit: t('error.rateLimit') });
        } else {
          setErrors({ submit: data.error || t('error.description') });
        }
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
      setErrors({ submit: t('error.description') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Bright gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-100 via-orange-50 to-purple-100 -z-10" />

      {/* Playful animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Floating decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl animate-bounce" style={{ animationDuration: '3s' }}>✨</div>
        <div className="absolute top-40 right-20 text-5xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>💌</div>
        <div className="absolute bottom-32 left-20 text-5xl animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>🌸</div>
        <div className="absolute bottom-40 right-32 text-6xl animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}>⭐</div>
      </div>

      {/* Language Selector */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector variant="light" />
      </div>

      {/* Back to brochure link */}
      <div className="absolute top-4 left-4 z-50">
        <Link
          href="/brochure"
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-lg border-2 border-orange-300 rounded-full text-gray-800 hover:bg-white hover:border-pink-400 transition-all shadow-lg hover:shadow-xl"
        >
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold">Back</span>
        </Link>
      </div>

      {/* Main content */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-2xl"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-gradient-to-br from-orange-400 to-pink-400 rounded-3xl shadow-lg"
            >
              <Mail className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-5xl md:text-6xl font-black mb-4"
            >
              <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow-sm">
                {t('title')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-gray-700 font-medium"
            >
              {t('subtitle')}
            </motion.p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 border-2 border-pink-200 shadow-2xl"
          >
            {submitStatus === 'success' ? (
              // Success message
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full shadow-lg">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-black text-gray-800 mb-3">
                  {t('success.title')}
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  {t('success.description')}
                </p>
                <button
                  onClick={() => setSubmitStatus(null)}
                  className="px-8 py-3 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full text-white font-bold hover:shadow-lg hover:scale-105 transition-all"
                >
                  {t('form.submit')}
                </button>
              </motion.div>
            ) : (
              // Form
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot field - hidden from users */}
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                  style={{
                    position: 'absolute',
                    left: '-9999px',
                    width: '1px',
                    height: '1px',
                    opacity: 0,
                  }}
                  aria-hidden="true"
                />

                {/* Name field */}
                <div>
                  <label htmlFor="name" className="block text-gray-800 font-bold mb-2 text-lg">
                    ✏️ {t('form.name')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('form.namePlaceholder')}
                    className={`w-full px-5 py-4 bg-white border-2 ${errors.name ? 'border-red-400' : 'border-pink-200'
                      } rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-400 transition-all shadow-sm hover:shadow-md`}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block text-gray-800 font-bold mb-2 text-lg">
                    📧 {t('form.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('form.emailPlaceholder')}
                    className={`w-full px-5 py-4 bg-white border-2 ${errors.email ? 'border-red-400' : 'border-pink-200'
                      } rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-400 transition-all shadow-sm hover:shadow-md`}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Message field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="message" className="block text-gray-800 font-bold text-lg">
                      💬 {t('form.message')}
                    </label>
                    <span className={`text-sm font-medium ${characterCount > MAX_MESSAGE_LENGTH ? 'text-red-500' : 'text-gray-500'
                      }`}>
                      {t('form.charactersRemaining', { count: MAX_MESSAGE_LENGTH - characterCount })}
                    </span>
                  </div>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('form.messagePlaceholder')}
                    rows={6}
                    className={`w-full px-5 py-4 bg-white border-2 ${errors.message ? 'border-red-400' : 'border-pink-200'
                      } rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-400 transition-all resize-none shadow-sm hover:shadow-md`}
                    disabled={isSubmitting}
                  />
                  {errors.message && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit error */}
                {errors.submit && (
                  <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl">
                    <p className="text-red-600 flex items-center gap-2 font-medium">
                      <AlertCircle className="w-5 h-5" />
                      {errors.submit}
                    </p>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-5 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full text-white font-black text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('form.submitting')}
                    </>
                  ) : (
                    <>
                      {t('form.submit')}
                      <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
