# ⛳️ Sore Sacks & Six Packs - Disc Golf Caddie & Scorecard

A mobile-first web app built specifically for the private 9-hole disc golf course **"Sore Sacks & Six Packs"** in Fort Wayne, Indiana.

Built with React 19, TypeScript, Vite, Leaflet satellite GPS mapping, and real-time multiplayer card synchronization.

---

## 🎯 Features

- **Satellite Caddie Map & GPS Rangefinder**: High-res aerial view with exact pins for the 3 physical Axiom Lite baskets, 9 tee pads, dogleg markers, glowing fairway flight paths, and live distance-to-pin calculation in feet.
- **Mobile Touch Scorecard**: Single-tap scoring with Ace, Birdie, Par, Bogey badges, cumulative score-to-par counters, leader indicators, and full 9-hole matrix table.
- **Multiplayer Sync & QR Codes**: Share 4-letter room codes or scan the in-app QR code to sync scores in real-time across players' phones. Works 100% offline with local persistence.
- **Theme Switcher**: Choose from 4 curated outdoor themes (Pine & Gold, Midnight Emerald, Carbon & Orange, Daylight Sun).
- **Course Records & Leaderboards**: Track lowest scores of all-time and automatic hole difficulty statistics.
- **Course Lore**: Dedicated house rules section (*"Don't Be a Loser, DRINK BEER!!"*, Chris Wilson benefactor tribute).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Dev Server
```bash
npm run dev
# or run the helper script:
./start.sh
```

Open [http://localhost:5173](http://localhost:5173) in your browser or on your phone using your local Wi-Fi IP.

### 3. Build for Production
```bash
npm run build
```

---

## 📋 Course Layout (Par 28 • 2,145 ft)

- **Basket 1** (Axiom Lite Green): Serves Hole 1 (272 ft), Hole 4 (272 ft), Hole 8 (226 ft)
- **Basket 2** (Axiom Lite Green): Serves Hole 2 (226 ft), Hole 5 (266 ft), Hole 7 (170 ft)
- **Basket 3** (Axiom Lite Green): Serves Hole 3 (161 ft), Hole 6 (262 ft), Hole 9 (289 ft - Par 4)
