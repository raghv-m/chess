'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaChess, 
  FaGraduationCap, 
  FaPuzzlePiece, 
  FaPlay, 
  FaBook, 
  FaTrophy,
  FaArrowRight,
  FaCheck
} from 'react-icons/fa';

export default function TutorialsPage() {
  const [selectedCategory, setSelectedCategory] = useState('basics');
  const [selectedLesson, setSelectedLesson] = useState(null);

  const categories = [
    { id: 'basics', name: 'Chess Basics', icon: FaBook, color: 'from-blue-500 to-blue-600' },
    { id: 'tactics', name: 'Tactics & Strategy', icon: FaPuzzlePiece, color: 'from-purple-500 to-purple-600' },
    { id: 'openings', name: 'Openings', icon: FaPlay, color: 'from-green-500 to-green-600' },
    { id: 'endgames', name: 'Endgames', icon: FaTrophy, color: 'from-red-500 to-red-600' }
  ];

  const lessons = {
    basics: [
      {
        id: 'piece-movement',
        title: 'How Pieces Move',
        description: 'Learn how each chess piece moves and captures',
        duration: '10 min',
        difficulty: 'Beginner',
        completed: false
      },
      {
        id: 'check-checkmate',
        title: 'Check and Checkmate',
        description: 'Understanding check, checkmate, and stalemate',
        duration: '15 min',
        difficulty: 'Beginner',
        completed: false
      },
      {
        id: 'special-moves',
        title: 'Special Moves',
        description: 'Castling, en passant, and pawn promotion',
        duration: '12 min',
        difficulty: 'Beginner',
        completed: false
      },
      {
        id: 'board-setup',
        title: 'Setting Up the Board',
        description: 'Proper chess board setup and notation',
        duration: '8 min',
        difficulty: 'Beginner',
        completed: false
      }
    ],
    tactics: [
      {
        id: 'forks',
        title: 'Forks',
        description: 'Attacking multiple pieces simultaneously',
        duration: '20 min',
        difficulty: 'Intermediate',
        completed: false
      },
      {
        id: 'pins',
        title: 'Pins',
        description: 'Restricting piece movement',
        duration: '18 min',
        difficulty: 'Intermediate',
        completed: false
      },
      {
        id: 'skewers',
        title: 'Skewers',
        description: 'Attacking pieces in line',
        duration: '16 min',
        difficulty: 'Intermediate',
        completed: false
      },
      {
        id: 'discovered-attacks',
        title: 'Discovered Attacks',
        description: 'Creating threats by moving pieces',
        duration: '22 min',
        difficulty: 'Advanced',
        completed: false
      }
    ],
    openings: [
      {
        id: 'e4-openings',
        title: '1.e4 Openings',
        description: 'Popular openings starting with 1.e4',
        duration: '25 min',
        difficulty: 'Intermediate',
        completed: false
      },
      {
        id: 'd4-openings',
        title: '1.d4 Openings',
        description: 'Strategic openings starting with 1.d4',
        duration: '30 min',
        difficulty: 'Intermediate',
        completed: false
      },
      {
        id: 'flank-openings',
        title: 'Flank Openings',
        description: 'Less common but effective opening systems',
        duration: '20 min',
        difficulty: 'Advanced',
        completed: false
      }
    ],
    endgames: [
      {
        id: 'king-pawn',
        title: 'King and Pawn Endgames',
        description: 'Essential pawn endgame techniques',
        duration: '35 min',
        difficulty: 'Intermediate',
        completed: false
      },
      {
        id: 'rook-endgames',
        title: 'Rook Endgames',
        description: 'Common rook endgame patterns',
        duration: '40 min',
        difficulty: 'Advanced',
        completed: false
      },
      {
        id: 'queen-endgames',
        title: 'Queen Endgames',
        description: 'Complex queen endgame strategies',
        duration: '30 min',
        difficulty: 'Advanced',
        completed: false
      }
    ]
  };

  const puzzles = [
    {
      id: 1,
      title: 'Mate in 1',
      description: 'Find the checkmate in one move',
      difficulty: 'Beginner',
      rating: 800,
      solved: false
    },
    {
      id: 2,
      title: 'Fork Opportunity',
      description: 'Create a fork to win material',
      difficulty: 'Intermediate',
      rating: 1200,
      solved: false
    },
    {
      id: 3,
      title: 'Tactical Combination',
      description: 'Find the winning combination',
      difficulty: 'Advanced',
      rating: 1600,
      solved: false
    },
    {
      id: 4,
      title: 'Endgame Technique',
      description: 'Convert your advantage to victory',
      difficulty: 'Expert',
      rating: 2000,
      solved: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-md z-50 border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <FaChess className="text-3xl text-white" />
            <span className="text-2xl font-bold text-white">3D Chess</span>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link href="/about" className="text-white hover:text-blue-400 transition-colors">About</Link>
            <Link href="/tutorials" className="text-blue-400 font-semibold">Tutorials</Link>
            <Link href="/leaderboard" className="text-white hover:text-blue-400 transition-colors">Leaderboard</Link>
            <Link href="/contact" className="text-white hover:text-blue-400 transition-colors">Contact</Link>
          </div>
          
          <div className="flex space-x-4">
            <Link 
              href="/game?mode=singleplayer&difficulty=beginner"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Play Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Learn
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> Chess</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Master the game of kings with our comprehensive tutorials, interactive lessons, and challenging puzzles.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/game?mode=practice&difficulty=tutorial"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
              >
                Start Learning
              </Link>
              <Link 
                href="#puzzles"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
              >
                Try Puzzles
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 bg-black/20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Learning Paths</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Choose your learning path and progress at your own pace.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-6 rounded-xl border transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r ' + category.color + ' border-white/20'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <category.icon className={`text-3xl mb-4 ${
                  selectedCategory === category.id ? 'text-white' : 'text-blue-400'
                }`} />
                <h3 className={`text-lg font-semibold ${
                  selectedCategory === category.id ? 'text-white' : 'text-white'
                }`}>
                  {category.name}
                </h3>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Lessons */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              {categories.find(c => c.id === selectedCategory)?.name} Lessons
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Interactive lessons designed to improve your chess skills.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons[selectedCategory].map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                onClick={() => setSelectedLesson(lesson)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">{lesson.title}</h3>
                  {lesson.completed && (
                    <FaCheck className="text-green-400 text-xl" />
                  )}
                </div>
                <p className="text-gray-300 mb-4">{lesson.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-400 text-sm">{lesson.duration}</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    lesson.difficulty === 'Beginner' ? 'bg-green-600/20 text-green-400' :
                    lesson.difficulty === 'Intermediate' ? 'bg-yellow-600/20 text-yellow-400' :
                    lesson.difficulty === 'Advanced' ? 'bg-red-600/20 text-red-400' :
                    'bg-purple-600/20 text-purple-400'
                  }`}>
                    {lesson.difficulty}
                  </span>
                </div>
                <div className="mt-4 flex items-center text-blue-400 hover:text-blue-300 transition-colors">
                  <span className="text-sm">Start Lesson</span>
                  <FaArrowRight className="ml-2 text-sm" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Puzzles Section */}
      <section id="puzzles" className="py-20 px-4 bg-black/20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Chess Puzzles</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Test your tactical skills with our collection of chess puzzles.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {puzzles.map((puzzle, index) => (
              <motion.div
                key={puzzle.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white">{puzzle.title}</h3>
                  {puzzle.solved && (
                    <FaCheck className="text-green-400 text-xl" />
                  )}
                </div>
                <p className="text-gray-300 mb-4">{puzzle.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    puzzle.difficulty === 'Beginner' ? 'bg-green-600/20 text-green-400' :
                    puzzle.difficulty === 'Intermediate' ? 'bg-yellow-600/20 text-yellow-400' :
                    puzzle.difficulty === 'Advanced' ? 'bg-red-600/20 text-red-400' :
                    'bg-purple-600/20 text-purple-400'
                  }`}>
                    {puzzle.difficulty}
                  </span>
                  <span className="text-blue-400 text-sm">Rating: {puzzle.rating}</span>
                </div>
                <div className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
                  <span className="text-sm">Solve Puzzle</span>
                  <FaArrowRight className="ml-2 text-sm" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Practice */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-white/10"
          >
            <div className="text-center mb-8">
              <FaGraduationCap className="text-5xl text-blue-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">Interactive Practice</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Apply what you've learned with our interactive practice mode.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <FaPlay className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Practice Mode</h3>
                <p className="text-gray-300 mb-4">Practice specific concepts with guided feedback</p>
                <Link 
                  href="/game?mode=practice&difficulty=beginner"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Start Practice
                </Link>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-purple-600 rounded-full flex items-center justify-center mb-4">
                  <FaPuzzlePiece className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Puzzle Mode</h3>
                <p className="text-gray-300 mb-4">Solve tactical puzzles to improve your game</p>
                <Link 
                  href="/game?mode=puzzles"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Try Puzzles
                </Link>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-green-600 rounded-full flex items-center justify-center mb-4">
                  <FaTrophy className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Analysis Mode</h3>
                <p className="text-gray-300 mb-4">Analyze your games and learn from mistakes</p>
                <Link 
                  href="/game?mode=analysis"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Analyze Games
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Progress Tracking */}
      <section className="py-20 px-4 bg-black/20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Track Your Progress</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Monitor your learning journey and celebrate your achievements.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center"
            >
              <div className="text-4xl font-bold text-blue-400 mb-2">0</div>
              <h3 className="text-lg font-semibold text-white mb-2">Lessons Completed</h3>
              <p className="text-gray-300">Keep learning to unlock achievements</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center"
            >
              <div className="text-4xl font-bold text-purple-400 mb-2">0</div>
              <h3 className="text-lg font-semibold text-white mb-2">Puzzles Solved</h3>
              <p className="text-gray-300">Improve your tactical skills</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center"
            >
              <div className="text-4xl font-bold text-green-400 mb-2">800</div>
              <h3 className="text-lg font-semibold text-white mb-2">Current Rating</h3>
              <p className="text-gray-300">Your chess strength indicator</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Learning?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Begin your chess journey today with our comprehensive learning system.
            </p>
            <Link 
              href="/game?mode=practice&difficulty=beginner"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 inline-block"
            >
              Start Your Chess Journey
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-12 px-4">
        <div className="container mx-auto text-center">
          <p className="text-gray-300">&copy; 2024 3D Chess. Built with ❤️ by Raghav Mahajan</p>
        </div>
      </footer>
    </div>
  );
} 