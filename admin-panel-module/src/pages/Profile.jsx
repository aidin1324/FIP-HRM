import React from 'react';
// import Sidebar from '../partials/Sidebar';
// import Header from '../partials/Header';

function Profile() {
    // Example user data - replace with your actual user data
    const userData = {
        name: "John Doe",
        role: "Senior Developer",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        location: "New York, USA",
        stats: {
            projects: 24,
            tasks: 132,
            connections: 560,
            status: "Active"
        },
        recentActivity: [
            { id: 1, text: "Completed project milestone", time: "2 hours ago" },
            { id: 2, text: "Started new task", time: "4 hours ago" },
            { id: 3, text: "Team meeting", time: "6 hours ago" }
        ]
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* <Sidebar /> */}

            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                {/* <Header /> */}

                <main className="grow">
                    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                        <div className="flex flex-col col-span-full xl:col-span-8 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
                            {/* Header */}
                            <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                                <h2 className="font-semibold text-gray-800 dark:text-gray-100">User Profile</h2>
                            </header>
                            
                            <div className="p-5">
                                {/* Profile section */}
                                <div className="flex flex-col md:flex-row items-center md:items-start">
                                    {/* Avatar */}
                                    <div className="relative mb-4 md:mb-0 md:mr-4">
                                        <svg 
                                            className="w-24 h-24 text-gray-400 bg-gray-100 rounded-full p-2"
                                            fill="currentColor"
                                            viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                        <button className="absolute bottom-0 right-0 p-2 bg-violet-500 hover:bg-violet-600 text-white rounded-full shadow-sm">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16">
                                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                            </svg>
                                        </button>
                                    </div>

                                    {/* User info */}
                                    <div className="flex flex-col items-center md:items-start">
                                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{userData.name}</h2>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">{userData.role}</p>
                                        <div className="flex space-x-4 mb-4">
                                            <button className="btn bg-violet-500 hover:bg-violet-600 text-white">Edit Profile</button>
                                            <button className="btn border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300">Settings</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-0.5">Projects</div>
                                        <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{userData.stats.projects}</div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-0.5">Tasks</div>
                                        <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{userData.stats.tasks}</div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-0.5">Connections</div>
                                        <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{userData.stats.connections}</div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-0.5">Activity</div>
                                        <div className="text-2xl font-bold text-green-500">{userData.stats.status}</div>
                                    </div>
                                </div>

                                {/* Contact information */}
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Contact Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Email:</span>
                                            <span className="text-sm text-gray-800 dark:text-gray-100">{userData.email}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Phone:</span>
                                            <span className="text-sm text-gray-800 dark:text-gray-100">{userData.phone}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Location:</span>
                                            <span className="text-sm text-gray-800 dark:text-gray-100">{userData.location}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Recent Activity</h3>
                                    <div className="space-y-3">
                                        {userData.recentActivity.map((activity) => (
                                            <div key={activity.id} className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center mr-3">
                                                    <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 16 16">
                                                        <path d="M10 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{activity.text}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Profile;