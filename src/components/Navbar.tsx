import React from 'react';
import { DiscIcon, MapPinIcon, TrophyIcon, BeerIcon } from './Icons';

export type NavTab = 'scorecard' | 'map' | 'leaderboard' | 'rules';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  hasActiveRound: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, hasActiveRound }) => {
  const navItems = [
    {
      id: 'scorecard' as NavTab,
      label: hasActiveRound ? 'Scorecard' : 'New Round',
      icon: DiscIcon
    },
    {
      id: 'map' as NavTab,
      label: 'Caddie Map',
      icon: MapPinIcon
    },
    {
      id: 'leaderboard' as NavTab,
      label: 'Records',
      icon: TrophyIcon
    },
    {
      id: 'rules' as NavTab,
      label: 'Course & Lore',
      icon: BeerIcon
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1500] bg-[#0c1f24]/95 backdrop-blur-xl border-t border-white/10 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all ${
                isActive
                  ? 'text-[#ea5826] font-black'
                  : 'text-[#d1dfdb]/60 hover:text-white font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-transform ${
                  isActive ? 'scale-110 bg-[#ea5826]/15' : ''
                }`}
              >
                <Icon size={20} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
