import React from "react";
import about1Image from "../Components/Assets/about1.jpg"; // Importing the image
import about2Image from "../Components/Assets/about2.jpg";
import "./Styles/About.css";

const About = () => {
  return (
    <div className="about-container">
      {/* Top Section */}
      <div className="about-top">
        <div className="about-text">
          <h1>Unlock Your Skin's Potential with AI</h1>
          <p>Tired of skincare guesswork? At The Ordinary AI, we're pioneering a new era of personalized beauty. We seamlessly blend cutting-edge artificial intelligence with dermatologist-backed knowledge to decode your unique skin needs and guide you to the perfect routine. Say goodbye to trial and error and hello to visibly healthier, more radiant skin.</p>
        </div>
        <div
          className="about-image about-img-top"
          style={{ backgroundImage: `url(${about1Image})` }} // Setting background image inline
        ></div>
      </div>

      {/* Middle Section */}
      <div className="about-middle">
        <div className="about-left">
          <h1 className="vertical-text">Our Intelligence</h1>
        </div>
        <div className="about-content">
          <p>
            At the heart of The Ordinary AI is our sophisticated skincare intelligence engine. Unlike generic recommendations, our AI analyzes a wealth of data – from product ingredients and scientific studies to user interactions and skin concerns – to provide truly personalized insights. Interact with our AI via text or even image analysis to get a deeper understanding of your skin and discover products specifically matched to your profile.</p>
          <p>Built on robust machine learning models and supported by secure cloud infrastructure, our platform ensures accuracy and privacy. We're constantly learning and evolving to bring you the most precise and effective skincare guidance available, right at your fingertips.</p>
          <div className="about-button-container">
            <button className="about-button">Discover Your Skin Profile</button>
          </div>
        </div>
        <div className="about-right"></div>
      </div>

      {/* Bottom Section */}
      <div className="about-bottom">
        <div className="about-img-bottom" style={{ backgroundImage: `url(${about2Image})`}}></div>
        <div className="about-goal">
          <h2>Empowering Your Skincare Journey</h2>
          <p>Our mission goes beyond selling products. We are dedicated to empowering you with the knowledge and tools to understand your skin on a deeper level. We believe that informed decisions lead to better results. By providing transparent, science-backed recommendations powered by AI, we aim to build your confidence and make your skincare journey effective, enjoyable, and uniquely yours. Join us in embracing the future of personalized beauty.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
