import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Home from './pages/Home';
import JobOffers from './pages/JobOffers';
import JobOfferDetail from './pages/JobOfferDetail';
import CreateJobOffer from './pages/CreateJobOffer';
import Login from './pages/Login';
import Profile from './pages/Profile';
import UpdateProfile from './pages/UpdateProfile';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/Register';
import ApplicationView from './pages/ApplicationView';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/offers" element={<JobOffers />} />
        <Route path="/offers/:id" element={<JobOfferDetail />} />
        <Route path="/offers/:id/applications" element={<ApplicationView />} />
        <Route path="/create-offer" element={<CreateJobOffer />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/update" element={<UpdateProfile />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <footer>© 2025 StudiLink. All rights reserved.</footer>
    </Router>
  );
}

export default App;
