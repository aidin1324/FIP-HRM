import React from 'react';

const mockContacts = [
    { id: '1', phone: '+996 312 345 678' },
    { id: '2', phone: '+996 312 987 654' },
    { id: '3', phone: '+996 312 112 233' },
    { id: '4', phone: '+996 312 234 567' },
    { id: '5', phone: '+996 312 987 654' },
];

const Contact = () => {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <h1 className="text-3xl font-bold text-center py-6 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                    ГОСТЕВАЯ БАЗА
                </h1>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    ID отзыва
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Телефон
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {mockContacts.map((contact) => (
                                <tr
                                    key={contact.id}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {contact.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {contact.phone}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Contact;