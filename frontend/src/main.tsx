import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Index from './pages/Index';
import CreateAgent from './pages/CreateAgent';
import TestAgent from './pages/TestAgent';
import Agents from './pages/Agents';
import AgentDetail from './pages/AgentDetail';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* Public: shared agent chat links (?cfg=...) must work without an account */}
          <Route path="/test-agent/:id?" element={<TestAgent />} />
          {/* All routes public (login disabled) */}
          <Route path="/create-agent" element={<CreateAgent />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/agent/:id" element={<AgentDetail />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

export default App;
