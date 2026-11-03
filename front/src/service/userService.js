// src/service/userService.js
import api from './apiInstance';

const UserService = {
  getProfile: async () => {
    const { data } = await api.get('/auth/profile'); // ton endpoint actuel
    return data;
  },

  /**
   * Met à jour le profil de l'utilisateur
   * @param {number|string} id
   * @param {object} payload
   */
  updateProfile: async (id, payload) => {
    const body = {
      ...payload,
      ...(payload.age !== undefined && payload.age !== '' ? { age: Number(payload.age) } : {})
    };

    const { data } = await api.patch(`/users/${id}`, body);
    return data;
  },

  deleteAccount: async (id) => {
    const res = await api.delete(`/users/${id}`);
    if (!res.status.toString().startsWith('2')) {
      throw new Error('Erreur API');
    }
    return res.data;
  }
};

export default UserService;
