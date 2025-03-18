# Multilayer Chess

A 3D multiplayer chess game with AI support, built with React, Three.js, and WebSocket.

## Features

- 3D chess board with multiple layers
- Real-time multiplayer support
- AI opponent with three difficulty levels
- In-game chat system
- Move validation and game state management
- Beautiful 3D piece models and animations
- Responsive design with Tailwind CSS

## Game Modes

1. **Local Game**
   - Play against another player on the same device
   - Full move validation and game state tracking

2. **AI Opponent**
   - Three difficulty levels: Beginner, Intermediate, and Expert
   - AI uses minimax algorithm with alpha-beta pruning
   - Adaptive gameplay based on difficulty level

3. **Online Multiplayer**
   - Real-time game synchronization
   - In-game chat with opponents
   - Player matchmaking system
   - Game state persistence

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/multilayer-chess.git
cd multilayer-chess
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. In a separate terminal, start the WebSocket server:
```bash
npm run server
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Game Controls

- Left click to select a piece
- Right click and drag to rotate the board
- Mouse wheel to zoom in/out
- Use the control panel to:
  - Start a new game
  - Choose game mode
  - Resign
  - Offer/accept draws
  - Toggle chat
  - Toggle board rotation

## Technical Details

### Architecture

- **Frontend**: React, Next.js, Three.js
- **3D Rendering**: React Three Fiber
- **State Management**: React Hooks
- **Styling**: Tailwind CSS
- **Real-time Communication**: WebSocket/Socket.IO
- **AI**: Minimax algorithm with alpha-beta pruning

### Project Structure

```
src/
├── components/        # React components
├── lib/              # Core game logic
│   ├── ai/           # AI implementation
│   ├── auth/         # User management
│   ├── chess/        # Chess engine
│   ├── game/         # Game mode management
│   └── multiplayer/  # Multiplayer system
├── server/           # WebSocket server
└── types/            # TypeScript definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
