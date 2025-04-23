'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useContractOperations } from '../hooks/useContractOperations';
import { useContract } from '../hooks/useContract';
import { ethers } from 'ethers';
import contractConfig from '../utils/contractConfig.json';

export default function DAOPage() {
  const { address, isConnected } = useAccount();
  const { joinDAO, voteOnProject, loading, error } = useContractOperations();
  const { contracts } = useContract();
  const [isMember, setIsMember] = useState(false);
  const [projectRequests, setProjectRequests] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [stakedAmount, setStakedAmount] = useState('0');
  const [txStatus, setTxStatus] = useState('');
  const [mounted, setMounted] = useState(false);
  const [minStakeAmount, setMinStakeAmount] = useState('0');
  const [totalStaked, setTotalStaked] = useState('0');

  useEffect(() => {
    setMounted(true);
    setMinStakeAmount(contractConfig.contracts.DAO.minStakeAmount);
  }, []);

  useEffect(() => {
    if (mounted && isConnected && address && contracts?.dao) {
      loadDAOData();
      const interval = setInterval(loadDAOData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [mounted, isConnected, address, contracts?.dao]);

  const loadDAOData = async () => {
    if (!contracts?.dao || !contracts?.projectListing) {
      console.error('Contracts not initialized');
      return;
    }

    try {
      console.log('Loading DAO data...');

      const isMemberResult = await contracts.dao.isMember(address);
      console.log('Is member result:', isMemberResult);
      setIsMember(isMemberResult);

      const memberCount = await contracts.dao.getMemberCount();
      console.log('Member count:', Number(memberCount));
      setMemberCount(Number(memberCount));

      if (isMemberResult) {
        const stake = await contracts.dao.getMemberStake(address);
        console.log('User stake:', ethers.formatEther(stake));
        setStakedAmount(ethers.formatEther(stake));
      }

      const projectIds = await contracts.projectListing.getAllProjectIds();
      console.log('Found project IDs:', projectIds);

      const requests = await Promise.all(
        projectIds.map(async (projectId) => {
          try {
            const request = await contracts.dao.projectRequests(projectId);
            if (request.projectId.toString() !== '0') {
              const hasVoted = await contracts.dao.hasVoted(projectId, address);
              const totalVotes = Number(request.yesVotes) + Number(request.noVotes);
              const memberCount = await contracts.dao.getMemberCount();
              const quorumReached = totalVotes >= memberCount / 2;

              return {
                id: projectId,
                name: request.name,
                description: request.description,
                owner: request.projectOwner,
                yesVotes: Number(request.yesVotes),
                noVotes: Number(request.noVotes),
                isProcessed: request.isProcessed,
                isApproved: request.isApproved,
                hasVoted,
                quorumReached,
                quorum: Math.ceil(memberCount / 2),
                totalVotes
              };
            }
            return null;
          } catch (err) {
            console.error('Error loading project request:', projectId, err);
            return null;
          }
        })
      );

      const validRequests = requests.filter(r => r !== null);
      console.log('Loaded project requests:', validRequests);
      setProjectRequests(validRequests);

    } catch (err) {
      console.error('Error in loadDAOData:', err);
      setTxStatus(`Error: ${err.message}`);
    }
  };

  const handleJoinDAO = async () => {
    setTxStatus('Joining DAO...');
    try {
      const success = await joinDAO();
      if (success) {
        setTxStatus('Successfully joined the DAO!');
        await loadDAOData();
      } else {
        setTxStatus('Failed to join DAO');
      }
    } catch (err) {
      setTxStatus('Error joining DAO: ' + err.message);
    }
  };

  const handleVote = async (projectId, voteInFavor) => {
    setTxStatus(`Voting ${voteInFavor ? 'Yes' : 'No'} on project ${projectId}...`);
    try {
      const success = await voteOnProject(projectId, voteInFavor);
      if (success) {
        setTxStatus('Vote recorded successfully!');
        await loadDAOData();
      } else {
        setTxStatus('Failed to record vote');
      }
    } catch (err) {
      setTxStatus('Error voting: ' + err.message);
    }
  };

  if (!mounted) return null;

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold mb-6 text-gradient">DAO Governance</h1>
          <p className="text-xl mb-6 text-gray-800">Connect your wallet to participate and make a difference!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold text-green-800">DAO Governance</h1>
        {error && <p className="text-red-600 mt-4">{error}</p>}
        {txStatus && <p className="text-blue-500 mt-4">{txStatus}</p>}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">DAO Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-gray-100 rounded-xl shadow-md">
            <h3 className="font-semibold text-gray-800">Total Members</h3>
            <p className="text-xl text-gray-900">{memberCount}</p>
          </div>
          <div className="p-6 bg-gray-100 rounded-xl shadow-md">
            <h3 className="font-semibold text-gray-800">Total Staked</h3>
            <p className="text-xl text-gray-900">{totalStaked} ETH</p>
          </div>
          <div className="p-6 bg-gray-100 rounded-xl shadow-md">
            <h3 className="font-semibold text-gray-800">Min Stake Required</h3>
            <p className="text-xl text-gray-900">{minStakeAmount} ETH</p>
          </div>
        </div>

        {isMember ? (
          <div className="mt-8 p-6 bg-green-100 rounded-xl shadow-md">
            <p className="text-green-600 font-semibold mb-4">You are a DAO member</p>
            <p className="text-gray-700">Your Staked Amount: <span className="font-bold">{stakedAmount} ETH</span></p>
          </div>
        ) : (
          <div className="mt-8">
            <button
              onClick={handleJoinDAO}
              disabled={loading}
              className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition duration-200"
            >
              {loading ? 'Processing...' : `Join DAO (Stake ${minStakeAmount} ETH)`}
            </button>
          </div>
        )}
      </div>

      {isMember && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Project Requests</h2>
          {projectRequests.length === 0 ? (
            <p className="text-gray-600">No pending project requests</p>
          ) : (
            <div className="space-y-8">
              {projectRequests.map((request) => (
                <div key={request.id} className="bg-gray-50 rounded-2xl p-8 shadow-lg">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{request.name}</h3>
                      <p className="text-gray-600 mt-2">{request.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Owner: {request.owner.slice(0, 6)}...{request.owner.slice(-4)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Status: {request.isProcessed ? (
                          request.isApproved ? 
                            <span className="text-green-600 font-semibold">Approved</span> : 
                            <span className="text-red-600 font-semibold">Rejected</span>
                        ) : (
                          <span className="text-yellow-600 font-semibold">Pending</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg p-6 text-center shadow-md">
                      <p className="text-green-600 text-2xl font-bold">{request.yesVotes}</p>
                      <p className="text-gray-600">Yes Votes</p>
                    </div>
                    <div className="bg-white rounded-lg p-6 text-center shadow-md">
                      <p className="text-red-600 text-2xl font-bold">{request.noVotes}</p>
                      <p className="text-gray-600">No Votes</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600">Progress: {request.totalVotes} / {request.quorum} votes</span>
                      <span className={`font-semibold ${request.quorumReached ? 'text-green-600' : 'text-yellow-600'}`}>
                        {request.quorumReached ? 'Quorum Reached' : 'Quorum Not Reached'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min((request.totalVotes / request.quorum) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {!request.isProcessed && !request.hasVoted && isMember && (
                    <div className="flex space-x-6 mt-6">
                      <button
                        onClick={() => handleVote(request.id, true)}
                        disabled={loading || request.hasVoted}
                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition duration-200"
                      >
                        Vote Yes
                      </button>
                      <button
                        onClick={() => handleVote(request.id, false)}
                        disabled={loading || request.hasVoted}
                        className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition duration-200"
                      >
                        Vote No
                      </button>
                    </div>
                  )}

                  {request.hasVoted && !request.isProcessed && (
                    <p className="text-center text-gray-600 mt-4">You have already voted on this project</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
