'use client';

import { useTranslations } from 'next-intl';
import { FileText, ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import LegalNav from '@/components/legal/LegalNav';
import LanguageSelector from '@/components/shared/LanguageSelector';

export default function TermsOfServicePage() {
  const t = useTranslations('legal.terms');
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
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

        {/* Acceptance Notice */}
        <div className="mb-8 p-6 bg-orange-500/10 border border-orange-500/30 rounded-xl">
          <p className="text-slate-200">{t('acceptance')}</p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Section 1: Definitions */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t('sections.definitions.title')}
            </h2>
            <div className="space-y-4">
              {Object.entries(t.raw('sections.definitions.items')).map(([key, value]) => (
                <div key={key} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-slate-300">{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Service Description */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('sections.serviceDescription.title')}
            </h2>
            <p className="text-slate-300 mb-6">{t('sections.serviceDescription.description')}</p>
            <ul className="space-y-2 text-slate-300 mb-6">
              {t.raw('sections.serviceDescription.features').map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <p className="text-slate-400 text-sm italic">
              {t('sections.serviceDescription.availability')}
            </p>
          </section>

          {/* Section 3: Eligibility */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t('sections.eligibility.title')}
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {t('sections.eligibility.requirements.title')}
                </h3>
                <ul className="space-y-2 text-slate-300">
                  {t.raw('sections.eligibility.requirements.items').map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {t('sections.eligibility.registration.title')}
                </h3>
                <p className="text-slate-300 mb-3">
                  {t('sections.eligibility.registration.description')}
                </p>
                <ul className="space-y-2 text-slate-300">
                  {t.raw('sections.eligibility.registration.items').map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-slate-400 text-sm italic">
                {t('sections.eligibility.termination')}
              </p>
            </div>
          </section>

          {/* Section 4: Acceptable Use */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t('sections.acceptableUse.title')}
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-green-400 mb-2">
                  {t('sections.acceptableUse.permitted.title')}
                </h3>
                <p className="text-slate-300">
                  {t('sections.acceptableUse.permitted.description')}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-red-400 mb-3">
                  {t('sections.acceptableUse.prohibited.title')}
                </h3>
                <p className="text-slate-300 mb-3">
                  {t('sections.acceptableUse.prohibited.description')}
                </p>
                <ul className="space-y-2 text-slate-300">
                  {t.raw('sections.acceptableUse.prohibited.items').map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-slate-300 font-semibold">
                  {t('sections.acceptableUse.enforcement')}
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: LINE Integration */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t('sections.lineIntegration.title')}
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {t('sections.lineIntegration.lineTerms.title')}
                </h3>
                <p className="text-slate-300 mb-3">
                  {t('sections.lineIntegration.lineTerms.description')}
                </p>
                <ul className="space-y-2 text-slate-300">
                  {t.raw('sections.lineIntegration.lineTerms.items').map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {t('sections.lineIntegration.limitations.title')}
                </h3>
                <ul className="space-y-2 text-slate-300">
                  {t.raw('sections.lineIntegration.limitations.items').map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t('sections.lineIntegration.thirdParty.title')}
                </h3>
                <p className="text-slate-300">
                  {t('sections.lineIntegration.thirdParty.description')}
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Payment */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t('sections.payment.title')}
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t('sections.payment.pricing.title')}
                </h3>
                <p className="text-slate-300">{t('sections.payment.pricing.description')}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {t('sections.payment.billing.title')}
                </h3>
                <ul className="space-y-2 text-slate-300">
                  {t.raw('sections.payment.billing.items').map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t('sections.payment.freeTrial.title')}
                </h3>
                <p className="text-slate-300">{t('sections.payment.freeTrial.description')}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {t('sections.payment.refunds.title')}
                </h3>
                <ul className="space-y-2 text-slate-300">
                  {t.raw('sections.payment.refunds.items').map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Sections 7-15 continue with similar patterns */}
          {/* For brevity, I'll include key sections abbreviated */}

          {/* Section 7: IP */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t('sections.intellectualProperty.title')}
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {t('sections.intellectualProperty.ownership.title')}
                </h3>
                <p className="text-slate-300 mb-3">
                  {t('sections.intellectualProperty.ownership.description')}
                </p>
                <ul className="space-y-2 text-slate-300">
                  {t.raw('sections.intellectualProperty.ownership.items').map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t('sections.intellectualProperty.userContent.title')}
                </h3>
                <p className="text-slate-300">
                  {t('sections.intellectualProperty.userContent.description')}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t('sections.intellectualProperty.lineTrademarks.title')}
                </h3>
                <p className="text-slate-300">
                  {t('sections.intellectualProperty.lineTrademarks.description')}
                </p>
              </div>
            </div>
          </section>

          {/* Section 8: Data Ownership */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t('sections.dataOwnership.title')}
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {t('sections.dataOwnership.customerData.title')}
                </h3>
                <p className="text-slate-300 mb-3">
                  {t('sections.dataOwnership.customerData.description')}
                </p>
                <ul className="space-y-2 text-slate-300">
                  {t.raw('sections.dataOwnership.customerData.items').map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t('sections.dataOwnership.companyData.title')}
                </h3>
                <p className="text-slate-300">
                  {t('sections.dataOwnership.companyData.description')}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t('sections.dataOwnership.dataPortability.title')}
                </h3>
                <p className="text-slate-300">
                  {t('sections.dataOwnership.dataPortability.description')}
                </p>
              </div>
            </div>
          </section>

          {/* Section 9: Warranties */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t('sections.warranties.title')}
            </h2>
            <div className="space-y-6">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <h3 className="text-xl font-semibold text-yellow-400 mb-3">
                  {t('sections.warranties.disclaimer.title')}
                </h3>
                <p className="text-slate-300 mb-3 uppercase font-bold">
                  {t('sections.warranties.disclaimer.description')}
                </p>
                <ul className="space-y-2 text-slate-300">
                  {t.raw('sections.warranties.disclaimer.items').map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span className="uppercase">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Section 10: Limitation of Liability */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t('sections.limitation.title')}
            </h2>
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
              <h3 className="text-xl font-semibold text-red-400 mb-3">
                {t('sections.limitation.general.title')}
              </h3>
              <p className="text-slate-300 mb-3 uppercase font-bold">
                {t('sections.limitation.general.description')}
              </p>
              <ul className="space-y-2 text-slate-300">
                {t.raw('sections.limitation.general.items').map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span className="uppercase">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">
                {t('sections.limitation.jurisdictions.title')}
              </h3>
              <p className="text-slate-300">{t('sections.limitation.jurisdictions.description')}</p>
            </div>
          </section>

          {/* Section 11: Indemnification */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('sections.indemnification.title')}
            </h2>
            <p className="text-slate-300 mb-4">{t('sections.indemnification.description')}</p>
            <ul className="space-y-2 text-slate-300">
              {t.raw('sections.indemnification.items').map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 12: Termination */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t('sections.termination.title')}
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t('sections.termination.byUser.title')}
                </h3>
                <p className="text-slate-300">{t('sections.termination.byUser.description')}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {t('sections.termination.byCompany.title')}
                </h3>
                <p className="text-slate-300 mb-3">
                  {t('sections.termination.byCompany.description')}
                </p>
                <ul className="space-y-2 text-slate-300">
                  {t.raw('sections.termination.byCompany.items').map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {t('sections.termination.effect.title')}
                </h3>
                <p className="text-slate-300 mb-3">{t('sections.termination.effect.description')}</p>
                <ul className="space-y-2 text-slate-300">
                  {t.raw('sections.termination.effect.items').map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Section 13: Dispute Resolution */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t('sections.disputeResolution.title')}
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t('sections.disputeResolution.governingLaw.title')}
                </h3>
                <p className="text-slate-300">
                  {t('sections.disputeResolution.governingLaw.description')}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t('sections.disputeResolution.jurisdiction.title')}
                </h3>
                <p className="text-slate-300">
                  {t('sections.disputeResolution.jurisdiction.description')}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t('sections.disputeResolution.arbitration.title')}
                </h3>
                <p className="text-slate-300">
                  {t('sections.disputeResolution.arbitration.description')}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t('sections.disputeResolution.classAction.title')}
                </h3>
                <p className="text-slate-300">
                  {t('sections.disputeResolution.classAction.description')}
                </p>
              </div>
            </div>
          </section>

          {/* Section 14: General Provisions - abbreviated for space */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t('sections.general.title')}
            </h2>
            <div className="space-y-4">
              {Object.entries(t.raw('sections.general')).filter(([key]) => key !== 'title').map(([key, section]) => (
                <div key={key} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-2">{section.title}</h3>
                  <p className="text-slate-300">{section.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 15: Contact */}
          <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('sections.contact.title')}
            </h2>
            <p className="text-slate-300 mb-4">{t('sections.contact.description')}</p>
            <ul className="space-y-2 text-slate-300">
              {t.raw('sections.contact.methods').map((method, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>{method}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Back to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full text-white shadow-lg hover:shadow-orange-500/50 transition-all hover:scale-110"
            aria-label={tCommon('backToTop')}
          >
            <ArrowUp className="w-6 h-6" />
          </button>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-white/10 text-center text-slate-400 text-sm">
          <p>
            These Terms of Service are provided for informational purposes. Please consult with legal
            counsel for specific legal advice.
          </p>
        </footer>
      </div>
    </div>
  );
}
