import request from 'supertest';
import app from '../../src/index';

describe('Auth API Integration (Real)', () => {
  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'cindy683',        
        password: 'password123',      
      });

    expect(res.status).toBe(200);
  });
});
