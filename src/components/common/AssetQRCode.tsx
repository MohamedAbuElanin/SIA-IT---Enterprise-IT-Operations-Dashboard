import React, { useMemo } from 'react';

interface AssetQRCodeProps {
  value: string;
}

const getCells = (value: string) => {
  let seed = 0;
  for (const character of value) seed = (seed * 31 + character.charCodeAt(0)) >>> 0;
  return Array.from({ length: 81 }, (_, index) => {
    const finder = (index < 21 && index % 9 < 3) || (index > 59 && index % 9 < 3) || (index < 21 && index % 9 > 5);
    return finder || ((seed >>> (index % 24)) ^ index) % 3 === 0;
  });
};

export const AssetQRCode: React.FC<AssetQRCodeProps> = ({ value }) => {
  const cells = useMemo(() => getCells(value), [value]);
  return (
    <div className="rounded-xl border border-slate-700 bg-white p-3 text-slate-950">
      <div className="grid grid-cols-9 gap-px" aria-label={`Asset QR identifier for ${value}`} role="img">
        {cells.map((filled, index) => <span key={index} className={`aspect-square ${filled ? 'bg-slate-950' : 'bg-white'}`} />)}
      </div>
      <p className="mt-2 text-center font-mono text-[10px] font-bold">{value}</p>
    </div>
  );
};
