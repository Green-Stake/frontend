export default function DAOInterface() {
    const { joinDAO, vote, loading, error, clearError } = useContractOperations();
    const { contracts, signer, isConnected, chainId } = useContract();
    const [isMember, setIsMember] = useState(false);
    const [projectRequests, setProjectRequests] = useState([]);
    const [txStatus, setTxStatus] = useState('');
    const [memberStake, setMemberStake] = useState('0');
    const [isLoading, setIsLoading] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(Date.now());

    const minStakeAmount = contractConfig.contracts.DAO.minStakeAmount;

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
        
        if (isLoading) return; 
        setIsLoading(true);
        try {
            const currentAccount = await signer.getAddress();
            console.log('Loading DAO data for account:', currentAccount);

            const memberData = await contracts.dao.members(currentAccount);
            setIsMember(memberData.isMember);
            
            if (memberData.isMember) {
                const stake = ethers.formatEther(memberData.stakedAmount);
                setMemberStake(stake);
                console.log('Member stake:', stake, 'ETH');
            }

            const projectCount = await contracts.projectListing.getProjectCount();
            console.log('Total projects:', projectCount.toString());

            const requests = [];
            for (let i = 1; i <= projectCount; i++) {
                try {
                    const project = await contracts.projectListing.getProject(i);
                    if (!project.name) continue;

                    const request = await contracts.dao.projectRequests(i);
                    const hasVoted = await contracts.dao.hasVoted(i, currentAccount);
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
            setTxStatus('');
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
        <div className="max-w-full sm:max-w-2xl mx-auto p-4 sm:p-6">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">DAO Interface</h2>
        
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-4">
                    {error}
                </div>
            )}
        
            {txStatus && (
                <div className={`p-4 rounded-lg mb-6 ${txStatus.includes('Success') ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-700'}`}>
                    {txStatus}
                </div>
            )}
        
            {!isConnected && (
                <div className="bg-yellow-100 text-yellow-700 px-6 py-4 rounded-lg mb-6 text-center">
                    Please connect your wallet to interact with the DAO
                </div>
            )}
        
            <div className="bg-white shadow-lg rounded-xl px-8 pt-6 pb-8 mb-6 hover:shadow-2xl transition-shadow duration-300">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">DAO Membership</h3>
                {!isMember ? (
                    <div>
                        <p className="mb-4 text-gray-600">Join the DAO to participate in project governance.</p>
                        <p className="mb-4 text-sm text-gray-500">Required stake: {minStakeAmount} ETH</p>
                        <button
                            onClick={handleJoinDAO}
                            disabled={loading || !isConnected}
                            className={`w-full py-3 rounded-lg font-semibold text-white ${loading || !isConnected ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                        >
                            {loading ? 'Processing...' : 'Join DAO'}
                        </button>
                    </div>
                ) : (
                    <div>
                        <p className="text-green-600 mb-4">You are a member of the DAO!</p>
                        <p className="text-sm text-gray-500">Your stake: {memberStake} ETH</p>
                    </div>
                )}
            </div>
        
            <div className="bg-white shadow-lg rounded-xl px-8 pt-6 pb-8 mb-6 hover:shadow-2xl transition-shadow duration-300">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">Project Requests</h3>
                {projectRequests.length === 0 ? (
                    <p className="text-gray-600 text-center">No projects available</p>
                ) : (
                    <div className="space-y-6">
                        {projectRequests.map((request) => (
                            <div key={request.projectId} className="border p-6 rounded-lg hover:shadow-xl transition-shadow duration-300">
                                <h4 className="text-xl font-bold text-gray-800">{request.name}</h4>
                                <p className="text-gray-700 mb-2">{request.description}</p>
                                <p className="text-sm text-gray-500">Owner: {request.owner}</p>
                                {request.isInDAO ? (
                                    <div className="text-sm text-gray-500 mt-3">
                                        <p>Yes Votes: {request.yesVotes}</p>
                                        <p>No Votes: {request.noVotes}</p>
                                        <p>Status: {request.isApproved ? 'Approved' : (request.isProcessed ? 'Rejected' : 'Pending')}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-yellow-600 mt-2">Awaiting DAO voting</p>
                                )}
                                {isMember && !request.isProcessed && !request.hasVoted && (
                                    <div className="mt-4 space-x-4">
                                        <button
                                            onClick={() => handleVote(request.projectId, true)}
                                            disabled={loading}
                                            className="py-2 px-4 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg focus:outline-none"
                                        >
                                            Vote Yes
                                        </button>
                                        <button
                                            onClick={() => handleVote(request.projectId, false)}
                                            disabled={loading}
                                            className="py-2 px-4 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg focus:outline-none"
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
