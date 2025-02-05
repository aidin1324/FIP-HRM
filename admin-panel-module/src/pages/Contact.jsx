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
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-4xl mx-auto bg-white shadow rounded-lg overflow-hidden">
                <h1 className="text-3xl font-bold text-center py-6 border-b">
                    ГОСТЕВАЯ БАЗА
                </h1>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                    ID отзыва
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                    Телефон
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {mockContacts.map((contact) => (
                                <tr key={contact.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {contact.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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