import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { RoleContext } from '../contexts/RoleContext';
import { send_register_request_path } from '../api_endpoints';

function Register() {
    const navigate = useNavigate();
    const { roles, loading: rolesLoading, error: rolesError } = useContext(RoleContext);
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        role_id: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
   
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }
        setLoading(true);
        setError(null);

        const payload = {
            first_name: formData.firstName,
            second_name: formData.lastName,
            email: formData.email,
            hashed_password: formData.password, 
            status: "pending",
            role_id: parseInt(formData.role_id, 0)
        };
        //
        try {
        const response = await fetch(send_register_request_path, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Registration failed");
        }
        if (response.ok) {
            navigate('/after-register');
        }
        const data = await response.json();
        } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Ошибка регистрации');
        }
        setError(error.message);
        } finally {
        setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const filteredRoles = Object.entries(roles).filter(([id]) => Number(id) !== 1);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 shadow-md rounded-xl">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center">
                Создайте свой аккаунт
                </h2>
                
                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Электронный адрес
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="form-input w-full mt-1"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    {/* First Name */}
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Имя
                        </label>
                        <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            required
                            className="form-input w-full mt-1"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Last Name */}
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Фамилия
                        </label>
                        <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            required
                            className="form-input w-full mt-1"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Выбрать роль
                        </label>
                        <select
                            id="role"
                            name="role_id"
                            required
                            className="form-select w-full mt-1"
                            value={formData.role_id}
                            onChange={handleChange}
                        >
                            <option value="">Выбрать роль</option>
                            {filteredRoles.map(([id, role]) => (
                                <option key={id} value={id}>
                                {role.name || role}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Пароль
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="form-input w-full mt-1"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Подтвердить пароль
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            className="form-input w-full mt-1"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Terms Acceptance */}
                    <div className="flex items-center">
                        <input
                            id="acceptTerms"
                            name="acceptTerms"
                            type="checkbox"
                            required
                            className="form-checkbox"
                            checked={formData.acceptTerms}
                            onChange={handleChange}
                        />
                        <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                            Я принимаю{' '}
                            <a href="#" className="text-violet-500 hover:text-violet-600 dark:hover:text-violet-400">
                            условия и положения
                            </a>{' '}
                            ZernoHub
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn w-full bg-violet-500 hover:bg-violet-600 text-white"
                        >
                            {loading ? 'Отправка...' : 'Отправить запрос на регистрацию'}
                        </button>
                    </div>

                    {/* Error display */}
                    {error && (
                        <div className="text-red-500 text-center">
                            {error}
                        </div>
                    )}

                    {/* Login Link */}
                    <div className="text-sm text-center">
                        Уже есть аккаунт?{' '}
                        <Link to="/login" className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400">
                            Войти
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;