import React, { useState } from 'react';
import DatePickerWithRange from '../components/Datepicker';

function Contacts() {
  // Пример данных контактов
  const initialContacts = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', phone: '123-456-7890', date: '2023-10-01' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', phone: '098-765-4321', date: '2023-10-02' },
    { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', phone: '555-555-5555', date: '2023-10-03' },
    { id: 4, name: 'Bob Brown', email: 'bob.brown@example.com', phone: '444-444-4444', date: '2023-10-04' },
    { id: 5, name: 'Charlie Davis', email: 'charlie.davis@example.com', phone: '333-333-3333', date: '2023-10-05' },
    { id: 6, name: 'Diana Miller', email: 'diana.miller@example.com', phone: '222-222-2222', date: '2023-10-06' },
    { id: 7, name: 'Eve Wilson', email: 'eve.wilson@example.com', phone: '111-111-1111', date: '2023-10-07' },
    { id: 8, name: 'Frank Moore', email: 'frank.moore@example.com', phone: '000-000-0000', date: '2023-10-08' },
    // Добавьте больше контактов по необходимости
  ];

  const [contacts] = useState(initialContacts);
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 5;
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  // Логика клиентской пагинации
  const filteredContacts = contacts.filter(contact => {
    const contactDate = new Date(contact.date);
    const { from, to } = dateRange;
    return (!from || contactDate >= from) && (!to || contactDate <= to);
  });

  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 dark:bg-gray-900 p-4">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Contacts Section</h1>
      <div className="mb-4">
        <DatePickerWithRange
          className="rounded-md border border-gray-300 dark:border-gray-600"
          onSelect={setDateRange}
        />
      </div>
      <div className="space-y-4">
        {currentContacts.length > 0 ? (
          currentContacts.map((contact) => (
            <div
              key={contact.id}
              className="border-b border-gray-200 dark:border-gray-700 pb-2"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {contact.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(contact.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{contact.phone}</p>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-300">No contacts found.</div>
        )}
      </div>
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
  );
}

export default Contacts;