'use client';

import { useState, useEffect } from 'react';
import { useContractOperations } from '../hooks/useContractOperations';
import { useContract } from '../hooks/useContract';
import { formatEther } from '@ethersproject/units';
import Link from 'next/link';

export default function ListedProjects() {
    const { donateToProject, loading, error, clearError } = useContractOperations();
    const { contracts } = useContract();
    const [projects, setProjects] = useState([]);
    const [txStatus, setTxStatus] = useState('');

    useEffect(() => {
        loadProjects();
    }, [contracts?.projectListing, contracts?.dao]);

    const loadProjects = async () => {
        if (!contracts?.projectListing || !contracts?.dao) return;

        try {
            const projectIds = [];
            let index = 0;
            while (true) {
                try {
                    const projectId = await contracts.projectListing.projectIds(index);
                    projectIds.push(Number(projectId));
                    index++;
                } catch (err) {
                    break;
                }
            }

            const projectsArray = [];

            for (const projectId of projectIds) {
                try {
                    const project = await contracts.projectListing.getProject(projectId);
                    const daoProjectRequest = await contracts.dao.projectRequests(projectId);
                    const projectListingApproval = await contracts.projectListing.getProject(projectId);

                    if (project.isListed) {
                        let totalDonationsAmount = BigInt(0);
                        let index = 0;

                        while (true) {
                            try {
                                const donation = await contracts.donate.projectDonations(projectId, index);
                                totalDonationsAmount += BigInt(donation.amount.toString());
                                index++;
                            } catch (err) {
                                break;
                            }
                        }

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

    const handleDonationChange = (projectId, value) => {
        setProjects(projects.map(project => 
            project.id === projectId 
                ? { ...project, donationAmount: value }
                : project
        ));
        if (error) clearError();
    };

    const handleDonate = async (projectId, donationAmount) => {
        if (!donationAmount || parseFloat(donationAmount) <= 0) {
            setTxStatus('Please enter a valid donation amount');
            return;
        }

        try {
            setTxStatus('Processing donation...');
            await donateToProject(projectId, donationAmount);
            setTxStatus('Donation successful!');
            
            setProjects(projects.map(project => 
                project.id === projectId 
                    ? { ...project, donationAmount: '' }
                    : project
            ));
            loadProjects();
        } catch (err) {
            setTxStatus('Error processing donation');
            console.error('Error:', err);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                <h1 className="text-2xl sm:text-4xl font-bold text-green-600">Listed Projects</h1>
                <Link href="/list" className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transition duration-300">
                    List a New Project
                </Link>
            </div>

            {projects.length === 0 ? (
                <div className="text-center text-gray-600 py-8">
                    No projects listed yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => {
                        let videoUrl = null;
                        try {
                            const videos = JSON.parse(localStorage.getItem('projectVideos') || '{}');
                            const videoData = videos[project.name];
                            if (videoData?.url) {
                                videoUrl = videoData.url;
                            }
                        } catch (err) {
                            console.error('Error loading video:', err);
                        }
                        
                        return (
                            <div key={project.id} className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                                {videoUrl ? (
                                    <div className="relative pt-[56.25%] w-full">
                                        <video 
                                            className="absolute top-0 left-0 w-full h-full object-cover rounded-t-3xl"
                                            controls
                                            src={videoUrl}
                                            autoPlay={false}
                                            muted={true}
                                            playsInline={true}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.style.display = 'none';
                                            }}
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                ) : (
                                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 rounded-t-3xl">
                                        No video available
                                    </div>
                                )}
                                <div className="p-6">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-green-700 mb-2">{project.name}</h3>
                                    <p className="text-sm sm:text-base text-gray-600 whitespace-pre-wrap">{project.description}</p>
                                    
                                    <div className="space-y-3 text-base mt-4">
                                        <p className="break-all">
                                            <span className="font-semibold text-green-700">Owner:</span>{' '}
                                            <span className="text-gray-600">{project.owner}</span>
                                        </p>
                                        <p>
                                            <span className="font-semibold text-green-700">Total Donations:</span>{' '}
                                            <span className="text-gray-600">{Number(project.totalDonations).toFixed(4)} ETH</span>
                                        </p>
                                        <p>
                                            <span className="font-semibold text-green-700">Subscription End:</span>{' '}
                                            <span className="text-gray-600">{project.subscriptionEndTime}</span>
                                        </p>
                                        <p>
                                            <span className="font-semibold text-green-700">Status:</span>{' '}
                                            <span className="text-gray-600">{project.isApproved ? 'Approved' : 'Pending Approval'}</span>
                                        </p>
                                        {!project.isApproved && project.isProcessed && (
                                            <p>
                                                <span className="font-semibold text-green-700">Votes:</span>{' '}
                                                <span className="text-gray-600">Yes ({project.yesVotes}) / No ({project.noVotes})</span>
                                            </p>
                                        )}
                                    </div>

                                    {project.isApproved && (
                                        <div className="mt-6 space-y-4">
                                            <div>
                                                <label htmlFor={`donation-${project.id}`} className="block mb-2 font-semibold text-green-700">
                                                    Donation Amount (ETH)
                                                </label>
                                                <input
                                                    id={`donation-${project.id}`}
                                                    type="number"
                                                    step="0.01"
                                                    value={project.donationAmount}
                                                    onChange={(e) => handleDonationChange(project.id, e.target.value)}
                                                    className="w-full px-4 py-2 sm:py-3 sm:px-5 border border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                                                    placeholder="Enter amount in ETH"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleDonate(project.id, project.donationAmount)}
                                                disabled={loading}
                                                className={`w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold transition transform duration-300 hover:bg-gradient-to-l hover:scale-105 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {loading ? 'Processing...' : 'Donate'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {error && (
                <div className="text-red-500 text-center mt-4">
                    {error}
                </div>
            )}

            {txStatus && (
                <div className={`text-center mt-4 ${txStatus.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                    {txStatus}
                </div>
            )}
        </div>
    );
}
