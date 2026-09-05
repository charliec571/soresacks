import React, { useState, useEffect } from 'react';
import { Round } from './types';
import { courseData } from './data/courseData';
import { syncService } from './services/syncService';
import { themeService, ThemeId, THEMES } from './services/themeService';
import { Navbar, NavTab } from './components/Navbar';
import { SplashScreen } from './components/SplashScreen';
import { Scorecard } from './components/Scorecard';
import { CaddieMap } from './components/CaddieMap';
import { RoundSetup } from './components/RoundSetup';
import { RoundSummary } from './components/RoundSummary';
import { Leaderboard } from './components/Leaderboard';
import { CourseRules } from './components/CourseRules';
import { FullScorecardModal } from './components/FullScorecardModal';
import { ShareRoomModal } from './components/ShareRoomModal';
import { ShareIcon } from './components/Icons';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('scorecard');
  const [round, setRound] = useState<Round | null>(() => syncService.getStoredRound());
  const [showSetup, setShowSetup] = useState<boolean>(false);
  const [setupMode, setSetupMode] = useState<'create' | 'join'>('create');
  const [selectedHole, setSelectedHole] = useState<number>(1);
  const [isFullScorecardOpen, setIsFullScorecardOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => themeService.getTheme());
  const [showThemeMenu, setShowThemeMenu] = useState<boolean>(false);

  // Apply theme to document
  useEffect(() => {
    themeService.setTheme(currentTheme);
  }, [currentTheme]);

  // Subscribe to real-time sync across devices / tabs
  useEffect(() => {
    const unsubscribe = syncService.subscribe((updatedRound) => {
      setRound(updatedRound ? { ...updatedRound } : null);
      if (updatedRound) {
        setSelectedHole(updatedRound.currentHole);
      }
    });
    return unsubscribe;
  }, []);

  // Check URL parameters for direct room joining (e.g. ?room=SS6P)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        const existing = syncService.getStoredRound();
        if (existing && existing.roomCode === roomParam) {
          setRound({ ...existing });
        }
      }
    }
  }, []);

  // Update selected hole when round changes
  useEffect(() => {
    if (round) {
      setSelectedHole(round.currentHole);
    }
  }, [round?.currentHole]);

  // Direct reactive score update
  const handleUpdateScore = (playerId: string, holeNumber: number, strokes: number) => {
    const updated = syncService.updateScore(playerId, holeNumber, strokes);
    if (updated) {
      setRound({ ...updated });
    }
  };

  // Direct reactive hole selector
  const handleSelectHole = (holeNumber: number) => {
    setSelectedHole(holeNumber);
    if (round) {
      const updated = syncService.setCurrentHole(holeNumber);
      if (updated) {
        setRound({ ...updated });
      }
    }
  };

  const handleStartRound = (playerNames: string[]) => {
    const newRound = syncService.createRound(playerNames);
    setRound({ ...newRound });
    setSelectedHole(1);
    setShowSetup(false);
    setActiveTab('scorecard');
  };

  const handleJoinRoom = (roomCode: string) => {
    const stored = syncService.getStoredRound();
    if (stored && stored.roomCode === roomCode) {
      setRound({ ...stored });
      setShowSetup(false);
      setActiveTab('scorecard');
      return;
    }

    const joinedRound = syncService.createRound(['Player 1', 'Player 2']);
    joinedRound.roomCode = roomCode;
    syncService.saveRound(joinedRound);
    setRound({ ...joinedRound });
    setShowSetup(false);
    setActiveTab('scorecard');
  };

  const handleFinishRound = () => {
    const finished = syncService.finishRound();
    if (finished) {
      setRound({ ...finished });
    }
  };

  const handleNewRound = () => {
    syncService.clearActiveRound();
    setRound(null);
    setShowSetup(false);
    setActiveTab('scorecard');
  };

  const activeThemeConfig = THEMES[currentTheme] || THEMES.midnight;

  return (
    <div
      className={`min-h-screen ${activeThemeConfig.bgClass} ${activeThemeConfig.textPrimary} flex flex-col selection:bg-emerald-500 selection:text-black transition-colors duration-200`}
    >
      {/* Top Universal App Header */}
      <header
        className={`sticky top-0 z-[1200] ${activeThemeConfig.bgClass}/95 backdrop-blur-md border-b ${activeThemeConfig.borderClass} px-4 py-2.5`}
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div
            onClick={() => {
              if (round && round.status === 'in_progress') {
                setActiveTab('scorecard');
              } else {
                setShowSetup(false);
                setActiveTab('scorecard');
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <img
              src="./course-logo.png"
              alt="Sore Sacks & Six Packs Logo"
              className="w-9 h-9 object-contain drop-shadow group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLImageElement).src = './course-logo-original.jpg';
              }}
            />
            <div>
              <h1 className="text-sm font-black tracking-tight leading-none text-white">
                Sore Sacks &amp; Six Packs
              </h1>
              <p className={`text-[10px] ${activeThemeConfig.textSecondary} font-bold leading-none mt-0.5`}>
                Fort Wayne, IN • Par {courseData.totalPar}
              </p>
            </div>
          </div>

          {/* Header Action Badges & Theme Toggle */}
          <div className="flex items-center gap-2">
            {/* Theme Picker Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className={`p-1.5 rounded-xl border ${activeThemeConfig.borderClass} ${activeThemeConfig.cardClass} flex items-center gap-1 text-xs font-bold`}
                title="Change Color Theme"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full inline-block shadow-sm"
                  style={{ backgroundColor: activeThemeConfig.dotColor }}
                />
              </button>

              {/* Theme Menu Dropdown */}
              {showThemeMenu && (
                <div
                  className={`absolute right-0 mt-2 w-44 rounded-2xl p-2 shadow-2xl border ${activeThemeConfig.borderClass} ${activeThemeConfig.cardClass} z-[2100] flex flex-col gap-1`}
                >
                  <p className="text-[10px] font-extrabold uppercase px-2 py-1 text-neutral-400">
                    Color Schemes
                  </p>
                  {(Object.keys(THEMES) as ThemeId[]).map((tKey) => {
                    const t = THEMES[tKey];
                    const isSelected = currentTheme === tKey;
                    return (
                      <button
                        key={tKey}
                        onClick={() => {
                          setCurrentTheme(tKey);
                          setShowThemeMenu(false);
                        }}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 font-black'
                            : 'hover:bg-white/5 text-neutral-300'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: t.dotColor }}
                        />
                        <span>{t.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {round && round.status === 'in_progress' ? (
              <button
                onClick={() => setIsShareModalOpen(true)}
                className={`px-2.5 py-1 rounded-xl ${activeThemeConfig.cardClass} border border-emerald-500/40 text-emerald-400 text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm`}
                title="Sync Card with Friends"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{round.roomCode}</span>
                <ShareIcon size={12} className="text-emerald-400" />
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-2.5 py-1 rounded-xl ${activeThemeConfig.cardClass} border ${activeThemeConfig.borderClass} text-xs font-bold ${activeThemeConfig.textSecondary}`}
              >
                Records
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main View — map gets full-bleed, everything else is padded */}
      {activeTab === 'map' ? (
        <div className="flex-1 w-full overflow-hidden">
          <CaddieMap currentHoleNumber={selectedHole} onSelectHole={handleSelectHole} />
        </div>
      ) : (
        <main className="flex-1 max-w-md w-full mx-auto p-3">
          {activeTab === 'scorecard' && (
            <>
              {!round && !showSetup && (
                <SplashScreen
                  onStartRound={() => {
                    setSetupMode('create');
                    setShowSetup(true);
                  }}
                  onJoinRound={() => {
                    setSetupMode('join');
                    setShowSetup(true);
                  }}
                  onOpenMap={() => setActiveTab('map')}
                  onOpenLeaderboard={() => setActiveTab('leaderboard')}
                  onOpenRules={() => setActiveTab('rules')}
                />
              )}

              {!round && showSetup && (
                <RoundSetup
                  onStartRound={handleStartRound}
                  onJoinRoom={handleJoinRoom}
                  initialTab={setupMode}
                  onBack={() => setShowSetup(false)}
                />
              )}

              {round && round.status === 'in_progress' && (
                <Scorecard
                  round={round}
                  onUpdateScore={handleUpdateScore}
                  onSelectHole={handleSelectHole}
                  onOpenMap={() => setActiveTab('map')}
                  onOpenFullScorecard={() => setIsFullScorecardOpen(true)}
                  onFinishRound={handleFinishRound}
                />
              )}

              {round && round.status === 'completed' && (
                <RoundSummary
                  round={round}
                  onNewRound={handleNewRound}
                  onViewLeaderboard={() => setActiveTab('leaderboard')}
                />
              )}
            </>
          )}

          {activeTab === 'leaderboard' && <Leaderboard />}

          {activeTab === 'rules' && <CourseRules onResetRound={handleNewRound} />}
        </main>
      )}

      {/* Modals */}
      {isFullScorecardOpen && round && (
        <FullScorecardModal
          round={round}
          onClose={() => setIsFullScorecardOpen(false)}
          onSelectHole={(h) => {
            handleSelectHole(h);
            setActiveTab('scorecard');
          }}
        />
      )}

      {isShareModalOpen && round && (
        <ShareRoomModal round={round} onClose={() => setIsShareModalOpen(false)} />
      )}

      {/* Bottom Sticky Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'scorecard' && !round) {
            setShowSetup(false);
          }
        }}
        hasActiveRound={!!round && round.status === 'in_progress'}
      />
    </div>
  );
};

export default App;
