import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Index from './pages/Index';
import CreateAgent from './pages/CreateAgent';
import TestAgent from './pages/TestAgent';
import Agents from './pages/Agents';
import AgentDetail from './pages/AgentDetail';
import Login from './pages/Login';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Index />} />
          {/* Public: shared agent chat links (?cfg=...) must work without an account */}
          <Route path="/test-agent/:id?" element={<TestAgent />} />
          {/* Protected: account required */}
          <Route
            path="/create-agent"
            element={
              <ProtectedRoute>
                <CreateAgent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agents"
            element={
              <ProtectedRoute>
                <Agents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/:id"
            element={
              <ProtectedRoute>
                <AgentDetail />
              </ProtectedRoute>
            }
          />
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
