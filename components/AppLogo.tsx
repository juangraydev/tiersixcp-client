'use client';

import { useState } from 'react';
import Image from 'next/image';

interface AppLogoProps {
  className?: string;
}

export default function AppLogo({ className = '' }: AppLogoProps) {
  const [imageError, setImageError] = useState(false);

  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'MyApp';
  const logoUrl = process.env.NEXT_PUBLIC_APP_LOGO;

  // Render image if provided and valid
  if (logoUrl && !imageError) {
    return (
      <div className={`relative flex items-center ${className}`}>
        <Image
          src={logoUrl}
          alt={appName}
          width={120}
          height={40}
          className="h-8 w-auto object-contain"
          onError={() => setImageError(true)}
          priority
        />
      </div>
    );
  }

  // Text fallback styled with primary red color
  return (
    <span className={`text-xl font-bold tracking-tight text-red-500 hover:text-red-400 transition-colors ${className}`}>
      {appName}
    </span>
  );
}