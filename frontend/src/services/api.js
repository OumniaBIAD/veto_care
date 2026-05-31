import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Token automatique
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Déconnexion auto si token expiré
api.interceptors.response.use(
    res => res,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/connexion';
        }
        return Promise.reject(error);
    }
);

// Auth
export const auth = {
    login:        (email, password) => api.post('/auth/login', { email, password }),
    register:     (data)            => api.post('/auth/register', data),
    verify:       ()                => api.get('/auth/verify'),
    updateProfile:(data)            => api.put('/auth/update-profile', data),
};

// Vétérinaires
export const veterinaires = {
    getAll:  ()         => api.get('/veterinaires'),
    getById: (id)       => api.get(`/veterinaires/${id}`),
    create:  (data)     => api.post('/veterinaires', data),
    update:  (id, data) => api.put(`/veterinaires/${id}`, data),
    delete:  (id)       => api.delete(`/veterinaires/${id}`),
    getMyProfile: ()    => api.get('/veterinaires/me'),
    updateMyProfile: (data) => api.put('/veterinaires/me', data),
};

// Services (prestations)
export const services = {
    getAll:  ()         => api.get('/services'),
    getById: (id)       => api.get(`/services/${id}`),
    create:  (data)     => api.post('/services', data),
    update:  (id, data) => api.put(`/services/${id}`, data),
    delete:  (id)       => api.delete(`/services/${id}`),
};

// Animaux
export const animaux = {
    getAll:        ()         => api.get('/animaux'),
    getMyAnimals:  ()         => api.get('/animaux/mes-animaux'),
    getByClient:   (clientId) => api.get(`/animaux/client/${clientId}`),
    getById:       (id)       => api.get(`/animaux/${id}`),
    create:        (data)     => api.post('/animaux', data),
    update:        (id, data) => api.put(`/animaux/${id}`, data),
    delete:        (id)       => api.delete(`/animaux/${id}`),
};

// Rendez-vous
export const rendezvous = {
    getAll:           ()            => api.get('/rendezvous'),
    getMyRendezVous:  ()            => api.get('/rendezvous/client'),
    getByClient:      (clientId)    => api.get(`/rendezvous/client/${clientId}`),
    getByVeterinaire: (id, date)    => api.get(`/rendezvous/veterinaire/${id}${date ? `?date=${date}` : ''}`),
    getVetRendezvous: ()            => api.get('/rendezvous/veterinaire'),
    getById:          (id)          => api.get(`/rendezvous/${id}`),
    create:           (data)        => api.post('/rendezvous', data),
    update:           (id, data)    => api.put(`/rendezvous/${id}`, data),
    updateStatus:     (id, statut)  => api.patch(`/rendezvous/${id}/status`, { statut }),
    delete:           (id)          => api.delete(`/rendezvous/${id}`),
};

// Produits
export const produits = {
    getAll:        ()         => api.get('/produits'),
    getById:       (id)       => api.get(`/produits/${id}`),
    getByCategorie:(cat)      => api.get(`/produits/categorie/${cat}`),
    create:        (data)     => api.post('/produits', data),
    update:        (id, data) => api.put(`/produits/${id}`, data),
    delete:        (id)       => api.delete(`/produits/${id}`),
};

// Commandes
export const commandes = {
    getAll:          ()         => api.get('/commandes'),
    getMesCommandes: ()         => api.get('/commandes/mes-commandes'),
    getById:         (id)       => api.get(`/commandes/${id}`),
    create:          (data)     => api.post('/commandes', data),
    updateStatus:    (id, stat) => api.patch(`/commandes/${id}/status`, { statut: stat }),
    annuler:         (id)       => api.post(`/commandes/${id}/annuler`),
};

// Profils Clients des Users
export const clients = {
    getAll:        ()     => api.get('/clients'),
    updateProfile: (data) => api.put('/clients/me', data),
    getCart:       ()     => api.get('/clients/me/cart'),
    saveCart:      (items) => api.post('/clients/me/cart', { items }),
};

export default api;