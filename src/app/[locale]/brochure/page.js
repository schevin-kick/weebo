'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Sparkles,
  Zap,
  Calendar,
  BarChart3,
  Users,
  QrCode,
  Clock,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import ThreeBackground from '@/components/brochure/ThreeBackground';
import TypewriterText from '@/components/brochure/TypewriterText';
import ParallaxSection from '@/components/brochure/ParallaxSection';
import FeatureCard from '@/components/brochure/FeatureCard';
import FeatureShowcase from '@/components/brochure/FeatureShowcase';
import AnimatedCounter from '@/components/brochure/AnimatedCounter';
import ScreenshotCard from '@/components/brochure/ScreenshotCard';
import FloatingNotification from '@/components/brochure/FloatingNotification';
import ImageModal from '@/components/brochure/ImageModal';
import LanguageSelector from '@/components/shared/LanguageSelector';

export default function BrochurePage() {
  const t = useTranslations('brochure');
  const tCommon = useTranslations('common');
  const tStructuredData = useTranslations('structuredData.brochure');
  const tFeatureShowcase = useTranslations('brochureV2.featureShowcase');
  const [showSubheading, setShowSubheading] = useState(false);
  const [heroRef, heroInView] = useInView({ threshold: 0.1 });
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [activeNotification, setActiveNotification] = useState(0);
  const [modalImage, setModalImage] = useState(null);
  const [config, setConfig] = useState(null);

  // Floating notifications data
  const notifications = [
    {
      icon: CheckCircle,
      title: 'New Booking Confirmed',
      message: 'Sarah Chen - 2:30 PM Haircut & Style',
      position: 'top-right',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Users,
      title: 'Payment Received',
      message: '$45.00 - Visa ending in 4242',
      position: 'bottom-left',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: MessageSquare,
      title: 'LINE Message Sent',
      message: 'Confirmation sent to customer',
      position: 'middle-left',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: BarChart3,
      title: 'Analytics Updated',
      message: 'Dashboard refreshed with real-time data',
      position: 'bottom-right',
      gradient: 'from-purple-500 to-violet-500'
    }
  ];

  // Load pricing config
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/subscription/config');
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (err) {
        console.error('Failed to load config:', err);
        // Use defaults if fetch fails
        setConfig({
          priceAmount: 200,
          priceCurrency: 'TWD',
          trialDays: 14,
        });
      }
    }
    loadConfig();
  }, []);

  // Cycle through notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNotification((prev) => (prev + 1) % notifications.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [notifications.length]);

  return (
    <div className="brochure-page relative min-h-screen overflow-x-hidden">
      {/* Three.js Background */}
      <ThreeBackground />

      {/* Language Selector - Fixed position */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 py-20" aria-label="Hero">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Headline with Typewriter */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
          >
            <TypewriterText
              text="Kitsune"
              speed={80}
              className="block bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent"
              onComplete={() => setShowSubheading(true)}
            />
            {/* {showSubheading && (
              <TypewriterText
                text="with Kitsune Booking"
                speed={80}
                className="block bg-gradient-to-r from-pink-400 via-rose-400 to-orange-400 bg-clip-text text-transparent"
              />
            )} */}
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: showSubheading ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* Quick Value Propositions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showSubheading ? 1 : 0, y: showSubheading ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-3 mb-10 px-4"
          >
            {[
              { icon: Zap, text: t('hero.valueProps.quickSetup'), gradient: 'from-yellow-400 to-orange-400' },
              { icon: Star, text: t('hero.valueProps.freeTrial'), gradient: 'from-pink-400 to-rose-400' },
              { icon: MessageSquare, text: t('hero.valueProps.lineNative'), gradient: 'from-green-400 to-emerald-400' },
              { icon: BarChart3, text: t('hero.valueProps.analytics'), gradient: 'from-purple-400 to-blue-400' }
            ].map((item, index) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: showSubheading ? 1 : 0, scale: showSubheading ? 1 : 0.8 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                className="group"
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full hover:bg-white/20 transition-all">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white whitespace-nowrap">{item.text}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showSubheading ? 1 : 0, y: showSubheading ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.a
              href="/api/auth/login"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-white font-bold text-lg shadow-2xl hover:shadow-orange-500/50 transition-all flex items-center gap-2"
            >
              {tCommon('buttons.startFreeTrial')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
            <motion.a
              href="/api/auth/login"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white/10 backdrop-blur-lg border-2 border-white/30 rounded-full text-white font-bold text-lg hover:bg-white/20 transition-all"
            >
              {tCommon('buttons.signIn')}
            </motion.a>
          </motion.div>

          {/* Floating mockup image placeholder */}
          <ParallaxSection speed={-0.3}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="mt-20"
            >
              <div className="relative max-w-4xl mx-auto">
                <div className="relative rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-2xl overflow-hidden" style={{ aspectRatio: '16/11' }}>
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="/brochure/kitsune-hero.mp4" type="video/mp4" />
                  </video>

                  {/* Waving robot video overlay - in front of SVG animations */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-64 h-64 object-contain opacity-30"
                    >
                      <source src="/robot-waving-unscreen-optimized.mp4" type="video/mp4" />
                    </video>
                  </div>

                  {/* Floating Notifications Overlay */}
                  <AnimatePresence mode="wait">
                    <FloatingNotification
                      key={activeNotification}
                      icon={notifications[activeNotification].icon}
                      title={notifications[activeNotification].title}
                      message={notifications[activeNotification].message}
                      position={notifications[activeNotification].position}
                      gradient={notifications[activeNotification].gradient}
                    />
                  </AnimatePresence>
                </div>
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-purple-500/20 blur-3xl -z-10" />
              </div>
            </motion.div>
          </ParallaxSection>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="relative py-20 px-4" aria-label="Statistics">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={statsInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <AnimatedCounter
                end={95}
                suffix="M+"
                className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent"
              />
              <p className="text-slate-300 mt-2 text-lg">{t('stats.lineUsers')}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={statsInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <AnimatedCounter
                end={5}
                suffix=" min"
                className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent"
              />
              <p className="text-slate-300 mt-2 text-lg">{t('stats.setupTime')}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={statsInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <AnimatedCounter
                end={24}
                suffix="/7"
                className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
              />
              <p className="text-slate-300 mt-2 text-lg">{t('stats.availability')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* LINE Integration Showcase */}
      <section className="relative py-32 px-4" aria-label="LINE Integration Features">
        <ParallaxSection speed={0.2}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {t('lineIntegration.title')}
                </span>
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                {t('lineIntegration.description')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Video showcase */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="aspect-video aspect-hero rounded-2xl overflow-hidden bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="/brochure/kitsune3.mp4" type="video/mp4" />
                  </video>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-3xl -z-10" />
              </motion.div>

              {/* Benefits list */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                {[
                  { icon: MessageSquare, text: t('lineIntegration.benefits.instantConfirmations') },
                  { icon: CheckCircle, text: t('lineIntegration.benefits.autoReminders') },
                  { icon: Users, text: t('lineIntegration.benefits.alwaysAvailable') },
                  { icon: Star, text: t('lineIntegration.benefits.beautifulCards') }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-slate-200 text-lg">{item.text}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </ParallaxSection>
      </section>

      {/* Features Grid */}
      <section className="relative py-32 px-4" aria-label="Key Features">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                {t('features.title')}
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              {t('features.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Zap}
              title={t('features.quickSetup.title')}
              description={t('features.quickSetup.description')}
              gradient="from-orange-500 to-amber-500"
              delay={0.1}
            />
            <FeatureCard
              icon={QrCode}
              title={t('features.qrCodes.title')}
              description={t('features.qrCodes.description')}
              gradient="from-pink-500 to-rose-500"
              delay={0.2}
            />
            <FeatureCard
              icon={BarChart3}
              title={t('features.analytics.title')}
              description={t('features.analytics.description')}
              gradient="from-purple-500 to-indigo-500"
              delay={0.3}
            />
            <FeatureCard
              icon={Calendar}
              title={t('features.scheduling.title')}
              description={t('features.scheduling.description')}
              gradient="from-blue-500 to-cyan-500"
              delay={0.4}
            />
            <FeatureCard
              icon={Sparkles}
              title={t('features.customForms.title')}
              description={t('features.customForms.description')}
              gradient="from-emerald-500 to-green-500"
              delay={0.5}
            />
            <FeatureCard
              icon={Clock}
              title={t('features.autoReminders.title')}
              description={t('features.autoReminders.description')}
              gradient="from-yellow-500 to-orange-500"
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Feature Showcase with Images */}
      <section className="relative py-32 px-4" aria-label="Featured Capabilities">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                {tFeatureShowcase('title')}
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              {tFeatureShowcase('subtitle')}
            </p>
          </motion.div>

          <div className="space-y-32">
            <FeatureShowcase
              imageSrc="/brochure/features/feature1.png"
              title={tFeatureShowcase('feature1.title')}
              description={tFeatureShowcase('feature1.description')}
              gradient="from-green-500 to-emerald-500"
              imagePosition="left"
              delay={0.1}
            />
            <FeatureShowcase
              imageSrc="/brochure/features/feature2.png"
              title={tFeatureShowcase('feature2.title')}
              description={tFeatureShowcase('feature2.description')}
              gradient="from-pink-500 to-rose-500"
              imagePosition="right"
              delay={0.2}
            />
            <FeatureShowcase
              imageSrc="/brochure/features/feature3.png"
              title={tFeatureShowcase('feature3.title')}
              description={tFeatureShowcase('feature3.description')}
              gradient="from-blue-500 to-cyan-500"
              imagePosition="left"
              delay={0.3}
            />
            <FeatureShowcase
              imageSrc="/brochure/features/feature4.png"
              title={tFeatureShowcase('feature4.title')}
              description={tFeatureShowcase('feature4.description')}
              gradient="from-purple-500 to-indigo-500"
              imagePosition="right"
              delay={0.4}
            />
            <FeatureShowcase
              imageSrc="/brochure/features/feature5.png"
              title={tFeatureShowcase('feature5.title')}
              description={tFeatureShowcase('feature5.description')}
              gradient="from-yellow-500 to-orange-500"
              imagePosition="left"
              delay={0.5}
            />
            <FeatureShowcase
              imageSrc="/brochure/features/feature6.png"
              title={tFeatureShowcase('feature6.title')}
              description={tFeatureShowcase('feature6.description')}
              gradient="from-emerald-500 to-green-500"
              imagePosition="right"
              delay={0.6}
            />
            <FeatureShowcase
              imageSrc="/brochure/features/feature7.png"
              title={tFeatureShowcase('feature7.title')}
              description={tFeatureShowcase('feature7.description')}
              gradient="from-orange-500 to-amber-500"
              imagePosition="left"
              delay={0.7}
            />
          </div>
        </div>
      </section>

      {/* Analytics Preview */}
      <section className="relative py-32 px-4" aria-label="Analytics Dashboard">
        <ParallaxSection speed={-0.2}>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {t('analyticsPreview.title')}
                  </span>
                </h2>
                <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                  {t('analyticsPreview.description')}
                </p>
                <div className="space-y-4">
                  {[
                    t('analyticsPreview.features.realtimeDashboard'),
                    t('analyticsPreview.features.customerInsights'),
                    t('analyticsPreview.features.revenueTracking'),
                    t('analyticsPreview.features.staffPerformance')
                  ].map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                      <span className="text-slate-200 text-lg">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Dashboard preview mockup */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 shadow-2xl p-8">
                  {/* Simple dashboard visualization */}
                  <div className="space-y-6 h-full flex flex-col justify-around">
                    <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-6 border border-cyan-500/30">
                      <p className="text-slate-400 text-sm mb-2">{t('analyticsPreview.stats.totalBookings')}</p>
                      <AnimatedCounter
                        end={1247}
                        className="text-4xl font-bold text-white"
                      />
                    </div>
                    <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-xl p-6 border border-pink-500/30">
                      <p className="text-slate-400 text-sm mb-2">{t('analyticsPreview.stats.thisWeek')}</p>
                      <AnimatedCounter
                        end={89}
                        className="text-4xl font-bold text-white"
                      />
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl p-6 border border-emerald-500/30">
                      <p className="text-slate-400 text-sm mb-2">{t('analyticsPreview.stats.revenue')}</p>
                      <AnimatedCounter
                        end={45280}
                        prefix="$"
                        className="text-4xl font-bold text-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl -z-10" />
              </motion.div>
            </div>
          </div>
        </ParallaxSection>
      </section>

      {/* QR Code Feature */}
      <section className="relative py-32 px-4" aria-label="QR Code Generator">
        <ParallaxSection speed={0.3}>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Video/Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative order-2 md:order-1"
              >
                <div className="aspect-video aspect-hero rounded-2xl overflow-hidden bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="/brochure/kitsune1.mp4" type="video/mp4" />
                  </video>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-amber-500/20 blur-3xl -z-10" />
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="order-1 md:order-2"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                    {t('qrCodeFeature.title')}
                  </span>
                </h2>
                <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                  {t('qrCodeFeature.description')}
                </p>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">{t('qrCodeFeature.steps.customize.title')}</p>
                      <p className="text-slate-400">{t('qrCodeFeature.steps.customize.description')}</p>
                    </div>
                  </div>
                  <div className="h-px bg-white/10 my-4" />
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">{t('qrCodeFeature.steps.share.title')}</p>
                      <p className="text-slate-400">{t('qrCodeFeature.steps.share.description')}</p>
                    </div>
                  </div>
                  <div className="h-px bg-white/10 my-4" />
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">{t('qrCodeFeature.steps.accept.title')}</p>
                      <p className="text-slate-400">{t('qrCodeFeature.steps.accept.description')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </ParallaxSection>
      </section>

      {/* Screenshots Section */}
      <section className="relative py-32 px-4" aria-label="Product Screenshots" id="screenshots">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('screenshots.title')}
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              {t('screenshots.subtitle')}
            </p>
          </motion.div>

          <div className="space-y-32">
            <ScreenshotCard
              src="/brochure/booking-modal.webp"
              alt="Kitsune Dashboard with Booking Details"
              title={t('screenshots.dashboard.title')}
              description={t('screenshots.dashboard.description')}
              delay={0.1}
              onClick={() => setModalImage({ src: '/brochure/booking-modal.png', alt: 'Kitsune Dashboard with Booking Details' })}
            />

            <ScreenshotCard
              src="/brochure/calendar-view.webp"
              alt="Calendar and Scheduling Interface"
              title={t('screenshots.calendar.title')}
              description={t('screenshots.calendar.description')}
              delay={0.2}
              reverse
              onClick={() => setModalImage({ src: '/brochure/calendar-view.png', alt: 'Calendar and Scheduling Interface' })}
            />

            <ScreenshotCard
              src="/brochure/form-builder.webp"
              alt="Custom Booking Form Builder"
              title={t('screenshots.qrAndForms.title')}
              description={t('screenshots.qrAndForms.description')}
              delay={0.4}
              reverse
              onClick={() => setModalImage({ src: '/brochure/form-builder.png', alt: 'Custom Booking Form Builder' })}
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 px-4" aria-label="Call to Action">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl relative overflow-hidden"
          >
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-purple-500/10 animate-pulse" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {t('finalCta.title')}
                </span>
              </h2>
              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                {t('finalCta.description')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <motion.a
                  href="/api/auth/login"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-white font-bold text-xl shadow-2xl hover:shadow-orange-500/50 transition-all flex items-center gap-3"
                >
                  {tCommon('buttons.getStartedFree')}
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </motion.a>
                <motion.a
                  href="/api/auth/login"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-white/10 backdrop-blur-lg border-2 border-white/30 rounded-full text-white font-bold text-xl hover:bg-white/20 transition-all"
                >
                  {tCommon('buttons.signIn')}
                </motion.a>
              </div>

              <p className="text-slate-400 mt-8">
                {t('finalCta.noCreditCard')} • {t('finalCta.quickSetup')} • {t('finalCta.freeTrial', { trialDays: config ? config.trialDays : 14 })}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-8">
            <div className="md:col-span-1">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" />
                Kitsune
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                {t('footer.tagline')}
              </p>
              <div className="flex gap-4">
                <a href="/api/auth/login" className="text-orange-400 hover:text-orange-300 transition-colors">
                  {tCommon('buttons.signIn')}
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('footer.resources')}</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">{t('footer.features')}</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">{t('footer.pricing')}</a></li>
                <li><a href="#screenshots" className="hover:text-white transition-colors">{t('footer.screenshots')}</a></li>
                <li><a href="/api/auth/login" className="hover:text-white transition-colors">{tCommon('buttons.getStarted')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('footer.legal')}</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/legal/privacy" className="hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
                <li><Link href="/legal/terms" className="hover:text-white transition-colors">{t('footer.terms')}</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">{t('footer.contact')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-slate-400 text-sm">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>

      {/* Image Modal */}
      <ImageModal
        isOpen={modalImage !== null}
        onClose={() => setModalImage(null)}
        src={modalImage?.src || ''}
        alt={modalImage?.alt || ''}
      />

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": tStructuredData('name'),
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "127"
            },
            "description": tStructuredData('description'),
            "featureList": [
              tStructuredData('featureList.0'),
              tStructuredData('featureList.1'),
              tStructuredData('featureList.2'),
              tStructuredData('featureList.3'),
              tStructuredData('featureList.4'),
              tStructuredData('featureList.5'),
              tStructuredData('featureList.6'),
              tStructuredData('featureList.7')
            ],
            "screenshot": "/brochure/booking-modal.png"
          })
        }}
      />
    </div>
  );
}
