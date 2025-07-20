'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaChess, 
  FaEnvelope, 
  FaGithub, 
  FaLinkedin, 
  FaGlobe, 
  FaComments,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
    alert('Thank you for your message! I\'ll get back to you soon.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
            <Link href="/leaderboard" className="text-white hover:text-blue-400 transition-colors">Leaderboard</Link>
            <Link href="/contact" className="text-blue-400 font-semibold">Contact</Link>
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
              Get in
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> Touch</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Have questions, feedback, or want to collaborate? I'd love to hear from you!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Send a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-white font-medium mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-white font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-white font-medium mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="feedback">Feedback</option>
                    <option value="collaboration">Collaboration</option>
                    <option value="bug-report">Bug Report</option>
                    <option value="feature-request">Feature Request</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-white font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                    placeholder="Tell me more about your inquiry..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  Send Message
                </button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h2 className="text-3xl font-bold text-white mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <FaEnvelope className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Email</h3>
                      <p className="text-gray-300">raghav@example.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                      <FaComments className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Live Chat</h3>
                      <p className="text-gray-300">Available during business hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <FaGlobe className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Website</h3>
                      <a 
                        href="https://www.raghv.dev" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        www.raghv.dev
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Connect With Me</h2>
                
                <div className="grid grid-cols-3 gap-4">
                  <a 
                    href="https://github.com/raghv-m"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg transition-colors text-center"
                  >
                    <FaGithub className="text-2xl mx-auto mb-2" />
                    <span className="text-sm">GitHub</span>
                  </a>
                  
                  <a 
                    href="https://linkedin.com/in/raghav-mahajan-17611b24b"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors text-center"
                  >
                    <FaLinkedin className="text-2xl mx-auto mb-2" />
                    <span className="text-sm">LinkedIn</span>
                  </a>
                  
                  <a 
                    href="https://www.raghv.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors text-center"
                  >
                    <FaGlobe className="text-2xl mx-auto mb-2" />
                    <span className="text-sm">Portfolio</span>
                  </a>
                </div>
              </div>

              {/* Support Info */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Support & FAQ</h2>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-400 pl-4">
                    <h3 className="text-white font-semibold">Technical Issues</h3>
                    <p className="text-gray-300 text-sm">Having trouble with the game? Check our troubleshooting guide.</p>
                  </div>
                  
                  <div className="border-l-4 border-purple-400 pl-4">
                    <h3 className="text-white font-semibold">Feature Requests</h3>
                    <p className="text-gray-300 text-sm">Want to see new features? Let us know your ideas!</p>
                  </div>
                  
                  <div className="border-l-4 border-green-400 pl-4">
                    <h3 className="text-white font-semibold">Collaboration</h3>
                    <p className="text-gray-300 text-sm">Interested in working together? I'm always open to new opportunities.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-black/20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Find answers to common questions about 3D Chess and my work.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                question: "How do I play 3D Chess?",
                answer: "3D Chess follows the same rules as traditional chess but with an additional layer dimension. Pieces can move between layers, adding strategic depth to the game."
              },
              {
                question: "What technologies did you use?",
                answer: "The game is built with Next.js, Three.js for 3D graphics, Socket.io for multiplayer, and TypeScript for type safety."
              },
              {
                question: "Can I play against friends?",
                answer: "Yes! The multiplayer mode allows you to create private rooms and invite friends using unique room codes."
              },
              {
                question: "How does the AI work?",
                answer: "The AI uses the minimax algorithm with alpha-beta pruning and position evaluation to make intelligent moves at different difficulty levels."
              },
              {
                question: "Is the game free to play?",
                answer: "Yes, 3D Chess is completely free to play with all features available to everyone."
              },
              {
                question: "Can I contribute to the project?",
                answer: "Absolutely! The project is open source and I welcome contributions. Check out the GitHub repository for more details."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
              >
                <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </motion.div>
            ))}
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
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Play?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Experience the future of chess gaming with our advanced 3D platform.
            </p>
            <Link 
              href="/game?mode=singleplayer&difficulty=beginner"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 inline-block"
            >
              Start Playing Now
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