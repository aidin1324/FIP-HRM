const API_CONFIG = {
  development: {
    baseURL: "http://localhost:8000",
  },
  production: {
    baseURL: "https://api.your-production-domain.com",
  },
  test: {
    baseURL: "http://localhost:8000",
  },
};

const ENV = process.env.NODE_ENV || "development";
const BASE_URL = API_CONFIG[ENV].baseURL;

const buildUrl = (endpoint) => `${BASE_URL}${endpoint}`;

const API = {
  auth: {
    login: buildUrl("/auth/login"),
    register: buildUrl("/registration_requests/register"),
    forgotPassword: buildUrl("/auth/forgot-password"),
    resetPassword: buildUrl("/auth/reset-password"),
  },

  users: {
    getAll: buildUrl("/users/get_user_with_pagination"),
    getById: (id) => buildUrl(`/users/get_user/${id}`),
    update: (id) => buildUrl(`/users/update_user/${id}`),
    delete: (id) => buildUrl(`/users/delete_user/${id}`),
  },

  registrationRequests: {
    getAll: buildUrl("/registration_requests/get_all"),
    updateStatus: buildUrl("/registration_requests/status"),
  },

  roles: {
    getAll: buildUrl("/roles/get_all"),
  },

  feedbacks: {
    getAll: buildUrl("/feedbacks/get_all_feedbacks"),
    getCustomerWaiterPaginated: buildUrl(
      "/comments/get-customer-waiter-feedbacks-paginated"
    ),
  },

  categories: {
    getAll: buildUrl("/categories/category"),
    create: buildUrl("/categories/category"),
    getById: (id) => buildUrl(`/categories/category/${id}`),
    update: (id) => buildUrl(`/categories/category/${id}`),
    delete: (id) => buildUrl(`/categories/category/${id}`),
  },

  feedbackType: {
    getAll: buildUrl("/feedback_type/feedback_type"),
    create: buildUrl("/feedback_type/feedback_type"),
    getById: (id) => buildUrl(`/feedback_type/feedback_type/${id}`),
    update: (id) => buildUrl(`/feedback_type/feedback_type/${id}`),
    delete: (id) => buildUrl(`/feedback_type/feedback_type/${id}`),
  },

  tags: {
    getAll: buildUrl("/tags/tag"),
    create: buildUrl("/tags/tag"),
    getById: (id) => buildUrl(`/tags/tag/${id}`),
    update: (id) => buildUrl(`/tags/tag/${id}`),
    delete: (id) => buildUrl(`/tags/tag/${id}`),
  },

  statistics: {
    getUserStats: (id) => buildUrl(`/stats/get_stats/${id}`),
    getUserTagsStats: (id) => buildUrl(`/stats/get_tags_stats/${id}`),
  },

  telegramConfig: {
    getAll: buildUrl(`/config_json/config/telegram_chat_ids`),
    create: buildUrl(`/config_json/config/telegram_chat_ids`),
    update: (id) => buildUrl(`/config_json/config/telegram_chat_ids/${id}`),
    delete: (id) => buildUrl(`/config_json/config/telegram_chat_ids/${id}`),
  },
};

export const CACHE_CONFIG = {
  "/roles/get_all": { maxAge: 3600000 },

  "/users/get_user_with_pagination": { maxAge: 300000 },

  "/feedbacks/get_all_feedbacks": { maxAge: 60000 },

  "/users/get_user/": { maxAge: 300000 },

  "/auth/login": false,
};

// Существующие экспорты
export const auth_login_path = API.auth.login;
export const send_register_request_path = API.auth.register;

// Новые экспорты для работы с паролями
export const forgot_password_path = API.auth.forgotPassword;
export const reset_password_path = API.auth.resetPassword;

// Остальные экспорты
export const get_request_path = API.registrationRequests.getAll;
export const approve_request_path = API.registrationRequests.updateStatus;
export const get_user_path = API.users.getAll;
export const patch_user_path = API.users.update;
export const get_roles_path = API.roles.getAll;
export const get_all_feedbacks = API.feedbacks.getAll;
export const get_user_profile_path = API.users.getById;
export const get_stats_dashboad_path = API.statistics.getUserStats;
export const get_user_tags_stat_path = API.statistics.getUserTagsStats;
export const get_customer_comments_path_with_param =
  API.feedbacks.getCustomerWaiterPaginated;

// Экспорты для работы с Telegram-чатами
export const get_telegram_config_path = API.telegramConfig.getAll;
export const create_telegram_config_path = API.telegramConfig.create;
export const update_telegram_config_path = API.telegramConfig.update;
export const delete_telegram_config_path = API.telegramConfig.delete;

export default API;
