import { RoleContext } from '../contexts/RoleContext';
import { AuthContext } from '../contexts/AuthContext'; 
import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { get_user_path, get_roles_path } from '../api_endpoints';
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

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        userId: null,
        userName: '',
        loading: false
    });

    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const confirmDelete = useCallback((userId, userName) => {
        setDeleteModal({
            isOpen: true,
            userId,
            userName,
            loading: false
        });
    }, []);

    const cancelDelete = useCallback(() => {
        setDeleteModal({
            isOpen: false,
            userId: null,
            userName: '',
            loading: false
        });
    }, []);

    const handleDeleteUser = useCallback(async () => {
        try {
            setDeleteModal(prev => ({ ...prev, loading: true }));
            
            if (!auth || !auth.access_token) {
                throw new Error('Ошибка авторизации. Пожалуйста, войдите снова.');
            }
            
            const response = await fetch(API.users.delete(deleteModal.userId), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${auth.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cascade: true,
                    deleted_by: auth.user_id || auth.id
                })
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

            setUsers(prevUsers => prevUsers.filter(user => user.id !== deleteModal.userId));
            
            setNotification({
                show: true,
                message: 'Пользователь успешно удален',
                type: 'success'
            });
            
            setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 3000);
        } catch (error) {
            console.error('Ошибка при удалении пользователя:', error);
            
            setNotification({
                show: true,
                message: `Ошибка при удалении пользователя: ${error.message}`,
                type: 'error'
            });
            
            setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 5000);
        } finally {
            cancelDelete();
        }
    }, [auth, deleteModal.userId, cancelDelete]);

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

    const canDeleteUser = useCallback((user) => {
        const userRole = user.role?.toLowerCase();
        const currentUserRole = getCurrentUserRole();
        
        const userId = String(user.id);
        const currentUserId = String(auth?.user_id || auth?.id || auth?.user?.id || '');
        
        const userEmail = user.email?.toLowerCase();
        const currentUserEmail = (auth?.email || auth?.user?.email || '').toLowerCase();
        
        const isCurrentUser = userId === currentUserId || 
                             (userEmail && currentUserEmail && userEmail === currentUserEmail);
        
        if (isCurrentUser) {
            return false;
        }
        
        if (!currentUserRole) return false;
        
        if (userRole === 'администратор' || userRole === 'админ' || userRole === 'admin') {
            return currentUserRole === 'администратор' || currentUserRole === 'админ' || currentUserRole === 'admin';
        }
        
        return ['admin', 'администратор', 'админ', 'manager', 'менеджер'].includes(currentUserRole);
    }, [auth, getCurrentUserRole]);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = new URL(get_user_path);
            url.searchParams.append('limit', 1000);

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
    };

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };

    useEffect(() => {
        if (!rolesLoading && !rolesError) {
            fetchUsers();
        }
    }, [searchTerm, selectedRole, usersPerPage, rolesLoading, rolesError]);

    const handleToggleActive = useCallback(async (userId) => {
        try {
            const user = currentUsers.find(u => u.id === userId);
            if (!user) return;
            
            const newActiveStatus = !user.active;

            const response = await fetch(API.users.update(userId), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.access_token}`
                },
                body: JSON.stringify({ active: newActiveStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update user status');
            }

            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === userId ? { ...user, active: newActiveStatus } : user
                )
            );

        } catch (error) {
            console.error('Ошибка при обновлении статуса пользователя:', error.message);
        }
    }, [auth, users]);

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
                                            <td colSpan="4" className="py-4 text-center text-gray-600 dark:text-gray-300">
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
                                                    {(function() {
                                                        const isCurrentUser = String(user.id) === String(auth?.user_id || auth?.id || '');
                                                        
                                                        if (isCurrentUser) {
                                                            return <span className="text-amber-500 text-xs italic">Нельзя удалить себя</span>;
                                                        } else if (!canDeleteUser(user)) {
                                                            return <span className="text-gray-400 text-xs italic">Нет доступа</span>;
                                                        } else {
                                                            return (
                                                                <button 
                                                                    onClick={() => confirmDelete(user.id, user.fullName)}
                                                                    className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                    title="Удалить пользователя"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            );
                                                        }
                                                    })()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!loading && !error && currentUsers.length > 0 && (
                        <div className="h-4"></div>
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

            {/* Модальное окно подтверждения удаления */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Подтверждение удаления
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-6">
                            Вы уверены, что хотите удалить пользователя <span className="font-semibold">{deleteModal.userName}</span>? 
                            <br></br>
                            Это действие невозможно отменить.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
                                onClick={cancelDelete}
                                disabled={deleteModal.loading}
                            >
                                Отмена
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center"
                                onClick={handleDeleteUser}
                                disabled={deleteModal.loading}
                            >
                                {deleteModal.loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Удаление...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                        Удалить
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Уведомления */}
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
        </div>
    );
}

export default Users;