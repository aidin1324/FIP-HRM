import React, { createContext, useState, useEffect } from 'react';
import { get_roles_path } from '../api_endpoints';

export const RoleContext = createContext({
  roles: {},
  loading: true,
  error: null
});

export const RoleProvider = ({ children }) => {
    const [roles, setRoles] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRoles = async () => {
            const storedRoles = sessionStorage.getItem('roles');
            if (storedRoles) {
                setRoles(JSON.parse(storedRoles));
                setLoading(false);
                return;
            }
            try {
                if (process.env.NODE_ENV === 'development') {
                    console.log('Fetching roles...');
                }
                const response = await fetch(get_roles_path);
                if (!response.ok) {
                    throw new Error('Не удалось загрузить роли');
                }
                const data = await response.json();
                const roleMap = {};
                data.forEach(role => {
                    roleMap[role.id] = role.role;
                });
                setRoles(roleMap);
                sessionStorage.setItem('roles', JSON.stringify(roleMap));
            } catch (err) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('Ошибка при загрузке ролей:', err.message);
                }
                setError('Ошибка при загрузке ролей.');
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    return (
        <RoleContext.Provider value={{ roles, loading, error }}>
            {children}
        </RoleContext.Provider>
    );
};