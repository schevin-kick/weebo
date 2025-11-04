import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';
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

/**
 * Server-rendered content for SEO
 * This component renders all the text, images, and semantic HTML
 * Client components will wrap sections for interactivity
 */
export default async function BrochureV2ServerContent({ locale }) {
  const t = await getTranslations({ locale, namespace: 'brochureV2' });

  return (
    <>
      {/* Hero Section - Server rendered content */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Main Headline - SEO Critical */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            {t('hero.title')}
          </h1>

          {/* Subheading - SEO Critical */}
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed font-medium">
            {t('hero.subtitle')}
          </p>

          {/* Value Props - SEO visible */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 px-4">
            <div className="flex items-center gap-2 px-4 py-2 glass rounded-full shadow-lg">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center flex-shrink-0">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-800 whitespace-nowrap">
                {t('hero.valueProps.quickSetup')}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 glass rounded-full shadow-lg">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center flex-shrink-0">
                <Star className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-800 whitespace-nowrap">
                {t('hero.valueProps.freeTrial')}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 glass rounded-full shadow-lg">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-800 whitespace-nowrap">
                {t('hero.valueProps.lineNative')}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 glass rounded-full shadow-lg">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-800 whitespace-nowrap">
                {t('hero.valueProps.analytics')}
              </span>
            </div>
          </div>

          {/* CTA Buttons - SEO crawlable links */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
            <a
              href="/api/auth/login"
              className="group px-8 py-4 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full text-white font-bold text-lg shadow-2xl flex items-center gap-2"
            >
              {t('hero.cta.startTrial')}
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/api/auth/login"
              className="px-8 py-4 glass rounded-full text-gray-800 font-bold text-lg border-2 border-pink-200"
            >
              {t('hero.cta.signIn')}
            </a>
          </div>

          <p className="text-sm text-gray-600">
            {t('hero.cta.finePrint')}
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="glass rounded-3xl p-8 shadow-xl">
              <p className="text-5xl font-black bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                {t('stats.lineUsers')}
              </p>
            </div>
            <div className="glass rounded-3xl p-8 shadow-xl">
              <p className="text-5xl font-black bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {t('stats.setupTime')}
              </p>
            </div>
            <div className="glass rounded-3xl p-8 shadow-xl">
              <p className="text-5xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {t('stats.availability')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LINE Integration Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {t('lineIntegration.title')}
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
              {t('lineIntegration.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-video rounded-3xl overflow-hidden glass shadow-2xl" />

            <div className="space-y-6">
              <div className="flex items-center gap-4 glass rounded-2xl p-4 shadow-lg border-2 border-pink-200">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-800 text-lg font-bold">
                  {t('lineIntegration.benefits.instantConfirmations')}
                </p>
              </div>
              <div className="flex items-center gap-4 glass rounded-2xl p-4 shadow-lg border-2 border-pink-200">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-800 text-lg font-bold">
                  {t('lineIntegration.benefits.autoReminders')}
                </p>
              </div>
              <div className="flex items-center gap-4 glass rounded-2xl p-4 shadow-lg border-2 border-pink-200">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-800 text-lg font-bold">
                  {t('lineIntegration.benefits.alwaysAvailable')}
                </p>
              </div>
              <div className="flex items-center gap-4 glass rounded-2xl p-4 shadow-lg border-2 border-pink-200">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-800 text-lg font-bold">
                  {t('lineIntegration.benefits.beautifulCards')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass rounded-3xl p-8 shadow-xl border-2 border-pink-200">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center mb-6 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-3">
                {t('features.quickSetup.title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('features.quickSetup.description')}
              </p>
            </div>

            <div className="glass rounded-3xl p-8 shadow-xl border-2 border-pink-200">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center mb-6 shadow-lg">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-3">
                {t('features.qrCodes.title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('features.qrCodes.description')}
              </p>
            </div>

            <div className="glass rounded-3xl p-8 shadow-xl border-2 border-pink-200">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center mb-6 shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-3">
                {t('features.analytics.title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('features.analytics.description')}
              </p>
            </div>

            <div className="glass rounded-3xl p-8 shadow-xl border-2 border-pink-200">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center mb-6 shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-3">
                {t('features.scheduling.title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('features.scheduling.description')}
              </p>
            </div>

            <div className="glass rounded-3xl p-8 shadow-xl border-2 border-pink-200">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-400 flex items-center justify-center mb-6 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-3">
                {t('features.customForms.title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('features.customForms.description')}
              </p>
            </div>

            <div className="glass rounded-3xl p-8 shadow-xl border-2 border-pink-200">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center mb-6 shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-3">
                {t('features.autoReminders.title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('features.autoReminders.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Preview */}
      <section className="relative py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {t('analyticsPreview.title')}
              </h2>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed font-medium">
                {t('analyticsPreview.description')}
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                  <span className="text-gray-800 text-lg font-medium">
                    {t('analyticsPreview.featuresList.realtimeDashboard')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                  <span className="text-gray-800 text-lg font-medium">
                    {t('analyticsPreview.featuresList.customerBehavior')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                  <span className="text-gray-800 text-lg font-medium">
                    {t('analyticsPreview.featuresList.revenueTracking')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                  <span className="text-gray-800 text-lg font-medium">
                    {t('analyticsPreview.featuresList.staffPerformance')}
                  </span>
                </div>
              </div>
            </div>

            <div className="aspect-square rounded-3xl glass shadow-2xl p-8">
              <div className="space-y-6 h-full flex flex-col justify-around">
                <div className="bg-gradient-to-br from-cyan-400/30 to-blue-400/30 rounded-2xl p-6 border-2 border-cyan-300 shadow-lg">
                  <p className="text-gray-700 text-sm mb-2 font-bold">
                    {t('analyticsPreview.dashboardMetrics.totalBookings')}
                  </p>
                  <p className="text-4xl font-black text-gray-800">1,247</p>
                </div>
                <div className="bg-gradient-to-br from-pink-400/30 to-rose-400/30 rounded-2xl p-6 border-2 border-pink-300 shadow-lg">
                  <p className="text-gray-700 text-sm mb-2 font-bold">
                    {t('analyticsPreview.dashboardMetrics.thisWeek')}
                  </p>
                  <p className="text-4xl font-black text-gray-800">89</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-400/30 to-green-400/30 rounded-2xl p-6 border-2 border-emerald-300 shadow-lg">
                  <p className="text-gray-700 text-sm mb-2 font-bold">
                    {t('analyticsPreview.dashboardMetrics.revenue')}
                  </p>
                  <p className="text-4xl font-black text-gray-800">$45,280</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QR Code Feature */}
      <section className="relative py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl w-full max-w-[700px] mx-auto" />

            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                {t('qrCodeFeature.title')}
              </h2>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed font-medium">
                {t('qrCodeFeature.description')}
              </p>
              <div className="glass rounded-2xl p-6 shadow-lg border-2 border-pink-200">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white font-black shadow-lg">
                    {t('qrCodeFeature.steps.customize.number')}
                  </div>
                  <div>
                    <p className="text-gray-800 font-black mb-1">
                      {t('qrCodeFeature.steps.customize.title')}
                    </p>
                    <p className="text-gray-600">
                      {t('qrCodeFeature.steps.customize.description')}
                    </p>
                  </div>
                </div>
                <div className="h-px bg-pink-200 my-4" />
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white font-black shadow-lg">
                    {t('qrCodeFeature.steps.share.number')}
                  </div>
                  <div>
                    <p className="text-gray-800 font-black mb-1">
                      {t('qrCodeFeature.steps.share.title')}
                    </p>
                    <p className="text-gray-600">
                      {t('qrCodeFeature.steps.share.description')}
                    </p>
                  </div>
                </div>
                <div className="h-px bg-pink-200 my-4" />
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white font-black shadow-lg">
                    {t('qrCodeFeature.steps.accept.number')}
                  </div>
                  <div>
                    <p className="text-gray-800 font-black mb-1">
                      {t('qrCodeFeature.steps.accept.title')}
                    </p>
                    <p className="text-gray-600">
                      {t('qrCodeFeature.steps.accept.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="relative py-32 px-4" id="screenshots">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('screenshots.title')}
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
              {t('screenshots.subtitle')}
            </p>
          </div>

          <div className="space-y-32">
            {/* Dashboard Screenshot */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/brochure/booking-modal.webp"
                  alt="Kitsune Dashboard with Booking Details"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div>
                <h3 className="text-3xl font-black text-gray-800 mb-4">
                  {t('screenshots.dashboard.title')}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t('screenshots.dashboard.description')}
                </p>
              </div>
            </div>

            {/* Calendar Screenshot */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-3xl font-black text-gray-800 mb-4">
                  {t('screenshots.calendar.title')}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t('screenshots.calendar.description')}
                </p>
              </div>
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl order-1 md:order-2">
                <Image
                  src="/brochure/calendar-view.webp"
                  alt="Calendar and Scheduling Interface"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Mobile Screenshot */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/brochure/mobile-form.webp"
                  alt="Mobile Booking Form Interface"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div>
                <h3 className="text-3xl font-black text-gray-800 mb-4">
                  {t('screenshots.mobile.title')}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t('screenshots.mobile.description')}
                </p>
              </div>
            </div>

            {/* Form Builder Screenshot */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-3xl font-black text-gray-800 mb-4">
                  {t('screenshots.formBuilder.title')}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t('screenshots.formBuilder.description')}
                </p>
              </div>
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl order-1 md:order-2">
                <Image
                  src="/brochure/form-builder.webp"
                  alt="Custom Booking Form Builder"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 shadow-2xl relative overflow-hidden border-2 border-pink-200">
            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {t('finalCta.title')}
            </h2>
            <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto font-medium">
              {t('finalCta.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <a
                href="/api/auth/login"
                className="group px-10 py-5 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full text-white font-black text-xl shadow-2xl flex items-center gap-3"
              >
                {t('finalCta.buttons.getStarted')}
                <ArrowRight className="w-6 h-6" />
              </a>
              <a
                href="/api/auth/login"
                className="px-10 py-5 glass rounded-full text-gray-800 font-black text-xl border-2 border-pink-200"
              >
                {t('finalCta.buttons.signIn')}
              </a>
            </div>

            <p className="text-gray-600 font-medium">
              {t('finalCta.finePrint', { trialDays: 14 })}
            </p>
          </div>
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
              <h4 className="text-gray-800 font-black mb-4">
                {t('footer.sections.resources.title')}
              </h4>
              <ul className="space-y-2 text-gray-600 text-sm font-medium">
                <li>
                  <a href="#features" className="hover:text-gray-800 transition-colors">
                    {t('footer.sections.resources.features')}
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-gray-800 transition-colors">
                    {t('footer.sections.resources.pricing')}
                  </a>
                </li>
                <li>
                  <a href="#screenshots" className="hover:text-gray-800 transition-colors">
                    {t('footer.sections.resources.screenshots')}
                  </a>
                </li>
                <li>
                  <a href="/api/auth/login" className="hover:text-gray-800 transition-colors">
                    {t('footer.sections.resources.getStarted')}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-800 font-black mb-4">
                {t('footer.sections.legal.title')}
              </h4>
              <ul className="space-y-2 text-gray-600 text-sm font-medium">
                <li>
                  <Link href="/legal/privacy" className="hover:text-gray-800 transition-colors">
                    {t('footer.sections.legal.privacy')}
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms" className="hover:text-gray-800 transition-colors">
                    {t('footer.sections.legal.terms')}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-gray-800 transition-colors">
                    {t('footer.sections.legal.contact')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t-2 border-pink-200 pt-8 text-center text-gray-600 text-sm font-medium">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
