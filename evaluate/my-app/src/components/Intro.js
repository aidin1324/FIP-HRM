// src/components/Intro.js
import React from 'react';
import { Link } from 'react-router-dom';
import zernoLogo from './img/zerno-474747 1 — копия 2.png';
import './Intro.css';

function Intro() {
  return (
    <div className="main-block">
      <div className="container-1">
        <img src={zernoLogo} alt="Логотип Zerno" className="intro-logo" />
        <p className="welcome-text">Здравствуйте, дорогой клиент!</p>
        <p className="block-text">
          Ваши отзывы помогут нам лучше понимать потребности клиентов, развивать навыки официантов и создавать
          комфортную атмосферу. Мы ценим ваше время и обратную связь – спасибо, что помогаете нам стать лучше!
        </p>
      </div>
      <div className="container-2">
        <button className="cont-btn">
          <Link to="/grade">Продолжить</Link>
        </button>
      </div>
    </div>
  );
}

export default Intro;
