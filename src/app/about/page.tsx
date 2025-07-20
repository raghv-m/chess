'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaGithub, 
  FaLinkedin, 
  FaInstagram, 
  FaGlobe, 
  FaGraduationCap, 
  FaCode, 
  FaMobile, 
  FaDatabase,
  FaChess
} from 'react-icons/fa';

export default function AboutPage() {
  const skills = [
    { name: 'React', icon: FaCode, level: 90 },
    { name: 'Node.js', icon: FaCode, level: 85 },
    { name: 'Firebase', icon: FaDatabase, level: 80 },
    { name: 'Flutter', icon: FaMobile, level: 75 },
    { name: 'Python', icon: FaCode, level: 80 },
    { name: 'Full-Stack', icon: FaCode, level: 85 }
  ];

  const projects = [
    {
      title: 'Chattr',
      description: 'Real-time chat platform with advanced features',
      tech: ['React', 'Node.js', 'Socket.io', 'MongoDB']
    },
    {
      title: 'ImmigrateX',
      description: 'Immigration services platform',
      tech: ['React', 'Firebase', 'TypeScript']
    },
    {
      title: 'bat-APP',
      description: 'Mobile application for business automation',
      tech: ['Flutter', 'Firebase', 'Dart']
    },
    {
      title: '3D Chess',
      description: 'Advanced 3D chess game with AI and multiplayer',
      tech: ['Next.js', 'Three.js', 'Socket.io', 'TypeScript']
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
            <Link href="/about" className="text-blue-400 font-semibold">About</Link>
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
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              About
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> Raghav Mahajan</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Full-stack developer passionate about creating innovative solutions and immersive gaming experiences.
            </p>
          </motion.div>

          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-16"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">The Developer Behind 3D Chess</h2>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Hi! I'm Raghav Mahajan, a passionate full-stack developer with a diploma from NAIT. 
                  I specialize in creating modern web applications, mobile apps, and immersive gaming experiences.
                </p>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  With expertise in React, Node.js, Firebase, Flutter, and Python, I've built various 
                  applications including chat platforms, business automation tools, and now this advanced 3D chess game.
                </p>
                
                {/* Social Links */}
                <div className="flex space-x-4 mb-6">
                  <a 
                    href="https://github.com/raghv-m" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg transition-colors"
                  >
                    <FaGithub className="text-xl" />
                  </a>
                  <a 
                    href="https://linkedin.com/in/raghav-mahajan-17611b24b" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors"
                  >
                    <FaLinkedin className="text-xl" />
                  </a>
                  <a 
                    href="https://www.raghv.dev" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors"
                  >
                    <FaGlobe className="text-xl" />
                  </a>
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-48 h-48 mx-auto bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center mb-4">
                  <FaChess className="text-6xl text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Raghav Mahajan</h3>
                <p className="text-gray-300">Full-Stack Developer</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Education & Experience */}
      <section className="py-20 px-4 bg-black/20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Education & Experience</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              My journey in technology and software development.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center mb-4">
                <FaGraduationCap className="text-3xl text-blue-400 mr-4" />
                <h3 className="text-2xl font-bold text-white">Education</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">Diploma in Software Development</h4>
                  <p className="text-blue-400">Northern Alberta Institute of Technology (NAIT)</p>
                  <p className="text-gray-300 text-sm">Comprehensive training in modern software development practices</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center mb-4">
                <FaCode className="text-3xl text-purple-400 mr-4" />
                <h3 className="text-2xl font-bold text-white">Experience</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">Full-Stack Freelancer</h4>
                  <p className="text-purple-400">Independent Developer</p>
                  <p className="text-gray-300 text-sm">Building custom solutions for clients across various industries</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">POS Tools & Chat Platforms</h4>
                  <p className="text-purple-400">Specialized Development</p>
                  <p className="text-gray-300 text-sm">Expertise in point-of-sale systems and real-time communication platforms</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Technical Skills</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Proficient in modern web technologies and mobile development.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
              >
                <div className="flex items-center mb-4">
                  <skill.icon className="text-2xl text-blue-400 mr-3" />
                  <h3 className="text-lg font-semibold text-white">{skill.name}</h3>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
                <p className="text-gray-300 text-sm mt-2">{skill.level}% proficiency</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20 px-4 bg-black/20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Featured Projects</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              A showcase of my recent work and technical achievements.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
              >
                <h3 className="text-xl font-bold text-white mb-3">{project.title}</h3>
                <p className="text-gray-300 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech, techIndex) => (
                    <span 
                      key={techIndex}
                      className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3D Chess Story */}
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
              <FaChess className="text-5xl text-blue-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">The 3D Chess Journey</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  3D Chess represents my passion for combining cutting-edge technology with classic gaming. 
                  This project showcases my expertise in modern web development, 3D graphics, and real-time multiplayer systems.
                </p>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Built with Next.js, Three.js, and Socket.io, this game demonstrates advanced concepts like 
                  AI algorithms, real-time communication, and immersive 3D experiences. It's not just a chess game 
                  - it's a testament to modern web development capabilities.
                </p>
                
                <Link 
                  href="/game?mode=singleplayer&difficulty=beginner"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 inline-block"
                >
                  Try 3D Chess Now
                </Link>
              </div>
              
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center mb-4">
                  <FaChess className="text-4xl text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Advanced Features</h3>
                <ul className="text-gray-300 space-y-2 text-left">
                  <li>• Intelligent AI with multiple difficulty levels</li>
                  <li>• Real-time multiplayer with friend invites</li>
                  <li>• Stunning 3D graphics and animations</li>
                  <li>• Interactive tutorials and puzzles</li>
                  <li>• Cross-platform compatibility</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">Let's Connect!</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Interested in working together or just want to chat about technology? 
              I'd love to hear from you!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
              >
                Get In Touch
              </Link>
              <a 
                href="https://github.com/raghv-m"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
              >
                View My Work
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex justify-center space-x-6 mb-6">
            <a 
              href="https://github.com/raghv-m" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <FaGithub className="text-2xl" />
            </a>
            <a 
              href="https://linkedin.com/in/raghav-mahajan-17611b24b" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <FaLinkedin className="text-2xl" />
            </a>
            <a 
              href="https://www.raghv.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <FaGlobe className="text-2xl" />
            </a>
          </div>
          <p className="text-gray-300">&copy; 2024 Raghav Mahajan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 