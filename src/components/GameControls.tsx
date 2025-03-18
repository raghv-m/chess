'use client';

interface GameControlsProps {
  onResign: () => void;
  onOfferDraw: () => void;
  onToggleChat: () => void;
  onToggleRotation: () => void;
}

export function GameControls({
  onResign,
  onOfferDraw,
  onToggleChat,
  onToggleRotation
}: GameControlsProps) {
  return (
    <div className="absolute bottom-4 left-4 flex space-x-4">
      <button
        onClick={onResign}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-colors"
      >
        Resign
      </button>
      <button
        onClick={onOfferDraw}
        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg shadow-lg transition-colors"
      >
        Offer Draw
      </button>
      <button
        onClick={onToggleChat}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors"
      >
        Toggle Chat
      </button>
      <button
        onClick={onToggleRotation}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg transition-colors"
      >
        Toggle Rotation
      </button>
    </div>
  );
} 