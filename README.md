# 3D Chess - Modern Chess with Advanced Features

A modern implementation of chess with 3D graphics, multiple game modes, and advanced features built with Next.js and Three.js.

![3D Chess Screenshot](public/screenshot.png)

## Features

### Multiple Game Modes
- **Single Player**: Play against AI with three difficulty levels
  - Beginner: Basic move selection
  - Intermediate: Advanced position evaluation
  - Expert: Deep move calculation
- **Multiplayer**: Real-time matches against other players
- **Practice Mode**:
  - Interactive Tutorials
  - Tactical Puzzles
  - Position Analysis

### Advanced Chess Features
- Full 3D board visualization
- Legal move validation
- Check and checkmate detection
- Move history with algebraic notation
- Position evaluation
- Captured pieces display
- Undo/redo functionality

### Technical Features
- Responsive design for all devices
- Real-time multiplayer using WebSocket
- Advanced position evaluation metrics
- Move suggestions with explanation
- Performance optimized 3D rendering
- Accessibility features
- Dark theme UI

## Tech Stack

- **Frontend Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **3D Graphics**: Three.js / React Three Fiber
- **State Management**: React Context + Custom Hooks
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Real-time Communication**: WebSocket
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/3d-chess.git
cd 3d-chess
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your configuration.

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
├── lib/                 # Core game logic
│   ├── game/           # Game managers
│   ├── ai/             # AI implementation
│   └── socket/         # WebSocket client
├── types/              # TypeScript types
└── utils/              # Utility functions
```

## Game Modes

### Single Player
- Three AI difficulty levels
- Position evaluation feedback
- Move suggestions
- Undo/redo support

### Multiplayer
- Real-time gameplay
- Player ratings
- Match history
- Chat functionality

### Practice Mode
- Step-by-step tutorials
- Tactical puzzles with solutions
- Position analysis with evaluation metrics
- Move suggestions with explanations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Deployment

This project is configured for deployment on Vercel:

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables
4. Deploy

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Chess piece 3D models by [Author Name]
- Sound effects from [Source]
- AI evaluation metrics inspired by [Source]
