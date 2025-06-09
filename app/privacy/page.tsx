"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen tech-background text-white">
      <div className="min-h-screen container max-w-screen-lg mx-auto px-4 py-6">
        {/* Title at the top */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative text-center mb-6"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 neon-title relative z-10">
            EventSense AI - Privacy Policy
          </h1>
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 rounded-lg blur-sm opacity-30 -z-10"></div>
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto backdrop-blur-md bg-white/5 border border-white/10 rounded-xl shadow-lg p-4 sm:p-6 space-y-6 relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-black/80 rounded-xl -z-10"></div>

          <section className="space-y-4">
            <h2 className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">1. Data Usage</h2>
            <p className="text-xs text-gray-300">
              EventSense AI processes videos to extract emotional highlights. Uploaded videos are used solely for the purpose of generating clips and are not stored permanently.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">2. Data Sharing</h2>
            <p className="text-xs text-gray-300">
              We do not share your videos or generated content with third parties, except for processing by our trusted transcription partner (AssemblyAI).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">3. Data Retention</h2>
            <p className="text-xs text-gray-300">
              Uploaded videos and generated clips may be temporarily cached to improve processing. Data is not stored longer than necessary to provide the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">4. Analytics</h2>
            <p className="text-xs text-gray-300">
              We may collect anonymized usage data (such as number of uploads) to help us improve the service. No personal data is collected without your consent.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">5. Contact</h2>
            <p className="text-xs text-gray-300">
              If you have any questions about this Privacy Policy or your data, please contact us at your.email@example.com.
            </p>
          </section>

          <div className="flex justify-center pt-4">
            <Link href="/" className="bg-blue-600/30 hover:bg-blue-600/40 text-white py-0.5 px-1.5 text-[9px] rounded-sm border border-blue-500/30 flex items-center">
              Return to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}