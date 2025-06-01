"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-white dark:bg-black text-gray-900 dark:text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Oops! The page you&#39;re looking for doesn&#39;t exist.</p>
      <Link
        href="/"
        className="px-6 py-2 bg-brand-primary text-white rounded hover:bg-indigo-700 transition"
      >
        Go Home
      </Link>
    </motion.div>
  );
}
