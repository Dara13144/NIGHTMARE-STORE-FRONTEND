import React from 'react';

export default function ParticleBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Base Nightmare Halloween Artwork Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed transform scale-105 transition-all duration-700"
        style={{
          backgroundImage: `url('/halloween-bg.jpg')`,
        }}
      />

      {/* 2. Deep Atmospheric Dark Vignette Overlay for Crisp Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#06080F]/70 via-[#06080F]/80 to-[#06080F]/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#06080F_78%)] opacity-85" />

      {/* 3. Spooky Moonlit & Pumpkin Amber Glow Orbs */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[42rem] h-[24rem] bg-purple-600/20 rounded-full blur-[140px] animate-pulse-aura" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/15 rounded-full blur-[130px] animate-pulse-aura" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-600/15 rounded-full blur-[130px] animate-pulse-aura" style={{ animationDelay: '4s' }} />
      <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-[140px] animate-pulse-aura" style={{ animationDelay: '3s' }} />

      {/* 4. Halloween Ember Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <span className="absolute top-[18%] left-[12%] w-2 h-2 rounded-full bg-orange-500/70 shadow-[0_0_12px_#f97316] animate-particle" style={{ animationDelay: '0s', animationDuration: '6s' }} />
        <span className="absolute top-[42%] left-[6%] w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-[0_0_10px_#fbbf24] animate-particle" style={{ animationDelay: '1.2s', animationDuration: '8s' }} />
        <span className="absolute top-[68%] left-[18%] w-2 h-2 rounded-full bg-purple-400/70 shadow-[0_0_12px_#c084fc] animate-particle" style={{ animationDelay: '2.5s', animationDuration: '7s' }} />
        <span className="absolute top-[22%] right-[14%] w-1.5 h-1.5 rounded-full bg-orange-400/80 shadow-[0_0_10px_#fb923c] animate-particle" style={{ animationDelay: '0.8s', animationDuration: '9s' }} />
        <span className="absolute top-[58%] right-[8%] w-2 h-2 rounded-full bg-amber-500/70 shadow-[0_0_14px_#f59e0b] animate-particle" style={{ animationDelay: '3.1s', animationDuration: '6.5s' }} />
        <span className="absolute top-[82%] right-[22%] w-1.5 h-1.5 rounded-full bg-purple-500/80 shadow-[0_0_12px_#a855f7] animate-particle" style={{ animationDelay: '1.9s', animationDuration: '7.5s' }} />
      </div>

      {/* 5. Subtle Cyberpunk Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #a855f7 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
}

