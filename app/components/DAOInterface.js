import { useState, useEffect } from 'react';
import { useContractOperations } from '../hooks/useContractOperations';
import { useContract } from '../hooks/useContract';
import contractConfig from '../utils/contractConfig.json';

export default function DAOInterface() {
    const { joinDAO, vote, loading, error, clearError } = useContractOperations();
    const { contracts } = useContract();
    const [isMember, setIsMember] = useState(false);
    const [projectRequests, setProjectRequests] = useState([]);
    const [txStatus, setTxStatus] = useState('');

    // Get the minimum stake amount from the contract config
    const minStakeAmount = contractConfig.contracts.DAO.minStakeAmount;

    useEffect(() => {
        loadDAOData();
    }, [contracts?.dao]);

    const loadDAOData = async () => {
        if (!contracts?.dao || !contracts?.projectListing) return;
        
        try {
            // Check if the current user is a member
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const currentAccount = accounts[0];
            const memberData = await contracts.dao.members(currentAccount);
            setIsMember(memberData.isMember);

            // Get all project IDs
            const projectIds = [];
            let index = 0;
            while (true) {
                try {
                    const projectId = await contracts.projectListing.projectIds(index);
                    projectIds.push(Number(projectId));
                    index++;
                } catch (err) {
                    // Break when we've reached the end of the array
                    break;
                }
            }

            // Load project requests
            const requests = [];
            
            for (const projectId of projectIds) {
                try {
                    const request = await contracts.dao.projectRequests(projectId);
                    if (request.projectId.toString() !== '0') { // Check if request exists
                        const hasVoted = await contracts.dao.hasVoted(projectId, currentAccount);
                        const project = await contracts.projectListing.getProject(projectId);
                        
                        requests.push({
                            projectId: projectId,
                            name: project.name,
                            description: project.description,
                            yesVotes: request.yesVotes.toString(),
                            noVotes: request.noVotes.toString(),
                            isApproved: request.isApproved,
                            isProcessed: request.isProcessed,
                            hasVoted
                        });
                    }
                } catch (err) {
                    console.error(`Error loading project request ${projectId}:`, err);
                }
            }
            
            setProjectRequests(requests);
        } catch (err) {
            console.error('Error loading DAO data:', err);
        }
    };

    const handleJoinDAO = async () => {
        setTxStatus('Initiating DAO membership transaction...');
        try {
            const success = await joinDAO();
            if (success) {
                setTxStatus('Successfully joined the DAO!');
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
        if (error) clearError();
        setTxStatus(`Submitting your vote for project ${projectId}...`);
        
        try {
            const success = await vote(projectId, voteValue);
            if (success) {
                setTxStatus('Vote submitted successfully!');
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

            {/* DAO Membership Section */}
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <h3 className="text-xl font-semibold mb-4">DAO Membership</h3>
                {!isMember ? (
                    <div>
                        <p className="mb-4">Join the DAO to participate in project governance.</p>
                        <button
                            onClick={handleJoinDAO}
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            {loading ? 'Processing...' : `Join DAO (${minStakeAmount} ETH)`}
                        </button>
                    </div>
                ) : (
                    <p className="text-green-600">You are a member of the DAO!</p>
                )}
            </div>

            {/* Project Requests Section */}
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
                <h3 className="text-xl font-semibold mb-4">Project Requests</h3>
                {projectRequests.length > 0 ? (
                    <div className="space-y-4">
                        {projectRequests.map((request) => (
                            <div key={request.projectId} className="border p-4 rounded">
                                <h4 className="font-bold">{request.name}</h4>
                                <p className="text-gray-600 mb-2">{request.description}</p>
                                <div className="text-sm text-gray-500">
                                    <p>Yes Votes: {request.yesVotes}</p>
                                    <p>No Votes: {request.noVotes}</p>
                                    <p>Status: {request.isApproved ? 'Approved' : (request.isProcessed ? 'Rejected' : 'Pending')}</p>
                                </div>
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
                                {request.hasVoted && (
                                    <p className="text-sm text-blue-600 mt-2">You have already voted on this project</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No project requests available.</p>
                )}
            </div>
        </div>
    );
}
