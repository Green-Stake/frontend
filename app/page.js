'use client';

import { useState } from 'react';
import ProjectListing from './components/ProjectListing';
import DonateProject from './components/DonateProject';
import DAOInterface from './components/DAOInterface';
import { useContract } from './hooks/useContract';

export default function Home() {
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const { loading: contractLoading, error: contractError } = useContract();

  const renderContent = () => {
    if (contractLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p>Connecting to blockchain...</p>
          </div>
        </div>
      );
    }

    if (contractError) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Connection Error</p>
          <p>{contractError}</p>
          <p className="mt-2 text-sm">Please make sure you have MetaMask installed and connected to the correct network.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'projects':
        return <ProjectListing onProjectSelect={setSelectedProjectId} />;
      case 'donate':
        return selectedProjectId ? 
          <DonateProject projectId={selectedProjectId} /> : 
          <div className="text-center py-8">Please select a project from the Projects tab first.</div>;
      case 'dao':
        return <DAOInterface />;
      default:
        return <ProjectListing />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-green-600">GreenStake</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('projects')}
                className={`${
                  activeTab === 'projects'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                Projects
              </button>
              <button
                onClick={() => setActiveTab('donate')}
                className={`${
                  activeTab === 'donate'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                Donate
              </button>
              <button
                onClick={() => setActiveTab('dao')}
                className={`${
                  activeTab === 'dao'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                DAO
              </button>
            </nav>
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
