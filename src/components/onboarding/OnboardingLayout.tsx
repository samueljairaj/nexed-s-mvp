
import React from "react";

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-nexed-500" />
            <span className="ml-2 text-xl font-bold text-nexed-800">neXed</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-md border p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-nexed-800">Welcome to neXed</h1>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
