import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NPS-form.css';
import zernoLogo from '../components/img/logo.png';

const GET_USER_BY_PAGINATION_AND_SORT = 'http://127.0.0.1:8000/users/get_user_with_pagination'; // Replace with your actual endpoint
const SUBMIT_FEEDBACK = 'http://127.0.0.1:8000/feedbacks/create'; 
function NPSForm() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [ratings, setRatings] = useState({
    serviceSpeed: 0,
    atmosphere: 0,
    waiterRecommendation: 0,
  });
  const [selectedWaiterId, setSelectedWaiterId] = useState(null); 
  const [isNameToggled, setIsNameToggled] = useState(true);

  const [contact, setContact] = useState('');

  const [errors, setErrors] = useState({});
  const [waiterComment, setWaiterComment] = useState('');
  const [selectedWaiterTag, setSelectedWaiterTag] = useState(null);

  const [waiters, setWaiters] = useState([]); 
  const [isLoading, setIsLoading] = useState(false); 
  const [fetchError, setFetchError] = useState(null); 

  const [isSubmitting, setIsSubmitting] = useState(false); 

  const tags = {
    positive: [
      { id: 1, label: 'Вежливость' },
      { id: 2, label: 'Быстрота' },
      { id: 3, label: 'Внимательность' },
      { id: 4, label: 'Знание меню' },
      { id: 5, label: 'Чистота' },
      { id: 6, label: 'Атмосфера общения' },
    ],
    negative: [
      { id: 7, label: 'Грубость' },
      { id: 8, label: 'Медлительность' },
      { id: 9, label: 'Игнорирование' },
      { id: 10, label: 'Ошибки в заказе' },
      { id: 11, label: 'Неряшливость' },
      { id: 12, label: 'Отказ в помощи' },
    ],
    neutral: [
      { id: 13, label: 'Оперативность' },
      { id: 14, label: 'Уважение' },
      { id: 15, label: 'Информативность' },
      { id: 16, label: 'Качество подачи' },
      { id: 17, label: 'Вовлечённость' },
      { id: 18, label: 'Реакции на запросы' },
    ],
  };

  useEffect(() => {
    const fetchWaiters = async () => {
      setIsLoading(true);
      const params = new URLSearchParams({
        role: 'официант',
        cursor: 0,
        limit: 100,
        sort_by: "first_name",
        ascending: "true", 
        active: "true",
      });
      try {
        const response = await fetch(`${GET_USER_BY_PAGINATION_AND_SORT}?${params.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error('Не удалось загрузить список официантов.');
        }
        const data = await response.json();
        const modifiedData = data.map(waiter => ({
          id: waiter.id,
          name: `${waiter.first_name} ${waiter.second_name.substring(0, 3)}.`,
        }));
        setWaiters(modifiedData);
      } catch (error) {
        setFetchError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaiters();
  }, []);

  const handleTagChange = (e) => {
    setSelectedWaiterTag(parseInt(e.target.value));
  };

  const handleNext = () => {
    const newErrors = {};

    if (currentStep === 1) {
      const { serviceSpeed, atmosphere } = ratings;
      if (serviceSpeed === 0 || atmosphere === 0) {
        newErrors.ratings = 'Пожалуйста, оцените все категории перед продолжением.';
      }
    }

    if (currentStep === 2) {
      if (isNameToggled && !selectedWaiterId) {
        newErrors.name = 'Пожалуйста, выберите официанта.';
      }

      if (isNameToggled) {
        if (ratings.waiterRecommendation === 0) {
          newErrors.waiterRecommendation = 'Пожалуйста, поставьте оценку от 1 до 5.';
        }
        if (ratings.waiterRecommendation > 0 && !selectedWaiterTag) {
          newErrors.selectedWaiterTag = 'Пожалуйста, выберите один тег.';
        }
      }
    }

    if (currentStep === 3) {
      if (contact.trim() === '') {
        newErrors.contact = 'Пожалуйста, введите контактный номер.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep(currentStep - 1);
  };

  const validateContact = (contactValue) => {
    if (!contactValue || contactValue.trim() === '') {
      return 'Пожалуйста, введите контактный номер.';
    }

    const digitsOnly = contactValue.replace(/\D/g, '');

    if (digitsOnly.length < 5) {
      return 'Номер телефона слишком короткий.';
    }
    
    return null; 
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    const newErrors = {};

    if (isNameToggled && !selectedWaiterId) {
      newErrors.name = 'Пожалуйста, выберите официанта.';
    }
    
    if (isNameToggled) {
      if (ratings.waiterRecommendation === 0) {
        newErrors.waiterRecommendation = 'Пожалуйста, поставьте оценку от 1 до 5.';
      }
      if (ratings.waiterRecommendation > 0 && !selectedWaiterTag) {
        newErrors.selectedWaiterTag = 'Пожалуйста, выберите один тег.';
      }
    }

    const contactError = validateContact(contact);
    if (contactError) {
      newErrors.contact = contactError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; 
    }

    setIsSubmitting(true);
    setErrors({});

    const category_id = ratings.waiterRecommendation >= 4 && ratings.waiterRecommendation <= 5
      ? 1
      : ratings.waiterRecommendation === 3
      ? 2
      : 3;

    const dataToSend = {
      is_notified: false,
      contact: contact.trim(), 
      waiter_score: {
        waiter_id: isNameToggled ? selectedWaiterId : null,
        score: isNameToggled ? ratings.waiterRecommendation : null,
        comment: isNameToggled && waiterComment.trim() !== '' ? waiterComment : null,
        tag_id: isNameToggled ? selectedWaiterTag : null,
        category_id: category_id,
      },
      ratings: [
        {
          rating: ratings.serviceSpeed,
          feedback_type_id: 1,
        },
        {
          rating: ratings.atmosphere,
          feedback_type_id: 2,
        },
      ],
    };

    try {
      const response = await fetch(SUBMIT_FEEDBACK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        navigate('/outro');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrors({ 
          submit: errorData.message || 'Произошла ошибка при отправке данных. Пожалуйста, попробуйте позже.' 
        });
      }
    } catch (error) {
      setErrors({ 
        submit: 'Ошибка сети. Пожалуйста, проверьте ваше соединение и попробуйте снова.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (category, max) => {
    return [...Array(max)].map((_, index) => {
      const ratingValue = index + 1;
      return (
        <span
          key={index}
          className={`nps-star ${ratings[category] >= ratingValue ? 'checked' : ''}`}
          onClick={() => setRatings({ ...ratings, [category]: ratingValue })}
          role="button"
          tabIndex={0}
          aria-label={`Оценка ${ratingValue}`}
        >
          &#9733;
        </span>
      );
    });
  };

  const getTagCategory = () => {
    const rating = ratings.waiterRecommendation;
    if (rating >= 1 && rating <= 2) {
      return 'negative';
    } else if (rating === 3) {
      return 'neutral';
    } else if (rating >= 4 && rating <= 5) {
      return 'positive';
    }
    return null;
  };

  const getDynamicQuestion = () => {
    const rating = ratings.waiterRecommendation;
    if (rating >= 1 && rating <= 2) {
      return 'Что вас особенно разочаровало в работе официанта?';
    } else if (rating === 3) {
      return 'Что бы вы предложили улучшить в работе официанта?';
    } else if (rating >= 4 && rating <= 5) {
      return 'Что именно вам особенно понравилось в работе официанта?';
    }
    return '';
  };

  const currentTagCategory = getTagCategory();
  const dynamicQuestion = getDynamicQuestion();

  return (
    <div className="nps-main-block">
      <div className="nps-first-block">
        <img src={zernoLogo} alt="Логотип Zerno" className="nps-logo" />
        <button onClick={() => navigate(-1)} className="nps-back" aria-label="Назад"></button>
      </div>
      <div className={`nps-second-block step-${currentStep}`}>
        {/* STEP 1 */}
        {currentStep === 1 && (
          <>
            <h2 className="nps-title">Пожалуйста, оцените следующие категории:</h2>
            {errors.ratings && <p className="error-message">{errors.ratings}</p>}

            <div className="grade-item">
              <p>1. Скорость обслуживания:</p>
              <div className="stars">{renderStars('serviceSpeed', 5)}</div>
            </div>

            <div className="grade-item">
              <p>2. Атмосфера:</p>
              <div className="stars">{renderStars('atmosphere', 5)}</div>
            </div>

            <div className="navigation-buttons">
              <button type="button" className="next-btn" onClick={handleNext}>
                Далее
              </button>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <>
            <h2 className="nps-title">Форма оценки официанта</h2>
            <div className="nps-contact-section">
              <span className="nps-label">Указать официанта:</span>
              <label className="nps-switch">
                <input
                  type="checkbox"
                  checked={isNameToggled}
                  onChange={() => {
                    setIsNameToggled(!isNameToggled);
                    setSelectedWaiterId(null); // Reset waiter selection when toggled
                    setSelectedWaiterTag(null); // Reset tag selection when toggled
                    setWaiterComment(''); // Reset comment when toggled
                  }}
                />
                <span className="nps-slider"></span>
              </label>
            </div>

            {isNameToggled && (
              <>
                {isLoading ? (
                  <p>Загрузка...</p>
                ) : fetchError ? (
                  <p className="error-message">Ошибка: {fetchError}</p>
                ) : (
                  <select
                    value={selectedWaiterId || ""}
                    onChange={(e) => setSelectedWaiterId(parseInt(e.target.value))}
                    className="nps-input"
                    aria-label="Выбор официанта"
                  >
                    <option value="">Выберите официанта</option>
                    {waiters.map((waiter) => (
                      <option key={waiter.id} value={waiter.id}>
                        {waiter.name}
                      </option>
                    ))}
                  </select>
                )}
                {/* Display errors in prioritized order */}
                {errors.name && <p className="error-message">{errors.name}</p>}
                {errors.waiterRecommendation && <p className="error-message">{errors.waiterRecommendation}</p>}

                <div className="grade-item">
                  <p>3. Рекомендовали бы официанта друзьям (1-5):</p>
                  <div className="stars">{renderStars('waiterRecommendation', 5)}</div>
                </div>

                {ratings.waiterRecommendation > 0 && (
                  <>
                    <p className="dynamic-question">{dynamicQuestion}</p>
                    <div className="tag-section">
                      {currentTagCategory ? (
                        <div className="tags-container">
                          {tags[currentTagCategory].map((tag) => (
                            <label key={tag.id} className={`tag-label ${currentTagCategory}`}>
                              <input
                                type="radio"
                                name="waiterTag"
                                value={tag.id}
                                checked={selectedWaiterTag === tag.id}
                                onChange={handleTagChange}
                              />
                              {tag.label}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="error-message">Пожалуйста, установите оценку, чтобы выбрать тег.</p>
                      )}
                      {errors.selectedWaiterTag && (
                        <p className="error-message">{errors.selectedWaiterTag}</p>
                      )}
                    </div>

                    <textarea
                      className="nps-text-area"
                      placeholder="Оставьте комментарий об официанте..."
                      value={waiterComment}
                      onChange={(e) => setWaiterComment(e.target.value)}
                    ></textarea>
                    {/* Removed error message for waiterComment since it's optional */}
                  </>
                )}
              </>
            )}

            <div className="navigation-buttons">
              <button type="button" className="next-btn" onClick={handleNext}>
                Далее
              </button>
              <button type="button" className="back-btn" onClick={handleBack}>
                Назад
              </button>
            </div>
          </>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <>
            <h2 className="nps-title">Контактная информация:</h2>
            {/* Удаляем переключатель и оставляем только поле ввода */}
            <p className="nps-label">Укажите ваш контактный номер:</p>
            <input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Введите контактный номер"
              className="nps-input"
              aria-label="Контактный номер"
              required
            />
            {errors.contact && <p className="error-message">{errors.contact}</p>}
            
            <div className="navigation-buttons">
              <button 
                type="button" 
                className="submit-btn" 
                onClick={handleSubmit}
                disabled={isSubmitting} // Блокируем кнопку во время отправки
              >
                {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
              </button>
              <button 
                type="button" 
                className="back-btn" 
                onClick={handleBack}
                disabled={isSubmitting} // Блокируем кнопку во время отправки
              >
                Назад
              </button>
            </div>
            {errors.submit && <p className="error-message">{errors.submit}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default NPSForm;