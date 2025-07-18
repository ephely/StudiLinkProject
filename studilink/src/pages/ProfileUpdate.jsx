import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfileUpdate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    location: '',
    skills: '',
    bio: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Not connected!');
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (avatar) data.append('avatar', avatar);

    try {
      const res = await fetch('http://localhost:3001/profile/update', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Update error');

      setMessage('Profile updated!');
      navigate('/profile');
    } catch (err) {
      console.error(err);
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h2>Profile update</h2>
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxWidth: '400px',
        }}
      >
        <input name="first_name" placeholder="First name" onChange={handleChange} />
        <input name="last_name" placeholder="Last name" onChange={handleChange} />
        <input name="location" placeholder="City" onChange={handleChange} />
        <input
          name="skills"
          placeholder="Skills"
          onChange={handleChange}
        />
        <textarea
          name="bio"
          placeholder="Bio"
          rows="3"
          onChange={handleChange}
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit">Update</button>
        {message && <p>{message}</p>}
      </form>
    </main>
  );
}
