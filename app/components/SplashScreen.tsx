"use client";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-99999 bg-white">
      <img
        src="/splash.png"
        alt="Workkerz"
        className="w-full h-full object-cover"
      />
    </div>
  );
}