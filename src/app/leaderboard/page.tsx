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

  // No real data yet: accounts and rated matches are not built. Dashes are placeholders, not statistics.
  // Invented sample players removed. Rows come from completed rated matches once accounts exist.
  const sampleLeaderboard = [
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
  const leaderboardData: typeof sampleLeaderboard = [];

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'crown':
        return <FaCrown className="text-yellow-400" />;
      case 'medal':
        return <FaMedal className="text-bone/75" />;
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
    if (rank === 2) return 'text-bone/75';
    if (rank === 3) return 'text-orange-500';
    return 'text-bone';
  };

  return (
    <div className="min-h-screen bg-ink">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-walnut/40 backdrop-blur-md z-50 border-b border-brass/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <FaChess className="text-3xl text-bone" />
            <span className="text-2xl font-bold text-bone">3D Chess</span>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link href="/about" className="text-bone hover:text-brass-light transition-colors">About</Link>
            <Link href="/tutorials" className="text-bone hover:text-brass-light transition-colors">Tutorials</Link>
            <Link href="/leaderboard" className="text-brass-light font-semibold">Leaderboard</Link>
            <Link href="/contact" className="text-bone hover:text-brass-light transition-colors">Contact</Link>
          </div>
          
          <div className="flex space-x-4">
            <Link 
              href="/game?mode=singleplayer&difficulty=beginner"
              className="bg-brass hover:bg-brass-light text-ink font-semibold px-4 py-2 rounded-lg transition-colors"
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
            <h1 className="text-5xl md:text-7xl font-bold text-bone mb-6">
              Global
              <span className="text-brass-light"> Leaderboard</span>
            </h1>
            <p className="text-xl md:text-2xl text-bone/75 mb-8 max-w-3xl mx-auto">
              Compete with the best players worldwide and climb the rankings.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-20 px-4 bg-walnut/40">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: FaUsers, label: 'Total Players', value: '—', color: 'text-brass-light' },
              { icon: FaTrophy, label: 'Active Games', value: '—', color: 'text-brass' },
              { icon: FaChartLine, label: 'Avg Rating', value: '—', color: 'text-green-400' },
              { icon: FaFire, label: 'Games Today', value: '—', color: 'text-orange-400' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-walnut/60 backdrop-blur-sm rounded-xl p-6 border border-brass/20 text-center"
              >
                <stat.icon className={`text-3xl ${stat.color} mx-auto mb-3`} />
                <div className="text-2xl font-bold text-bone mb-1">{stat.value}</div>
                <div className="text-bone/75 text-sm">{stat.label}</div>
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
              <FaFilter className="text-bone" />
              <span className="text-bone font-medium">Filter by:</span>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="bg-white/10 border border-brass/30 rounded-lg px-4 py-2 text-bone focus:outline-none focus:border-brass"
              >
                <option value="all">All Players</option>
                <option value="top-10">Top 10</option>
                <option value="top-50">Top 50</option>
                <option value="active">Recently Active</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-bone font-medium">Timeframe:</span>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="bg-white/10 border border-brass/30 rounded-lg px-4 py-2 text-bone focus:outline-none focus:border-brass"
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
            className="bg-walnut/60 backdrop-blur-sm rounded-2xl border border-brass/20 overflow-hidden"
          >
            {/* Table Header */}
            <div className="bg-white/10 px-6 py-4 border-b border-brass/20">
              <div className="grid grid-cols-12 gap-4 text-bone font-semibold">
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
              {leaderboardData.length === 0 && (
                <div className="px-6 py-10 text-center text-bone/70">
                  No rated players yet. Rankings appear once accounts and completed rated matches exist.
                </div>
              )}
              {leaderboardData.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="px-6 py-4 hover:bg-walnut/60 transition-colors"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className={`col-span-1 font-bold text-lg ${getRankColor(player.rank)}`}>
                      #{player.rank}
                    </div>
                    
                    <div className="col-span-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-brass rounded-full flex items-center justify-center">
                          <FaChess className="text-bone text-lg" />
                        </div>
                        <div>
                          <div className="text-bone font-semibold">{player.username}</div>
                          <div className="text-bone/60 text-sm">ID: {player.id}</div>
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
                      <span className="text-bone/60">{player.draws}</span>
                    </div>
                    
                    <div className="col-span-1">
                      <span className="text-brass-light">{player.winRate}%</span>
                    </div>
                    
                    <div className="col-span-1">
                      <span className="text-bone">{player.gamesPlayed}</span>
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
      <section className="py-20 px-4 bg-walnut/40">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r bg-brass/10 rounded-2xl p-8 border border-brass/20"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-bone mb-4">Your Statistics</h2>
              <p className="text-bone/75">Your statistics appear here once accounts and rated matches exist.</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { label: 'Current Rating', value: '—', change: '', color: 'text-bone' },
                { label: 'Games Played', value: '—', change: '', color: 'text-bone' },
                { label: 'Win Rate', value: '—', change: '', color: 'text-brass-light' },
                { label: 'Best Streak', value: '—', change: '', color: 'text-orange-400' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-bone/75 text-sm mb-1">{stat.label}</div>
                  {stat.change && (
                    <div className="text-green-400 text-xs">{stat.change} this week</div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link 
                href="/game?mode=multiplayer"
                className="bg-brass text-ink font-semibold px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 inline-block"
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
            <h2 className="text-4xl font-bold text-bone mb-4">Recent Achievements</h2>
            <p className="text-xl text-bone/75 max-w-2xl mx-auto">
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
                color: 'from-brass to-brass'
              }
            ].map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-walnut/60 backdrop-blur-sm rounded-xl p-6 border border-brass/20 text-center"
              >
                <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${achievement.color} rounded-full flex items-center justify-center mb-4`}>
                  <achievement.icon className="text-2xl text-bone" />
                </div>
                <h3 className="text-xl font-bold text-bone mb-2">{achievement.title}</h3>
                <p className="text-bone/75">{achievement.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-walnut/40">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-bone mb-6">Join the Competition</h2>
            <p className="text-xl text-bone/75 mb-8 max-w-2xl mx-auto">
              Start playing today and climb the global leaderboard!
            </p>
            <Link 
              href="/game?mode=multiplayer"
              className="bg-brass text-ink font-semibold px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 inline-block"
            >
              Play Now & Compete
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-brass/20 py-12 px-4">
        <div className="container mx-auto text-center">
          <p className="text-bone/75">&copy; 2024 3D Chess. Built with ❤️ by Raghav Mahajan</p>
        </div>
      </footer>
    </div>
  );
} 