'use client';

import { useTranslations } from 'next-intl';
import { Shield, ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import LegalNav from '@/components/legal/LegalNav';
import LanguageSelector from '@/components/shared/LanguageSelector';

export default function PrivacyPolicyPage() {
  const t = useTranslations('legal.privacy');
  const tCommon = useTranslations('legal.common');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen px-4 py-12">
      {/* Language Selector */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      {/* Container */}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          <div className="mt-6 text-sm text-slate-400">
            <p>{tCommon('lastUpdated')}: January 15, 2025</p>
            <p>{tCommon('effectiveDate')}: January 15, 2025</p>
          </div>
        </div>

        {/* Navigation */}
        <LegalNav />

        {/* Jurisdiction Notice */}
        <div className="mb-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <p className="text-slate-200">{t('jurisdiction')}</p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Section 1: Data Collection */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('sections.dataCollection.title')}
            </h2>
            <p className="text-slate-300 mb-6">{t('sections.dataCollection.intro')}</p>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {t('sections.dataCollection.personalInfo.title')}
                </h3>
                <ul className="space-y-2 text-slate-300">
                  {t.raw('sections.dataCollection.personalInfo.items').map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {t('sections.dataCollection.automaticInfo.title')}
                </h3>
                <ul className="space-y-2 text-slate-300">
                  {t.raw('sections.dataCollection.automaticInfo.items').map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {t('sections.dataCollection.thirdParty.title')}
                </h3>
                <ul className="space-y-2 text-slate-300">
                  {t.raw('sections.dataCollection.thirdParty.items').map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: How We Use */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('sections.howWeUse.title')}
            </h2>
            <p className="text-slate-300 mb-6">{t('sections.howWeUse.intro')}</p>
            <ul className="space-y-2 text-slate-300">
              {t.raw('sections.howWeUse.items').map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 3: Data Sharing */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('sections.dataSharing.title')}
            </h2>
            <p className="text-slate-300 mb-6">{t('sections.dataSharing.intro')}</p>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {t('sections.dataSharing.serviceProviders.title')}
                </h3>
                <p className="text-slate-300 mb-3">
                  {t('sections.dataSharing.serviceProviders.description')}
                </p>
                <ul className="space-y-2 text-slate-300">
                  {t.raw('sections.dataSharing.serviceProviders.items').map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t('sections.dataSharing.businessTransfers.title')}
                </h3>
                <p className="text-slate-300">
                  {t('sections.dataSharing.businessTransfers.description')}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t('sections.dataSharing.legalRequirements.title')}
                </h3>
                <p className="text-slate-300">
                  {t('sections.dataSharing.legalRequirements.description')}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t('sections.dataSharing.withConsent.title')}
                </h3>
                <p className="text-slate-300">
                  {t('sections.dataSharing.withConsent.description')}
                </p>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h3 className="text-xl font-semibold text-green-400 mb-2">
                  {t('sections.dataSharing.noSale.title')}
                </h3>
                <p className="text-slate-300">
                  {t('sections.dataSharing.noSale.description')}
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Your Rights */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('sections.yourRights.title')}
            </h2>
            <p className="text-slate-300 mb-6">{t('sections.yourRights.intro')}</p>

            <div className="space-y-4">
              {t.raw('sections.yourRights.rights').map((right, idx) => (
                <div key={idx} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-lg font-semibold text-cyan-400 mb-2">{right.title}</h3>
                  <p className="text-slate-300">{right.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">
                {t('sections.yourRights.exercise.title')}
              </h3>
              <p className="text-slate-300">
                {t('sections.yourRights.exercise.description')}
              </p>
            </div>
          </section>

          {/* Section 5: Data Security */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('sections.dataSecurity.title')}
            </h2>
            <p className="text-slate-300 mb-6">{t('sections.dataSecurity.description')}</p>
            <ul className="space-y-2 text-slate-300 mb-6">
              {t.raw('sections.dataSecurity.items').map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-slate-400 text-sm italic">
              {t('sections.dataSecurity.disclaimer')}
            </p>
          </section>

          {/* Section 6: Data Retention */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('sections.dataRetention.title')}
            </h2>
            <p className="text-slate-300 mb-6">{t('sections.dataRetention.description')}</p>
            <ul className="space-y-2 text-slate-300">
              {t.raw('sections.dataRetention.items').map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 7: Cookies */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('sections.cookies.title')}
            </h2>
            <p className="text-slate-300 mb-6">{t('sections.cookies.description')}</p>

            <div className="space-y-4 mb-6">
              {t.raw('sections.cookies.types').map((type, idx) => (
                <div key={idx} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-2">{type.title}</h3>
                  <p className="text-slate-300">{type.description}</p>
                </div>
              ))}
            </div>

            <p className="text-slate-400 text-sm italic">{t('sections.cookies.control')}</p>
          </section>

          {/* Section 8: International Transfers */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('sections.international.title')}
            </h2>
            <p className="text-slate-300 mb-6">{t('sections.international.description')}</p>
            <ul className="space-y-2 text-slate-300">
              {t.raw('sections.international.items').map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 9: Children's Privacy */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('sections.childrenPrivacy.title')}
            </h2>
            <p className="text-slate-300">{t('sections.childrenPrivacy.description')}</p>
          </section>

          {/* Section 10: Third-Party Links */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('sections.thirdPartyLinks.title')}
            </h2>
            <p className="text-slate-300">{t('sections.thirdPartyLinks.description')}</p>
          </section>

          {/* Section 11: Changes */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('sections.changes.title')}
            </h2>
            <p className="text-slate-300">{t('sections.changes.description')}</p>
          </section>

          {/* Section 12: Contact */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('sections.contact.title')}
            </h2>
            <p className="text-slate-300 mb-4">{t('sections.contact.description')}</p>
            <ul className="space-y-2 text-slate-300 mb-4">
              {t.raw('sections.contact.methods').map((method, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>{method}</span>
                </li>
              ))}
            </ul>
            <p className="text-slate-400 text-sm italic">{t('sections.contact.response')}</p>
          </section>
        </div>

        {/* Back to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-white shadow-lg hover:shadow-cyan-500/50 transition-all hover:scale-110"
            aria-label={tCommon('backToTop')}
          >
            <ArrowUp className="w-6 h-6" />
          </button>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-white/10 text-center text-slate-400 text-sm">
          <p>
            This Privacy Policy is provided for informational purposes. Please consult with legal
            counsel for specific legal advice.
          </p>
        </footer>
      </div>
    </div>
  );
}
