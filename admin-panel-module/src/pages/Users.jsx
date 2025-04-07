import { RoleContext } from '../contexts/RoleContext';
import { AuthContext } from '../contexts/AuthContext'; 
import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { get_user_path } from '../api_endpoints';
import API from '../api_endpoints';

function Users() {
    const { roles, loading: rolesLoading, error: rolesError } = useContext(RoleContext);
    const { auth } = useContext(AuthContext); 
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [usersPerPage, setUsersPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [authReady, setAuthReady] = useState(true); 
    const [refreshKey, setRefreshKey] = useState(0);

    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        userId: null,
        userName: '',
        userRole: '',
        loading: false,
        isAdminDelete: false
    });

    const [editModal, setEditModal] = useState({
        isOpen: false,
        userId: null,
        userData: null,
        loading: false,
        error: null
    });

    const forceRefresh = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const url = new URL(get_user_path);
            url.searchParams.append('limit', 1000);
            url.searchParams.append('_', Date.now()); // Добавляем timestamp для предотвращения кэширования

            if (searchTerm) {
                url.searchParams.append('search', searchTerm);
            }

            if (selectedRole) {
                const roleId = Object.entries(roles).find(
                    ([key, value]) => value.toLowerCase() === selectedRole.toLowerCase()
                )?.[0];
                
                if (roleId) {
                    url.searchParams.append('role_id', roleId);
                }
            }

            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();

            const transformedUsers = data.map(user => ({
                ...user,
                fullName: `${user.first_name} ${user.second_name}`,
                role: roles[user.role_id] ? capitalizeFirstLetter(roles[user.role_id]) : 'User',
            }));

            setUsers(transformedUsers);
            setCurrentPage(1); 
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, selectedRole, roles]);

    const forceUpdateUserList = useCallback(async () => {
        await fetchUsers();  // Полное обновление списка пользователей
    }, [fetchUsers]);

    const getCurrentUserRole = useCallback(() => {
        if (!auth) return null;
        
        if (auth.role) return auth.role.toLowerCase();
        if (auth.user?.role) return auth.user.role.toLowerCase();
        if (Array.isArray(auth.user?.roles) && auth.user.roles.length > 0) 
            return auth.user.roles[0].toLowerCase();
        if (typeof auth.user?.roles === 'string') 
            return auth.user.roles.toLowerCase();
        
        return null;
    }, [auth]);

    const canEditUser = useCallback((user) => {
        if (!auth || !user || !user.role) return false; // По умолчанию запрещаем доступ
        
        // Нормализуем роли для консистентного сравнения
        const normalizeRole = (role) => {
            if (!role) return '';
            role = String(role).toLowerCase();
            // Группируем варианты названий ролей
            if (['admin', 'администратор', 'админ'].includes(role)) return 'admin';
            if (['manager', 'менеджер'].includes(role)) return 'manager';
            if (['user', 'пользователь', 'официант', 'waiter'].includes(role)) return 'user';
            return role;
        };
        
        const userRole = normalizeRole(user.role);
        const currentUserRole = normalizeRole(getCurrentUserRole());
        
        // Проверка на редактирование самого себя
        const isCurrentUser = String(user.id) === String(auth?.user_id || auth?.id || auth?.user?.id || '');
        if (isCurrentUser) return false; // Запрещаем редактировать самого себя
        
        // Админ может редактировать всех, включая других админов
        if (currentUserRole === 'admin') {
            return true;
        }
        
        // Менеджер может редактировать только пользователей (не менеджеров и не админов)
        if (currentUserRole === 'manager') {
            return userRole === 'user';
        }
        
        // Все остальные не могут редактировать никого
        return false;
    }, [auth, getCurrentUserRole]);

    const canDeleteUser = useCallback((user) => {
        if (!auth || !user || !user.role) return false;
        
        const normalizeRole = (role) => {
            if (!role) return '';
            role = String(role).toLowerCase();
            if (['admin', 'администратор', 'админ'].includes(role)) return 'admin';
            if (['manager', 'менеджер'].includes(role)) return 'manager';
            if (['user', 'пользователь', 'официант', 'waiter'].includes(role)) return 'user';
            return role;
        };
        
        const userRole = normalizeRole(user.role);
        const currentUserRole = normalizeRole(getCurrentUserRole());
        
        // Запрещаем удалять самого себя
        const isCurrentUser = String(user.id) === String(auth?.user_id || auth?.id || auth?.user?.id || '');
        if (isCurrentUser) return false;

        // Админ может удалять всех, включая других админов
        if (currentUserRole === 'admin') {
            return true;
        }
        
        // Менеджер может удалять только пользователей
        if (currentUserRole === 'manager') {
            return userRole === 'user';
        }
        
        return false;
    }, [auth, getCurrentUserRole]);

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            forceRefresh();
        }, 100);
        
        return () => clearTimeout(timer);
    }, [forceRefresh]);

    useEffect(() => {
        if (!rolesLoading && !rolesError) {
            // Проверяем, были ли данные предварительно загружены недавно
            const lastPreload = localStorage.getItem('preloaded_users');
            const isRecentlyPreloaded = lastPreload && (Date.now() - parseInt(lastPreload)) < 5000; // 5 секунд
            
            if (!isRecentlyPreloaded) {
                fetchUsers();
            } else {
                // Если данные были недавно загружены, добавим небольшую задержку
                // чтобы не перезагружать сразу же после предзагрузки
                const timer = setTimeout(() => {
                    fetchUsers();
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [rolesLoading, rolesError, fetchUsers]);

    useEffect(() => {
        if (refreshKey > 0) {
            fetchUsers();
        }
    }, [refreshKey, fetchUsers]);

    useEffect(() => {
        if (users.length > 0) {
            const timer = setTimeout(() => {
                setAuthReady(prevAuthReady => {
                    return true;
                });
            }, 200);
            
            return () => clearTimeout(timer);
        }
    }, [users]);

    const handleToggleActive = useCallback(async (userId) => {
        try {
            const user = users.find(u => u.id === userId);
            if (!user) return;
            
            const newActiveStatus = !user.active;

            setUsers(prevUsers => 
                prevUsers.map(u => 
                    u.id === userId ? { ...u, active: newActiveStatus } : u
                )
            );

            const response = await fetch(API.users.update(userId), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.access_token}`
                },
                body: JSON.stringify({ active: newActiveStatus })
            });

            if (!response.ok) {
                setUsers(prevUsers => 
                    prevUsers.map(u => 
                        u.id === userId ? { ...u, active: !newActiveStatus } : u
                    )
                );
                throw new Error('Failed to update user status');
            }

            await forceUpdateUserList();

            setNotification({
                show: true,
                message: `Пользователь ${newActiveStatus ? 'активирован' : 'деактивирован'}`,
                type: 'success'
            });
            
            setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 2000);

        } catch (error) {
            setNotification({
                show: true,
                message: 'Ошибка при обновлении статуса пользователя',
                type: 'error'
            });
            
            setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 3000);
        }
    }, [auth, forceUpdateUserList, users]);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchSearch =
                user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchRole = selectedRole 
                ? user.role.toLowerCase() === selectedRole.toLowerCase() 
                : true;
            
            return matchSearch && matchRole;
        });
    }, [users, searchTerm, selectedRole]);

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const confirmDelete = useCallback((user) => {
        // Принудительно обновляем список перед проверкой прав
        forceUpdateUserList().then(() => {
            if (user && canDeleteUser(user)) {
                // Определяем, является ли пользователь админом
                const normalizeRole = (role) => {
                    if (!role) return '';
                    role = String(role).toLowerCase();
                    if (['admin', 'администратор', 'админ'].includes(role)) return 'admin';
                    return role;
                };
                
                const isAdminUser = normalizeRole(user.role) === 'admin';
                
                setDeleteModal({
                    isOpen: true,
                    userId: user.id,
                    userName: `${user.first_name || ''} ${user.second_name || ''}`.trim() || user.email || 'Пользователь',
                    userRole: user.role || '',
                    loading: false,
                    isAdminDelete: isAdminUser
                });
            } else {
                setNotification({
                    show: true,
                    message: 'У вас нет прав на удаление этого пользователя',
                    type: 'warning',
                });
                setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
            }
        });
    }, [canDeleteUser, forceUpdateUserList]);

    const cancelDelete = useCallback(() => {
        setDeleteModal({
            isOpen: false,
            userId: null,
            userName: '',
            userRole: '',
            loading: false,
            isAdminDelete: false
        });
    }, []);

    const handleDeleteUser = useCallback(async () => {
        try {
            setDeleteModal(prev => ({ ...prev, loading: true }));

            if (!auth || !auth.access_token) {
                throw new Error('Ошибка авторизации. Пожалуйста, войдите снова.');
            }

            const response = await fetch(`${API.users.delete(deleteModal.userId)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${auth.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || 'Ошибка при удалении пользователя');
            }

            // После успешного удаления - принудительно перезагружаем список пользователей
            await forceUpdateUserList();

            cancelDelete();

            setNotification({
                show: true,
                message: `Пользователь ${deleteModal.userName} успешно удален`,
                type: 'success'
            });

            setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 3000);

        } catch (error) {
            console.error('Ошибка при удалении пользователя:', error);
            setNotification({
                show: true,
                message: error.message || 'Произошла ошибка при удалении пользователя',
                type: 'error'
            });
            setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 3000);
        } finally {
            setDeleteModal(prev => ({ ...prev, loading: false }));
        }
    }, [auth, deleteModal.userId, deleteModal.userName, cancelDelete, forceUpdateUserList]);

    const openEditModal = useCallback((user) => {
        forceUpdateUserList().then(() => {
            const canEdit = canEditUser(user);
            if (canEdit) {
                setEditModal({
                    isOpen: true,
                    userId: user.id,
                    userData: user,
                    loading: false,
                    error: null
                });
            } else {
                setNotification({
                    show: true,
                    message: 'У вас нет прав на редактирование этого пользователя',
                    type: 'warning'
                });
                setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
            }
        });
    }, [canEditUser, forceUpdateUserList]);

    const closeEditModal = useCallback(() => {
        setEditModal({
            isOpen: false,
            userId: null,
            userData: null,
            loading: false,
            error: null
        });
    }, []);

    const handleUpdateUser = useCallback(async (formData) => {
        try {
            setEditModal(prev => ({ ...prev, loading: true, error: null }));
            
            if (!auth || !auth.access_token) {
                throw new Error('Ошибка авторизации. Пожалуйста, войдите снова.');
            }
            
            const dataToSend = {
                first_name: formData.get('first_name'),
                second_name: formData.get('second_name'),
                email: formData.get('email'),
                role_id: Number(formData.get('role_id')),
                active: formData.get('active') === 'on'
            };
            
            const response = await fetch(API.users.update(editModal.userId), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${auth.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.detail || errorData.message || `Ошибка ${response.status}`;
                } catch {
                    errorMessage = `Ошибка ${response.status}: ${errorText || response.statusText}`;
                }
                throw new Error(errorMessage);
            }
            
            const updatedUserData = await response.json();
            
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === editModal.userId ? {
                        ...user,
                        first_name: updatedUserData.first_name,
                        second_name: updatedUserData.second_name,
                        email: updatedUserData.email,
                        role_id: updatedUserData.role_id,
                        role: roles[updatedUserData.role_id] ? capitalizeFirstLetter(roles[updatedUserData.role_id]) : 'User',
                        active: updatedUserData.active,
                        fullName: `${updatedUserData.first_name} ${updatedUserData.second_name}`
                    } : user
                )
            );

            await forceUpdateUserList();
            
            closeEditModal();
            
            setNotification({
                show: true,
                message: 'Пользователь успешно обновлен',
                type: 'success'
            });
            
            setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 3000);
            
        } catch (error) {
            setEditModal(prev => ({ 
                ...prev, 
                loading: false,
                error: error.message 
            }));
        }
    }, [auth, editModal.userId, roles, closeEditModal, forceUpdateUserList]);

    const DeleteConfirmModal = ({ deleteModal, handleDeleteUser, cancelDelete }) => {
        const [confirmText, setConfirmText] = useState('');
        const isAdmin = deleteModal.isAdminDelete;
        
        // Определяем требуемый текст подтверждения - имя и фамилия администратора
        const requiredText = isAdmin 
            ? `${deleteModal.userName}`.trim() 
            : "";
        
        const isConfirmed = isAdmin ? confirmText === requiredText : true;
        
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Улучшенный фон с размытием */}
                <div className="fixed inset-0 backdrop-blur-sm bg-black/40 dark:bg-black/60 transition-opacity" aria-hidden="true"></div>
                
                {/* Контейнер модального окна */}
                <div className="relative w-full max-w-md p-6 mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all">
                    {/* Заголовок */}
                    <div className="flex items-start">
                        <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                {isAdmin ? "Удаление администратора" : "Удаление пользователя"}
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Вы уверены, что хотите удалить пользователя{" "}
                                <span className="font-semibold">
                                    {deleteModal.userName}
                                </span>{" "}
                                ({deleteModal.userRole})?
                            </p>
                            
                            {isAdmin && (
                                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-md">
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        <strong>Внимание!</strong> Удаление пользователя с правами администратора может повлиять на работу системы.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Поле подтверждения для админа */}
                    {isAdmin && (
                        <div className="mt-5">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Для подтверждения введите полное имя администратора: <span className="font-semibold">{requiredText}</span>
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                placeholder="Введите имя и фамилию"
                                autoFocus
                            />
                        </div>
                    )}
                    
                    {/* Кнопки */}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                            onClick={cancelDelete}
                            disabled={deleteModal.loading}
                        >
                            Отмена
                        </button>
                        <button
                            type="button"
                            className={`px-4 py-2 rounded-md text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                isConfirmed 
                                    ? "bg-red-600 hover:bg-red-700 focus:ring-red-500" 
                                    : "bg-red-400 cursor-not-allowed"}`}
                            onClick={handleDeleteUser}
                            disabled={!isConfirmed || deleteModal.loading}
                        >
                            {deleteModal.loading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Удаление...
                                </div>
                            ) : "Удалить"}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen w-full bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col h-full">
                <div className="px-4 pt-4">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Пользователи</h1>
                    <div className="flex flex-col md:flex-row gap-4 mb-6 justify-center md:justify-between">
                        <input
                            type="text"
                            placeholder="Поиск по имени или почте..."
                            className="form-input px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 w-full md:w-1/2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            className="form-select px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 w-full md:w-1/4"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            <option value="">Все роли</option>
                            {Object.values(roles).map(role => (
                                <option key={role} value={role.toLowerCase()}>
                                    {role === "admin" ? "Админ" : 
                                     role === "manager" ? "Менеджер" : 
                                     role === "user" ? "Пользователь" : role}
                                </option>
                            ))}
                        </select>
                        <select
                            className="form-select px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 w-full md:w-1/4"
                            value={usersPerPage}
                            onChange={(e) => setUsersPerPage(Number(e.target.value))}
                        >
                            <option value={10}>10 стр.</option>
                            <option value={20}>20 стр.</option>
                            <option value={50}>50 стр.</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-28"> 
                    {loading ? (
                        <div className="text-center text-gray-700 dark:text-gray-200 py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4"></div>
                            Загрузка пользователей...
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-10">{error}</div>
                    ) : (
                        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow mb-4"> 
                            <table className="min-w-full table-auto text-sm text-left">
                                <thead className="border-b bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="py-3 px-4">Имя</th>
                                        <th className="py-3 px-4">Почта</th>
                                        <th className="py-3 px-4">Роль</th>
                                        <th className="py-3 px-4">Активен</th>
                                        <th className="py-3 px-4 text-center">Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-4 text-center text-gray-600 dark:text-gray-300">
                                                Пользователей не найдено.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentUsers.map((user) => (
                                            <tr key={user.id} className="border-b last:border-0">
                                                <td className="py-3 px-4">
                                                    <a href={`/profile/${user.id}`} className="text-violet-500 hover:underline">
                                                        {user.fullName}
                                                    </a>
                                                </td>
                                                <td className="py-3 px-4">{user.email}</td>
                                                <td className="py-3 px-4 capitalize">{user.role}</td>
                                                <td className="py-3 px-4">
                                                    <label className="inline-flex relative items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={user.active}
                                                            className="sr-only peer"
                                                            onChange={() => handleToggleActive(user.id)}
                                                        />
                                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-300 rounded-full peer dark:bg-gray-600 peer-checked:bg-violet-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                                                    </label>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <button 
                                                            onClick={() => openEditModal(user)}
                                                            className={`p-1 rounded-full ${canEditUser(user) 
                                                                ? 'text-blue-500 hover:text-blue-700 hover:bg-gray-100 dark:hover:bg-gray-700' 
                                                                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
                                                            title={canEditUser(user) ? "Редактировать пользователя" : "Нет прав на редактирование"}
                                                            disabled={!canEditUser(user)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button 
                                                            onClick={() => confirmDelete(user)}
                                                            className={`p-1 rounded-full ${canDeleteUser(user) 
                                                                ? 'text-red-500 hover:text-red-700 hover:bg-gray-100 dark:hover:bg-gray-700' 
                                                                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
                                                            title={canDeleteUser(user) ? "Удалить пользователя" : "Нет прав на удаление"}
                                                            disabled={!canDeleteUser(user)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className="sticky bottom-0 left-0 right-0 bg-gray-50 dark:bg-gray-900 shadow-md border-t border-gray-200 dark:border-gray-700 py-4 px-4 z-10">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                currentPage === 1
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-violet-500 text-white hover:bg-violet-600'
                            }`}
                        >
                            Пред.
                        </button>
                        <span className="text-gray-700 dark:text-gray-200">
                            Страница {currentPage}/{totalPages || 1}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages || 1))}
                            disabled={currentPage === (totalPages || 1) || totalPages === 0}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                currentPage === (totalPages || 1) || totalPages === 0
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-violet-500 text-white hover:bg-violet-600'
                            }`}
                        >
                            След.
                        </button>
                    </div>
                </div>
            </div>

            {notification.show && (
                <div className={`fixed top-16 left-1/2 transform -translate-x-1/2 p-4 rounded-md shadow-lg z-50 ${
                    notification.type === 'success' ? 'bg-green-500' : 
                    notification.type === 'error' ? 'bg-red-500' : 
                    'bg-yellow-500'
                } text-white min-w-[300px] text-center animate-fade-in flex items-center justify-center`}>
                    <div className="flex items-center">
                        {notification.type === 'success' && (
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        )}
                        {notification.type === 'error' && (
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        )}
                        {notification.type === 'warning' && (
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                        )}
                        {notification.message}
                    </div>
                </div>
            )}

            {deleteModal.isOpen && (
                <DeleteConfirmModal 
                    deleteModal={deleteModal} 
                    handleDeleteUser={handleDeleteUser} 
                    cancelDelete={cancelDelete} 
                />
            )}

            {editModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Редактирование пользователя
                        </h3>
                        {editModal.error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {editModal.error}
                            </div>
                        )}
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdateUser(new FormData(e.target));
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Имя
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        defaultValue={editModal.userData?.first_name || ''}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Фамилия
                                    </label>
                                    <input
                                        type="text"
                                        name="second_name"
                                        defaultValue={editModal.userData?.second_name || ''}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        defaultValue={editModal.userData?.email || ''}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        required
                                    />
                                </div>
                                {/* Выбор роли с проверкой доступа для менеджеров */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Роль
                                    </label>
                                    {getCurrentUserRole() === 'admin' || 
                                     getCurrentUserRole() === 'администратор' || 
                                     getCurrentUserRole() === 'админ' ? (
                                        <select
                                            name="role_id"
                                            defaultValue={editModal.userData?.role_id || ''}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            required
                                        >
                                            {Object.entries(roles).map(([id, role]) => (
                                                <option key={id} value={id}>
                                                    {role === "admin" ? "Админ" : 
                                                     role === "manager" ? "Менеджер" : 
                                                     role === "user" ? "Пользователь" : role}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <>
                                            <input 
                                                type="hidden" 
                                                name="role_id" 
                                                value={editModal.userData?.role_id || ''} 
                                            />
                                            <div className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
                                                {roles[editModal.userData?.role_id] === "admin" ? "Админ" : 
                                                 roles[editModal.userData?.role_id] === "manager" ? "Менеджер" : 
                                                 roles[editModal.userData?.role_id] === "user" ? "Пользователь" : 
                                                 roles[editModal.userData?.role_id] || "Неизвестная роль"}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div>
                                    <label className="inline-flex relative items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="active"
                                            defaultChecked={editModal.userData?.active}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-300 rounded-full peer dark:bg-gray-600 peer-checked:bg-violet-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">Активен</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
                                    onClick={closeEditModal}
                                    disabled={editModal.loading}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-violet-500 text-white rounded hover:bg-violet-600 transition-colors flex items-center"
                                    disabled={editModal.loading}
                                >
                                    {editModal.loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Сохранение...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            Сохранить
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Users;