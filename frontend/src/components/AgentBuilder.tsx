import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AgentConfig {
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
  const navigate = useNavigate();

  const steps = [
    'Provide agent name',
    'Define agent description',
    'Specify agent purpose',
    'Select industry',
    'Choose capabilities',
  ];

  const handleNext = () => {
    // Validate current step
    const isValid = validateCurrentStep();
    if (!isValid) return;

    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return steps.name.length >= 3;
      case 2:
        return steps.description.length >= 10;
      case 3:
        return steps.purpose.length >= 10;
      case 4:
        return steps.industry.length >= 2;
      case 5:
        return steps.capabilities.length > 0;
      default:
        return true;
    }
  };

  const addCapability = (capability: string) => {
    setSteps(prev => ({
      ...prev,
      capabilities: [...prev.capabilities, capability],
    }));
  };

  const removeCapability = (capability: string) => {
    setSteps(prev => ({
      ...prev,
      capabilities: prev.capabilities.filter(c => c !== capability),
    }));
  };

  if (currentStep > steps.length) {
    // Complete - send to onComplete
    onComplete({
      name: steps.name,
      description: steps.description,
      purpose: steps.purpose,
      industry: steps.industry,
      capabilities: steps.capabilities,
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
    });
    return null;
  }

  return (
    <div className="agent-builder min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        {/* Step Progress */}
        <div className="mb-6">
          <nav className="flex space-x-2">
            {steps.map((step, index) => (
              <div key={index} className={`flex-1 rounded px-3 py-2 ${index + 1 < currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {step}
              </div>
            ))}
          </nav>
          <p className="mt-2 text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </p>
        </div>

        {/* Step Content */}
        <div className={`prose max-w-none ${currentStep === 1 ? 'step-1' : ''}`}>
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
                    onChange={(e) => 
                      setSteps(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Customer Support Bot"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    // Skip validation for demo
                    setCurrentStep(2);
                  }}
                  className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  disabled={steps.name.length < 3}
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
                  onChange={(e) => 
                    setSteps(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Helps customers with billing questions and account management..."
                  required
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  disabled={steps.description.length < 10}
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
                  onChange={(e) => 
                    setSteps(prev => ({ ...prev, purpose: e.target.value }))}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Answer FAQs, process orders, schedule appointments..."
                  required
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  disabled={steps.purpose.length < 10}
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
                  onChange={(e) => 
                    setSteps(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
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
                  onClick={() => setCurrentStep(3)}
                  className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={steps.capabilities.includes('text-generation')}
                      onChange={(e) => 
                        setSteps(prev => ({
                          ...prev,
                          capabilities: 
                            e.target.checked 
                              ? [...prev.capabilities, 'text-generation']
                              : prev.capabilities.filter(c => c !== 'text-generation'),
                        }))}
                      className="rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-2"
                    />
                    Text generation
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={steps.capabilities.includes('code-generation')}
                      onChange={(e) => 
                        setSteps(prev => ({
                          ...prev,
                          capabilities: 
                            e.target.checked 
                              ? [...prev.capabilities, 'code-generation']
                              : prev.capabilities.filter(c => c !== 'code-generation'),
                        }))}
                      className="rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-2"
                    />
                    Code generation
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={steps.capabilities.includes('analysis')}
                      onChange={(e) => 
                        setSteps(prev => ({
                          ...prev,
                          capabilities: 
                            e.target.checked 
                              ? [...prev.capabilities, 'analysis']
                              : prev.capabilities.filter(c => c !== 'analysis'),
                        }))}
                      className="rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-2"
                    />
                    Data analysis
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={steps.capabilities.includes('customer-service')}
                      onChange={(e) => 
                        setSteps(prev => ({
                          ...prev,
                          capabilities: 
                            e.target.checked 
                              ? [...prev.capabilities, 'customer-service']
                              : prev.capabilities.filter(c => c !== 'customer-service'),
                        }))}
                      className="rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-2"
                    />
                    Customer service
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Create Agent
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentBuilder;