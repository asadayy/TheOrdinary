import React, { useState } from 'react';
import StarRating from '../StarRating/StarRating';
import './RatingForm.css';

const RatingForm = ({ productId, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [userName, setUserName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;
    
    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          rating,
          review,
          userName: userName || 'Anonymous'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      // Reset form and show success message
      setRating(0);
      setReview('');
      setUserName('');
      setSuccess(true);
      
      // Notify parent component
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
  };

  return (
    <div className="rating-form-container">
      <h3>Rate this product</h3>
      {success ? (
        <div className="rating-success">
          <p>Thank you for your rating!</p>
          <button 
            className="rate-again-btn"
            onClick={handleReset}
          >
            Rate Again
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rating-form">
          <div className="form-group">
            <label>Your Name (optional):</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="name-input"
            />
          </div>
          <div className="form-group">
            <label>Your Rating:</label>
            <StarRating 
              rating={rating} 
              onRatingChange={setRating} 
              readOnly={false} 
              size="lg"
            />
          </div>
          <div className="form-group">
            <label htmlFor="review">Your Review (optional):</label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows="4"
              placeholder="Share your thoughts about this product..."
            />
          </div>
          <button 
            type="submit" 
            className="submit-rating-btn"
            disabled={!rating || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </form>
      )}
    </div>
  );
};

export default RatingForm;
