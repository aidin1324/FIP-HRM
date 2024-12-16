// src/components/Outro.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Outro.css';
import zernoLogo from './img/zerno-474747 1 — копия 2.png';

function Outro() {
  return (
    <div className="main-block">
      <div className="container-1">
        <img src={zernoLogo} alt="Логотип Zerno" className="intro-logo" />
        <p className="welcome-text">Спасибо за ваш отзыв!</p>
      </div>
      <div className="container-2">
        <button className="cont-btn">
          <Link to="/grade">Вернуться</Link>
        </button>
      </div>
    </div>
  );
}

export default Outro;