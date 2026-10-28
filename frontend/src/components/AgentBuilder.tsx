import React, { useState } from 'react';

export interface AgentConfig {
  name: string;
  description: string;
  purpose: string;
  industry: string;
  capabilities: string[];
  model: string;
  temperature: number;
}

interface AgentBuilderProps {
  onComplete: (config: AgentConfig) => void;
}

const AgentBuilder: React.FC<AgentBuilderProps> = ({ onComplete }) => {
  const [steps, setSteps] = useState<{
    name: string;
    description: string;
    purpose: string;
    industry: string;
    capabilities: string[];
  }>({
    name: '',
    description: '',
    purpose: '',
    industry: '',
    capabilities: [],
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');

  const stepLabels = [
    'Provide agent name',
    'Define agent description',
    'Specify agent purpose',
    'Select industry',
    'Choose capabilities',
  ];

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!steps.name.trim()) {
          setError('Please enter an agent name.');
          return false;
        }
        break;
      case 2:
        if (!steps.description.trim()) {
          setError('Please enter an agent description.');
          return false;
        }
        break;
      case 3:
        if (!steps.purpose.trim()) {
          setError('Please specify the agent purpose.');
          return false;
        }
        break;
      case 4:
        if (!steps.industry) {
          setError('Please select an industry.');
          return false;
        }
        break;
      case 5:
        if (steps.capabilities.length === 0) {
          setError('Please select at least one capability.');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (currentStep === stepLabels.length) {
      onComplete({
        name: steps.name.trim() || 'My AI Agent',
        description: steps.description.trim() || 'General AI Assistant',
        purpose: steps.purpose.trim() || 'Assist users with their questions',
        industry: steps.industry || 'other',
        capabilities: steps.capabilities.length > 0 ? steps.capabilities : ['text-generation'],
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
      });
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const handleSkip = () => {
    setError('');
    if (currentStep === stepLabels.length) {
      onComplete({
        name: steps.name.trim() || 'My AI Agent',
        description: steps.description.trim() || 'General AI Assistant',
        purpose: steps.purpose.trim() || 'Assist users with their questions',
        industry: steps.industry || 'other',
        capabilities: steps.capabilities.length > 0 ? steps.capabilities : ['text-generation'],
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
      });
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  return (
    <div className="agent-builder">
      {/* Step Progress */}
      <div className="mb-6">
        <nav className="flex space-x-2">
          {stepLabels.map((step, index) => (
            <div
              key={index}
              className={`flex-1 rounded px-3 py-2 text-sm font-medium ${
                index + 1 <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
          ))}
        </nav>
        <p className="mt-2 text-sm text-gray-500">
          Step {currentStep} of {stepLabels.length}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="prose max-w-none">
        {/* Step 1: Name */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Agent Name</h2>
            <p className="text-gray-600 mb-4">
              Give your AI agent a name that reflects its purpose.
            </p>
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Agent Name
                </label>
                <input
                  value={steps.name}
                  onChange={(e) => {
                    setError('');
                    setSteps(prev => ({ ...prev, name: e.target.value }));
                  }}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Customer Support Bot"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSkip}
                className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!steps.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Description */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Agent Description</h2>
            <p className="text-gray-600 mb-4">
              Describe what your agent does in one sentence.
            </p>
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <textarea
                value={steps.description}
                onChange={(e) => {
                  setError('');
                  setSteps(prev => ({ ...prev, description: e.target.value }));
                }}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Helps customers with billing questions and account management..."
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => { setError(''); setCurrentStep(1); }}
                className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!steps.description.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Purpose */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Agent Purpose</h2>
            <p className="text-gray-600 mb-4">
              What specific tasks should your agent perform?
            </p>
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <textarea
                value={steps.purpose}
                onChange={(e) => {
                  setError('');
                  setSteps(prev => ({ ...prev, purpose: e.target.value }));
                }}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Answer FAQs, process orders, schedule appointments..."
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => { setError(''); setCurrentStep(2); }}
                className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!steps.purpose.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Industry */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Industry</h2>
            <p className="text-gray-600 mb-4">
              Which industry will your agent operate in?
            </p>
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <select
                value={steps.industry}
                onChange={(e) => {
                  setError('');
                  setSteps(prev => ({ ...prev, industry: e.target.value }));
                }}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an industry</option>
                <option value="customer-service">Customer Service</option>
                <option value="sales">Sales</option>
                <option value="human-resources">Human Resources</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => { setError(''); setCurrentStep(3); }}
                className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!steps.industry}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Capabilities */}
        {currentStep === 5 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Capabilities</h2>
            <p className="text-gray-600 mb-4">
              Select what your agent should be able to do.
            </p>
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="space-y-2">
                {[
                  { id: 'text-generation', label: 'Text generation' },
                  { id: 'code-generation', label: 'Code generation' },
                  { id: 'analysis', label: 'Data analysis' },
                  { id: 'customer-service', label: 'Customer service' },
                ].map(cap => (
                  <label key={cap.id} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={steps.capabilities.includes(cap.id)}
                      onChange={(e) => {
                        setError('');
                        setSteps(prev => ({
                          ...prev,
                          capabilities: e.target.checked
                            ? [...prev.capabilities, cap.id]
                            : prev.capabilities.filter(c => c !== cap.id),
                        }));
                      }}
                      className="rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-2"
                    />
                    {cap.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => { setError(''); setCurrentStep(4); }}
                className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Skip & Create
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={steps.capabilities.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Agent
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentBuilder;
