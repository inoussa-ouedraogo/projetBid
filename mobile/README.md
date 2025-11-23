## SmartBid Mobile

React Native (Expo + TypeScript) app that talks to the SmartBid backend (auth, auctions, bids, profile) with a modern design.

### Delivered features

- Auth flow (register with RGPD consent, login, secure token storage with SecureStore).
- Dashboard hero section, running/scheduled auctions preview, category cloud.
- Navigation stack + tabs (`Home`, `Auctions`, `Bids`, `Profile`) plus an auction detail screen.
- REST calls (`/api/auth`, `/api/auctions`, `/api/me/bids`, `/api/products`) handled with Axios + React Query (cache + invalidations).
- Bid placement form with instant refresh of the bid history.
- Profile screen with wallet balance and local preferences (dark mode toggle).
- In-house SVG icons under `src/components/icons`.

### Requirements

- Node.js 18+ (Expo 54 suggests 20.19.4 or newer).
- Expo CLI (`npx expo ...`) and a simulator / device / Expo Go.

### Install

```bash
cd mobile
npm install
```

### Backend URL

Expose the API URL via Expo public vars:

```bash
cp .env.example .env.local   # then edit if needed
```

```
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080   # Android emulator
EXPO_PUBLIC_WS_URL=ws://10.0.2.2:8080
```

Start Expo with the variable:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.10:8080 npm run start
```

Any env var starting with `EXPO_PUBLIC_` is embedded in the bundle.

### NPM scripts

- `npm run start` : Expo (QR, web, iOS, Android).
- `npm run android` / `npm run ios` / `npm run web` : platform shortcuts.

### Architecture

- `src/api` : typed Axios clients + React Query hooks.
- `src/context` : AuthProvider (token, profile restore, SecureStore).
- `src/navigation` : auth stack + protected stack + bottom tabs.
- `src/screens` : Home, Auctions, AuctionDetail, Bids, Profile, Login, Register.
- `src/components` : layout primitives, inputs, cards, custom icons.
- `src/theme` : light/dark palette, spacing, typography helpers.
- `src/store` : UI preferences with zustand.

### Quick test plan

1. `npm run start` then scan the QR code or open an emulator.
2. Register a new account (consent must stay checked).
3. Login, browse the tabs, and place a bid on a RUNNING auction.

### Next ideas

- Add UI for `/api/products/{id}/image`.
- Plug the `/ws` websocket to stream bids live.
- Add Jest/RTL tests for the critical hooks and components.

