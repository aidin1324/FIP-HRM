import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import zernoLogo from './img/logo.png';
import './FeedbackChat.css';

function FeedbackChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogComplete, setDialogComplete] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const chatAreaRef = useRef(null);
  
  const MAX_MESSAGE_LENGTH = 500;
  const FEEDBACK_COMPLETION_TEXT = 'Мы уведомим менеджера, благодарим вас!';

  // Автоматическая прокрутка при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Проверка на завершение диалога
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.text.includes(FEEDBACK_COMPLETION_TEXT)) {
        setDialogComplete(true);
      }
    }
  }, [messages]);

  // Начальное сообщение от AI
  useEffect(() => {
    startNewDialog();
  }, []);

  const startNewDialog = () => {
    setMessages([]);
    setDialogComplete(false);
    setLoading(true);
    
    fetch(`${process.env.REACT_APP_FEEDBACK_AGENT_URL || 'http://localhost:8001'}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_message: "Привет, я хочу оставить отзыв",
        history: []
      })
    })
      .then(response => {
        if (!response.ok) throw new Error('Ошибка сервера');
        return response.json();
      })
      .then(data => {
        setMessages([
          { role: 'assistant', text: data.assistant_message }
        ]);
      })
      .catch(error => {
        console.error('Ошибка:', error);
        setMessages([
          { 
            role: 'assistant', 
            text: 'Здравствуйте! Я виртуальный помощник ресторана. Расскажите о вашем опыте посещения, что понравилось или не понравилось? Буду рад помочь и передать ваш отзыв руководству! 😊' 
          }
        ]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleResetDialog = () => {
    setResetConfirmOpen(true);
  };

  const confirmResetDialog = () => {
    setResetConfirmOpen(false);
    startNewDialog();
  };

  const cancelResetDialog = () => {
    setResetConfirmOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || dialogComplete) return;

    const userMessage = input.trim().slice(0, MAX_MESSAGE_LENGTH);
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_FEEDBACK_AGENT_URL || 'http://localhost:8001'}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_message: userMessage,
          history: messages.map(msg => ({
            role: msg.role,
            message: msg.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.assistant_message }]);
      
      // Проверяем здесь, завершил ли агент диалог
      if (data.assistant_message.includes(FEEDBACK_COMPLETION_TEXT)) {
        setDialogComplete(true);
      }
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: 'Извините, возникла проблема при обработке вашего сообщения. Пожалуйста, попробуйте еще раз или оставьте отзыв традиционным способом.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-block feedback-chat-container">
      <div className="feedback-header">
        <button onClick={() => navigate(-1)} className="back-button" aria-label="Назад">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="logo-container">
          <img src={zernoLogo} alt="Логотип Zerno" className="logo-image" />
        </div>
        <button 
          onClick={handleResetDialog}
          className="reset-button" 
          aria-label="Новый диалог"
          title="Начать новый диалог"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
            <path d="M2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12ZM12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6Z" 
                  stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 6V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      
      <div className="chat-card" ref={chatAreaRef}>
        <h2 className="chat-title">Чат с ассистентом</h2>
        <p className="chat-subtitle">Расскажите о своих впечатлениях, и мы передадим ваш отзыв руководству</p>
        
        <div className="messages-container">
          {messages.length === 0 && !loading ? (
            <div className="empty-chat">
              <div className="empty-chat-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p>Начинаем диалог...</p>
            </div>
          ) : (
            <div className="messages">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`message-wrapper ${message.role === 'user' ? 'user-wrapper' : 'assistant-wrapper'}`}
                >
                  <div className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}>
                    {message.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message-wrapper assistant-wrapper">
                  <div className="message assistant-message loading">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <div className="input-container">
          <form onSubmit={handleSubmit} className="message-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              placeholder={dialogComplete ? "Отзыв отправлен менеджеру" : "Напишите ваше сообщение..."}
              disabled={loading || dialogComplete}
              className={`message-input ${dialogComplete ? 'input-disabled' : ''}`}
              maxLength={MAX_MESSAGE_LENGTH}
            />
            {dialogComplete ? (
              <button 
                type="button" 
                onClick={startNewDialog}
                className="action-button new-dialog-button"
              >
                Новый отзыв
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={loading || !input.trim() || dialogComplete}
                className="action-button send-button"
              >
                <span>Отправить</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                  <path d="M12 5l7 7-7 7M5 12h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </form>
          
          {/* Счетчик символов - показывается, когда близко к лимиту */}
          {input.length > MAX_MESSAGE_LENGTH * 0.7 && !dialogComplete && (
            <div className="character-counter">
              {input.length}/{MAX_MESSAGE_LENGTH}
            </div>
          )}
        </div>
      </div>

      {/* Диалог подтверждения сброса */}
      {resetConfirmOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Сбросить диалог?</h3>
              <button onClick={cancelResetDialog} className="modal-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24">
                  <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <p>Все сообщения будут удалены и диалог начнется заново.</p>
            </div>
            <div className="modal-actions">
              <button onClick={cancelResetDialog} className="cancel-button">Отмена</button>
              <button onClick={confirmResetDialog} className="confirm-button">Сбросить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedbackChat;