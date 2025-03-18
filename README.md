# 3D Chess Game

A modern 3D chess game built with Next.js, Three.js, and TypeScript. Features include local gameplay, AI opponent, and multiplayer support.

## Features

- 3D chess board with realistic piece movements
- Multiple game modes:
  - Local (2 players on the same device)
  - AI opponent with adjustable difficulty
  - Online multiplayer
- Real-time game state updates
- Chat functionality in multiplayer mode
- Responsive design
- Beautiful UI with Tailwind CSS

## Prerequisites

- Node.js 18.x or later
- npm or yarn package manager

## Installation

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

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Building for Production

Build the application:

```bash
npm run build
# or
yarn build
```

Start the production server:

```bash
npm start
# or
yarn start
```

## Project Structure

```
src/
  ├── app/              # Next.js app directory
  ├── components/       # React components
  ├── lib/             # Game logic and utilities
  └── types.ts         # TypeScript type definitions
```

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [Three.js](https://threejs.org/) - 3D graphics library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Socket.IO](https://socket.io/) - Real-time communication

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
