import React, { useState } from 'react';
import { useMetadata } from '../../contexts/MetadataContext';
import MetadataForm from './MetadataForm';
import ConfirmDialog from './ConfirmDialog';

function CategoriesManager() {
  const { categories, createCategory, updateCategory, deleteCategory } = useMetadata();
  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  const handleSubmit = async (data) => {
    try {
      if (editingItem) {
        await updateCategory(editingItem.id, data);
        setEditingItem(null);
      } else {
        await createCategory(data);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Ошибка при сохранении категории:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    
    try {
      await deleteCategory(deletingItem.id);
      setDeletingItem(null);
    } catch (error) {
      console.error('Ошибка при удалении категории:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Категории</h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-md shadow-sm"
          >
            Добавить категорию
          </button>
        )}
      </div>

      {isCreating && (
        <div className="mb-8 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Новая категория
          </h3>
          <MetadataForm
            fields={[{ name: 'category', label: 'Название категории', required: true }]}
            onSubmit={handleSubmit}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}

      {editingItem && (
        <div className="mb-8 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Редактирование категории
          </h3>
          <MetadataForm
            fields={[{ name: 'category', label: 'Название категории', required: true }]}
            initialValues={{ category: editingItem.category }}
            onSubmit={handleSubmit}
            onCancel={() => setEditingItem(null)}
          />
        </div>
      )}

      {/* Таблица категорий */}
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
            {categories.length === 0 ? (
              <tr className="bg-white dark:bg-gray-800">
                <td colSpan="3" className="px-4 py-3 text-center italic text-gray-500 dark:text-gray-400">
                  Нет доступных категорий
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">{category.id}</td>
                  <td className="px-4 py-3">{category.category}</td>
                  <td className="px-4 py-3 flex space-x-2">
                    <button
                      onClick={() => setEditingItem(category)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => setDeletingItem(category)}
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
          title="Удаление категории"
          message={`Вы уверены, что хотите удалить категорию "${deletingItem.category}"? Это действие также удалит все связанные теги.`}
          confirmLabel="Удалить"
          cancelLabel="Отмена"
          onConfirm={handleDelete}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </div>
  );
}

export default CategoriesManager;