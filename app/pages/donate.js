import { useState, useEffect } from 'react';
import { useContractOperations } from '../hooks/useContractOperations';
import { useContract } from '../hooks/useContract';
import { ethers } from 'ethers';

export default function DonatePage() {
    const { donate, loading, error, clearError } = useContractOperations();
    const { contracts } = useContract();
    const [projects, setProjects] = useState([]);
    const [donationAmount, setDonationAmount] = useState('');
    const [txStatus, setTxStatus] = useState('');

    useEffect(() => {
        if (contracts?.projectListing) {
            loadApprovedProjects();
        }
    }, [contracts?.projectListing]);

    const loadApprovedProjects = async () => {
        try {
            setTxStatus('Loading approved projects...');
            
            const approvedIds = await contracts.projectListing.getApprovedProjects();
            console.log('Approved IDs:', approvedIds.toString());
            
            const projectsData = [];
            
            for (const id of approvedIds) {
                try {
                    const project = await contracts.projectListing.getProject(id);
                    console.log('Project details for ID', id.toString(), ':', project);
                    
                    if (project.isListed && project.isApproved) {
                        projectsData.push({
                            id: id.toString(),
                            name: project.name,
                            description: project.description,
                            owner: project.owner,
                            totalDonations: ethers.formatEther(project.totalDonations.toString()),
                            subscriptionEndTime: new Date(Number(project.subscriptionEndTime) * 1000).toLocaleDateString()
                        });
                    }
                } catch (err) {
                    console.error(`Error loading project ${id}:`, err);
                }
            }
            
            setProjects(projectsData);
            setTxStatus('');
            
        } catch (err) {
            console.error('Error loading approved projects:', err);
            setTxStatus('Failed to load projects. Please try again.');
        }
    };

    const handleDonationAmountChange = (e, projectId) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setDonationAmount(value);
            if (error) clearError();
        }
    };

    const handleDonate = async (projectId) => {
        if (!donationAmount || parseFloat(donationAmount) <= 0) {
            setTxStatus('Please enter a valid donation amount');
            return;
        }

        setTxStatus('Processing donation...');

        try {
            const success = await donate(projectId, donationAmount);
            if (success) {
                setTxStatus('Donation successful! Thank you for your contribution.');
                setDonationAmount('');
                await loadApprovedProjects();
            }
        } catch (err) {
            console.error('Error making donation:', err);
            setTxStatus('Failed to process donation. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-light-gray py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-forest-green sm:text-4xl">
                        Support Green Projects
                    </h1>
                    <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                        Make a difference by donating to approved environmental projects
                    </p>
                </div>

                {error && (
                    <div className="mt-8 max-w-3xl mx-auto">
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                                    <div className="mt-2 text-sm text-red-700">{error}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {txStatus && (
                    <div className="mt-8 max-w-3xl mx-auto">
                        <div className={`rounded-md p-4 ${
                            txStatus.includes('successful')
                                ? 'bg-green-50 text-green-700'
                                : txStatus.includes('Loading')
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-red-50 text-red-700'
                        }`}>
                            {txStatus}
                        </div>
                    </div>
                )}

                <div className="mt-12 grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    {project.name}
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    {project.description}
                                </p>
                                <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                    <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500">Total Donations</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{project.totalDonations} ETH</dd>
                                    </div>
                                    <div className="sm:col-span-1">
                                        <dt className="text-sm font-medium text-gray-500">Subscription Ends</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{project.subscriptionEndTime}</dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Project Owner</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{project.owner}</dd>
                                    </div>
                                </dl>
                                <div className="mt-6">
                                    <div className="flex space-x-3">
                                        <input
                                            type="text"
                                            placeholder="Amount in ETH"
                                            value={donationAmount}
                                            onChange={(e) => handleDonationAmountChange(e, project.id)}
                                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-forest-green focus:border-forest-green sm:text-sm"
                                        />
                                        <button
                                            onClick={() => handleDonate(project.id)}
                                            disabled={loading || !donationAmount}
                                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-forest-green hover:bg-forest-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest-green ${loading || !donationAmount ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {loading ? 'Processing...' : 'Donate'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {projects.length === 0 && !loading && (
                    <div className="mt-12 text-center">
                        <p className="text-gray-500">No approved projects available for donations at this time.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
