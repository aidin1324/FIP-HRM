import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// Исправленный импорт
import API from '../api_endpoints';

const MetadataContext = createContext();

export const useMetadata = () => useContext(MetadataContext);

export const MetadataProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [feedbackTypes, setFeedbackTypes] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка всех метаданных
  const fetchAllMetadata = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [categoriesRes, typesRes, tagsRes] = await Promise.all([
        axios.get(API.categories.getAll),
        axios.get(API.feedbackType.getAll),
        axios.get(API.tags.getAll)
      ]);
      
      setCategories(categoriesRes.data);
      setFeedbackTypes(typesRes.data);
      setTags(tagsRes.data);
    } catch (err) {
      setError('Ошибка загрузки метаданных');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Функции для категорий
  const createCategory = async (categoryData) => {
    try {
      const response = await axios.post(API.categories.create, categoryData);
      setCategories(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      throw new Error('Ошибка при создании категории');
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      const response = await axios.patch(API.categories.update(id), categoryData);
      setCategories(prev => prev.map(cat => cat.id === id ? response.data : cat));
      return response.data;
    } catch (err) {
      throw new Error('Ошибка при обновлении категории');
    }
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(API.categories.delete(id));
      setCategories(prev => prev.filter(cat => cat.id !== id));
      // При удалении категории, удалить связанные теги
      setTags(prev => prev.filter(tag => tag.category_id !== id));
      return true;
    } catch (err) {
      throw new Error('Ошибка при удалении категории');
    }
  };

  // Функции для типов фидбека
  const createFeedbackType = async (typeData) => {
    try {
      const response = await axios.post(API.feedbackType.create, typeData);
      setFeedbackTypes(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      throw new Error('Ошибка при создании типа фидбека');
    }
  };

  const updateFeedbackType = async (id, typeData) => {
    try {
      const response = await axios.patch(API.feedbackType.update(id), typeData);
      setFeedbackTypes(prev => prev.map(type => type.id === id ? response.data : type));
      return response.data;
    } catch (err) {
      throw new Error('Ошибка при обновлении типа фидбека');
    }
  };

  const deleteFeedbackType = async (id) => {
    try {
      await axios.delete(API.feedbackType.delete(id));
      setFeedbackTypes(prev => prev.filter(type => type.id !== id));
      return true;
    } catch (err) {
      throw new Error('Ошибка при удалении типа фидбека');
    }
  };

  // Функции для тегов
  const createTag = async (tagData) => {
    try {
      const response = await axios.post(API.tags.create, tagData);
      setTags(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      throw new Error('Ошибка при создании тега');
    }
  };

  const updateTag = async (id, tagData) => {
    try {
      const response = await axios.patch(API.tags.update(id), tagData);
      setTags(prev => prev.map(tag => tag.id === id ? response.data : tag));
      return response.data;
    } catch (err) {
      throw new Error('Ошибка при обновлении тега');
    }
  };

  const deleteTag = async (id) => {
    try {
      await axios.delete(API.tags.delete(id));
      setTags(prev => prev.filter(tag => tag.id !== id));
      return true;
    } catch (err) {
      throw new Error('Ошибка при удалении тега');
    }
  };

  useEffect(() => {
    fetchAllMetadata();
  }, [fetchAllMetadata]);

  return (
    <MetadataContext.Provider
      value={{
        categories,
        feedbackTypes,
        tags,
        isLoading,
        error,
        fetchAllMetadata,
        createCategory,
        updateCategory,
        deleteCategory,
        createFeedbackType,
        updateFeedbackType,
        deleteFeedbackType,
        createTag,
        updateTag,
        deleteTag
      }}
    >
      {children}
    </MetadataContext.Provider>
  );
};