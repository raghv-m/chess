'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaChess, FaUsers, FaRobot, FaTrophy, FaGraduationCap, FaMobile } from 'react-icons/fa';

export default function HomePage() {
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
            <Link href="/tutorials" className="text-white hover:text-blue-400 transition-colors">Tutorials</Link>
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
              Experience Chess in
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> 3D</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Immerse yourself in the ultimate chess experience with stunning 3D graphics, 
              intelligent AI opponents, and real-time multiplayer battles.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/game?mode=singleplayer&difficulty=beginner"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
              >
                Play vs AI
              </Link>
              <Link 
                href="/game?mode=multiplayer"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
              >
                Play Online
              </Link>
              <Link 
                href="/tutorials"
                className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
              >
                Learn Chess
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-black/20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose 3D Chess?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover the next generation of chess with cutting-edge features designed for modern players.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FaChess,
                title: "Stunning 3D Graphics",
                description: "Experience chess like never before with beautiful 3D pieces and immersive board design."
              },
              {
                icon: FaRobot,
                title: "Intelligent AI",
                description: "Challenge AI opponents with customizable difficulty levels using advanced algorithms."
              },
              {
                icon: FaUsers,
                title: "Real-time Multiplayer",
                description: "Play with friends or random opponents worldwide with seamless real-time gameplay."
              },
              {
                icon: FaTrophy,
                title: "Competitive Leaderboard",
                description: "Track your progress and compete with players globally on our dynamic leaderboard."
              },
              {
                icon: FaGraduationCap,
                title: "Interactive Tutorials",
                description: "Learn chess strategies with step-by-step tutorials and practice puzzles."
              },
              {
                icon: FaMobile,
                title: "Cross-Platform",
                description: "Play anywhere - desktop, tablet, or mobile with responsive design and PWA support."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
              >
                <feature.icon className="text-4xl text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Modes Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Choose Your Game Mode</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Whether you're a beginner or a grandmaster, we have the perfect mode for you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Single Player",
                description: "Practice against our intelligent AI with adjustable difficulty levels.",
                features: ["3 difficulty levels", "Move suggestions", "Game analysis", "Practice mode"],
                href: "/game?mode=singleplayer&difficulty=beginner",
                color: "from-blue-600 to-blue-700"
              },
              {
                title: "Multiplayer",
                description: "Challenge players worldwide in real-time competitive matches.",
                features: ["Real-time gameplay", "Friend invites", "Ranked matches", "Live chat"],
                href: "/game?mode=multiplayer",
                color: "from-purple-600 to-purple-700"
              },
              {
                title: "Tutorials & Puzzles",
                description: "Learn chess strategies and solve challenging puzzles.",
                features: ["Interactive tutorials", "Puzzle collection", "Strategy guides", "Progress tracking"],
                href: "/tutorials",
                color: "from-green-600 to-green-700"
              }
            ].map((mode, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all"
              >
                <h3 className="text-2xl font-bold text-white mb-4">{mode.title}</h3>
                <p className="text-gray-300 mb-6">{mode.description}</p>
                
                <ul className="space-y-2 mb-8">
                  {mode.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link 
                  href={mode.href}
                  className={`inline-block bg-gradient-to-r ${mode.color} text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105`}
                >
                  Start Playing
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Play?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of players worldwide and experience the future of chess gaming.
            </p>
            <Link 
              href="/game?mode=singleplayer&difficulty=beginner"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 inline-block"
            >
              Start Your Chess Journey
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FaChess className="text-2xl text-white" />
                <span className="text-xl font-bold text-white">3D Chess</span>
              </div>
              <p className="text-gray-300">
                The ultimate 3D chess experience with AI, multiplayer, and tutorials.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Game Modes</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/game?mode=singleplayer" className="hover:text-white transition-colors">Single Player</Link></li>
                <li><Link href="/game?mode=multiplayer" className="hover:text-white transition-colors">Multiplayer</Link></li>
                <li><Link href="/tutorials" className="hover:text-white transition-colors">Tutorials</Link></li>
                <li><Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="https://github.com/raghv-m" className="text-gray-300 hover:text-white transition-colors">
                  <FaChess className="text-xl" />
                </a>
                <a href="https://linkedin.com/in/raghav-mahajan-17611b24b" className="text-gray-300 hover:text-white transition-colors">
                  <FaChess className="text-xl" />
                </a>
                <a href="https://www.raghv.dev" className="text-gray-300 hover:text-white transition-colors">
                  <FaChess className="text-xl" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 3D Chess. Built with ❤️ by Raghav Mahajan</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
