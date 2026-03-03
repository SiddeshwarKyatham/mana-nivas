import React from 'react';
import './team.css';

const Team = () => {
  const teamMembers = [
    {
      name: "John Smith",
      position: "General Manager",
      image: "/images/team/john-smith.jpg",
      bio: "With over 15 years of experience in luxury hospitality, John leads our team with passion and expertise."
    },
    {
      name: "Sarah Johnson",
      position: "Head Chef",
      image: "/images/team/sarah-johnson.jpg",
      bio: "Sarah brings her culinary expertise from top restaurants around the world to create unforgettable dining experiences."
    },
    {
      name: "Michael Chen",
      position: "Spa Director",
      image: "/images/team/michael-chen.jpg",
      bio: "Michael's background in wellness and holistic healing ensures our spa services are truly transformative."
    },
    {
      name: "Emma Wilson",
      position: "Guest Relations Manager",
      image: "/images/team/emma-wilson.jpg",
      bio: "Emma's dedication to exceptional service ensures every guest feels like family at MANA NIVAS."
    }
  ];

  return (
    <div className="team-page">
      <section className="team-hero">
        <div className="team-hero-content">
          <h1>Our Team</h1>
          <p>Meet the dedicated professionals who make MANA NIVAS special</p>
        </div>
      </section>

      <section className="team-content">
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-card-image">
                <img src={member.image} alt={member.name} />
              </div>
              <div className="team-card-content">
                <h3>{member.name}</h3>
                <p className="position">{member.position}</p>
                <p className="bio">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Team; 