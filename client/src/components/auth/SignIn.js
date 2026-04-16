import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SignIn.scss';

export default function SignIn() {
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    remember: false,
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.userName.trim() || !formData.password.trim()) {
      setError('Invalid username or password.');
      return;
    }

    // TODO: Replace with real auth API call.
    console.log('Sign in payload:', formData);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {error && (
          <div className="auth-alert" role="alert">
            <strong>Error.</strong> {error}
          </div>
        )}

        <div className="auth-card">
          <div className="auth-card-grid">
            <div className="auth-visual" aria-hidden="true">
              <div className="auth-visual-inner" />
            </div>

            <div className="auth-content">
              <div className="auth-header">
                <div className="auth-header-subtitle">Welcome back</div>
                <h1>Sign in</h1>
              </div>

              <form onSubmit={handleSubmit} id="signinForm" noValidate>
                <div className="auth-field">
                  <label htmlFor="userName">Username</label>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="auth-field">
                  <div className="auth-field-row">
                    <label htmlFor="password">Password</label>
                    <a href="#">Forgot password?</a>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="auth-options">
                  <label className="auth-check" htmlFor="remember">
                    <input
                      type="checkbox"
                      id="remember"
                      name="remember"
                      checked={formData.remember}
                      onChange={handleChange}
                    />
                    <span>Remember me</span>
                  </label>
                </div>

                <button type="submit" className="auth-submit">
                  Sign In
                </button>

                <a href="/auth/google" className="auth-google-btn">
                  Google Authentication
                </a>

                <p className="auth-footer-text">
                  Don&apos;t have an account?{' '}
                  <Link to="/signup">Create one</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
