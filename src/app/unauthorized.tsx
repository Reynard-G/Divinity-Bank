"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Unauthorized() {
  const router = useRouter();

  return (
    <main className="relative flex h-screen items-center justify-center overflow-hidden bg-[#010101]">
      <div className="relative z-10 -mt-32 flex flex-col items-center justify-center p-8 text-center">
        <Image
          src="/unauthorized.webp"
          alt="Unauthorized Image"
          width={128}
          height={128}
          className="mb-6 duration-1000 ease-in-out animate-in fade-in"
          priority
        />
        <h1 className="mb-2 text-3xl font-semibold text-white">Unauthorized</h1>
        <p className="text-base text-gray-400">
          You start to feel your grip on reality slipping away. This page is not
          safe,{" "}
          <button
            onClick={() => router.back()}
            className="cursor-pointer border-none bg-transparent text-neutral-100 underline transition-colors hover:text-neutral-300"
          >
            turn back
          </button>
          .
        </p>
      </div>
    </main>
  );
}
