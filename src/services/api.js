const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ===== User API =====
  async getUsers(page = 1, limit = 10) {
    return this.request(`/users?page=${page}&limit=${limit}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: userData,
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: userData,
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== Teacher API =====
    async getTeachers(page = 1, limit = 10) {
    return this.request(`/teachers?page=${page}&limit=${limit}`);
}


  async getTeacherById(id) {
    return this.request(`/teachers/${id}`);
  }

  async createTeacher(teacherData) {
    return this.request('/teachers', {
      method: 'POST',
      body: teacherData,
    });
  }

  async updateTeacher(id, teacherData) {
    return this.request(`/teachers/${id}`, {
      method: 'PUT',
      body: teacherData,
    });
  }

  async deleteTeacher(id) {
    return this.request(`/teachers/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== Teacher Position API =====
  async getTeacherPositions() {
    return this.request('/teacher-positions');
  }

  async createTeacherPosition(positionData) {
    return this.request('/teacher-positions', {
      method: 'POST',
      body: positionData,
    });
  }

  async updateTeacherPosition(id, positionData) {
    return this.request(`/teacher-positions/${id}`, {
      method: 'PUT',
      body: positionData,
    });
  }

  async deleteTeacherPosition(id) {
    return this.request(`/teacher-positions/${id}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();
