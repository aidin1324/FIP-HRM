import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const avatarOptions = [
  '/avatars/avatar_1.jpg',
  '/avatars/avatar_2.jpg',
  '/avatars/avatar_3.jpg',
  '/avatars/avatar_4.jpg',
  '/avatars/avatar_5.jpg',
  '/avatars/avatar_6.jpg',
  '/avatars/avatar_7.jpg',
  '/avatars/avatar_8.jpg',
];

const AvatarButton = React.memo(({ avatar, index, selectedAvatar, onSelect, onError }) => {
  const isSelected = selectedAvatar === avatar;

  const buttonClassName = useMemo(() => `w-16 h-16 rounded-full overflow-hidden border-2 hover:opacity-90 transition-all flex items-center justify-center ${
    isSelected 
    ? 'border-violet-500 dark:border-violet-400 ring-2 ring-offset-2 ring-violet-300 dark:ring-offset-gray-800' 
    : 'border-transparent'
  }`, [isSelected]);

  return (
    <div className="flex justify-center">
      <button
        className={buttonClassName}
        onClick={() => onSelect(avatar)}
      >
        <div className="w-full h-full relative">
          <img 
            src={avatar} 
            alt={`Аватар ${index + 1}`} 
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => onError(index)} 
            loading="lazy" 
          />
        </div>
      </button>
    </div>
  );
});

const AvatarSelector = ({ onSelect, onClose, currentAvatar, defaultAvatar = '/avatars/avatar_8.jpg' }) => {
  const [imgErrors, setImgErrors] = useState({});
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || defaultAvatar);

  useEffect(() => {
    if (!currentAvatar && defaultAvatar) {
      onSelect(defaultAvatar);
    }
  }, [currentAvatar, defaultAvatar, onSelect]);
  
  const handleSelect = useCallback((avatar) => {
    setSelectedAvatar(avatar);
    onSelect(avatar);
  }, [onSelect]);
  
  const handleImageError = useCallback((index) => {
    setImgErrors(prev => ({ ...prev, [index]: true }));
    if (process.env.NODE_ENV === 'development') {
      console.error(`Не удалось загрузить аватар: ${avatarOptions[index]}`);
    }
  }, []);

  const avatarGrid = useMemo(() => (
    <div className="grid grid-cols-4 gap-4 mb-4">
      {avatarOptions.map((avatar, index) => (
        imgErrors[index] ? (
          <div key={index} className="flex justify-center">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">Ошибка</span>
            </div>
          </div>
        ) : (
          <AvatarButton
            key={index}
            avatar={avatar}
            index={index}
            selectedAvatar={selectedAvatar}
            onSelect={handleSelect}
            onError={handleImageError}
          />
        )
      ))}
    </div>
  ), [imgErrors, selectedAvatar, handleSelect, handleImageError]);

  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-selector-title"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 id="avatar-selector-title" className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Выберите аватарку
          </h3>
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {avatarGrid}
      </div>
    </div>,
    document.body
  );
};

export default React.memo(AvatarSelector);