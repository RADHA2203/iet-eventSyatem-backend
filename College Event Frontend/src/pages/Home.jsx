import React from "react";

const Home = () => {
  return (
    <div className="page-container">
      <div className="container text-center">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Welcome to College Event Management
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '2rem' }}>
          Discover and participate in college events.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <a href="/register" style={{
            display: 'inline-block',
            padding: '0.75rem 2rem',
            backgroundColor: '#2563eb',
            color: 'white',
            borderRadius: '6px',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            Get Started
          </a>
          <a href="/login" style={{
            display: 'inline-block',
            padding: '0.75rem 2rem',
            backgroundColor: 'white',
            color: '#2563eb',
            borderRadius: '6px',
            fontWeight: '600',
            textDecoration: 'none',
            border: '2px solid #2563eb'
          }}>
            Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
