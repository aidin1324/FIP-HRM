const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:8000',
  },
  production: {
    baseURL: 'https://api.your-production-domain.com', 
  },
  test: {
    baseURL: 'http://localhost:8000',
  }
};

const ENV = process.env.NODE_ENV || 'development';
const BASE_URL = API_CONFIG[ENV].baseURL;

const buildUrl = (endpoint) => `${BASE_URL}${endpoint}`;

const API = {
  auth: {
    login: buildUrl('/auth/login'),
    register: buildUrl('/registration_requests/register'),
  },
  
  users: {
    getAll: buildUrl('/users/get_user_with_pagination'),
    getById: (id) => buildUrl(`/users/get_user/${id}`),
    update: (id) => buildUrl(`/users/update_user/${id}`),
  },
  
  registrationRequests: {
    getAll: buildUrl('/registration_requests/get_all'),
    updateStatus: buildUrl('/registration_requests/status'),
  },
  
  roles: {
    getAll: buildUrl('/roles/get_all'),
  },
  
  feedbacks: {
    getAll: buildUrl('/feedbacks/get_all_feedbacks'),
    getCustomerWaiterPaginated: buildUrl('/comments/get-customer-waiter-feedbacks-paginated'),
  },
  
  statistics: {
    getUserStats: (id) => buildUrl(`/stats/get_stats/${id}`),
    getUserTagsStats: (id) => buildUrl(`/stats/get_tags_stats/${id}`),
  }
};

export const auth_login_path = API.auth.login;
export const send_register_request_path = API.auth.register;
export const get_request_path = API.registrationRequests.getAll;
export const approve_request_path = API.registrationRequests.updateStatus;
export const get_user_path = API.users.getAll;
export const patch_user_path = API.users.update;
export const get_roles_path = API.roles.getAll;
export const get_all_feedbacks = API.feedbacks.getAll;
export const get_user_profile_path = API.users.getById;
export const get_stats_dashboad_path = API.statistics.getUserStats;
export const get_user_tags_stat_path = API.statistics.getUserTagsStats;
export const get_customer_comments_path_with_param = API.feedbacks.getCustomerWaiterPaginated;

export default API;