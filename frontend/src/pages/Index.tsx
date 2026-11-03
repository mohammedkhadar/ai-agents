import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f7f7f4]">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 pt-12">
        <p className="text-center text-lg text-[#5a5852] mb-8 max-w-2xl mx-auto">
          Opus Agents is a no-code platform that allows companies to create AI agents, train them with their own data, and deploy them without programming.
        </p>
        <main>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between border border-[#e6e5e0]">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#fafaf7] flex items-center justify-center border border-[#e6e5e0]">
                    <svg className="w-6 h-6 text-[#f54e00]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <span className="ml-3 text-[#f54e00] text-xl font-bold">Build</span>
                </div>
                <h2 className="text-2xl font-bold text-[#26251e] mb-2">
                  Build AI Agents
                </h2>
                <p className="text-[#5a5852]">
                  Configure your agent step-by-step or describe your needs in natural conversation, and we'll build a tailored AI agent for you.
                </p>
              </div>
              <Link
                to="/create-agent"
                className="mt-6 inline-block text-center px-6 py-3 bg-[#f54e00] text-white font-medium rounded-lg hover:bg-[#d04200] transition-colors"
              >
                Get Started →
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between border border-[#e6e5e0]">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#fafaf7] flex items-center justify-center border border-[#e6e5e0]">
                    <svg className="w-6 h-6 text-[#1f8a65]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <span className="ml-3 text-[#1f8a65] text-xl font-bold">Test & Deploy</span>
                </div>
                <h2 className="text-2xl font-bold text-[#26251e] mb-2">
                  Test Your Agent
                </h2>
                <p className="text-[#5a5852]">
                  Chat with your AI agent powered by live AI responses to see how it performs before deploying and sharing.
                </p>
              </div>
              <div className="mt-6 flex gap-3">
                <Link
                  to="/test-agent"
                  className="flex-1 text-center px-4 py-3 bg-[#1f8a65] text-white font-medium rounded-lg hover:bg-[#176b50] transition-colors"
                >
                  Test Agent →
                </Link>
                <Link
                  to="/agents"
                  className="px-4 py-3 bg-[#e6e5e0] text-[#26251e] font-medium rounded-lg hover:bg-[#d5d4cf] transition-colors"
                >
                  My Agents
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
