'use client';

import dynamic from 'next/dynamic';

const ApaAshcheGame = dynamic(() => import('../../apa_ashche'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#0b0f19] text-[#FACC15] font-black">
      <div className="text-3xl font-black mb-2 animate-bounce">আপা আসছে!</div>
      <div className="text-sm text-slate-300">লোডিং আর্কেড ইঞ্জিন...</div>
    </div>
  ),
});

export default function Page() {
  return (
    <main>
      <h1 className="sr-only">
        আপা আসছে! — Apa Ashche Bengali Political Satire Arcade Game
      </h1>
      <p className="sr-only">
        বাংলা এবং ইংরেজি সমর্থিত পলিটিক্যাল স্যাটায়ার ব্রাউজার আর্কেড গেম।
        Play a Bengali and English political satire side-scrolling arcade game
        across fictional border checkpoints and monsoon river routes.
      </p>
      <ApaAshcheGame />
    </main>
  );
}
