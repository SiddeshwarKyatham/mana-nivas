import React from 'react';
import './dining.css';
// Import signature dish images
import andhraThali from '../assets/dish-andhra-thali.jpg';
import gonguraMutton from '../assets/dish-gongura-mutton-curry.jpg';
import hyderabadiBiryani from '../assets/dish-hyderabadi-dum-biryani.jpg';
import chettinadChicken from '../assets/dish-chettinad-chicken-curry.jpg';
import tandooriVeg from '../assets/dish-tandoori-veg-platter.jpg';
import pesarattu from '../assets/dish-pesarattu-ginger-chutney.jpg';
import doubleKaMeetha from '../assets/dish-double-ka-meetha.jpg';
import breakfast from '../assets/breakfast.jpg';
// Import venue images
import rooftopLounge from '../assets/venue-rooftop-lounge.jpg';
import gardenPatio from '../assets/venue-garden-patio.jpg';
import indoorDining from '../assets/venue-indoor-fine-dining.jpg';
// Import hero image
import diningHero from '../assets/dining-hero.jpg';

const signatureDishes = [
  {
    name: 'Andhra Thali',
    image: andhraThali,
    description: 'A wholesome, traditional Andhra meal served on a banana leaf. Includes steamed rice, tangy sambar, nutritious pappu (dal), crispy fryums, spicy pickles, flavorful chutneys, cool curd, and a sweet dessert.',
    chefNote: 'A symphony of textures and vibrant flavors from Telangana and Andhra.'
  },
  {
    name: 'Gongura Mutton Curry',
    image: gonguraMutton,
    description: 'A fiery and flavorful mutton curry made with the tangy essence of gongura (sorrel leaves). Cooked with traditional spices and tender meat.',
    chefNote: 'Served alongside steaming white rice for a rich, hearty meal loved across South India.'
  },
  {
    name: 'Hyderabadi Dum Biryani',
    image: hyderabadiBiryani,
    description: 'An iconic dish from Hyderabad, this biryani is slow-cooked with fragrant basmati rice, aromatic spices, saffron, and marinated meat.',
    chefNote: 'Garnished with crispy onions and mint, served with tangy salan and cooling raita.'
  },
  {
    name: 'Chettinad Chicken Curry',
    image: chettinadChicken,
    description: 'A bold and spicy chicken curry from the Chettinad region, known for its intense flavors.',
    chefNote: 'Prepared with roasted coconut, pepper, and aromatic spices, served best with steamed rice or flaky parotta.'
  },
  {
    name: 'Tandoori Veg Platter',
    image: tandooriVeg,
    description: 'A colorful assortment of grilled vegetables including paneer tikka, mushrooms, bell peppers, and baby corn.',
    chefNote: 'Marinated in aromatic spices and grilled to perfection, served with lemon wedges and mint chutney.'
  },
  {
    name: 'Pesarattu with Ginger Chutney',
    image: pesarattu,
    description: 'A healthy green gram dosa from Andhra cuisine, crispy on the outside and soft inside.',
    chefNote: 'Served with a flavorful ginger chutney and a warm upma filling, making it a balanced and filling breakfast or lunch option.'
  },
  {
    name: 'Double Ka Meetha',
    image: doubleKaMeetha,
    description: 'A royal dessert from Hyderabad made with fried bread slices soaked in cardamom-infused milk.',
    chefNote: 'Garnished with saffron and crunchy dry fruits, sweet, soft, and indulgent.'
  },
  {
    name: 'South Indian Breakfast Platter',
    image: breakfast,
    description: 'A hearty breakfast platter featuring idli, vada, dosa, and sambar, served with coconut chutney and tomato chutney.',
    chefNote: 'A perfect start to your day with authentic South Indian flavors.'
  }
];

const diningVenues = [
  {
    name: 'Rooftop Lounge',
    image: rooftopLounge,
    hours: '6pm - 11pm',
    ambiance: 'Panoramic city views, live music'
  },
  {
    name: 'Garden Patio',
    image: gardenPatio,
    hours: '7am - 10pm',
    ambiance: 'Lush greenery, open-air seating'
  },
  {
    name: 'Indoor Fine Dining',
    image: indoorDining,
    hours: '12pm - 3pm, 7pm - 11pm',
    ambiance: 'Elegant interiors, candlelit tables'
  }
];

const Dining = () => {
  return (
    <div className="dining-page">
      {/* Hero Banner */}
      <section className="dining-hero">
        <div className="dining-hero-image">
          <img src={diningHero} alt="Luxury Dining Experience" loading="eager" fetchPriority="high" decoding="async" />
        </div>
        <div className="dining-hero-content">
          <h1 className="dining-hero-headline">A Feast for the Senses</h1>
          <p className="dining-hero-subheadline">Experience authentic flavors with a modern twist.</p>
        </div>
      </section>

      {/* Signature Dishes Section */}
      <section className="dining-carousel-section">
        <h2 className="dining-section-title">Signature Dishes</h2>
        <div className="dining-carousel">
          {signatureDishes.map((dish, index) => (
            <div key={index} className="dish-card">
              <div className="dish-image">
                <img src={dish.image} alt={dish.name} loading="lazy" decoding="async" />
              </div>
              <div className="dish-info">
                <h3>{dish.name}</h3>
                <div className="dish-hover">
                  <p>{dish.description}</p>
                  <span className="chef-note">Chef's Note: {dish.chefNote}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dining Venues Section */}
      <section className="dining-venues-section">
        <h2 className="dining-section-title">Dining Venues</h2>
        <div className="dining-venues-grid">
          {diningVenues.map((venue, index) => (
            <div key={index} className="venue-card">
              <div className="venue-image">
                <img src={venue.image} alt={venue.name} loading="lazy" decoding="async" />
              </div>
              <div className="venue-info">
                <h3>{venue.name}</h3>
                <p>Hours: {venue.hours}</p>
                <span>Ambiance: {venue.ambiance}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dining; 
