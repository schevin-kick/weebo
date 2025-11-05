'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
  Star,
  Heart,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import TypewriterText from '@/components/brochure/TypewriterText';
import ParallaxSection from '@/components/brochure/ParallaxSection';
import AnimatedCounter from '@/components/brochure/AnimatedCounter';
import ScreenshotCard from '@/components/brochure/ScreenshotCard';
import FloatingNotification from '@/components/brochure/FloatingNotification';
import ImageModal from '@/components/brochure/ImageModal';
import ScrollProgress from '@/components/brochure-v2/ScrollProgress';
import InteractiveCard from '@/components/brochure-v2/InteractiveCard';
import LightFeatureCard from '@/components/brochure-v2/LightFeatureCard';
import HeroSvgAnimation from '@/components/brochure-v2/HeroSvgAnimation';
import LineIntegrationSvg from '@/components/brochure-v2/LineIntegrationSvg';
import SphereNetworkBackground from '@/components/brochure-v2/SphereNetworkBackground';
import QRCodeMagicSvg from '@/components/brochure-v2/QRCodeMagicSvg';
import LanguageSelector from '@/components/shared/LanguageSelector';
import '@/styles/brochure-v2.css';

export default function BrochureV2Content() {
  const t = useTranslations('brochureV2');
  const [showSubheading, setShowSubheading] = useState(false);
  const [heroRef, heroInView] = useInView({ threshold: 0.1 });
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [activeNotification, setActiveNotification] = useState(0);
  const [modalImage, setModalImage] = useState(null);
  const [config, setConfig] = useState(null);
  const qrSectionRef = useRef(null);
  const phoneRef = useRef(null);

  // Global page scroll for background sphere
  const { scrollYProgress: globalScrollProgress } = useScroll();

  // Phone parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: phoneRef,
    offset: ["start end", "end start"]
  });

  const phoneY = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100]);
  const phoneScale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.85, 1, 1, 0.95]);
  const phoneRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-5, 0, 5]);

  // Convert scroll progress MotionValue to regular value for Three.js
  const [scrollValue, setScrollValue] = useState(0);
  useEffect(() => {
    const unsubscribe = globalScrollProgress.on('change', (latest) => {
      setScrollValue(latest);
    });
    return () => unsubscribe();
  }, [globalScrollProgress]);

  // Floating notifications data
  const notifications = [
    {
      icon: CheckCircle,
      title: t('hero.notifications.newBooking.title'),
      message: t('hero.notifications.newBooking.message'),
      position: 'top-right',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Users,
      title: t('hero.notifications.paymentReceived.title'),
      message: t('hero.notifications.paymentReceived.message'),
      position: 'bottom-left',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: MessageSquare,
      title: t('hero.notifications.lineMessage.title'),
      message: t('hero.notifications.lineMessage.message'),
      position: 'middle-left',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: BarChart3,
      title: t('hero.notifications.analyticsUpdated.title'),
      message: t('hero.notifications.analyticsUpdated.message'),
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
    <div className="relative min-h-screen overflow-x-hidden animate-gradient-bg">
      {/* Fixed Background Animation - 3D Network Sphere */}
      <div className="fixed inset-0 pointer-events-none opacity-70 z-0">
        <SphereNetworkBackground scrollProgress={scrollValue} />
      </div>

      {/* Scroll Progress Bar */}
      <ScrollProgress />

      {/* Language Selector - Fixed position */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector variant='light' />
      </div>

      {/* Pulsing gradient blobs */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
      <div className="fixed top-1/2 left-1/2 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Main Headline with Typewriter */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6"
          >
            <TypewriterText
              text={t('hero.title')}
              speed={80}
              className="block bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
              onComplete={() => setShowSubheading(true)}
            />
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: showSubheading ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed font-medium"
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
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <div className="flex items-center gap-2 px-4 py-2 glass rounded-full hover:shadow-lg transition-all soft-glow">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-800 whitespace-nowrap">{item.text}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showSubheading ? 1 : 0, y: showSubheading ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4"
          >
            <motion.a
              href="/api/auth/login"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group px-8 py-4 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full text-white font-bold text-lg shadow-2xl hover:shadow-xl soft-glow transition-all flex items-center gap-2"
            >
              {t('hero.cta.startTrial')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
            <motion.a
              href="/api/auth/login"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 glass rounded-full text-gray-800 font-bold text-lg hover:shadow-lg transition-all border-2 border-pink-200"
            >
              {t('hero.cta.signIn')}
            </motion.a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: showSubheading ? 1 : 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="text-sm text-gray-600"
          >
            {t('hero.cta.finePrint')}
          </motion.p>

          {/* Floating mockup video */}
          <ParallaxSection speed={-0.3}>
            <motion.div
              ref={phoneRef}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="mt-20"
              style={{
                y: phoneY,
                scale: phoneScale,
                rotateZ: phoneRotate
              }}
            >
              <div className="relative max-w-sm mx-auto perspective-container">
                <InteractiveCard hoverScale={1.03} tiltIntensity={5}>
                  {/* Smartphone Frame */}
                  <div className="relative rounded-[50px] bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-3 shadow-2xl">
                    {/* Phone Bezel Inner Shadow */}
                    <div className="absolute inset-3 rounded-[40px] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]" />

                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-black rounded-b-3xl z-20 shadow-lg">
                      {/* Camera */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-700" />
                      {/* Speaker */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 translate-x-4 w-6 h-1.5 rounded-full bg-gray-800" />
                    </div>

                    {/* Screen */}
                    <div className="relative rounded-[40px] glass shadow-2xl overflow-hidden soft-glow" style={{ aspectRatio: '9/19.5' }}>
                      {/* SVG Animation */}
                      <HeroSvgAnimation />

                      {/* Waving robot video overlay - in front of SVG animations */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-48 h-48 object-contain opacity-30"
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

                      {/* Screen Reflection Overlay */}
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                    </div>

                    {/* Power Button */}
                    <div className="absolute right-0 top-32 w-1 h-16 bg-gray-950 rounded-l-sm" />

                    {/* Volume Buttons */}
                    <div className="absolute left-0 top-28 w-1 h-10 bg-gray-950 rounded-r-sm" />
                    <div className="absolute left-0 top-40 w-1 h-10 bg-gray-950 rounded-r-sm" />
                  </div>
                </InteractiveCard>
              </div>
            </motion.div>
          </ParallaxSection>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={statsInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <InteractiveCard hoverScale={1.05} tiltIntensity={8}>
                <div className="relative overflow-hidden rounded-2xl p-8 shadow-xl bg-gradient-to-br from-orange-100 via-pink-50 to-white border-2 border-orange-200">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-300/20 to-pink-300/20 rounded-full blur-2xl" />
                  <p className="relative text-4xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent leading-tight">
                    {t('stats.lineUsers')}
                  </p>
                </div>
              </InteractiveCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={statsInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <InteractiveCard hoverScale={1.05} tiltIntensity={8}>
                <div className="relative overflow-hidden rounded-2xl p-8 shadow-xl bg-gradient-to-br from-pink-100 via-purple-50 to-white border-2 border-pink-200">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-300/20 to-purple-300/20 rounded-full blur-2xl" />
                  <p className="relative text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent leading-tight">
                    {t('stats.setupTime')}
                  </p>
                </div>
              </InteractiveCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={statsInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <InteractiveCard hoverScale={1.05} tiltIntensity={8}>
                <div className="relative overflow-hidden rounded-2xl p-8 shadow-xl bg-gradient-to-br from-purple-100 via-blue-50 to-white border-2 border-purple-200">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-300/20 to-blue-300/20 rounded-full blur-2xl" />
                  <p className="relative text-4xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent leading-tight">
                    {t('stats.availability')}
                  </p>
                </div>
              </InteractiveCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* LINE Integration Showcase */}
      <section className="relative py-32 px-4">
        <ParallaxSection speed={0.2}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-black mb-6">
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {t('lineIntegration.title')}
                </span>
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
                {t('lineIntegration.subtitle')}
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
                <InteractiveCard hoverScale={1.02} tiltIntensity={5}>
                  <div className="aspect-video rounded-3xl overflow-hidden glass shadow-2xl soft-glow">
                    <LineIntegrationSvg />
                  </div>
                </InteractiveCard>
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
                    whileHover={{ x: 10 }}
                  >
                    <InteractiveCard hoverScale={1.02} tiltIntensity={3}>
                      <div className="flex items-center gap-4 glass rounded-2xl p-4 shadow-lg border-2 border-pink-200">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center shadow-lg">
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-gray-800 text-lg font-bold">{item.text}</p>
                      </div>
                    </InteractiveCard>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </ParallaxSection>
      </section>

      {/* Features Grid */}
      <section className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                {t('features.title')}
              </span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
              {t('features.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <LightFeatureCard
              icon={Zap}
              title={t('features.quickSetup.title')}
              description={t('features.quickSetup.description')}
              gradient="from-orange-400 to-pink-400"
              delay={0.1}
            />
            <LightFeatureCard
              icon={QrCode}
              title={t('features.qrCodes.title')}
              description={t('features.qrCodes.description')}
              gradient="from-pink-400 to-rose-400"
              delay={0.2}
            />
            <LightFeatureCard
              icon={BarChart3}
              title={t('features.analytics.title')}
              description={t('features.analytics.description')}
              gradient="from-purple-400 to-indigo-400"
              delay={0.3}
            />
            <LightFeatureCard
              icon={Calendar}
              title={t('features.scheduling.title')}
              description={t('features.scheduling.description')}
              gradient="from-blue-400 to-cyan-400"
              delay={0.4}
            />
            <LightFeatureCard
              icon={Sparkles}
              title={t('features.customForms.title')}
              description={t('features.customForms.description')}
              gradient="from-emerald-400 to-green-400"
              delay={0.5}
            />
            <LightFeatureCard
              icon={Clock}
              title={t('features.autoReminders.title')}
              description={t('features.autoReminders.description')}
              gradient="from-yellow-400 to-orange-400"
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Analytics Preview */}
      <section className="relative py-32 px-4">
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
                <h2 className="text-4xl md:text-5xl font-black mb-6">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
                    {t('analyticsPreview.title')}
                  </span>
                </h2>
                <p className="text-xl text-gray-800 mb-8 leading-relaxed font-bold">
                  {t('analyticsPreview.description')}
                </p>
                <div className="space-y-4">
                  {[
                    t('analyticsPreview.featuresList.realtimeDashboard'),
                    t('analyticsPreview.featuresList.customerBehavior'),
                    t('analyticsPreview.featuresList.revenueTracking'),
                    t('analyticsPreview.featuresList.staffPerformance')
                  ].map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-gray-900 text-lg font-bold">{feature}</span>
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
                <InteractiveCard hoverScale={1.02} tiltIntensity={5}>
                  <div className="aspect-square rounded-3xl glass shadow-2xl p-8 soft-glow">
                    {/* Simple dashboard visualization */}
                    <div className="space-y-6 h-full flex flex-col justify-around">
                      <div className="bg-gradient-to-br from-cyan-400/30 to-blue-400/30 rounded-2xl p-6 border-2 border-cyan-300 shadow-lg">
                        <p className="text-gray-700 text-sm mb-2 font-bold">{t('analyticsPreview.dashboardMetrics.totalBookings')}</p>
                        <AnimatedCounter
                          end={1247}
                          className="text-4xl font-black text-gray-800"
                        />
                      </div>
                      <div className="bg-gradient-to-br from-pink-400/30 to-rose-400/30 rounded-2xl p-6 border-2 border-pink-300 shadow-lg">
                        <p className="text-gray-700 text-sm mb-2 font-bold">{t('analyticsPreview.dashboardMetrics.thisWeek')}</p>
                        <AnimatedCounter
                          end={89}
                          className="text-4xl font-black text-gray-800"
                        />
                      </div>
                      <div className="bg-gradient-to-br from-emerald-400/30 to-green-400/30 rounded-2xl p-6 border-2 border-emerald-300 shadow-lg">
                        <p className="text-gray-700 text-sm mb-2 font-bold">{t('analyticsPreview.dashboardMetrics.revenue')}</p>
                        <AnimatedCounter
                          end={45280}
                          prefix="$"
                          className="text-4xl font-black text-gray-800"
                        />
                      </div>
                    </div>
                  </div>
                </InteractiveCard>
              </motion.div>
            </div>
          </div>
        </ParallaxSection>
      </section>

      {/* QR Code Feature */}
      <section ref={qrSectionRef} className="relative py-32 px-4">
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
                <InteractiveCard hoverScale={1.02} tiltIntensity={5}>
                  <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl w-full max-w-[700px] mx-auto">
                    <QRCodeMagicSvg containerRef={qrSectionRef} />
                  </div>
                </InteractiveCard>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="order-1 md:order-2"
              >
                <h2 className="text-4xl md:text-5xl font-black mb-6">
                  <span className="bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                    {t('qrCodeFeature.title')}
                  </span>
                </h2>
                <p className="text-xl text-gray-800 mb-8 leading-relaxed font-bold">
                  {t('qrCodeFeature.description')}
                </p>
                <div className="glass rounded-2xl p-6 shadow-lg border-2 border-pink-200">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-black shadow-lg">
                      {t('qrCodeFeature.steps.customize.number')}
                    </div>
                    <div>
                      <p className="text-gray-900 font-black mb-1">{t('qrCodeFeature.steps.customize.title')}</p>
                      <p className="text-gray-700 font-medium">{t('qrCodeFeature.steps.customize.description')}</p>
                    </div>
                  </div>
                  <div className="h-px bg-pink-200 my-4" />
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-black shadow-lg">
                      {t('qrCodeFeature.steps.share.number')}
                    </div>
                    <div>
                      <p className="text-gray-900 font-black mb-1">{t('qrCodeFeature.steps.share.title')}</p>
                      <p className="text-gray-700 font-medium">{t('qrCodeFeature.steps.share.description')}</p>
                    </div>
                  </div>
                  <div className="h-px bg-pink-200 my-4" />
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-black shadow-lg">
                      {t('qrCodeFeature.steps.accept.number')}
                    </div>
                    <div>
                      <p className="text-gray-900 font-black mb-1">{t('qrCodeFeature.steps.accept.title')}</p>
                      <p className="text-gray-700 font-medium">{t('qrCodeFeature.steps.accept.description')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </ParallaxSection>
      </section>

      {/* Screenshots Section */}
      <section className="relative py-32 px-4" id="screenshots">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('screenshots.title')}
              </span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
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
              src="/brochure/mobile-form.webp"
              alt="Mobile Booking Form Interface"
              title={t('screenshots.mobile.title')}
              description={t('screenshots.mobile.description')}
              delay={0.3}
              onClick={() => setModalImage({ src: '/brochure/mobile-form.png', alt: 'Mobile Booking Form Interface' })}
            />

            <ScreenshotCard
              src="/brochure/form-builder.webp"
              alt="Custom Booking Form Builder"
              title={t('screenshots.formBuilder.title')}
              description={t('screenshots.formBuilder.description')}
              delay={0.4}
              reverse
              onClick={() => setModalImage({ src: '/brochure/form-builder.png', alt: 'Custom Booking Form Builder' })}
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <InteractiveCard hoverScale={1.02} tiltIntensity={5}>
              <div className="glass rounded-3xl p-12 shadow-2xl relative overflow-hidden soft-glow border-2 border-pink-200">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 via-pink-400/10 to-purple-400/10 animate-gradient-pulse" />

                <div className="relative z-10">
                  <h2 className="text-4xl md:text-6xl font-black mb-6">
                    <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                      {t('finalCta.title')}
                    </span>
                  </h2>
                  <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto font-medium">
                    {t('finalCta.description')}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                    <motion.a
                      href="/api/auth/login"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group px-10 py-5 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full text-white font-black text-xl shadow-2xl hover:shadow-xl soft-glow transition-all flex items-center gap-3"
                    >
                      {t('finalCta.buttons.getStarted')}
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                    <motion.a
                      href="/api/auth/login"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-10 py-5 glass rounded-full text-gray-800 font-black text-xl hover:shadow-lg transition-all border-2 border-pink-200"
                    >
                      {t('finalCta.buttons.signIn')}
                    </motion.a>
                  </div>

                  <p className="text-gray-600 font-medium">
                    {t('finalCta.finePrint', { trialDays: config ? config.trialDays : 14 })}
                  </p>
                </div>
              </div>
            </InteractiveCard>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t-2 border-pink-200 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-8">
            <div className="md:col-span-1">
              <h3 className="text-gray-800 font-black text-lg mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" />
                {t('footer.brand')}
              </h3>
              <p className="text-gray-600 text-sm mb-4 font-medium">
                {t('footer.tagline')}
              </p>
              <div className="flex gap-4">
                <a href="/api/auth/login" className="text-orange-400 hover:text-pink-400 transition-colors font-bold">
                  {t('footer.sections.account.signIn')}
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-gray-800 font-black mb-4">{t('footer.sections.resources.title')}</h4>
              <ul className="space-y-2 text-gray-600 text-sm font-medium">
                <li><a href="#features" className="hover:text-gray-800 transition-colors">{t('footer.sections.resources.features')}</a></li>
                <li><a href="#pricing" className="hover:text-gray-800 transition-colors">{t('footer.sections.resources.pricing')}</a></li>
                <li><a href="#screenshots" className="hover:text-gray-800 transition-colors">{t('footer.sections.resources.screenshots')}</a></li>
                <li><a href="/api/auth/login" className="hover:text-gray-800 transition-colors">{t('footer.sections.resources.getStarted')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-800 font-black mb-4">{t('footer.sections.legal.title')}</h4>
              <ul className="space-y-2 text-gray-600 text-sm font-medium">
                <li><Link href="/legal/privacy" className="hover:text-gray-800 transition-colors">{t('footer.sections.legal.privacy')}</Link></li>
                <li><Link href="/legal/terms" className="hover:text-gray-800 transition-colors">{t('footer.sections.legal.terms')}</Link></li>
                <li><Link href="/contact" className="hover:text-gray-800 transition-colors">{t('footer.sections.legal.contact')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t-2 border-pink-200 pt-8 text-center text-gray-600 text-sm font-medium">
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
    </div>
  );
}
