'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useContract } from '../hooks/useContract';
import { formatEther } from '@ethersproject/units';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Gift,
  CheckCircle,
  Vote,
} from 'lucide-react';

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
      const memberData = await contracts.dao.members(address);
      let listedProjects = 0;
      let totalDonations = BigInt(0);
      let votesCount = 0;
      const userActivities = [];

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

      for (const projectId of projectIds) {
        try {
          const project = await contracts.projectListing.getProject(projectId);

          if (project.owner.toLowerCase() === address.toLowerCase()) {
            listedProjects++;
            userActivities.push({
              type: 'PROJECT_LISTED',
              projectId,
              projectName: project.name,
              timestamp: Date.now()
            });
          }

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
          } catch {}

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
              } catch {
                break;
              }
            }
          } catch {}
        } catch {}
      }

      setUserStats({
        projectsListed: listedProjects,
        totalDonations: formatEther(totalDonations),
        isDaoMember: memberData.isMember,
        votesParticipated: votesCount
      });

      userActivities.sort((a, b) => b.timestamp - a.timestamp);
      setActivities(userActivities);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  if (!mounted || loading) return null;

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-600 via-gray-800 to-green-600 text-white">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">🔒 Connect Your Wallet</h1>
          <p className="text-gray-400">Please connect your wallet to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-gradient-to-b from-green-200 via-gray-500 to-green-50 text-white rounded-xl">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[ 
            {
              label: 'Projects Listed',
              value: userStats.projectsListed,
              icon: <UserPlus size={32} />,
            },
            {
              label: 'Total Donations',
              value: `${Number(userStats.totalDonations).toFixed(4)} ETH`,
              icon: <Gift size={32} />,
            },
            {
              label: 'DAO Status',
              value: userStats.isDaoMember ? 'Member' : 'Not Member',
              icon: <CheckCircle size={32} />,
            },
            {
              label: 'Votes Cast',
              value: userStats.votesParticipated,
              icon: <Vote size={32} />,
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              className="bg-black/40 border border-white rounded-2xl p-6 backdrop-blur-lg shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-center gap-4">
                <div className="text-green-500">{stat.icon}</div>
                <div>
                  <h2 className="text-lg font-semibold">{stat.label}</h2>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Activity Feed */}
        <motion.div
          className="bg-black/40 border border-white rounded-2xl p-6 backdrop-blur-lg shadow-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-green-400">📜 Activity History</h2>
          {activities.length > 0 ? (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {activities.map((activity, index) => (
                <motion.div
                  key={index}
                  className="border-b border-white/20 pb-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <p className="text-white">
                    {activity.type === 'DONATION' && (
                      <>💸 Donated <span className="text-green-300">{Number(activity.amount).toFixed(4)} ETH</span> to </>
                    )}
                    {activity.type === 'PROJECT_LISTED' && <>📁 Listed project: </>}
                    {activity.type === 'VOTED' && <>🗳️ Voted on project: </>}
                    <span className="font-semibold">{activity.projectName}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center">No activities yet</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
