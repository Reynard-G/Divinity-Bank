import { Link, useNavigate } from "@remix-run/react";
import { useState } from "react";

import { cn } from "~/lib/utils/cn";

const images = ["404_1.jpg", "404_2.jpg", "404_3.jpg", "404_4.jpg"];
const offsets = Array.from({ length: images.length }, (_, i) =>
  i % 2 === 0 ? "translate-y-8" : "-translate-y-8",
);

export default function CatchAllRoute() {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleTurnBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(-1);
  };

  return (
    <main className="flex h-screen items-center justify-center bg-[#161616]">
      <div className="relative -top-4 flex flex-col items-center justify-center p-8 text-center md:-top-16">
        <div
          className="relative mb-8 h-72 w-[256px] overflow-hidden sm:w-[384px] md:w-[512px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {images.map((image, index) => (
            <img
              key={image}
              src={`https://imgs.divinity.milklegend.xyz/${image}`}
              alt={`404 pt. ${index + 1}`}
              className={cn(
                "absolute h-full w-1/4 object-cover opacity-100 mix-blend-lighten brightness-125 transition-all duration-500 ease-in-out animate-in fade-in",
                isHovered
                  ? "translate-y-0 hue-rotate-15 sepia-0"
                  : `${offsets[index]} hue-rotate-0 sepia`,
              )}
              style={{
                left: `${index * 25}%`,
              }}
            />
          ))}
        </div>
        <div className="z-10">
          <h1 className="mb-2 text-3xl font-semibold text-white">
            Page not found
          </h1>
          <p className="text-base text-gray-400">
            Darkness envelops this page. It&apos;s not safe here,{" "}
            <Link
              to="#"
              preventScrollReset
              className="text-neutral-100 underline transition-colors hover:text-neutral-300"
              onClick={handleTurnBack}
            >
              turn back
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
