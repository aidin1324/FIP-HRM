export const get_roles_path = 'http://localhost:8000/roles/get_all';
export const auth_login_path = 'http://localhost:8000/auth/login';
export const get_user_path = 'http://localhost:8000/users/get_user_with_pagination';
export const get_user_profile_path = (id) => `http://localhost:8000/users/get_user/${id}`;

export const CACHE_CONFIG = {
  "/roles/get_all": { maxAge: 3600000 },
  "/users/get_user_with_pagination": { maxAge: 300000 },
  "/feedbacks/get_all_feedbacks": { maxAge: 60000 },
  "/users/get_user/": { maxAge: 300000 },
  "/auth/login": false,
};