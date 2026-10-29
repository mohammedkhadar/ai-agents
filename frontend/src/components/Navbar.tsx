import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { pathname } = useLocation();

  const navLinkClass = (path: string) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname === path
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            AI
          </div>
          <span className="font-bold text-gray-900 text-lg">AI Agent Platform</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/" className={navLinkClass('/')}>
            Home
          </Link>
          <Link to="/create-agent" className={navLinkClass('/create-agent')}>
            Create Agent
          </Link>
          <Link to="/agents" className={navLinkClass('/agents')}>
            My Agents
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
