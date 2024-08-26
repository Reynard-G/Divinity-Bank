import { Link, useNavigate } from "@remix-run/react";
import { useState } from "react";

import { cn } from "~/lib/utils/cn";

export default function CatchAllRoute() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();

  const handleTurnBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(-1);
  };

  return (
    <main className="flex h-screen items-center justify-center bg-[#161616]">
      <div className="relative -top-16 flex flex-col items-center justify-center text-center">
        <div className="relative mb-8 h-72 overflow-hidden">
          <img
            src="https://imgs.divinity.milklegend.xyz/404.jpg"
            alt="404"
            className={cn(
              "h-full w-full object-cover mix-blend-lighten brightness-125",
              imageLoaded
                ? "opacity-100 duration-1000 animate-in fade-in"
                : "opacity-0",
            )}
            onLoad={() => setImageLoaded(true)}
            ref={(img) => {
              if (img && img.complete) setImageLoaded(true);
            }}
          />
        </div>
        <div className="z-10">
          <h1 className="mb-2 text-3xl font-semibold text-white">
            Page not found
          </h1>
          <p className="text-sm text-gray-400">
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
