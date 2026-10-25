import React from 'react';
import { Link } from 'react-router-dom';

const PromoBanner = () => {
  return (
    <section className="my-12 relative overflow-hidden bg-[#0A0A0A] rounded-3xl p-8 sm:p-12 text-white shadow-2xl border border-neutral-800">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#84CC16]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl text-center md:text-left space-y-3">
          <span className="px-3.5 py-1 bg-[#84CC16] text-[#0A0A0A] rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
            ⚡ Limited Time Offer
          </span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
            POWER YOUR AMBITION WITH <span className="text-[#84CC16]">INDIA'S BEST DEALS</span>
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base font-medium">
            Upgrade your lifestyle with our curated Indian product collection. Save up to <span className="font-black text-[#84CC16]">40% OFF</span> on top electronics, fashion & home essentials.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
          <Link to="/products">
            <button className="btn-lime-gradient px-8 py-3.5 rounded-full font-black text-sm uppercase tracking-wider text-[#0A0A0A] hover:scale-105 transition-all shadow-lg shadow-[#84CC16]/30">
              EXPLORE ALL DEALS
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
