export const auth_login_path = 'http://localhost:8000/auth/login';
export const send_register_request_path = 'http://localhost:8000/registration_requests/register';

export const get_user_path = 'http://localhost:8000/users/get_user_with_pagination';
export const patch_user_path = 'http://localhost:8000/users/update_user';
export const get_roles_path = "http://127.0.0.1:8000/roles/get_all"

export const get_user_profile_path = (id) => `http://localhost:8000/users/get_user/${id}`;
export const get_stats_dashboad_path = (id) => `http://localhost:8000/stats/get_stats/${id}`;
export const get_user_tags_stat_path = (id) => `http://localhost:8000/stats/get_tags_stats/${id}`;

export const get_customer_comments_path_with_param = 'http://localhost:8000/comments/get-customer-waiter-feedbacks-paginated';