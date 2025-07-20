# 🏆 3D Chess - Advanced Chess Game

Experience chess like never before with stunning 3D graphics, intelligent AI, and real-time multiplayer battles. Built with Next.js, Three.js, and modern web technologies.

![3D Chess Game](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Three.js](https://img.shields.io/badge/Three.js-0.161-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

## ✨ Features

### 🎮 Game Modes
- **Single Player vs AI**: Challenge intelligent AI with 3 difficulty levels
- **Multiplayer**: Real-time games with friends and global players
- **Practice Mode**: Learn and improve your skills
- **Puzzle Mode**: Solve tactical chess puzzles

### 🤖 Advanced AI
- **Minimax Algorithm**: Sophisticated move calculation
- **Alpha-Beta Pruning**: Optimized search performance
- **Position Evaluation**: Smart board assessment
- **Difficulty Levels**: Beginner, Intermediate, Expert

### 🌐 Multiplayer Features
- **Real-time Gameplay**: WebSocket-powered live matches
- **Friend Invites**: Share room codes with friends
- **Global Leaderboard**: Compete with players worldwide
- **Live Chat**: Communicate during games
- **Matchmaking**: Find opponents automatically

### 🎨 3D Graphics & UI
- **Stunning 3D Board**: Immersive Three.js rendering
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Modern, eye-friendly interface
- **PWA Support**: Install as a native app

### 📚 Learning Tools
- **Interactive Tutorials**: Step-by-step chess lessons
- **Move Suggestions**: Get hints during games
- **Game Analysis**: Review your moves
- **Progress Tracking**: Monitor your improvement

### 🔧 Technical Features
- **TypeScript**: Full type safety
- **PWA**: Offline support and app installation
- **Service Worker**: Background sync and caching
- **Real-time Updates**: Live game state synchronization
- **Cross-platform**: Works on all modern browsers

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/raghv-m/chess.git
   cd chess
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_WS_URL=ws://localhost:3001
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   DATABASE_URL=postgresql://user:password@localhost:5432/chess_db
   REDIS_URL=redis://localhost:6379
   ```

4. **Start development servers**
   ```bash
   npm run dev:full
   ```
   This starts both the Next.js frontend (port 3000) and WebSocket server (port 3001).

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
chess/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── page.tsx         # Landing page
│   │   ├── about/           # About page
│   │   ├── tutorials/       # Tutorials page
│   │   ├── leaderboard/     # Leaderboard page
│   │   ├── contact/         # Contact page
│   │   └── game/            # Game page
│   ├── components/          # React components
│   │   ├── ChessBoard.tsx   # 3D chess board
│   │   ├── ChessGame.tsx    # Main game component
│   │   ├── GameControls.tsx # Game controls
│   │   └── ...
│   ├── lib/                 # Core logic
│   │   ├── chess/           # Chess engine
│   │   ├── ai/              # AI algorithms
│   │   ├── game/            # Game management
│   │   ├── multiplayer/     # Multiplayer logic
│   │   └── socket.ts        # WebSocket client
│   └── types/               # TypeScript definitions
├── public/                  # Static assets
│   ├── manifest.json        # PWA manifest
│   ├── sw.js               # Service worker
│   └── icons/              # App icons
├── server.js               # WebSocket server
├── docker-compose.yml      # Docker orchestration
└── package.json
```

## 🎯 Game Modes

### Single Player vs AI
- **Beginner**: Basic move generation, suitable for new players
- **Intermediate**: Improved evaluation, challenging for casual players
- **Expert**: Advanced algorithms, competitive for experienced players

### Multiplayer
- **Quick Match**: Find random opponents instantly
- **Private Room**: Create games with friends using room codes
- **Ranked Games**: Competitive matches with rating system
- **Casual Games**: Practice without affecting rating

### Practice & Learning
- **Tutorial Mode**: Interactive lessons for beginners
- **Puzzle Mode**: Solve tactical positions
- **Analysis Mode**: Review and analyze games
- **Opening Trainer**: Learn chess openings

## 🤖 AI Engine

The AI uses advanced algorithms to provide challenging gameplay:

- **Minimax Algorithm**: Evaluates all possible moves
- **Alpha-Beta Pruning**: Optimizes search performance
- **Position Evaluation**: Assesses board strength
- **Move Ordering**: Prioritizes promising moves
- **Transposition Tables**: Caches evaluated positions

## 🌐 Multiplayer System

Real-time multiplayer powered by WebSocket technology:

- **Room Management**: Create and join game rooms
- **Player Matching**: Find opponents based on skill
- **Live Synchronization**: Real-time game state updates
- **Chat System**: In-game communication
- **Spectator Mode**: Watch ongoing games

## 📱 PWA Features

Progressive Web App capabilities:

- **Offline Support**: Play against AI without internet
- **App Installation**: Install on desktop and mobile
- **Push Notifications**: Game invitations and updates
- **Background Sync**: Sync game data when online
- **Responsive Design**: Works on all screen sizes

## 🧪 Testing

Run the test suite to ensure everything works correctly:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Test chess engine specifically
npm run test:engine
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables**:
   - `NEXT_PUBLIC_WS_URL`: Your WebSocket server URL
   - `NEXT_PUBLIC_APP_URL`: Your app URL
3. **Deploy**: Vercel will automatically build and deploy

### Docker

1. **Build and run with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

2. **For development**:
   ```bash
   docker-compose --profile dev up
   ```

### Manual Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start production servers**:
   ```bash
   npm start & node server.js
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | `ws://localhost:3001` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | - |

### Game Settings

Customize the game experience in `src/lib/game/GameSettings.ts`:

- Board themes and piece styles
- Sound effects and music
- Animation speeds
- AI difficulty settings

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 About the Developer

**Raghav Mahajan** - Full-stack developer passionate about creating innovative gaming experiences.

- **GitHub**: [@raghv-m](https://github.com/raghv-m)
- **LinkedIn**: [Raghav Mahajan](https://linkedin.com/in/raghav-mahajan-17611b24b)
- **Portfolio**: [raghv.dev](https://www.raghv.dev)

## 🙏 Acknowledgments

- **Chess.com API** for inspiration and reference
- **Three.js** for 3D graphics capabilities
- **Next.js** for the amazing React framework
- **Framer Motion** for smooth animations
- **Socket.io** for real-time communication

## 📞 Support

- **Email**: raghav@example.com
- **Issues**: [GitHub Issues](https://github.com/raghv-m/chess/issues)
- **Discussions**: [GitHub Discussions](https://github.com/raghv-m/chess/discussions)

---

⭐ **Star this repository if you found it helpful!**

Made with ❤️ by [Raghav Mahajan](https://github.com/raghv-m)
