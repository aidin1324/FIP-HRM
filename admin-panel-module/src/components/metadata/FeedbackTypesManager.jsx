import React, { useState } from 'react';
import { useMetadata } from '../../contexts/MetadataContext';
import MetadataForm from './MetadataForm';
import ConfirmDialog from './ConfirmDialog';

function FeedbackTypesManager() {
  const { feedbackTypes, createFeedbackType, updateFeedbackType, deleteFeedbackType } = useMetadata();
  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  const handleSubmit = async (data) => {
    try {
      if (editingItem) {
        await updateFeedbackType(editingItem.id, data);
        setEditingItem(null);
      } else {
        await createFeedbackType(data);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Ошибка при сохранении типа фидбека:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    
    try {
      await deleteFeedbackType(deletingItem.id);
      setDeletingItem(null);
    } catch (error) {
      console.error('Ошибка при удалении типа фидбека:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Типы фидбека
        </h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-md shadow-sm"
          >
            Добавить тип
          </button>
        )}
      </div>

      {isCreating && (
        <div className="mb-8 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Новый тип фидбека
          </h3>
          <MetadataForm
            fields={[{ name: 'feedback_type', label: 'Название типа', required: true }]}
            onSubmit={handleSubmit}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}

      {editingItem && (
        <div className="mb-8 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Редактирование типа фидбека
          </h3>
          <MetadataForm
            fields={[{ name: 'feedback_type', label: 'Название типа', required: true }]}
            initialValues={{ feedback_type: editingItem.feedback_type }}
            onSubmit={handleSubmit}
            onCancel={() => setEditingItem(null)}
          />
        </div>
      )}

      {/* Таблица типов фидбека */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Название</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {feedbackTypes.length === 0 ? (
              <tr className="bg-white dark:bg-gray-800">
                <td colSpan="3" className="px-4 py-3 text-center italic text-gray-500 dark:text-gray-400">
                  Нет доступных типов фидбека
                </td>
              </tr>
            ) : (
              feedbackTypes.map((type) => (
                <tr key={type.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">{type.id}</td>
                  <td className="px-4 py-3">{type.feedback_type}</td>
                  <td className="px-4 py-3 flex space-x-2">
                    <button
                      onClick={() => setEditingItem(type)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => setDeletingItem(type)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Диалог подтверждения удаления */}
      {deletingItem && (
        <ConfirmDialog
          title="Удаление типа фидбека"
          message={`Вы уверены, что хотите удалить тип "${deletingItem.feedback_type}"? Это может повлиять на существующие отзывы.`}
          confirmLabel="Удалить"
          cancelLabel="Отмена"
          onConfirm={handleDelete}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </div>
  );
}

export default FeedbackTypesManager;