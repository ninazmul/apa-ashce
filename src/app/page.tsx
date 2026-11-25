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
  return <ApaAshcheGame />;
}
