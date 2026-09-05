import React from 'react';
import { DiscIcon, MapPinIcon, TableIcon, TrophyIcon, BeerIcon } from './Icons';

export type NavTab = 'scorecard' | 'map' | 'matrix' | 'leaderboard' | 'rules';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  hasActiveRound: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, hasActiveRound }) => {
  const navItems = [
    {
      id: 'scorecard' as NavTab,
      label: hasActiveRound ? 'Card' : 'Home',
      icon: DiscIcon
    },
    {
      id: 'map' as NavTab,
      label: 'Map',
      icon: MapPinIcon
    },
    {
      id: 'matrix' as NavTab,
      label: 'Matrix',
      icon: TableIcon
    },
    {
      id: 'leaderboard' as NavTab,
      label: 'Records',
      icon: TrophyIcon
    },
    {
      id: 'rules' as NavTab,
      label: 'Lore',
      icon: BeerIcon
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1500] bg-[#090d16]/95 backdrop-blur-xl border-t border-white/10 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-1 py-1.5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-2xl transition-all ${
                isActive
                  ? 'text-emerald-400 font-black'
                  : 'text-neutral-400 hover:text-white font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-transform ${
                  isActive ? 'scale-110 bg-emerald-500/15' : ''
                }`}
              >
                <Icon size={19} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
