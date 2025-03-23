import { RoleContext } from '../contexts/RoleContext';
import React, { useState, useEffect, useContext } from 'react';
import { get_user_path, patch_user_path, get_roles_path } from '../api_endpoints';

function Users() {
    const { roles, loading: rolesLoading, error: rolesError } = useContext(RoleContext);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [usersPerPage, setUsersPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    const handleToggleActive = async (id) => {
        try {
            const userToUpdate = users.find(user => user.id === id);
            if (!userToUpdate) {
                throw new Error('User not found');
            }

            const response = await fetch(`${patch_user_path}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ active: !userToUpdate.active }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user status');
            }

            const updatedUser = await response.json();

            setUsers(prevUsers => prevUsers.map(user => 
                user.id === id ? { 
                    ...user, 
                    active: updatedUser.active, 
                    fullName: `${updatedUser.first_name} ${updatedUser.second_name}`,
                    role: roles[updatedUser.role_id] || 'user',
                } : user
            ));
        } catch (err) {
            console.error(err);
            alert('Ошибка при переключении статуса пользователя.');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchSearch =
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchRole = selectedRole 
            ? user.role.toLowerCase() === selectedRole.toLowerCase() 
            : true;
        
        return matchSearch && matchRole;
    });

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const goToPage = (num) => setCurrentPage(num);

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
                            <option value={5}>5 стр.</option>
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
        </div>
    );
}

export default Users;