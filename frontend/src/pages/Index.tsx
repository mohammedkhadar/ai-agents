import React from 'react';
import { Link } from 'react-router-dom';
import ChatInterface from '../components/ChatInterface';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-2xl mx-auto p-6">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-indigo-600 mb-4">
            AI Agent Platform
          </h1>
          <p className="text-lg text-gray-600">
            Create, test and deploy AI agents through natural conversation.
            No programming expertise required.
          </p>
        </header>

        <main>
          <div className="grid gap-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:transform hover:translate-y-1 hover:transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path className="w-6 h-6" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <path className="w-6 h-6" d="M3 13h2l6 6v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2l6-6h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2z" />
                    <circle className="w-1 h-1 fill-current" cx="10" cy="10" r="7" />
                  </svg>
                </div>
                <span className="ml-3 text-indigo-600 text-xl font-bold">AI</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Build AI Agents
              </h2>
              <p className="text-gray-500">
                Tell our chatbot about your needs, and we'll build a tailored AI agent for you.
              </p>
              <Link to "/create-agent" 
                className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                Get Started →
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:transform hover:translate-y-1 hover:transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path className="w-6 h-6" d="M12 15m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0" />
                    <path className="w-6 h-6" d="M12 2v2m0 16v-2m7-5h-6L12 6l-3 5H3" />
                  </svg>
                </div>
                <span className="ml-3 text-green-600 text-xl font-bold">Test</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Test Your Agent
              </h2>
              <p className="text-gray-500">
                Chat with your AI agent to see how it responds before deploying.
              </p>
              <Link to "/test-agent" 
                className="mt-6 inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
                Test Agent →
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;