import { useState, useEffect } from 'react';
import { useContractOperations } from '../hooks/useContractOperations';
import { useContract } from '../hooks/useContract';
import contractConfig from '../utils/contractConfig.json';
import { ethers } from 'ethers';

export default function ProjectListing() {
    const { listProject, donateToProject, loading, error, clearError } = useContractOperations();
    const { contracts } = useContract();
    const [projects, setProjects] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [donationAmount, setDonationAmount] = useState('');
    const [txStatus, setTxStatus] = useState('');

    // Get the subscription fee from the contract config
    const subscriptionFee = contractConfig.contracts.ProjectListing.subscriptionFee;

    useEffect(() => {
        loadProjects();
    }, [contracts?.projectListing]);

    const loadProjects = async () => {
        if (!contracts?.projectListing) return;

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
                    if (project.isListed) {
                        // Convert BigInt to string for display
                        const totalDonations = ethers.formatEther(project.totalDonations);
                        const subscriptionEndTime = Number(project.subscriptionEndTime) * 1000;
                        
                        projectsArray.push({
                            id: projectId,
                            name: project.name,
                            description: project.description,
                            owner: project.owner,
                            isApproved: project.isApproved,
                            totalDonations: totalDonations,
                            subscriptionEndTime: new Date(subscriptionEndTime).toLocaleDateString()
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

    const handleDonationAmountChange = (e, projectId) => {
        setDonationAmount(e.target.value);
        if (error) clearError();
    };

    const handleDonate = async (projectId) => {
        if (!donationAmount || parseFloat(donationAmount) <= 0) {
            setTxStatus('Please enter a valid donation amount');
            return;
        }

        setTxStatus('Processing donation...');
        try {
            const success = await donateToProject(projectId, donationAmount);
            if (success) {
                setTxStatus('Donation successful!');
                setDonationAmount('');
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
                        <label className="block text-sm font-medium text-gray-700">
                            Project Name (3-50 characters)
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            minLength={3}
                            maxLength={50}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Project Description (50-500 characters)
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Listed Projects</h2>
                <div className="space-y-4">
                    {projects.map((project) => (
                        <div key={project.id} className="border rounded-lg p-4">
                            <h3 className="text-lg font-medium">{project.name}</h3>
                            <p className="text-gray-600 mt-1">{project.description}</p>
                            <div className="mt-2 text-sm text-gray-500">
                                <p>Owner: {project.owner}</p>
                                <p>Total Donations: {project.totalDonations} ETH</p>
                                <p>Subscription End: {project.subscriptionEndTime}</p>
                                <p>Status: {project.isApproved ? 'Approved' : 'Pending Approval'}</p>
                            </div>
                            {project.isApproved && (
                                <div className="mt-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="ETH Amount"
                                            value={donationAmount}
                                            onChange={(e) => handleDonationAmountChange(e, project.id)}
                                            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-32"
                                        />
                                        <button
                                            onClick={() => handleDonate(project.id)}
                                            disabled={loading}
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        >
                                            {loading ? 'Processing...' : 'Donate'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {projects.length === 0 && (
                        <p className="text-gray-500 text-center">No projects listed yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}
