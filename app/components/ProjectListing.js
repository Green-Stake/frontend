import { useState, useEffect } from 'react';
import { useContractOperations } from '../hooks/useContractOperations';
import { useContract } from '../hooks/useContract';
import contractConfig from '../utils/contractConfig.json';
import { formatEther } from '@ethersproject/units';

export default function ProjectListing() {
    const { listProject, donateToProject, loading, error, clearError } = useContractOperations();
    const { contracts } = useContract();
    const [projects, setProjects] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [txStatus, setTxStatus] = useState('');

    // Get the subscription fee from the contract config
    const subscriptionFee = contractConfig.contracts.ProjectListing.subscriptionFee;

    useEffect(() => {
        loadProjects();
    }, [contracts?.projectListing, contracts?.dao]);

    const loadProjects = async () => {
        if (!contracts?.projectListing || !contracts?.dao) return;

        try {
            // Get the array of project IDs
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

            const projectsArray = [];

            for (const projectId of projectIds) {
                try {
                    const project = await contracts.projectListing.getProject(projectId);
                    const daoProjectRequest = await contracts.dao.projectRequests(projectId);
                    
                    // Check if project is approved in both contracts
                    const projectListingApproval = await contracts.projectListing.getProject(projectId);
                    console.log(`Project ${projectId} approval status:`, {
                        daoApproved: daoProjectRequest.isApproved,
                        projectListingApproved: projectListingApproval.isApproved,
                        isProcessed: daoProjectRequest.isProcessed,
                        yesVotes: Number(daoProjectRequest.yesVotes),
                        noVotes: Number(daoProjectRequest.noVotes)
                    });
                    
                    if (project.isListed) {
                        // Get project donations from the mapping
                        let totalDonationsAmount = BigInt(0);
                        let index = 0;
                        
                        while (true) {
                            try {
                                const donation = await contracts.donate.projectDonations(projectId, index);
                                totalDonationsAmount += BigInt(donation.amount.toString());
                                index++;
                            } catch (err) {
                                // Break when we've reached the end of the array
                                break;
                            }
                        }
                        
                        // Convert BigInt to string for display
                        const totalDonations = formatEther(totalDonationsAmount);
                        const subscriptionEndTime = Number(project.subscriptionEndTime) * 1000;
                        
                        projectsArray.push({
                            id: projectId,
                            name: project.name,
                            description: project.description,
                            owner: project.owner,
                            isApproved: daoProjectRequest.isApproved && projectListingApproval.isApproved,
                            isProcessed: daoProjectRequest.isProcessed,
                            yesVotes: Number(daoProjectRequest.yesVotes),
                            noVotes: Number(daoProjectRequest.noVotes),
                            totalDonations: totalDonations,
                            subscriptionEndTime: new Date(subscriptionEndTime).toLocaleDateString(),
                            donationAmount: ''
                        });
                    }
                } catch (err) {
                    console.error(`Error loading project ${projectId}:`, err);
                }
            }

            setProjects(projectsArray);
        } catch (err) {
            console.error('Error loading projects:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) clearError();
    };

    const handleDonate = async (projectId, donationAmount) => {
        if (!donationAmount || parseFloat(donationAmount) <= 0) {
            setTxStatus('Please enter a valid donation amount');
            return;
        }

        setTxStatus('Processing donation...');
        try {
            const success = await donateToProject(projectId, donationAmount);
            if (success) {
                setTxStatus('Donation successful!');
                setProjects(projects.map(project => project.id === projectId ? { ...project, donationAmount: '' } : project));
                await loadProjects();
            } else {
                setTxStatus('Donation failed. Please check the error message above.');
            }
        } catch (err) {
            console.error('Error donating:', err);
            setTxStatus('Donation failed. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate inputs
        if (!formData.name.trim() || !formData.description.trim()) {
            setTxStatus('Please fill in all fields');
            return;
        }
        
        if (formData.name.length < 3 || formData.name.length > 50) {
            setTxStatus('Project name must be between 3 and 50 characters');
            return;
        }
        
        if (formData.description.length < 50 || formData.description.length > 500) {
            setTxStatus('Description must be between 50 and 500 characters');
            return;
        }

        setTxStatus('Initiating transaction...');
        
        try {
            const success = await listProject(formData.name, formData.description);
            if (success) {
                setFormData({ name: '', description: '' });
                setTxStatus('Project listed successfully!');
                await loadProjects();
            } else {
                setTxStatus('Transaction failed. Please check the error message above.');
            }
        } catch (err) {
            console.error('Error submitting project:', err);
            setTxStatus('Transaction failed. Please try again.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold mb-6">List Your Project</h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {txStatus && (
                    <div className={`mb-4 p-4 rounded-md ${
                        txStatus.includes('successfully') 
                            ? 'bg-green-100 text-green-700' 
                            : txStatus.includes('failed') || txStatus.includes('must')
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                    }`}>
                        {txStatus}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Project Name (3-50 characters)
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                            minLength={3}
                            maxLength={50}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Project Description (50-500 characters)
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600"
                            minLength={50}
                            maxLength={500}
                            required
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-sm text-gray-600">
                            Subscription Fee: {subscriptionFee} ETH
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Processing...' : 'List Project'}
                    </button>
                </form>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Listed Projects</h2>
                <div className="space-y-6">
                    {projects.map(project => (
                        <div key={project.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{project.name}</h3>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">{project.description}</p>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                <p>Owner: {project.owner}</p>
                                <p>Total Donations: {project.totalDonations} ETH</p>
                                <p>Subscription End: {project.subscriptionEndTime}</p>
                                <p className={project.isApproved ? "text-green-600" : "text-yellow-600"}>
                                    Status: {project.isProcessed 
                                        ? (project.isApproved ? "Approved" : "Rejected")
                                        : `Pending (Yes: ${project.yesVotes}, No: ${project.noVotes})`
                                    }
                                </p>
                            </div>
                            
                            {project.isApproved && (
                                <div className="mt-4 border-t pt-4">
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="number"
                                            value={project.donationAmount || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setProjects(projects.map(p => 
                                                    p.id === project.id 
                                                        ? {...p, donationAmount: value}
                                                        : p
                                                ));
                                            }}
                                            placeholder="Amount in ETH"
                                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                                            min="0"
                                            step="0.01"
                                        />
                                        <button
                                            onClick={() => handleDonate(project.id, project.donationAmount)}
                                            disabled={loading || !project.donationAmount || parseFloat(project.donationAmount) <= 0}
                                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Processing...' : 'Donate'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {projects.length === 0 && (
                        <p className="text-gray-700 dark:text-gray-300 text-center">No projects listed yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
