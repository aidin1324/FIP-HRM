import React, { useState } from 'react';

function Users() {
    const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', active: true },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'manager', active: true },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'manager', active: true },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'user', active: true },
        { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', role: 'user', active: true },
        { id: 6, name: 'Eve Wilson', email: 'eve@example.com', role: 'admin', active: true },
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', active: true },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'manager', active: true },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'manager', active: true },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'user', active: true },
        { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', role: 'user', active: true },
        { id: 6, name: 'Eve Wilson', email: 'eve@example.com', role: 'admin', active: true },
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', active: true },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'manager', active: true },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'manager', active: true },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'user', active: true },
        { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', role: 'user', active: true },
        { id: 6, name: 'Eve Wilson', email: 'eve@example.com', role: 'admin', active: true },
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', active: true },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'manager', active: true },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'manager', active: true },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'user', active: true },
        { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', role: 'user', active: true },
        { id: 6, name: 'Eve Wilson', email: 'eve@example.com', role: 'admin', active: true },
        
        // ...добавьте при необходимости
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage, setUsersPerPage] = useState(5);

    const handleToggleActive = (id) => {
        console.log('Toggle user with ID:', id);
    };

    const filteredUsers = mockUsers.filter((user) => {
        const matchSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = selectedRole ? user.role === selectedRole : true;
        return matchSearch && matchRole;
    });

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const goToPage = (num) => setCurrentPage(num);

    return (
        <div className="p-4 space-y-4 h-screen overflow-y-auto pb-36">
                <h1 className="text-xl font-semibold">Users</h1>
                <div className="flex flex-col md:flex-row gap-2">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="form-input px-3 py-2 border rounded md:w-1/3"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                    <select
                        className="form-select px-3 py-2 border rounded md:w-1/4"
                        value={selectedRole}
                        onChange={(e) => {
                            setSelectedRole(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">All roles</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="user">User</option>
                    </select>
                    <select
                        className="form-select px-3 py-2 border rounded md:w-1/4"
                        value={usersPerPage}
                        onChange={(e) => {
                            setUsersPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                </div>

                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow">
                    <table className="min-w-full text-sm text-left">
                        <thead className="border-b bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="py-3 px-4">Name</th>
                                <th className="py-3 px-4">Email</th>
                                <th className="py-3 px-4">Role</th>
                                <th className="py-3 px-4">Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map((user) => (
                                <tr key={user.id} className="border-b last:border-0">
                                    <td className="py-3 px-4">{user.name}</td>
                                    <td className="py-3 px-4">{user.email}</td>
                                    <td className="py-3 px-4">{user.role}</td>
                                    <td className="py-3 px-4">
                                        <label className="inline-flex relative items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={user.active}
                                                className="sr-only peer"
                                                onChange={() => handleToggleActive(user.id)}
                                            />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-300 rounded-full peer dark:bg-gray-600 peer-checked:bg-violet-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Пагинация */}
                <div className="flex justify-center items-center space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                        <button
                            key={num}
                            onClick={() => goToPage(num)}
                            className={`px-3 py-1 text-sm rounded ${
                                currentPage === num
                                    ? 'bg-violet-500 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
                            }`}
                        >
                            {num}
                        </button>
                    ))}
                </div>
            </div>
            
    );
}

export default Users;