import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-800/80 bg-[#0a0a0f] py-4 text-xs text-zinc-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <span>© 2026 GroverLab</span>
        <span>Quantum Search Algorithm Research</span>
      </div>
    </footer>
  );
};
