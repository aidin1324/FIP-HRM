// src/components/Intro.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaSmile } from 'react-icons/fa'; // Importing smile emoji
import zernoLogo from '../components/img/logo.png';
import './Intro.css';

function Intro() {
  return (
    <div className="main-block">
      <div className="container-1">
        <img src={zernoLogo} alt="Логотип Zerno" className="intro-logo" />
   
        <p className="block-text">
        Спасибо, что оставляете отзыв!
        </p>
      </div>
      <div className="container-2">
        <button className="cont-btn">
          <Link to="/nps">Продолжить</Link>
        </button>
      </div>
    </div>
  );
}

export default Intro;