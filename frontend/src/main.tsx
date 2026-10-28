import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import CreateAgent from './pages/CreateAgent';
import TestAgent from './pages/TestAgent';
import Agents from './pages/Agents';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/create-agent" element={<CreateAgent />} />
        <Route path="/test-agent/:id?" element={<TestAgent />} />
        <Route path="/agents" element={<Agents />} />
      </Routes>
    </Router>
  );
};

export default App;