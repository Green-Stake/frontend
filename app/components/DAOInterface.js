import { useState, useEffect } from 'react';
import { useContractOperations } from '../hooks/useContractOperations';
import { useContract } from '../hooks/useContract';
import { ethers } from 'ethers';
import contractConfig from '../utils/contractConfig.json';

export default function DAOInterface() {
    const { joinDAO, vote, loading, error, clearError } = useContractOperations();
    const { contracts, signer, isConnected, chainId } = useContract();
    const [isMember, setIsMember] = useState(false);
    const [projectRequests, setProjectRequests] = useState([]);
    const [txStatus, setTxStatus] = useState('');
    const [memberStake, setMemberStake] = useState('0');
    const [isLoading, setIsLoading] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(Date.now());

    // Get the minimum stake amount from the contract config
    const minStakeAmount = contractConfig.contracts.DAO.minStakeAmount;

    // Add polling for data updates
    useEffect(() => {
        const pollInterval = setInterval(() => {
            setLastRefresh(Date.now());
        }, 15000); // Poll every 15 seconds

        return () => clearInterval(pollInterval);
    }, []);

    useEffect(() => {
        if (isConnected && contracts?.dao) {
            loadDAOData();
        }
    }, [isConnected, contracts?.dao, signer, lastRefresh]);

    const loadDAOData = async () => {
        if (!contracts?.dao || !contracts?.projectListing || !signer) {
            console.log('Required contracts or signer not available');
            return;
        }
        
        if (isLoading) return; // Prevent multiple simultaneous loads
        
        setIsLoading(true);
        try {
            // Get the current account
            const currentAccount = await signer.getAddress();
            console.log('Loading DAO data for account:', currentAccount);

            // Check if the current user is a member
            const memberData = await contracts.dao.members(currentAccount);
            setIsMember(memberData.isMember);
            
            if (memberData.isMember) {
                const stake = ethers.formatEther(memberData.stakedAmount);
                setMemberStake(stake);
                console.log('Member stake:', stake, 'ETH');
            }

            // Get all project IDs from ProjectListing contract
            const projectCount = await contracts.projectListing.getProjectCount();
            console.log('Total projects:', projectCount.toString());

            // Load project requests
            const requests = [];
            for (let i = 1; i <= projectCount; i++) {
                try {
                    const project = await contracts.projectListing.getProject(i);
                    
                    // Skip if project doesn't exist (empty name)
                    if (!project.name) continue;
                    
                    // Get DAO request data
                    const request = await contracts.dao.projectRequests(i);
                    const hasVoted = await contracts.dao.hasVoted(i, currentAccount);
                    
                    // Include project even if not yet in DAO voting
                    const isInDAO = request.projectId.toString() !== '0';
                    
                    requests.push({
                        projectId: i,
                        name: project.name,
                        description: project.description,
                        owner: project.owner,
                        yesVotes: isInDAO ? request.yesVotes.toString() : '0',
                        noVotes: isInDAO ? request.noVotes.toString() : '0',
                        isApproved: isInDAO ? request.isApproved : false,
                        isProcessed: isInDAO ? request.isProcessed : false,
                        hasVoted: isInDAO ? hasVoted : false,
                        isInDAO: isInDAO
                    });
                } catch (err) {
                    console.error(`Error loading project request ${i}:`, err);
                }
            }
            
            setProjectRequests(requests);
            console.log('Loaded project requests:', requests);
            setTxStatus(''); // Clear any previous status messages
        } catch (err) {
            console.error('Error loading DAO data:', err);
            setTxStatus('Error loading DAO data. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinDAO = async () => {
        if (!contracts?.dao) {
            setTxStatus('DAO contract not available. Please check your connection.');
            return;
        }

        setTxStatus('Initiating DAO membership transaction...');
        try {
            const success = await joinDAO();
            if (success) {
                setTxStatus('Successfully joined the DAO! Refreshing data...');
                await loadDAOData();
            } else {
                setTxStatus('Failed to join DAO. Please check the error message above.');
            }
        } catch (err) {
            console.error('Error joining DAO:', err);
            setTxStatus('Transaction failed. Please try again.');
        }
    };

    const handleVote = async (projectId, voteValue) => {
        if (!contracts?.dao) {
            setTxStatus('DAO contract not available. Please check your connection.');
            return;
        }

        if (error) clearError();
        setTxStatus(`Submitting your vote for project ${projectId}...`);
        
        try {
            const success = await vote(projectId, voteValue);
            if (success) {
                setTxStatus('Vote submitted successfully! Refreshing data...');
                await loadDAOData();
            } else {
                setTxStatus('Failed to submit vote. Please check the error message above.');
            }
        } catch (err) {
            console.error('Error voting:', err);
            setTxStatus('Failed to submit vote. Please try again.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">DAO Interface</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {txStatus && (
                <div className={`p-4 rounded mb-4 ${
                    txStatus.includes('Success') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                    {txStatus}
                </div>
            )}

            {/* Connection Status */}
            {!isConnected && (
                <div className="bg-yellow-100 text-yellow-700 px-4 py-3 rounded mb-4">
                    Please connect your wallet to interact with the DAO
                </div>
            )}

            {/* DAO Membership Section */}
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <h3 className="text-xl font-semibold mb-4">DAO Membership</h3>
                {!isMember ? (
                    <div>
                        <p className="mb-4">Join the DAO to participate in project governance.</p>
                        <p className="mb-4 text-sm text-gray-600">Required stake: {minStakeAmount} ETH</p>
                        <button
                            onClick={handleJoinDAO}
                            disabled={loading || !isConnected}
                            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                                (loading || !isConnected) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {loading ? 'Processing...' : 'Join DAO'}
                        </button>
                    </div>
                ) : (
                    <div>
                        <p className="text-green-600 mb-2">You are a member of the DAO!</p>
                        <p className="text-sm text-gray-600">Your stake: {memberStake} ETH</p>
                    </div>
                )}
            </div>

            {/* Project Requests Section */}
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
                <h3 className="text-xl font-semibold mb-4">Project Requests</h3>
                {projectRequests.length === 0 ? (
                    <p className="text-gray-600">No projects available</p>
                ) : (
                    <div className="space-y-4">
                        {projectRequests.map((request) => (
                            <div key={request.projectId} className="border p-4 rounded">
                                <h4 className="font-bold">{request.name}</h4>
                                <p className="text-gray-600 mb-2">{request.description}</p>
                                <p className="text-sm text-gray-500">Owner: {request.owner}</p>
                                {request.isInDAO ? (
                                    <div className="text-sm text-gray-500">
                                        <p>Yes Votes: {request.yesVotes}</p>
                                        <p>No Votes: {request.noVotes}</p>
                                        <p>Status: {request.isApproved ? 'Approved' : (request.isProcessed ? 'Rejected' : 'Pending')}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-yellow-600">Awaiting DAO voting</p>
                                )}
                                {isMember && !request.isProcessed && !request.hasVoted && (
                                    <div className="mt-2 space-x-2">
                                        <button
                                            onClick={() => handleVote(request.projectId, true)}
                                            disabled={loading}
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                                        >
                                            Vote Yes
                                        </button>
                                        <button
                                            onClick={() => handleVote(request.projectId, false)}
                                            disabled={loading}
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                                        >
                                            Vote No
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
