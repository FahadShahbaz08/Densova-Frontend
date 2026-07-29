import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "https://densova.shop/backend/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("densova_token")
    : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("densova_token");
        localStorage.removeItem("densova_user");
      }
    }
    return Promise.reject(err);
  },
);

// â”€â”€ Public storefront â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  getReviews: (slug, params) =>
    api.get(`/products/${slug}/reviews`, { params }),
};
export const reviewsAPI = {
  getAll: (params) => api.get("/reviews", { params }),
  stats: () => api.get("/reviews/stats"),
  create: (payload) => api.post("/reviews", payload),
  canReview: (productId) => api.get(`/reviews/can-review/${productId}`),
};
export const announcementsAPI = {
  getActive: () => api.get("/announcements/active"),
};
export const newsletterAPI = {
  subscribe: (email) => api.post("/newsletter/subscribe", { email }),
};
export const contactAPI = {
  send: (payload) => api.post("/contact", payload),
};
export const uploadsAPI = {
  // For authenticated customer uploads (review photos, etc.)
  reviewImage: (file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/uploads/review-image", form, {
      headers: { "Content-Type": undefined },
    });
  },
};
export const ordersAPI = {
  create: (payload) => api.post("/orders", payload),
  lookup: (orderNumber, email) =>
    api.get(`/orders/${orderNumber}`, { params: { email } }),
  track: (payload) => api.post("/orders/track", payload),
};
export const settingsAPI = {
  getPublic: () => api.get("/settings/public"),
};
export const authAPI = {
  register: (payload) => api.post("/auth/register", payload),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

// â”€â”€ Admin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const adminAPI = {
  dashboard: {
    stats: () => api.get("/admin/dashboard/stats"),
  },

  upload: {
    image: (file) => {
      const form = new FormData();
      form.append("file", file);
      return api.post("/admin/upload", form, {
        headers: { "Content-Type": undefined },
      });
    },
  },

  products: {
    list: (params) => api.get("/admin/products", { params }),
    create: (payload) => api.post("/admin/products", payload),
    show: (id) => api.get(`/admin/products/${id}`),
    update: (id, body) => api.put(`/admin/products/${id}`, body),
    destroy: (id) => api.delete(`/admin/products/${id}`),
  },

  categories: {
    list: () => api.get("/admin/categories"),
    create: (payload) => api.post("/admin/categories", payload),
    update: (id, body) => api.put(`/admin/categories/${id}`, body),
    destroy: (id) => api.delete(`/admin/categories/${id}`),
  },

  orders: {
    list: (params) => api.get("/admin/orders", { params }),
    create: (payload) => api.post("/admin/orders", payload),
    show: (id) => api.get(`/admin/orders/${id}`),
    update: (id, body) => api.put(`/admin/orders/${id}`, body),
    destroy: (id) => api.delete(`/admin/orders/${id}`),
  },

  customers: {
    list: (params) => api.get("/admin/customers", { params }),
    create: (payload) => api.post("/admin/customers", payload),
    show: (id) => api.get(`/admin/customers/${id}`),
    update: (id, body) => api.put(`/admin/customers/${id}`, body),
    destroy: (id) => api.delete(`/admin/customers/${id}`),
  },

  reviews: {
    list: (params) => api.get("/admin/reviews", { params }),
    create: (payload) => api.post("/admin/reviews", payload),
    show: (id) => api.get(`/admin/reviews/${id}`),
    update: (id, body) => api.put(`/admin/reviews/${id}`, body),
    approve: (id) => api.post(`/admin/reviews/${id}/approve`),
    reject: (id) => api.post(`/admin/reviews/${id}/reject`),
    destroy: (id) => api.delete(`/admin/reviews/${id}`),
  },

  discounts: {
    list: (params) => api.get("/admin/discounts", { params }),
    create: (payload) => api.post("/admin/discounts", payload),
    show: (id) => api.get(`/admin/discounts/${id}`),
    update: (id, body) => api.put(`/admin/discounts/${id}`, body),
    changeStatus: (id, status) =>
      api.patch(`/admin/discounts/${id}/status`, { status }),
    destroy: (id) => api.delete(`/admin/discounts/${id}`),
  },

  campaigns: {
    list: () => api.get("/admin/campaigns"),
    create: (payload) => api.post("/admin/campaigns", payload),
    update: (id, body) => api.put(`/admin/campaigns/${id}`, body),
    destroy: (id) => api.delete(`/admin/campaigns/${id}`),
  },

  settings: {
    list: () => api.get("/admin/settings"),
    update: (key, body) => api.put(`/admin/settings/${key}`, body),
    save: (key, value, group = "admin", isPublic = false) =>
      api.put(`/admin/settings/${key}`, { value, group, is_public: isPublic }),
  },

  newsletter: {
    list: (params) => api.get("/admin/newsletter", { params }),
    stats: () => api.get("/admin/newsletter/stats"),
    create: (payload) => api.post("/admin/newsletter", payload),
    destroy: (id) => api.delete(`/admin/newsletter/${id}`),
  },

  contact: {
    list: (params) => api.get("/admin/contact", { params }),
    stats: () => api.get("/admin/contact/stats"),
    show: (id) => api.get(`/admin/contact/${id}`),
    update: (id, body) => api.put(`/admin/contact/${id}`, body),
    destroy: (id) => api.delete(`/admin/contact/${id}`),
  },
};

export default api;
