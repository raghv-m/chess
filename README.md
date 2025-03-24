# 3D Chess – Advanced Modern Chess Game

<div align="center">
  <img src="public/screenshot.png" alt="3D Chess Screenshot" width="200"/>

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![Three.js](https://img.shields.io/badge/Three.js-3D-000000?style=flat&logo=three.js)](https://threejs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-4.0+-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

  A modern, feature-rich chess platform with 3D visuals and smart gameplay built using Next.js, TypeScript, and Three.js.
</div>

## 👨‍💻 Developer

<div align="center">
  <h3>Raghav Mahajan</h3>

  [![GitHub](https://img.shields.io/badge/GitHub-s_raghv--m-black?style=flat&logo=github)](https://github.com/raghv-m)  
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-Raghav_Mahajan-blue?style=flat&logo=linkedin)](https://www.linkedin.com/in/raghav-mahajan-17611b24b)  
  [![Instagram](https://img.shields.io/badge/Instagram-raghv.m__-pink?style=flat&logo=instagram)](https://instagram.com/ragh.v_)  
  [![Snapchat](https://img.shields.io/badge/Snapchat-rxaghav-yellow?style=flat&logo=snapchat)](https://snapchat.com/add/rxaghav)
</div>


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
