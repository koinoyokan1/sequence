# Sequence - Multiplayer Board Game

A production-quality, full-stack implementation of the classic Sequence board game built with React and Supabase.

![Sequence Game](https://img.shields.io/badge/status-production-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)

## 🎮 Features

### Game Features
- ✅ Official Sequence rules implementation
- ✅ 2-4 player support with team-based gameplay
- ✅ Two standard decks (104 cards)
- ✅ Jack special moves (one-eyed remove, two-eyed wild)
- ✅ Automatic sequence detection
- ✅ Overlapping sequences support
- ✅ Win condition validation

### Multiplayer Features
- ✅ Real-time gameplay using Supabase Realtime
- ✅ Game lobby with invite codes
- ✅ Player ready states
- ✅ Live board updates
- ✅ Turn-based gameplay
- ✅ Reconnection support
- ✅ Connection status indicators

### UI/UX Features
- ✅ Modern dark-themed interface
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Smooth animations with Framer Motion
- ✅ Card selection and highlighting
- ✅ Visual sequence indicators
- ✅ Toast notifications
- ✅ Loading states

## 🏗️ Architecture

```
Frontend (React + Vite)     Backend (Supabase)
├─ React 18                 ├─ PostgreSQL
├─ TypeScript               ├─ Realtime subscriptions
├─ TailwindCSS              ├─ Row Level Security
├─ Framer Motion            ├─ Database functions
├─ Zustand (state)          └─ Authentication
└─ React Router
```

## 📁 Project Structure

```
sequence/
├── src/
│   ├── components/       # React components
│   │   ├── board/       # Board, cells, chips
│   │   ├── cards/       # Playing cards, hand
│   │   ├── game/        # Game UI, header, turn
│   │   ├── lobby/       # Lobby room, player list
│   │   └── ui/          # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Core logic and utilities
│   │   ├── game-logic/  # Board, cards, moves, sequences
│   │   └── supabase.ts  # Supabase client
│   ├── pages/           # Route pages
│   ├── stores/          # Zustand stores
│   ├── types/           # TypeScript types
│   └── utils/           # Helper functions
├── supabase/
│   └── migrations/      # Database schema
└── .github/
    └── workflows/       # CI/CD
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd sequence
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key
4. Run the migrations in the Supabase SQL editor:
   - Execute `supabase/migrations/001_initial_schema.sql`
   - Execute `supabase/migrations/002_rls_policies.sql`
   - Execute `supabase/migrations/003_functions.sql`

### 4. Configure Environment

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📦 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to GitHub Pages

1. Push code to GitHub
2. Add Supabase secrets to GitHub repository:
   - Go to Settings > Secrets and variables > Actions
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`
3. Enable GitHub Pages:
   - Go to Settings > Pages
   - Source: GitHub Actions
4. Push to main branch - deployment happens automatically

## 🎲 How to Play

1. **Create a Game**: Click "Create Game", enter your name, choose a team
2. **Share Code**: Share the 6-digit code with friends
3. **Join Game**: Friends use "Join Game" and enter the code
4. **Ready Up**: All players click "Ready"
5. **Start Game**: Host starts the game
6. **Play**: Take turns playing cards to place chips on the board
7. **Win**: First to complete the required sequences wins!

### Game Rules

- Place chips by playing cards that match board positions
- **One-eyed Jacks** (♠J, ♣J): Remove opponent's chip
- **Two-eyed Jacks** (♥J, ♦J): Wild card, place anywhere
- **Corners**: Free spaces for both teams
- **Sequence**: 5 chips in a row (horizontal, vertical, or diagonal)
- **Win**: 1 sequence for 2 players, 2 sequences for 3-4 players

## 🛠️ Development

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run format    # Format code with Prettier
```

### Tech Stack Details

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Fast build tool
- **TailwindCSS**: Utility-first CSS
- **Framer Motion**: Animations
- **Zustand**: State management
- **React Router**: Routing
- **Supabase**: Backend platform
- **PostgreSQL**: Database

## 🐛 Troubleshooting

See [DEPLOYMENT.md](DEPLOYMENT.md) for common issues and solutions.

## 📄 License

MIT License - feel free to use this project for learning or building your own games!

## 🙏 Acknowledgments

Built with ❤️ using modern web technologies.
