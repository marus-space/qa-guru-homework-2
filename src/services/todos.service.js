import { test } from '@playwright/test';
import { apiUrl, TOKEN_KEY } from '../helpers';

export class TodosService {
  constructor(request) {
    this.request = request;
    this.path = 'todos';
  }

  async get({ token, urlParams, requestHeaders }) {
    const params = urlParams
      ? `?${Object.entries(urlParams).map(([key, value]) => `${key}=${value}`).join('&')}`
      : '';
    
    return test.step(`GET /${this.path}${params}`, async () => {
      const response = await this.request.get(`${apiUrl}/${this.path}${params}`, {
        headers: {
          [TOKEN_KEY]: token,
          ...requestHeaders,
        },
      });

      const status = await response.status();
      const headers = await response.headers();
      const body = headers['content-type']?.includes('application/json')
        ? await response.json()
        : await response.text();
      
      return { status, headers, body };
    });
  }

  async getById({ token, id }) {
    return test.step(`GET /${this.path}/${id}`, async () => {
      const response = await this.request.get(`${apiUrl}/${this.path}/${id}`, {
        headers: {
          [TOKEN_KEY]: token,
        },
      });

      const status = await response.status();
      const statusText = response.statusText();
      const headers = await response.headers();
      const body = await response.json();
      
      return { status, statusText, headers, body };
    });
  }

  async post({ token, requestHeaders, data }) {
    return test.step(`POST /${this.path}`, async () => {
      const response = await this.request.post(`${apiUrl}/${this.path}`, {
        headers: {
          [TOKEN_KEY]: token,
          ...requestHeaders,
        },
        data,
      });

      const status = await response.status();
      const headers = await response.headers();
      const body = headers['content-type']?.includes('application/json')
        ? await response.json()
        : await response.text(); 
      
      return { status, headers, body };
    });
  }

  async postById({ token, id, data }) {
    return test.step(`POST /${this.path}/${id}`, async () => {
      const response = await this.request.post(`${apiUrl}/${this.path}/${id}`, {
        headers: {
          [TOKEN_KEY]: token,
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
          [TOKEN_KEY]: token,
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
          [TOKEN_KEY]: token,
        },
        data,
      });

      const status = await response.status();
      const statusText = response.statusText();
      const headers = await response.headers();
      const body = headers['content-type']?.includes('application/json')
        ? await response.json()
        : await response.text(); 
      
      return { status, statusText, headers, body };
    });
  }
}
