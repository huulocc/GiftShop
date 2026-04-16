import React, { useState } from 'react'
import { useAuth } from '../../services/AuthContext'
import ChangePassword from './ChangePassword'
import './Profile.scss'

const ProfilePage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profileInfo')

  if (!user) {
    return <div className="profile-page"><p>Please log in to view this page.</p></div>
  }

  return (
    <div className="profile-page" aria-label="Profile Page">
      <div className="profile-header">
        <h2 className="profile-title">My Account</h2>
        <p className="profile-subtitle">Manage your profile and account settings</p>
      </div>
      
      <div className="profile-content">
        <aside className="profile-sidebar">
          <nav className="profile-nav">
            <button
              className={`profile-nav-btn ${activeTab === 'profileInfo' ? 'active' : ''}`}
              onClick={() => setActiveTab('profileInfo')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Profile Information
            </button>
            <button
              className={`profile-nav-btn ${activeTab === 'changePassword' ? 'active' : ''}`}
              onClick={() => setActiveTab('changePassword')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Security Settings
            </button>
          </nav>
        </aside>

        <main className="profile-main">
          {activeTab === 'profileInfo' && (
            <div className="profile-info-content">
              <h3>Profile Information</h3>
              <div className="profile-info">
                <div className="info-group">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{user.fullName || 'N/A'}</span>
                </div>
                <div className="info-group">
                  <span className="info-label">Username</span>
                  <span className="info-value">{user.username || 'N/A'}</span>
                </div>
                <div className="info-group">
                  <span className="info-label">Email</span>
                  <span className="info-value">{user.email || 'N/A'}</span>
                </div>
                <div className="info-group">
                  <span className="info-label">Role</span>
                  <span className="info-value info-role">{user.roleCode || 'USER'}</span>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'changePassword' && (
            <ChangePassword />
          )}
        </main>
      </div>
    </div>
  )
}

export default ProfilePage
