import { test } from '@playwright/test';
import { apiUrl } from '../helpers';

export class TodosService {
  constructor(request) {
    this.request = request;
    this.path = 'todos';
  }

  async get({ token, params }) {
    const urlParams = params
      ? `?${Object.entries(params).map(([key, value]) => `${key}=${value}`)}`
      : '';
    
    return test.step(`GET /${this.path}/${urlParams}`, async () => {
      const response = await this.request.get(`${apiUrl}/${this.path}${urlParams}`, {
        headers: {
          'x-challenger': token,
        },
      });

      const status = await response.status();
      const headers = await response.headers();
      const body = await response.json();
      
      return { status, headers, body };
    });
  }

  async getById({ token, id }) {
    return test.step(`GET /${this.path}/${id}`, async () => {
      const response = await this.request.get(`${apiUrl}/${this.path}/${id}`, {
        headers: {
          'x-challenger': token,
        },
      });

      const status = await response.status();
      const statusText = response.statusText();
      const headers = await response.headers();
      const body = await response.json();
      
      return { status, statusText, headers, body };
    });
  }

  async post({ token, data }) {
    return test.step(`POST /${this.path}`, async () => {
      const response = await this.request.post(`${apiUrl}/${this.path}`, {
        headers: {
          'x-challenger': token,
        },
        data,
      });

      const status = await response.status();
      const headers = await response.headers();
      const body = await response.json();
      
      return { status, headers, body };
    });
  }

  async postById({ token, id, data }) {
    return test.step(`POST /${this.path}/${id}`, async () => {
      const response = await this.request.post(`${apiUrl}/${this.path}/${id}`, {
        headers: {
          'x-challenger': token,
        },
        data,
      });

      const status = await response.status();
      const headers = await response.headers();
      const body = await response.json();
      
      return { status, headers, body };
    });
  }

  async delete({ token, id }) {
    return test.step(`DELETE /${this.path}/${id}`, async () => {
      const response = await this.request.delete(`${apiUrl}/${this.path}/${id}`, {
        headers: {
          'x-challenger': token,
        },
      });

      const status = await response.status();
      const headers = await response.headers();
      
      return { status, headers };
    });
  }

  async putById({ token, id, data }) {
    return test.step(`PUT /${this.path}/${id}`, async () => {
      const response = await this.request.put(`${apiUrl}/${this.path}/${id}`, {
        headers: {
          'x-challenger': token,
        },
        data,
      });

      const status = await response.status();
      const statusText = response.statusText();
      const headers = await response.headers();

      let body;

      if (status === 200) {
        body = await response.json();
      }      
      
      return { status, statusText, headers, body };
    });
  }
}
