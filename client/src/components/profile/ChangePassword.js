import React, { useState } from 'react'
import authService from '../../services/authService'

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      return setError('Please fill all fields')
    }

    if (currentPassword.length < 6 || newPassword.length < 6 || confirmPassword.length < 6) {
      return setError('Passwords must be at least 6 characters')
    }

    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match')
    }

    if (newPassword === currentPassword) {
      return setError('New password cannot be the same as the current password')
    }

    try {
      const res = await authService.changePassword({ currentPassword, newPassword })
      setMessage(res.message || 'Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      // API returns something like err.response.data.error
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error)
      } else {
        setError('Something went wrong')
      }
    }
  }

  return (
    <div className="change-password-tab">
      <h3>Change Password</h3>
      <form onSubmit={handleSubmit} className="change-password-form">
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password <span style={{color: 'red'}}>*</span></label>
          <input
            id="currentPassword"
            type="password"
            placeholder="Enter current password (min 6 characters)"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="newPassword">New Password <span style={{color: 'red'}}>*</span></label>
          <input
            id="newPassword"
            type="password"
            placeholder="Enter new password (min 6 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password <span style={{color: 'red'}}>*</span></label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm new password (min 6 characters)"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <button type="submit" className="btn-submit">
          Update Password
        </button>
      </form>
    </div>
  )
}

export default ChangePassword
