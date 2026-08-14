'use client';

export default function PublicError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold text-[#CC0000] mb-2">Something went wrong</h2>
        <p className="text-gray-400 text-sm mb-6">We encountered an error loading this page.</p>
        <button onClick={reset} className="bg-[#CC0000] hover:bg-[#a30000] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
          Try Again
        </button>
      </div>
    </div>
  );
}
