'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Unauthorized() {
  const router = useRouter();

  return (
    <main className="relative flex h-screen items-center justify-center overflow-hidden bg-[#010101]">
      <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center -mt-32">
        <Image
          src="/unauthorized.webp"
          alt="Unauthorized Image"
          width={128}
          height={128}
          className="mb-6 animate-in fade-in duration-1000 ease-in-out"
          priority
        />
        <h1 className="mb-2 text-3xl font-semibold text-white">
          Unauthorized
        </h1>
        <p className="text-base text-gray-400">
          You start to feel your grip on reality slipping away. This page is not safe,{" "}
          <button
            onClick={() => router.back()}
            className="text-neutral-100 underline transition-colors hover:text-neutral-300 bg-transparent border-none cursor-pointer"
          >
            turn back
          </button>
          .
        </p>
      </div>
    </main>
  );
}
