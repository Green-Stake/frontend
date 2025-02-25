'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useContract } from '../hooks/useContract';
import { formatEther } from '@ethersproject/units';

export default function Profile() {
  const { address, isConnected } = useAccount();
  const { contracts, loading } = useContract();
  const [mounted, setMounted] = useState(false);
  const [activities, setActivities] = useState([]);
  const [userStats, setUserStats] = useState({
    projectsListed: 0,
    totalDonations: '0',
    isDaoMember: false,
    votesParticipated: 0
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isConnected && address && contracts && !loading) {
      loadUserData();
    }
  }, [mounted, isConnected, address, contracts, loading]);

  const loadUserData = async () => {
    if (!contracts?.projectListing || !contracts?.dao || !contracts?.donate) return;

    try {
      // Get user's DAO membership status
      const memberData = await contracts.dao.members(address);
      
      // Track user stats
      let listedProjects = 0;
      let totalDonations = BigInt(0);
      let votesCount = 0;
      const userActivities = [];

      // Get all project IDs
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

      // Check projects for ownership, votes, and donations
      for (const projectId of projectIds) {
        try {
          const project = await contracts.projectListing.getProject(projectId);
          
          // Check if user is project owner
          if (project.owner.toLowerCase() === address.toLowerCase()) {
            listedProjects++;
            userActivities.push({
              type: 'PROJECT_LISTED',
              projectId,
              projectName: project.name,
              timestamp: Date.now()
            });
          }

          // Check if user has voted on this project
          try {
            const hasVoted = await contracts.dao.hasVoted(projectId, address);
            if (hasVoted) {
              votesCount++;
              userActivities.push({
                type: 'VOTED',
                projectId,
                projectName: project.name,
                timestamp: Date.now()
              });
            }
          } catch (err) {
            console.error(`Error checking vote for project ${projectId}:`, err);
          }

          // Get user's donations for this project
          try {
            let index = 0;
            while (true) {
              try {
                const donation = await contracts.donate.projectDonations(projectId, index);
                if (donation.donor.toLowerCase() === address.toLowerCase()) {
                  totalDonations += BigInt(donation.amount.toString());
                  userActivities.push({
                    type: 'DONATION',
                    projectId,
                    projectName: project.name,
                    amount: formatEther(donation.amount),
                    timestamp: Number(donation.timestamp) * 1000
                  });
                }
                index++;
              } catch (err) {
                // Break when we've reached the end of the array
                break;
              }
            }
          } catch (err) {
            console.error(`Error getting donations for project ${projectId}:`, err);
          }
        } catch (err) {
          console.error(`Error loading project ${projectId}:`, err);
        }
      }

      // Update user stats
      setUserStats({
        projectsListed: listedProjects,
        totalDonations: formatEther(totalDonations),
        isDaoMember: memberData.isMember,
        votesParticipated: votesCount
      });

      // Sort activities by timestamp in descending order
      userActivities.sort((a, b) => b.timestamp - a.timestamp);
      setActivities(userActivities);

    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  // Handle initial loading state
  if (!mounted || loading) {
    return null;
  }

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Connect Your Wallet</h1>
        <p className="text-gray-600">Please connect your wallet to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Projects Listed</h3>
          <p className="text-3xl font-bold text-green-600">{userStats.projectsListed}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Total Donations</h3>
          <p className="text-3xl font-bold text-green-600">
            {Number(userStats.totalDonations).toFixed(4)} ETH
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">DAO Status</h3>
          <p className="text-3xl font-bold text-green-600">
            {userStats.isDaoMember ? 'Member' : 'Not Member'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Votes Cast</h3>
          <p className="text-3xl font-bold text-green-600">{userStats.votesParticipated}</p>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Activity History</h2>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start">
                  <div className={`w-2 h-2 mt-2 rounded-full mr-4 ${
                    activity.type === 'DONATION' ? 'bg-green-500' :
                    activity.type === 'PROJECT_LISTED' ? 'bg-blue-500' :
                    'bg-purple-500'
                  }`} />
                  <div>
                    <p className="text-gray-800">
                      {activity.type === 'DONATION' && (
                        <>Donated {Number(activity.amount).toFixed(4)} ETH to </>
                      )}
                      {activity.type === 'PROJECT_LISTED' && (
                        <>Listed project: </>
                      )}
                      {activity.type === 'VOTED' && (
                        <>Voted on project: </>
                      )}
                      <span className="font-semibold">{activity.projectName}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No activities yet</p>
        )}
      </div>
    </div>
  );
}
