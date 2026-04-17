import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './SignUp.scss';

const initialFormData = {
  fullName: '',
  userName: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false,
};

const initialErrors = {
  fullName: '',
  userName: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: '',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUp() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialErrors);
  const [submitted, setSubmitted] = useState(false);

  const hasErrors = useMemo(() => Object.values(errors).some(Boolean), [errors]);

  const validateField = (name, value, nextData = formData) => {
    switch (name) {
      case 'fullName':
        return value.trim() ? '' : 'Full name cannot be empty.';
      case 'userName':
        return value.trim() ? '' : 'Username cannot be empty.';
      case 'email':
        if (!value.trim()) return 'Email cannot be empty.';
        return emailPattern.test(value.trim()) ? '' : 'Please enter a valid email address.';
      case 'password':
        return value.length >= 6 ? '' : 'Password must be at least 6 characters.';
      case 'confirmPassword':
        return value && value === nextData.password ? '' : 'Passwords do not match.';
      case 'terms':
        return value ? '' : 'You must agree to the Terms and Privacy Policy.';
      default:
        return '';
    }
  };

  const validateAll = (data) => ({
    fullName: validateField('fullName', data.fullName, data),
    userName: validateField('userName', data.userName, data),
    email: validateField('email', data.email, data),
    password: validateField('password', data.password, data),
    confirmPassword: validateField('confirmPassword', data.confirmPassword, data),
    terms: validateField('terms', data.terms, data),
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => {
      const nextData = { ...prev, [name]: nextValue };

      setErrors((currentErrors) => {
        const updated = { ...currentErrors };
        updated[name] = validateField(name, nextValue, nextData);

        if (name === 'password' && nextData.confirmPassword) {
          updated.confirmPassword = validateField('confirmPassword', nextData.confirmPassword, nextData);
        }

        if (name === 'confirmPassword') {
          updated.confirmPassword = validateField('confirmPassword', nextValue, nextData);
        }

        return updated;
      });

      return nextData;
    });
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, formData[name], formData),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateAll(formData);
    setErrors(nextErrors);
    setSubmitted(true);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    // TODO: call signup API here.
    console.log('Sign up payload:', formData);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {submitted && hasErrors && (
          <div className="auth-alert" role="alert">
            <strong>Error.</strong> Please fix the highlighted fields and try again.
          </div>
        )}

        <div className="auth-card">
          <div className="auth-card-grid">
            <div className="auth-visual" aria-hidden="true">
              <div className="auth-visual-inner" />
            </div>

            <div className="auth-content">
              <div className="auth-header">
                <div className="auth-header-subtitle">Join Online Academy</div>
                <h1>Create your account</h1>
              </div>

              <form onSubmit={handleSubmit} id="signupForm" noValidate>
                <div className="auth-field">
                  <label htmlFor="fullName">Full name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Nguyen Van A"
                    className={errors.fullName ? 'is-invalid' : ''}
                    required
                  />
                  {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                </div>

                <div className="auth-field">
                  <label htmlFor="userName">User name</label>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="nguyenvana01"
                    className={errors.userName ? 'is-invalid' : ''}
                    required
                  />
                  {errors.userName && <div className="invalid-feedback">{errors.userName}</div>}
                </div>

                <div className="auth-field">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="you@example.com"
                    className={errors.email ? 'is-invalid' : ''}
                    required
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="auth-field">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Xxx@123"
                    className={errors.password ? 'is-invalid' : ''}
                    required
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="auth-field">
                  <label htmlFor="confirmPassword">Confirm password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Xxx@123"
                    className={errors.confirmPassword ? 'is-invalid' : ''}
                    required
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">{errors.confirmPassword}</div>
                  )}
                </div>

                <div className="auth-options">
                  <label className="auth-check" htmlFor="terms">
                    <input
                      type="checkbox"
                      id="terms"
                      name="terms"
                      checked={formData.terms}
                      onChange={handleChange}
                      className={errors.terms ? 'is-invalid' : ''}
                    />
                    <span>I agree to the Terms and Privacy Policy.</span>
                  </label>
                  {errors.terms && <div className="invalid-feedback invalid-feedback--static">{errors.terms}</div>}
                </div>

                <button type="submit" className="auth-submit">
                  Create Account
                </button>

                <p className="auth-footer-text">
                  Already have an account? <Link to="/signin">Sign in</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}