import { useState, useEffect } from 'react';
import { useContractOperations } from '../hooks/useContractOperations';
import { useContract } from '../hooks/useContract';
import { ethers } from 'ethers';

export default function DonateInterface() {
    const { donate, loading, error, clearError } = useContractOperations();
    const { contracts } = useContract();
    const [approvedProjects, setApprovedProjects] = useState([]);
    const [donationAmount, setDonationAmount] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [txStatus, setTxStatus] = useState('');

    useEffect(() => {
        loadApprovedProjects();
    }, [contracts?.projectListing]);

    const loadApprovedProjects = async () => {
        if (!contracts?.projectListing) return;

        try {
            // Get approved project IDs
            const approvedIds = await contracts.projectListing.getApprovedProjects();
            const projectsData = [];

            // Load details for each approved project
            for (const id of approvedIds) {
                try {
                    const project = await contracts.projectListing.projects(id);
                    if (project.isListed && project.isApproved) {
                        projectsData.push({
                            id: id.toString(),
                            name: project.name,
                            description: project.description,
                            owner: project.owner,
                            totalDonations: ethers.formatEther(project.totalDonations),
                            subscriptionEndTime: new Date(Number(project.subscriptionEndTime) * 1000).toLocaleDateString()
                        });
                    }
                } catch (err) {
                    console.error(`Error loading project ${id}:`, err);
                }
            }

            setApprovedProjects(projectsData);
        } catch (err) {
            console.error('Error loading approved projects:', err);
        }
    };

    const handleDonationAmountChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setDonationAmount(value);
        }
        if (error) clearError();
    };

    const handleProjectSelect = (project) => {
        setSelectedProject(project);
        if (error) clearError();
    };

    const handleDonate = async (e) => {
        e.preventDefault();
        if (!selectedProject || !donationAmount) {
            setTxStatus('Please select a project and enter donation amount');
            return;
        }

        if (parseFloat(donationAmount) <= 0) {
            setTxStatus('Please enter a valid donation amount');
            return;
        }

        setTxStatus('Processing donation...');

        try {
            const success = await donate(selectedProject.id, donationAmount);
            if (success) {
                setTxStatus('Donation successful!');
                setDonationAmount('');
                setSelectedProject(null);
                await loadApprovedProjects();
            } else {
                setTxStatus('Donation failed. Please check the error message above.');
            }
        } catch (err) {
            console.error('Error making donation:', err);
            setTxStatus('Donation failed. Please try again.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Donate to Projects</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {txStatus && (
                <div className={`mb-4 p-4 rounded-md ${
                    txStatus.includes('successful')
                        ? 'bg-green-100 text-green-700'
                        : txStatus.includes('failed') || txStatus.includes('Please')
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                }`}>
                    {txStatus}
                </div>
            )}

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Make a Donation</h3>
                <form onSubmit={handleDonate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Project
                        </label>
                        <div className="space-y-2">
                            {approvedProjects.map((project) => (
                                <div
                                    key={project.id}
                                    onClick={() => handleProjectSelect(project)}
                                    className={`p-4 rounded-lg cursor-pointer border ${
                                        selectedProject?.id === project.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300'
                                    }`}
                                >
                                    <h4 className="font-medium">{project.name}</h4>
                                    <p className="text-sm text-gray-600">{project.description}</p>
                                    <div className="mt-2 text-sm text-gray-500">
                                        <p>Total Donations: {project.totalDonations} ETH</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Donation Amount (ETH)
                        </label>
                        <input
                            type="text"
                            value={donationAmount}
                            onChange={handleDonationAmountChange}
                            placeholder="0.0"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !selectedProject || !donationAmount}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            (loading || !selectedProject || !donationAmount) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Processing...' : 'Donate'}
                    </button>
                </form>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Approved Projects</h3>
                <div className="space-y-4">
                    {approvedProjects.map((project) => (
                        <div key={project.id} className="border rounded-lg p-4">
                            <h4 className="text-lg font-medium">{project.name}</h4>
                            <p className="text-gray-600 mt-1">{project.description}</p>
                            <div className="mt-2 text-sm text-gray-500">
                                <p>Owner: {project.owner}</p>
                                <p>Total Donations: {project.totalDonations} ETH</p>
                                <p>Subscription End: {project.subscriptionEndTime}</p>
                            </div>
                        </div>
                    ))}
                    {approvedProjects.length === 0 && (
                        <p className="text-gray-500 text-center">No approved projects available</p>
                    )}
                </div>
            </div>
        </div>
    );
}
