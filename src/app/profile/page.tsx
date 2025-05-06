'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { authAPI } from '@/services/api';
import { User } from '@/services/api';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiSave, FiX, FiLock, FiMail, FiPhone, FiMapPin, FiHome, FiMap, FiUser } from 'react-icons/fi';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  alternatePhone: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    alternatePhone: user?.alternatePhone || ''
  });
  const [originalData, setOriginalData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    alternatePhone: ''
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showNewPasswordFields, setShowNewPasswordFields] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Load saved profile data from localStorage
    const savedProfile = localStorage.getItem('profileData');
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setFormData(parsedProfile);
      setOriginalData(parsedProfile);
    } else {
      const userData = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        alternatePhone: user.alternatePhone || ''
      };
      setFormData(userData);
      setOriginalData(userData);
    }
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authAPI.updateProfile(formData);
      localStorage.setItem('profileData', JSON.stringify(formData));
      setOriginalData(formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleInitiatePasswordChange = async () => {
    if (!user?.email) return;

    setIsVerifying(true);
    try {
      await authAPI.initiatePasswordReset({ email: user.email });
      toast.success('Verification code sent to your email!');
      setShowOtpInput(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!user?.email) return;

    setIsVerifying(true);
    try {
      await authAPI.verifyResetCode({ email: user.email, code: verificationCode });
      toast.success('Code verified successfully!');
      setShowNewPasswordFields(true);
      setShowOtpInput(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !verificationCode) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authAPI.resetPassword({
        email: user.email,
        code: verificationCode,
        newPassword: passwordData.newPassword
      });
      
      // Show success message
      toast.success('Password changed successfully!');
      
      // Reset all states
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setVerificationCode('');
      setShowNewPasswordFields(false);
      setShowOtpInput(false);
      
      // Stay on the same page
      setIsChangingPassword(false);
    } catch (error: any) {
      // Show error message
      toast.error(error.response?.data?.message || 'Failed to change password. Please try again.');
      setIsChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-primary text-white p-4 sm:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
            <div className="relative">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-lg">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold">{user.name}</h1>
                  <p className="text-white/80 text-sm sm:text-base">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-8">
            {/* Profile Form */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Personal Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors w-full sm:w-auto justify-center"
                >
                  <FiEdit2 className="text-lg" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
                  >
                    <FiX className="text-lg" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 w-full sm:w-auto"
                  >
                    <FiSave className="text-lg" />
                    <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 text-green-500 p-4 rounded-lg mb-6">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FiUser className="mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-100 disabled:text-gray-500"
                      required
                    />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FiMail className="mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-100 disabled:text-gray-500"
                      required
                    />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FiPhone className="mr-2" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FiPhone className="mr-2" />
                      Alternate Phone
                    </label>
                    <input
                      type="tel"
                      name="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FiMapPin className="mr-2" />
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FiHome className="mr-2" />
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FiMap className="mr-2" />
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FiMapPin className="mr-2" />
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* Password Change Section */}
            <div className="mt-8 border-t pt-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FiLock className="mr-2" />
                Change Password
              </h3>
              
              {!showOtpInput && !showNewPasswordFields && (
                <button
                  onClick={handleInitiatePasswordChange}
                  disabled={isVerifying}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  <FiLock className="text-lg" />
                  <span>{isVerifying ? 'Sending Code...' : 'Change Password'}</span>
                </button>
              )}

              {showOtpInput && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter Verification Code
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter the code sent to your email"
                        required
                      />
                      <button
                        onClick={handleVerifyCode}
                        disabled={isVerifying || !verificationCode}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                      >
                        {isVerifying ? 'Verifying...' : 'Verify Code'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showNewPasswordFields && (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isChangingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 