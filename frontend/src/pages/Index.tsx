import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Logo from '../components/Logo';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 pt-12">
        <header className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-4xl font-extrabold text-indigo-600 mb-4">
            Opus Agents
          </h1>
          <p className="text-lg text-gray-600">
            Create, test and deploy AI agents through natural conversation or step-by-step configuration.
            No programming expertise required.
          </p>
        </header>

        {/* Video Tutorial */}
        <div className="mb-12 rounded-2xl overflow-hidden shadow-lg bg-black">
          <video
            src="/tutorial.mp4"
            autoPlay
            muted
            loop
            controls
            playsInline
            className="w-full aspect-video"
          />
          <p className="text-center text-sm text-gray-500 py-3 bg-white">
            🎬 Watch our walkthrough of Opus Agents
          </p>
        </div>

        <main>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <span className="ml-3 text-indigo-600 text-xl font-bold">Build</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Build AI Agents
                </h2>
                <p className="text-gray-500">
                  Configure your agent step-by-step or describe your needs in natural conversation, and we'll build a tailored AI agent for you.
                </p>
              </div>
              <Link
                to="/create-agent"
                className="mt-6 inline-block text-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Get Started →
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <span className="ml-3 text-green-600 text-xl font-bold">Test & Deploy</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Test Your Agent
                </h2>
                <p className="text-gray-500">
                  Chat with your AI agent powered by live AI responses to see how it performs before deploying and sharing.
                </p>
              </div>
              <div className="mt-6 flex gap-3">
                <Link
                  to="/test-agent"
                  className="flex-1 text-center px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Test Agent →
                </Link>
                <Link
                  to="/agents"
                  className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
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
