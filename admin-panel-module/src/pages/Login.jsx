import React from 'react';
import { MDBContainer, MDBCol, MDBRow, MDBBtn, MDBIcon, MDBInput, MDBCheckbox } from 'mdb-react-ui-kit';

import '../css/style.css';

function Login() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 shadow-md rounded-xl">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center">Sign in to ZernoHub</h2>
                <form className="mt-8 space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="form-input w-full mt-1"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="form-input w-full mt-1"
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input type="checkbox" className="form-checkbox" />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">Remember me</span>
                        </label>
                        <div className="text-sm">
                            <a href="#" className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400">
                                Forgot your password?
                            </a>
                        </div>
                    </div>
                    <div>
                        <button type="submit" className="btn w-full bg-violet-500 hover:bg-violet-600 text-white">
                            Sign In
                        </button>
                    </div>
                    <div className="text-sm text-center">
                        Don't have an account?{' '}
                        <a href="/register" className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400">
                            Sign up
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default Login;