// Desc: A page to display all users, search and filter users by name, email, and role, and toggle user active status.
// Нужно понять
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
            url.searchParams.append('limit', 1000); // Fetch all users for client-side pagination

            if (searchTerm) {
                url.searchParams.append('search', searchTerm);
            }
            if (selectedRole) {
                url.searchParams.append('role_id', Object.keys(roles).find(
                    (key) => roles[key] === selectedRole.toLowerCase()
                ));
            }

            const response = await fetch(url.toString());
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();

            // Transform users data
            const transformedUsers = data.map(user => ({
                ...user,
                fullName: `${user.first_name} ${user.second_name}`,
                role: roles[user.role_id] || 'user',
            }));

            setUsers(transformedUsers);
            setCurrentPage(1); // Reset to first page after fetching
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!rolesLoading && !rolesError) {
            fetchUsers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

            // Update the user locally
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

    // Client-side Pagination Logic
    const filteredUsers = users.filter(user => {
        const matchSearch =
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = selectedRole ? user.role === selectedRole : true;
        return matchSearch && matchRole;
    });

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const goToPage = (num) => setCurrentPage(num);

    return (
        <div className="flex flex-col h-screen w-full bg-gray-50 dark:bg-gray-900">
            <div className="flex-1 p-4 overflow-y-auto">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Users</h1>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="form-input px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 w-full md:w-1/3"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                        }}
                    />
                    <select
                        className="form-select px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 w-full md:w-1/4"
                        value={selectedRole}
                        onChange={(e) => {
                            setSelectedRole(e.target.value);
                        }}
                    >
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="user">User</option>
                    </select>
                    <select
                        className="form-select px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 w-full md:w-1/4"
                        value={usersPerPage}
                        onChange={(e) => {
                            setUsersPerPage(Number(e.target.value));
                        }}
                    >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                </div>

                {loading ? (
                    <div className="text-center text-gray-700 dark:text-gray-200">Loading...</div>
                ) : error ? (
                    <div className="text-center text-red-500">{error}</div>
                ) : (
                    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow">
                        <table className="min-w-full table-auto text-sm text-left">
                            <thead className="border-b bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="py-3 px-4">Name</th>
                                    <th className="py-3 px-4">Email</th>
                                    <th className="py-3 px-4">Role</th>
                                    <th className="py-3 px-4">Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-4 text-center text-gray-600 dark:text-gray-300">
                                            No users found.
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

                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-6">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            currentPage === 1
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-violet-500 text-white hover:bg-violet-600'
                        }`}
                    >
                        Prev
                    </button>
                    <span className="text-gray-700 dark:text-gray-200">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            currentPage === totalPages
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-violet-500 text-white hover:bg-violet-600'
                        }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );

}

export default Users;