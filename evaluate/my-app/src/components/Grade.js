import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Grade.css';
import zernoLogo from './img/zerno-474747 1 — копия 2.png';

function Grade() {
  const navigate = useNavigate();

  const [feedback, setFeedback] = useState({
    ratings: {
      personal: 0,
      service_quality: 0,
      service_speed: 0,
      problem_solving: 0,
      overall_impression: 0,
    },
    reviewText: '',
  });

  const [isContactToggled, setIsContactToggled] = useState(false); 
  const [isWaiterToggled, setIsWaiterToggled] = useState(false);
  const [contact, setContact] = useState('');
  const [waiter, setWaiter] = useState(''); 

  const handleStarClick = (category, rating) => {
    setFeedback((prevFeedback) => ({
      ...prevFeedback,
      ratings: {
        ...prevFeedback.ratings,
        [category]: rating,
      },
    }));
  };

  const handleReviewChange = (e) => {
    setFeedback({ ...feedback, reviewText: e.target.value });
  };

  const handleSubmit = async () => {
    const allRatingsEmpty = Object.values(feedback.ratings).every((rating) => rating === 0);
    if (allRatingsEmpty) {
      alert('Пожалуйста, оцените хотя бы одну категорию перед отправкой отзыва.');
      return;
    }

    console.log("Sending data:", {
      is_notified: isContactToggled,
      comment: feedback.reviewText,
      contact: isContactToggled ? contact : null, 
      waiter: isWaiterToggled ? waiter : null,
      ratings: [
        { rating: feedback.ratings.personal, feedback_type_id: 1 },
        { rating: feedback.ratings.service_quality, feedback_type_id: 2 },
        { rating: feedback.ratings.service_speed, feedback_type_id: 3 },
      ],
    });
  
    const dataToSend = {
      is_notified: isContactToggled,
      comment: feedback.reviewText,
      contact: isContactToggled ? contact : null, 
      waiter: isWaiterToggled ? waiter : null, 
      ratings: [
        { rating: feedback.ratings.personal, feedback_type_id: 1 },
        { rating: feedback.ratings.service_quality, feedback_type_id: 2 },
        { rating: feedback.ratings.service_speed, feedback_type_id: 3 },
      ],
    };
  
    navigate('/outro');
    };

  const renderStars = (category) => {
    return [1, 2, 3, 4, 5].map((value) => (
      <span
        key={value}
        className={`star ${feedback.ratings[category] >= value ? 'checked' : ''}`}
        onClick={() => handleStarClick(category, value)}
      >
        &#9733;
      </span>
    ));
  };

  return (
    <div className="main-block">
      <div className="first-block">
        <button onClick={() => navigate(-1)} className="back"></button>
        <img src={zernoLogo} alt="Логотип Zerno" className="logo" />
      </div>
      <div className="second-block">
        <p className="grade-p">Отзыв:</p>

        <div className="grade-item">
          <p>1. Отношение персонала:</p>
          <div className="stars">{renderStars('personal')}</div>
        </div>

        <div className="grade-item">
          <p>2. Качество обслуживания:</p>
          <div className="stars">{renderStars('service_quality')}</div>
        </div>

        <div className="grade-item">
          <p>3. Скорость обслуживания:</p>
          <div className="stars">{renderStars('service_speed')}</div>
        </div>

        <div className="grade-contact">
          <span className="name-label">Указать имя официанта:</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={isWaiterToggled}
              onChange={() => setIsWaiterToggled(!isWaiterToggled)}
            />
            <span className="slider"></span>
          </label>

          <div className={`name-input-block ${isWaiterToggled ? 'visible' : 'hidden'}`}>
            <input
              type="text"
              value={waiter}
              onChange={(e) => setWaiter(e.target.value)}
              placeholder="Введите имя официанта"
              className="phone-input"
            />
          </div>
        </div>

        <div className="grade-contact">
          <span className="name-label">Указать контактный номер:</span> 
          <label className="switch">
            <input
              type="checkbox"
              checked={isContactToggled} 
              onChange={() => setIsContactToggled(!isContactToggled)} 
            />
            <span className="slider"></span>
          </label>

          <div className={`phone-input-container ${isContactToggled ? 'visible' : 'hidden'}`}> 
            <input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)} 
              placeholder="Введите контактный номер"
              className="phone-input"
            />
          </div>
        </div>

        <textarea
          className="text-area"
          placeholder="Напишите отзыв..."
          value={feedback.reviewText}
          onChange={handleReviewChange}
        ></textarea>

        <button className="submit-btn" onClick={handleSubmit}>
          Оставить отзыв
        </button>
      </div>
    </div>
  );
}

export default Grade;
