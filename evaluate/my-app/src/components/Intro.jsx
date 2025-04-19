import React from 'react';
import { Link } from 'react-router-dom';
import zernoLogo from '../components/img/logo_dark.png';
import './Intro.css';

function Intro() {
  return (
    <div className="intro-container">
      <div className="intro-card">
        <div className="intro-header">
          <img src={zernoLogo} alt="Логотип Zerno" className="intro-logo" />
          <h1 className="intro-title">Оставьте отзыв</h1>
          <p className="intro-description">
            Спасибо, что решили поделиться своими впечатлениями! Ваше мнение поможет нам стать лучше.
          </p>
        </div>
        
        <div className="intro-options">
          <div className="option-label">Выберите способ:</div>
          
          <Link to="/nps" className="option-button standard-option">
            <div className="option-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                <path d="M3 7h18M3 12h18M3 17h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="option-content">
              <span className="option-title">Стандартная форма</span>
              <span className="option-description">Быстрая оценка вашего опыта</span>
            </div>
          </Link>
          
          <Link to="/chat" className="option-button chat-option">
            <div className="option-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="option-content">
              <span className="option-title">Чат с ассистентом</span>
              <span className="option-description">Подробный разговор об опыте</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Intro;