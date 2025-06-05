"use client";

import { useTheme } from "@/lib/useTheme";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex space-x-4">
      <button
        className={`px-4 py-2 rounded ${
          theme === "light" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
        }`}
        onClick={() => setTheme("light")}
      >
        Light
      </button>
      <button
        className={`px-4 py-2 rounded ${
          theme === "dark" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
        }`}
        onClick={() => setTheme("dark")}
      >
        Dark
      </button>
      <button
        className={`px-4 py-2 rounded ${
          theme === "system" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
        }`}
        onClick={() => setTheme("system")}
      >
        System
      </button>
    </div>
  );
}
