import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Register() {
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        role: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
    });

    const roles = [
        { id: 'farmer', label: 'Менеджер' },
        { id: 'trader', label: 'Официант' },
        { id: 'buyer', label: 'Повар' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add your registration logic here
        console.log('Form submitted:', formData);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 shadow-md rounded-xl">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center">Create your account</h2>
                
                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Email address
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
                            First Name
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
                            Last Name
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
                            Select Role
                        </label>
                        <select
                            id="role"
                            name="role"
                            required
                            className="form-select w-full mt-1"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="">Choose a role</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            Password
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
                            Confirm Password
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
                            I accept the <a href="#" className="text-violet-500 hover:text-violet-600 dark:hover:text-violet-400">terms and conditions</a> of ZernoHub
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            className="btn w-full bg-violet-500 hover:bg-violet-600 text-white"
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Login Link */}
                    <div className="text-sm text-center">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;