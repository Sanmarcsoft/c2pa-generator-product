import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Profile data state (future enhancement)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'All password fields are required' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters' });
      return;
    }

    if (passwordData.oldPassword === passwordData.newPassword) {
      setMessage({ type: 'error', text: 'New password must be different from old password' });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        // Clear form
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1 className="pixel-text">👤 User Profile</h1>
        <p className="subtitle">Manage your account settings and preferences</p>
      </div>

      {/* Profile Information */}
      <div className="profile-section">
        <h2>📋 Profile Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>Email</label>
            <div className="info-value">{user?.email}</div>
          </div>
          <div className="info-item">
            <label>Name</label>
            <div className="info-value">{user?.name || 'Not set'}</div>
          </div>
          <div className="info-item">
            <label>Role</label>
            <div className="info-value">
              <span className={`role-badge ${user?.role}`}>
                {user?.role === 'admin' ? '👑 Admin' : '👤 User'}
              </span>
            </div>
          </div>
          <div className="info-item">
            <label>Account Created</label>
            <div className="info-value">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="profile-section">
        <h2>🔒 Change Password</h2>

        {message && (
          <div className={`message-box ${message.type}`}>
            {message.type === 'success' ? '✓' : '✗'} {message.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="password-form">
          <div className="form-group">
            <label htmlFor="oldPassword">Current Password</label>
            <input
              type="password"
              id="oldPassword"
              value={passwordData.oldPassword}
              onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
              placeholder="Enter current password"
              disabled={saving}
              autoComplete="current-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder="Enter new password (min 8 characters)"
              disabled={saving}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              disabled={saving}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
          >
            {saving ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>

        <div className="password-requirements">
          <h3>Password Requirements:</h3>
          <ul>
            <li>Minimum 8 characters</li>
            <li>Must be different from current password</li>
            <li>Recommended: Mix of letters, numbers, and symbols</li>
          </ul>
        </div>
      </div>

      {/* Future sections can be added here */}
      {/* Example: Notification preferences, Theme settings, etc. */}
    </div>
  );
};

export default ProfilePage;
