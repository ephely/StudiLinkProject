import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
    companyName: '',
    companySector: '',
    companyLocation: '',
    companyPosition: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.role === 'employer') {
      if (!form.companyName || !form.companySector || !form.companyLocation) {
        setError('Please fill in all required company fields.');
        return;
      }
    }
    try {
      const response = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          ...(form.role === 'employer'
            ? {
                companyName: form.companyName,
                companySector: form.companySector,
                companyLocation: form.companyLocation,
                companyPosition: form.companyPosition,
              }
            : {}),
        }),
      });
      if (response.ok) {
        setSuccess('Registration successful! You can now login.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        const data = await response.json();
        setError(data.message || 'Error during registration.');
      }
    } catch (err) {
      setError('Server error.');
    }
  };

  return (
    <div className="register-container">
      {/* Inscription */}
      <h2>Create an account</h2>
      {/* Formulaire (dynamique selon type de compte) */}
      <form className="register-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          placeholder="First name"
          value={form.firstName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last name"
          value={form.lastName}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        {/* Sélection du type (employer ou student) */}
        <div className="register-role">
          <label>
            <input
              type="radio"
              name="role"
              value="student"
              checked={form.role === 'student'}
              onChange={handleChange}
              required
            />
            Student
          </label>
          <label style={{ marginLeft: '1.5rem' }}>
            <input
              type="radio"
              name="role"
              value="employer"
              checked={form.role === 'employer'}
              onChange={handleChange}
              required
            />
            Employer
          </label>
        </div>
        {/* Champs spécifiques si employer */}
        {form.role === 'employer' && (
          <>
            <input
              type="text"
              name="companyName"
              placeholder="Company name"
              value={form.companyName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="companySector"
              placeholder="Company sector"
              value={form.companySector}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="companyLocation"
              placeholder="Company location"
              value={form.companyLocation}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="companyPosition"
              placeholder="Role in the company (optional)"
              value={form.companyPosition}
              onChange={handleChange}
            />
          </>
        )}
        {/* Submit */}
        <button type="submit" className="register-submit">
          Register
        </button>
      </form>
      {/* Error/Success */}
      {error && <div className="register-error">{error}</div>}
      {success && <div className="register-success">{success}</div>}
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
