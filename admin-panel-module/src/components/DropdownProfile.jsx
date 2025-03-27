import React, { useState, useRef, useEffect, useCallback, useMemo, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Transition from '../utils/Transition';
import { AuthContext } from '../contexts/AuthContext';
import UserAvatar from '../images/user-avatar-32.png';
import { get_user_profile_path } from '../api_endpoints';
import AvatarSelector from './AvatarSelector'; 

const DropdownProfile = React.memo(({ align }) => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false); 

  const trigger = useRef(null);
  const dropdown = useRef(null);

  const getUserAvatar = useCallback((userId) => {
    if (!userId) return null;

    const savedAvatars = localStorage.getItem('userAvatars');
    const avatarsMap = savedAvatars ? JSON.parse(savedAvatars) : {};

    return avatarsMap[userId] || '/avatars/avatar_8.jpg';
  }, []);

  const saveUserAvatar = useCallback((userId, avatarUrl) => {
    if (!userId) return;

    const savedAvatars = localStorage.getItem('userAvatars');
    const avatarsMap = savedAvatars ? JSON.parse(savedAvatars) : {};

    avatarsMap[userId] = avatarUrl;

    localStorage.setItem('userAvatars', JSON.stringify(avatarsMap));
    localStorage.setItem('userAvatar', avatarUrl);
  }, []);

  const getUserRole = useCallback(() => {
    if (!userData) return '';

    const roleIdMapping = {
      1: 'Администратор',
      2: 'Менеджер',
      3: 'Официант'
    };

    const roleNameMapping = {
      'admin': 'Администратор',
      'manager': 'Менеджер',
      'waiter': 'Официант',
      'user': 'Пользователь'
    };

    if (userData.role_id && roleIdMapping[userData.role_id]) {
      return roleIdMapping[userData.role_id];
    }

    if (userData.role) {
      if (typeof userData.role === 'number' && roleIdMapping[userData.role]) {
        return roleIdMapping[userData.role];
      }
      
      if (typeof userData.role === 'string' && roleNameMapping[userData.role]) {
        return roleNameMapping[userData.role];
      }

      return userData.role;
    }

    return 'Пользователь';
  }, [userData]);

  const getDisplayName = useCallback(() => {
    if (!userData) return 'Загрузка...';
    
    if (userData.first_name && userData.second_name) {
      return `${userData.first_name} ${userData.second_name}`;
    } else if (userData.first_name) {
      return userData.first_name;
    } else if (userData.email) {
      return userData.email.split('@')[0];
    }
    return getUserRole();
  }, [userData, getUserRole]);

  const handleLogout = useCallback(() => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  }, [logout, navigate]);

  const handleAvatarSelect = useCallback((avatarUrl) => {
    setLoading(true);

    const userId = userData?.id || auth?.user?.id || auth?.id;

    if (userId) {
      saveUserAvatar(userId, avatarUrl);
    }

    setUserData(prev => ({
      ...prev,
      avatar: avatarUrl
    }));
    
    setShowAvatarSelector(false);
    setLoading(false);
  }, [userData, auth, saveUserAvatar]);

  useEffect(() => {
    if (auth) {
      setLoading(true);

      const userId = auth.id || auth.user_id || auth.user?.id;
      
      if (userId) {
        const controller = new AbortController();
        const signal = controller.signal;

        const apiUrl = get_user_profile_path(userId);
        
        fetch(apiUrl, {
          headers: {
            'Authorization': auth.token ? `Bearer ${auth.token}` : '',
            'Content-Type': 'application/json'
          },
          signal
        })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Ошибка при загрузке профиля: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          const userAvatar = getUserAvatar(userId);
          if (userAvatar) {
            data.avatar = userAvatar;
          }
          
          setUserData(data);
          setLoading(false);
        })
        .catch(err => {
          if (err.name === 'AbortError') {
            return; 
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.error('Ошибка загрузки профиля пользователя');
          }

          if (auth.user) {
            const userData = auth.user;
            const userAvatar = getUserAvatar(userId);
            if (userAvatar) {
              userData.avatar = userAvatar;
            }
            setUserData(userData);
          } else if (auth.email || auth.first_name) {
            const userData = {...auth};
            const userAvatar = getUserAvatar(userId);
            if (userAvatar) {
              userData.avatar = userAvatar;
            }
            setUserData(userData);
          }
          setLoading(false);
        });

        return () => controller.abort();
      } else {
        if (auth.user) {
          const userData = auth.user;
          const userAvatar = getUserAvatar(auth.user.id);
          if (userAvatar) {
            userData.avatar = userAvatar;
          }
          setUserData(userData);
        } else if (auth.email || auth.first_name) {
          const userData = {...auth};
          const userAvatar = getUserAvatar(auth.id);
          if (userAvatar) {
            userData.avatar = userAvatar;
          }
          setUserData(userData);
        }
        setLoading(false);
      }
    }
  }, [auth, getUserAvatar]);

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [dropdownOpen]);

  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [dropdownOpen]);

  const roleColorClass = useMemo(() => {
    if (!userData) return '';
    return userData.role_id === 1 || userData.role === 'admin' 
      ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' 
      : userData.role_id === 2 || userData.role === 'manager'
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
      : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
  }, [userData]);

  return (
    <>
      <div className="relative inline-flex">
        <button
          ref={trigger}
          className="inline-flex justify-center items-center group"
          aria-haspopup="true"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-expanded={dropdownOpen}
        >
          <div className="relative">
            <img 
              className={`w-8 h-8 rounded-full ${loading ? 'opacity-70' : ''}`} 
              src={userData?.avatar || UserAvatar} 
              width="32" 
              height="32" 
              alt={getDisplayName()} 
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-violet-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
            )}
          </div>
          
          <div className="flex items-center truncate">
            <span className="truncate ml-2 text-sm font-medium text-gray-600 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-white">
              {getDisplayName()}
            </span>
            <svg className="w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500" viewBox="0 0 12 12">
              <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
            </svg>
          </div>
        </button>

        <Transition
          className={`origin-top-right z-10 absolute top-full min-w-60 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'}`}
          show={dropdownOpen}
          enter="transition ease-out duration-200 transform"
          enterStart="opacity-0 -translate-y-2"
          enterEnd="opacity-100 translate-y-0"
          leave="transition ease-out duration-200"
          leaveStart="opacity-100"
          leaveEnd="opacity-0"
        >
          <div
            ref={dropdown}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => setDropdownOpen(false)}
          >
            <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-gray-200 dark:border-gray-700/60">
              {userData ? (
                <>
                  <div className="relative group mb-2 flex justify-center">
                    <img 
                      src={userData.avatar || UserAvatar} 
                      className="w-16 h-16 rounded-full object-cover group-hover:opacity-80 transition-opacity" 
                      alt={getDisplayName()} 
                    />
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAvatarSelector(true);
                      }}
                      className="absolute inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 rounded-full transition-opacity"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>

                  <div className="font-medium text-gray-800 dark:text-gray-100">{getDisplayName()}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {userData.email || 'Email не указан'}
                  </div>
                  <div className="flex items-center mt-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${roleColorClass}`}>
                      {getUserRole()}
                    </span>
                  </div>
                </>
              ) : (
                <div className="py-2 text-center text-sm text-gray-600 dark:text-gray-400">
                  Загрузка данных...
                </div>
              )}
            </div>
            <ul>
              <li>
                <Link
                  className="font-medium text-sm text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center py-1 px-3"
                  to="/my-profile"
                  onClick={() => setDropdownOpen(false)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Мой профиль
                </Link>
              </li>
              <li>
                <button
                  className="font-medium text-sm text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center py-1 px-3 w-full text-left"
                  onClick={handleLogout}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Выход
                </button>
              </li>
            </ul>
          </div>
        </Transition>
      </div>

      {showAvatarSelector && (
        <AvatarSelector 
          onSelect={handleAvatarSelect} 
          onClose={() => setShowAvatarSelector(false)}
          currentAvatar={userData?.avatar}
          defaultAvatar="/avatars/avatar_8.jpg"
        />
      )}
    </>
  );
});

export default DropdownProfile;