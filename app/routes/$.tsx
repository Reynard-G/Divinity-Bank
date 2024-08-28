import { Link, useNavigate } from "@remix-run/react";
import { useState } from "react";

import { cn } from "~/lib/utils/cn";

export default function CatchAllRoute() {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleTurnBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(-1);
  };

  // Define offsets for each image
  const offsets = [
    "-translate-y-8",
    "translate-y-4",
    "-translate-y-6",
    "translate-y-10",
  ];

  return (
    <main className="flex h-screen items-center justify-center bg-[#161616]">
      <div className="relative -top-16 flex flex-col items-center justify-center text-center">
        <div
          className="relative mb-8 h-72 w-[400px] overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {[1, 2, 3, 4].map((num, index) => (
            <img
              key={num}
              src={`https://imgs.divinity.milklegend.xyz/404_${num}.jpg`}
              alt={`404 part ${num}`}
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
