import { type MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Unauthorized • Divinity" },
    {
      name: "description",
      content: "Whatcha doing here lil bro? You ain't supposed to be here! 😡",
    },
  ];
};

export default function Unauthorized() {
  return (
    <main className="relative flex h-dvh items-center justify-center bg-black">
      <img
        className="relative z-10 object-contain mix-blend-luminosity duration-1000 animate-in fade-in"
        src="/unauthorized.webp"
        alt="Unauthorized"
        width="1920"
        height="1080"
      />

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 text-center font-metal_mania">
        <h1 className="text-4xl font-bold text-white delay-500 duration-1000 animate-in fade-in slide-in-from-top-1 fill-mode-backwards">
          Unauthorized
        </h1>
        <p className="max-w-md text-lg text-white delay-500 duration-1000 animate-in fade-in slide-in-from-bottom-1 fill-mode-backwards">
          The void consumes all. You are not supposed to be here. Go back to
          where you belong...
        </p>
      </div>
    </main>
  );
}
