'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaChess, 
  FaTrophy, 
  FaMedal, 
  FaCrown, 
  FaStar, 
  FaFire,
  FaUsers,
  FaChartLine,
  FaFilter
} from 'react-icons/fa';

export default function LeaderboardPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all-time');

  // Mock leaderboard data
  const leaderboardData = [
    {
      id: 1,
      username: 'ChessMaster2024',
      rating: 2850,
      wins: 156,
      losses: 23,
      draws: 12,
      winRate: 81.7,
      gamesPlayed: 191,
      streak: 15,
      rank: 1,
      badge: 'crown'
    },
    {
      id: 2,
      username: 'TacticalGenius',
      rating: 2720,
      wins: 134,
      losses: 31,
      draws: 18,
      winRate: 73.2,
      gamesPlayed: 183,
      streak: 8,
      rank: 2,
      badge: 'medal'
    },
    {
      id: 3,
      username: 'EndgameWizard',
      rating: 2680,
      wins: 128,
      losses: 35,
      draws: 22,
      winRate: 69.2,
      gamesPlayed: 185,
      streak: 12,
      rank: 3,
      badge: 'star'
    },
    {
      id: 4,
      username: 'OpeningExpert',
      rating: 2650,
      wins: 122,
      losses: 38,
      draws: 25,
      winRate: 65.9,
      gamesPlayed: 185,
      streak: 6,
      rank: 4,
      badge: 'fire'
    },
    {
      id: 5,
      username: '3DChessPro',
      rating: 2620,
      wins: 118,
      losses: 42,
      draws: 28,
      winRate: 62.8,
      gamesPlayed: 188,
      streak: 9,
      rank: 5,
      badge: 'star'
    },
    {
      id: 6,
      username: 'StrategicMind',
      rating: 2590,
      wins: 115,
      losses: 45,
      draws: 30,
      winRate: 60.5,
      gamesPlayed: 190,
      streak: 4,
      rank: 6,
      badge: 'fire'
    },
    {
      id: 7,
      username: 'PawnPromoter',
      rating: 2560,
      wins: 112,
      losses: 48,
      draws: 32,
      winRate: 58.3,
      gamesPlayed: 192,
      streak: 7,
      rank: 7,
      badge: 'star'
    },
    {
      id: 8,
      username: 'KnightRider',
      rating: 2530,
      wins: 109,
      losses: 51,
      draws: 35,
      winRate: 56.4,
      gamesPlayed: 195,
      streak: 3,
      rank: 8,
      badge: 'fire'
    },
    {
      id: 9,
      username: 'BishopBlitz',
      rating: 2500,
      wins: 106,
      losses: 54,
      draws: 38,
      winRate: 54.5,
      gamesPlayed: 198,
      streak: 5,
      rank: 9,
      badge: 'star'
    },
    {
      id: 10,
      username: 'RookRampage',
      rating: 2470,
      wins: 103,
      losses: 57,
      draws: 41,
      winRate: 52.7,
      gamesPlayed: 201,
      streak: 2,
      rank: 10,
      badge: 'fire'
    }
  ];

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'crown':
        return <FaCrown className="text-yellow-400" />;
      case 'medal':
        return <FaMedal className="text-gray-300" />;
      case 'star':
        return <FaStar className="text-yellow-500" />;
      case 'fire':
        return <FaFire className="text-orange-500" />;
      default:
        return null;
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-500';
    return 'text-white';
  };

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
            <Link href="/leaderboard" className="text-blue-400 font-semibold">Leaderboard</Link>
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
              Global
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> Leaderboard</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Compete with the best players worldwide and climb the rankings.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-20 px-4 bg-black/20">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: FaUsers, label: 'Total Players', value: '12,847', color: 'text-blue-400' },
              { icon: FaTrophy, label: 'Active Games', value: '1,234', color: 'text-purple-400' },
              { icon: FaChartLine, label: 'Avg Rating', value: '1,250', color: 'text-green-400' },
              { icon: FaFire, label: 'Games Today', value: '567', color: 'text-orange-400' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center"
              >
                <stat.icon className={`text-3xl ${stat.color} mx-auto mb-3`} />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-10 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center space-x-4">
              <FaFilter className="text-white" />
              <span className="text-white font-medium">Filter by:</span>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-400"
              >
                <option value="all">All Players</option>
                <option value="top-10">Top 10</option>
                <option value="top-50">Top 50</option>
                <option value="active">Recently Active</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-white font-medium">Timeframe:</span>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-400"
              >
                <option value="all-time">All Time</option>
                <option value="this-month">This Month</option>
                <option value="this-week">This Week</option>
                <option value="today">Today</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Table */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
          >
            {/* Table Header */}
            <div className="bg-white/10 px-6 py-4 border-b border-white/10">
              <div className="grid grid-cols-12 gap-4 text-white font-semibold">
                <div className="col-span-1">Rank</div>
                <div className="col-span-3">Player</div>
                <div className="col-span-1">Rating</div>
                <div className="col-span-1">Wins</div>
                <div className="col-span-1">Losses</div>
                <div className="col-span-1">Draws</div>
                <div className="col-span-1">Win Rate</div>
                <div className="col-span-1">Games</div>
                <div className="col-span-1">Streak</div>
                <div className="col-span-1">Badge</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/10">
              {leaderboardData.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="px-6 py-4 hover:bg-white/5 transition-colors"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className={`col-span-1 font-bold text-lg ${getRankColor(player.rank)}`}>
                      #{player.rank}
                    </div>
                    
                    <div className="col-span-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                          <FaChess className="text-white text-lg" />
                        </div>
                        <div>
                          <div className="text-white font-semibold">{player.username}</div>
                          <div className="text-gray-400 text-sm">ID: {player.id}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-1">
                      <span className="text-green-400 font-semibold">{player.rating}</span>
                    </div>
                    
                    <div className="col-span-1">
                      <span className="text-green-400">{player.wins}</span>
                    </div>
                    
                    <div className="col-span-1">
                      <span className="text-red-400">{player.losses}</span>
                    </div>
                    
                    <div className="col-span-1">
                      <span className="text-gray-400">{player.draws}</span>
                    </div>
                    
                    <div className="col-span-1">
                      <span className="text-blue-400">{player.winRate}%</span>
                    </div>
                    
                    <div className="col-span-1">
                      <span className="text-white">{player.gamesPlayed}</span>
                    </div>
                    
                    <div className="col-span-1">
                      <div className="flex items-center space-x-1">
                        <FaFire className="text-orange-500 text-sm" />
                        <span className="text-orange-400">{player.streak}</span>
                      </div>
                    </div>
                    
                    <div className="col-span-1">
                      {getBadgeIcon(player.badge)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Your Stats */}
      <section className="py-20 px-4 bg-black/20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-white/10"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Your Statistics</h2>
              <p className="text-gray-300">Track your progress and achievements</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { label: 'Current Rating', value: '1200', change: '+50', color: 'text-green-400' },
                { label: 'Games Played', value: '45', change: '', color: 'text-white' },
                { label: 'Win Rate', value: '65%', change: '+5%', color: 'text-blue-400' },
                { label: 'Best Streak', value: '8', change: '', color: 'text-orange-400' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-gray-300 text-sm mb-1">{stat.label}</div>
                  {stat.change && (
                    <div className="text-green-400 text-xs">{stat.change} this week</div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link 
                href="/game?mode=multiplayer"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 inline-block"
              >
                Play More Games
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Recent Achievements</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Celebrate the accomplishments of our top players.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Rating Milestone',
                description: 'ChessMaster2024 reached 2850 rating',
                icon: FaTrophy,
                color: 'from-yellow-400 to-orange-500'
              },
              {
                title: 'Win Streak',
                description: 'TacticalGenius achieved 15-game win streak',
                icon: FaFire,
                color: 'from-orange-400 to-red-500'
              },
              {
                title: 'Games Played',
                description: 'EndgameWizard completed 200 games',
                icon: FaStar,
                color: 'from-blue-400 to-purple-500'
              }
            ].map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center"
              >
                <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${achievement.color} rounded-full flex items-center justify-center mb-4`}>
                  <achievement.icon className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{achievement.title}</h3>
                <p className="text-gray-300">{achievement.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-black/20">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">Join the Competition</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Start playing today and climb the global leaderboard!
            </p>
            <Link 
              href="/game?mode=multiplayer"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 inline-block"
            >
              Play Now & Compete
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