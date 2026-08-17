'use client';

import AppLogo from '@/components/AppLogo';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white animate-fadeIn">
      <div className="flex flex-col items-center space-y-4">
        {/* App Logo */}
        <div className="scale-150 transform font-extrabold tracking-wide">
          <AppLogo />
        </div>

        {/* Loading Spinner Icon */}
        <div className="pt-2">
          <svg
            className="h-8 w-8 animate-spin text-red-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>

        {/* Loading Text */}
        <p className="text-sm font-medium tracking-widest text-neutral-400 uppercase animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}