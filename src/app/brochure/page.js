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
import ThreeBackground from '@/components/brochure/ThreeBackground';
import TypewriterText from '@/components/brochure/TypewriterText';
import ParallaxSection from '@/components/brochure/ParallaxSection';
import FeatureCard from '@/components/brochure/FeatureCard';
import AnimatedCounter from '@/components/brochure/AnimatedCounter';
import ScreenshotCard from '@/components/brochure/ScreenshotCard';
import FloatingNotification from '@/components/brochure/FloatingNotification';
import ImageModal from '@/components/brochure/ImageModal';

export default function BrochurePage() {
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
            The intelligent booking platform built for Asia. Powered by LINE integration,
            designed for simplicity, packed with analytics.
          </motion.p>

          {/* Quick Value Propositions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showSubheading ? 1 : 0, y: showSubheading ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-3 mb-10 px-4"
          >
            {[
              { icon: Zap, text: '5 Min Setup', gradient: 'from-yellow-400 to-orange-400' },
              { icon: Star, text: 'Free Trial', gradient: 'from-pink-400 to-rose-400' },
              { icon: MessageSquare, text: 'LINE Native', gradient: 'from-green-400 to-emerald-400' },
              { icon: BarChart3, text: 'Real-time Analytics', gradient: 'from-purple-400 to-blue-400' }
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
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
            <motion.a
              href="/api/auth/login"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white/10 backdrop-blur-lg border-2 border-white/30 rounded-full text-white font-bold text-lg hover:bg-white/20 transition-all"
            >
              Sign In
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
              <p className="text-slate-300 mt-2 text-lg">LINE Users in Asia</p>
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
              <p className="text-slate-300 mt-2 text-lg">Setup Time</p>
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
              <p className="text-slate-300 mt-2 text-lg">Always Available</p>
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
                  Powered by LINE
                </span>
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Reach customers where they already are. LINE is Asia's #1 messaging platform
                with over 95 million active users across Japan, Thailand, and Taiwan.
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
                  { icon: MessageSquare, text: 'Instant booking confirmations via LINE chat' },
                  { icon: CheckCircle, text: 'Automated reminders reduce no-shows by 80%' },
                  { icon: Users, text: 'Customers book 24/7 without phone calls' },
                  { icon: Star, text: 'Beautiful LINE cards showcase your services' }
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
                Everything You Need
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Built for business owners who want powerful features without the complexity
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Zap}
              title="5-Minute Setup"
              description="Go live in minutes with our guided setup wizard. No technical skills required."
              gradient="from-orange-500 to-amber-500"
              delay={0.1}
            />
            <FeatureCard
              icon={QrCode}
              title="Branded QR Codes"
              description="Generate beautiful QR codes with your logo. Print or share instantly."
              gradient="from-pink-500 to-rose-500"
              delay={0.2}
            />
            <FeatureCard
              icon={BarChart3}
              title="Powerful Analytics"
              description="Track bookings, revenue, and customer trends with real-time dashboards."
              gradient="from-purple-500 to-indigo-500"
              delay={0.3}
            />
            <FeatureCard
              icon={Calendar}
              title="Smart Scheduling"
              description="Manage staff availability, business hours, and holidays effortlessly."
              gradient="from-blue-500 to-cyan-500"
              delay={0.4}
            />
            <FeatureCard
              icon={Sparkles}
              title="Custom Forms"
              description="Collect any information you need with drag-and-drop form builder."
              gradient="from-emerald-500 to-green-500"
              delay={0.5}
            />
            <FeatureCard
              icon={Clock}
              title="Auto Reminders"
              description="Reduce no-shows with automatic booking reminders via LINE."
              gradient="from-yellow-500 to-orange-500"
              delay={0.6}
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
                    Analytics That Matter
                  </span>
                </h2>
                <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                  See your business performance at a glance. Track bookings, identify
                  your best customers, and make data-driven decisions.
                </p>
                <div className="space-y-4">
                  {[
                    'Real-time booking dashboard',
                    'Customer insights & rankings',
                    'Revenue tracking',
                    'Staff performance metrics'
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
                      <p className="text-slate-400 text-sm mb-2">Total Bookings</p>
                      <AnimatedCounter
                        end={1247}
                        className="text-4xl font-bold text-white"
                      />
                    </div>
                    <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-xl p-6 border border-pink-500/30">
                      <p className="text-slate-400 text-sm mb-2">This Week</p>
                      <AnimatedCounter
                        end={89}
                        className="text-4xl font-bold text-white"
                      />
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl p-6 border border-emerald-500/30">
                      <p className="text-slate-400 text-sm mb-2">Revenue</p>
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
                    Scan. Book. Done.
                  </span>
                </h2>
                <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                  Generate beautiful, branded QR codes in seconds. Customers scan,
                  add your LINE bot, and book instantly. No app downloads required.
                </p>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">Customize Your QR Code</p>
                      <p className="text-slate-400">Add your logo and brand colors</p>
                    </div>
                  </div>
                  <div className="h-px bg-white/10 my-4" />
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">Print or Share</p>
                      <p className="text-slate-400">Display at your location or post online</p>
                    </div>
                  </div>
                  <div className="h-px bg-white/10 my-4" />
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">Start Accepting Bookings</p>
                      <p className="text-slate-400">Customers book via LINE instantly</p>
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
                See Kitsune in Action
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Explore the intuitive interface designed to make booking management effortless
            </p>
          </motion.div>

          <div className="space-y-32">
            <ScreenshotCard
              src="/brochure/booking-modal.webp"
              alt="Kitsune Dashboard with Booking Details"
              title="Powerful Dashboard"
              description="Get instant insights into your business performance. Track bookings, monitor revenue, identify top customers, and make data-driven decisions with real-time analytics at your fingertips."
              delay={0.1}
              onClick={() => setModalImage({ src: '/brochure/booking-modal.png', alt: 'Kitsune Dashboard with Booking Details' })}
            />

            <ScreenshotCard
              src="/brochure/calendar-view.webp"
              alt="Calendar and Scheduling Interface"
              title="Smart Calendar Management"
              description="Visualize your schedule with ease. Multi-view calendar supports day, week, month, and agenda views. Filter by staff, service, or status. Color-coded bookings help you stay organized."
              delay={0.2}
              reverse
              onClick={() => setModalImage({ src: '/brochure/calendar-view.png', alt: 'Calendar and Scheduling Interface' })}
            />

            <ScreenshotCard
              src="/brochure/mobile-form.webp"
              alt="Mobile Booking Form Interface"
              title="Seamless LINE Integration"
              description="Your customers book directly through LINE - Asia's favorite messaging app. Automatic confirmations, reminders, and updates keep everyone informed without any extra effort."
              delay={0.3}
              onClick={() => setModalImage({ src: '/brochure/mobile-form.png', alt: 'Mobile Booking Form Interface' })}
            />

            <ScreenshotCard
              src="/brochure/form-builder.webp"
              alt="Custom Booking Form Builder"
              title="Beautiful QR Codes & Custom Forms"
              description="Generate branded QR codes in seconds. Customize with your logo and colors, then download or print. Build custom booking forms with drag-and-drop simplicity. Customers scan and book instantly - no app downloads required."
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
                  Ready to Transform Your Bookings?
                </span>
              </h2>
              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                Join hundreds of businesses using Kitsune to streamline their booking
                process and delight their customers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <motion.a
                  href="/api/auth/login"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-white font-bold text-xl shadow-2xl hover:shadow-orange-500/50 transition-all flex items-center gap-3"
                >
                  Get Started Free
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </motion.a>
                <motion.a
                  href="/api/auth/login"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-white/10 backdrop-blur-lg border-2 border-white/30 rounded-full text-white font-bold text-xl hover:bg-white/20 transition-all"
                >
                  Sign In
                </motion.a>
              </div>

              <p className="text-slate-400 mt-8">
                No credit card required • 5-minute setup • Free{' '}
                {config ? config.trialDays : 14}-day trial
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
                The intelligent booking platform for modern businesses in Asia.
                LINE-powered scheduling made simple.
              </p>
              <div className="flex gap-4">
                <a href="/api/auth/login" className="text-orange-400 hover:text-orange-300 transition-colors">
                  Sign In
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#screenshots" className="hover:text-white transition-colors">Screenshots</a></li>
                <li><a href="/api/auth/login" className="hover:text-white transition-colors">Get Started</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2025 Kitsune. All rights reserved. Made with ❤️ for Asian businesses.</p>
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
            "name": "Kitsune ",
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
            "description": "Transform your business with Kitsune - the intelligent appointment scheduling platform built for Asia. Seamless LINE integration, 5-minute setup, powerful analytics.",
            "featureList": [
              "LINE Integration",
              "5-Minute Setup",
              "QR Code Generation",
              "Real-time Analytics",
              "Staff Management",
              "Custom Booking Forms",
              "Automated Reminders",
              "Multi-language Support"
            ],
            "screenshot": "/brochure/booking-modal.png"
          })
        }}
      />
    </div>
  );
}
