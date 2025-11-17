'use client';

import { useState, useEffect } from 'react';
import UserDashboardLayout from './UserDashboardLayout';
import { api, ReferralResponse, handleApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  CheckCircle,
  Clock,
  Gift,
  Flame,
  Copy,
  Share2,
  TrendingUp,
} from 'lucide-react';

export default function ReferralsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasReferral, setHasReferral] = useState(false);
  const [applying, setApplying] = useState(false);
  const [referralData, setReferralData] = useState<ReferralResponse | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkReferralStatus();
  }, []);

  const checkReferralStatus = async () => {
    try {
      setLoading(true);
      const status = await api.referrals.checkReferralStatus();
      setHasReferral(status.has_referral);

      if (status.has_referral) {
        const data = await api.referrals.getReferralData();
        setReferralData(data);
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleApplyForReferral = async () => {
    try {
      setApplying(true);
      setError(null);
      await api.referrals.createReferralCode();
      await checkReferralStatus();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setApplying(false);
    }
  };

  const copyToClipboard = async () => {
    if (referralData?.referral_code.referral_link) {
      try {
        await navigator.clipboard.writeText(referralData.referral_code.referral_link);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const shareToSocial = (platform: string) => {
    const link = referralData?.referral_code.referral_link || '';
    const text = 'Join Learnexity and start your learning journey!';
    
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + link)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </UserDashboardLayout>
    );
  }

  if (!hasReferral) {
    return (
      <UserDashboardLayout>
        <div className="max-w-2xl mx-auto px-4 py-20 pt-25 ">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Share2 className="w-10 h-10 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Start Earning Rewards
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              Apply for your unique referral link and earn <span className="font-semibold text-purple-600">$30 credit</span> for 
              every friend who signs up and completes their first sprint.
            </p>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {error}
              </div>
            )}
            <button
              onClick={handleApplyForReferral}
              disabled={applying}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
            >
              {applying ? 'Generating...' : 'Apply Now'}
            </button>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="max-w-[1500px] mx-auto px-4 py-8 pt-28">
        {/* Referral Link Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Share2 className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Your Referral Link</h2>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            Share this unique link with friends and earn rewards when they sign up
          </p>
          <div className="flex gap-3">
            <div className="flex-1 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
              <p className="text-gray-700 font-mono text-sm break-all">
                {referralData?.referral_code.referral_link}
              </p>
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
            >
              <Copy className="w-4 h-4" />
              {copySuccess ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

          {/* Referral Rewards Info */}
          <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Gift className="w-5 h-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Referral Rewards</h3>
                <p className="text-sm text-gray-700">
                  Earn <span className="font-semibold text-purple-600">$30 credit</span> for each friend who 
                  successfully signs up and completes their first sprint. Your friend also gets{' '}
                  <span className="font-semibold text-purple-600">$20 off</span> their enrollment!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Statistics */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Referral Statistics</h2>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            Track your referral performance and earnings
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatCard
              icon={<Users className="w-5 h-5 text-purple-600" />}
              label="Total Referrals"
              value={referralData?.statistics.total_referrals || 0}
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5 text-green-600" />}
              label="Successful"
              value={referralData?.statistics.successful_referrals || 0}
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-orange-600" />}
              label="Pending"
              value={referralData?.statistics.pending_referrals || 0}
            />
            <StatCard
              icon={<Gift className="w-5 h-5 text-purple-600" />}
              label="Rewards"
              value={`$${referralData?.statistics.total_rewards || 0}`}
            />
            <StatCard
              icon={<Flame className="w-5 h-5 text-red-600" />}
              label="Streak"
              value={`${referralData?.statistics.current_streak_months || 0} months`}
            />
          </div>
        </div>

        {/* Referral History */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Referral History</h2>
          </div>
          <p className="text-gray-600 mb-6 text-sm">
            View all your referrals and their current status
          </p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Reward</th>
                </tr>
              </thead>
              <tbody>
                {referralData?.history && referralData.history.length > 0 ? (
                  referralData.history.map((ref) => (
                    <tr key={ref.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(ref.referred_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{ref.referred_user_name}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={ref.status} />
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                        {ref.status === 'completed' ? `$${ref.reward_amount}` : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      No referrals yet. Start sharing your link!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Share Your Link Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Share Your Link</h2>
          </div>
          <p className="text-gray-600 mb-6 text-sm">
            Share your referral link on social media platforms
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SocialButton
              icon="facebook"
              label="Facebook"
              onClick={() => shareToSocial('facebook')}
            />
            <SocialButton
              icon="twitter"
              label="Twitter"
              onClick={() => shareToSocial('twitter')}
            />
            <SocialButton
              icon="linkedin"
              label="LinkedIn"
              onClick={() => shareToSocial('linkedin')}
            />
            <SocialButton
              icon="whatsapp"
              label="WhatsApp"
              onClick={() => shareToSocial('whatsapp')}
            />
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
}

// Stat Card Component
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const styles = {
    completed: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-orange-100 text-orange-700 border-orange-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Social Button Component
function SocialButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  const icons: Record<string, string> = {
    facebook: '📘',
    twitter: '🐦',
    linkedin: '💼',
    whatsapp: '💬',
  };

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg py-3 px-4 transition-colors"
    >
      <span className="text-xl">{icons[icon]}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  );
}