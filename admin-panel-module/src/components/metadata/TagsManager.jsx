import React, { useState, useMemo } from 'react';
import { useMetadata } from '../../contexts/MetadataContext';
import MetadataForm from './MetadataForm';
import ConfirmDialog from './ConfirmDialog';

function TagsManager() {
  const { tags, categories, createTag, updateTag, deleteTag } = useMetadata();
  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Фильтрация тегов по выбранной категории
  const filteredTags = useMemo(() => {
    if (selectedCategory === 'all') {
      return tags;
    }
    return tags.filter(tag => tag.category_id === parseInt(selectedCategory));
  }, [tags, selectedCategory]);
  
  // Карта категорий для отображения названий категорий
  const categoriesMap = useMemo(() => {
    const map = {};
    categories.forEach(category => {
      map[category.id] = category.category;
    });
    return map;
  }, [categories]);

  const handleSubmit = async (data) => {
    try {
      if (editingItem) {
        await updateTag(editingItem.id, data);
        setEditingItem(null);
      } else {
        await createTag(data);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Ошибка при сохранении тега:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    
    try {
      await deleteTag(deletingItem.id);
      setDeletingItem(null);
    } catch (error) {
      console.error('Ошибка при удалении тега:', error);
    }
  };

  // Формируем поля для формы
  const fields = [
    { name: 'tag', label: 'Название тега', required: true },
    { 
      name: 'category_id', 
      label: 'Категория', 
      type: 'select',
      options: categories.map(cat => ({ value: cat.id, label: cat.category })),
      required: true 
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Теги</h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-md shadow-sm"
          >
            Добавить тег
          </button>
        )}
      </div>

      {isCreating && (
        <div className="mb-8 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Новый тег
          </h3>
          <MetadataForm
            fields={fields}
            onSubmit={handleSubmit}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}

      {editingItem && (
        <div className="mb-8 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
            Редактирование тега
          </h3>
          <MetadataForm
            fields={fields}
            initialValues={{ 
              tag: editingItem.tag,
              category_id: editingItem.category_id
            }}
            onSubmit={handleSubmit}
            onCancel={() => setEditingItem(null)}
          />
        </div>
      )}

      {/* Фильтр тегов по категории */}
      <div className="mb-4">
        <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Фильтр по категории:
        </label>
        <select
          id="categoryFilter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 text-sm"
        >
          <option value="all">Все категории</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.category}
            </option>
          ))}
        </select>
      </div>

      {/* Таблица тегов */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Название</th>
              <th className="px-4 py-3">Категория</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredTags.length === 0 ? (
              <tr className="bg-white dark:bg-gray-800">
                <td colSpan="4" className="px-4 py-3 text-center italic text-gray-500 dark:text-gray-400">
                  Нет доступных тегов
                </td>
              </tr>
            ) : (
              filteredTags.map((tag) => (
                <tr key={tag.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">{tag.id}</td>
                  <td className="px-4 py-3">{tag.tag}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      tag.category_id === 1 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      tag.category_id === 2 ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                      tag.category_id === 3 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {categoriesMap[tag.category_id] || `Категория ${tag.category_id}`}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex space-x-2">
                    <button
                      onClick={() => setEditingItem(tag)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => setDeletingItem(tag)}
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
          title="Удаление тега"
          message={`Вы уверены, что хотите удалить тег "${deletingItem.tag}"?`}
          confirmLabel="Удалить"
          cancelLabel="Отмена"
          onConfirm={handleDelete}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </div>
  );
}

export default TagsManager;