import Link from "next/link";
import FallingSakura from '@/components/background/FallingSakura';

export default function Home() {
  return (
    <>
      {/* Falling Sakura Animation */}
      <FallingSakura />

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/50 to-orange-50 pattern-sakura-paws flex items-center justify-center p-4">
      <main className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-12 text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">🦊</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Kitsune Booking
            </h1>
            <p className="text-orange-50 text-lg">
              LINE bot-based booking system for SMBs
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-12">
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-orange-600">⚡</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Setup in 5 minutes</h3>
                  <p className="text-slate-600 text-sm">Configure your business info, services, and bot workflow</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-orange-600">💬</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">LINE integration</h3>
                  <p className="text-slate-600 text-sm">Customers book via LINE - the #1 messaging app in Asia</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-orange-600">🎨</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Customizable workflow</h3>
                  <p className="text-slate-600 text-sm">Build your bot's conversation flow with drag & drop components</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/setup"
              className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-center px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl"
            >
              Start Setup Wizard →
            </Link>

            <p className="text-center text-slate-500 text-sm mt-4">
              No credit card required
            </p>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}
