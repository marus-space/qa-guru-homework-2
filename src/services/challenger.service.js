import { test } from '@playwright/test';
import { apiUrl } from '../helpers';

export class ChallengerService {
  constructor(request) {
    this.request = request;
    this.path = 'challenger';
  }

  async post() {
    return test.step(`POST /${this.path}`, async () => {
      const response = await this.request.post(`${apiUrl}/${this.path}`);
      
      const status = await response.status();
      const headers = await response.headers();

      console.log(`${apiUrl}${headers.location}`);
      
      return { status, headers };
    });
  }
}
