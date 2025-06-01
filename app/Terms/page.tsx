"use client";

import React from "react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <p className="mb-4">
        Welcome to EventSense AI. By accessing or using our platform, you agree to be bound by these Terms of Service.
        Please read them carefully.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Use of the Service</h2>
      <p className="mb-4">
        You may use EventSense AI only in compliance with these Terms and all applicable laws. You are responsible
        for your use of the service and for any data, content, or video you upload or process through our platform.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Content</h2>
      <p className="mb-4">
        You retain ownership of the content you upload. By using EventSense AI, you grant us the rights necessary
        to process, analyze, and generate output from your media using our tools.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Termination</h2>
      <p className="mb-4">
        We may suspend or terminate your access if you violate these Terms or misuse the service.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Disclaimer</h2>
      <p className="mb-4">
        EventSense AI is provided &ldquo;as-is&rdquo; without warranties of any kind. We do not guarantee that the service will
        be error-free or uninterrupted.
        <p>This is a &ldquo;disclaimer&rdquo; section.</p>
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Contact</h2>
      <p>
        For questions about these Terms, please contact us at <a href="mailto:support@eventsense.ai" className="text-blue-500 hover:underline">support@eventsense.ai</a>.
      </p>
    </div>
  );
}
