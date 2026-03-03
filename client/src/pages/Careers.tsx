import React from 'react';
import './careers.css';

const Careers = () => {
  const jobOpenings = [
    {
      title: 'Front Desk Associate',
      department: 'Guest Services',
      location: 'Mumbai',
      type: 'Full-time',
      description: 'Join our front desk team to provide exceptional guest service and create memorable experiences.'
    },
    {
      title: 'Sous Chef',
      department: 'Culinary',
      location: 'Mumbai',
      type: 'Full-time',
      description: 'Work with our executive chef to create innovative and authentic dining experiences.'
    },
    {
      title: 'Spa Therapist',
      department: 'Wellness',
      location: 'Mumbai',
      type: 'Full-time',
      description: 'Deliver exceptional spa treatments and wellness experiences to our guests.'
    },
    {
      title: 'Housekeeping Supervisor',
      department: 'Operations',
      location: 'Mumbai',
      type: 'Full-time',
      description: 'Lead our housekeeping team to maintain the highest standards of cleanliness and service.'
    }
  ];

  return (
    <div className="careers-page">
      <section className="careers-hero">
        <div className="careers-hero-content">
          <h1>Join Our Team</h1>
          <p>Be part of a legacy of excellence in hospitality</p>
        </div>
      </section>

      <section className="careers-content">
        <div className="careers-intro">
          <h2>Why Join MANA NIVAS?</h2>
          <p>At MANA NIVAS, we believe in nurturing talent and providing opportunities for growth. Join us to be part of a team that values excellence, innovation, and guest satisfaction.</p>
        </div>

        <div className="job-openings">
          <h2>Current Openings</h2>
          <div className="job-grid">
            {jobOpenings.map((job, index) => (
              <div key={index} className="job-card">
                <h3>{job.title}</h3>
                <div className="job-details">
                  <span className="department">{job.department}</span>
                  <span className="location">{job.location}</span>
                  <span className="type">{job.type}</span>
                </div>
                <p>{job.description}</p>
                <button className="apply-button">Apply Now</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Careers; 