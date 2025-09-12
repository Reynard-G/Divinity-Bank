'use client';

import { useMediaQuery } from '@/hooks/use-media-query';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <main className="relative flex h-screen items-center justify-center overflow-hidden bg-[#010101]">
      {isMobile !== undefined && (
        <video
          autoPlay
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={isMobile ? '/not-found_background_1080x1080.mp4' : '/not-found_background_1920x1080.mp4'} type="video/mp4" />
        </video>
      )}
      <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="mb-2 text-3xl font-semibold text-white">
          Page not found
        </h1>
        <p className="text-base text-gray-400">
          Darkness envelops this page. It&apos;s not safe here,{" "}
          <button
            onClick={() => router.back()}
            className="text-neutral-100 underline transition-colors hover:text-neutral-300"
          >
            turn back
          </button>
          .
        </p>
      </div>
    </main>
  );
}
