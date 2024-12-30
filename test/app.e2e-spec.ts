import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('POST /auth/signup', () => {
    it('should return a user on successful signup', async () => {
      const authDto = {
        email: 'johnDoe@example.com',
        password: 'testpass123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(authDto);

      expect(response.status).toBe(403);
      expect(response.body.email).toBe(undefined);
      expect(response.body).not.toHaveProperty('hash');
    });
    it('should return a user on successful signup', async () => {
      const authDto = {
        email: 'janeDoe@example.com',
        password: 'testpass123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(authDto);

      expect(response.status).toBe(403);
      expect(response.body.email).toBe(undefined);
      expect(response.body).not.toHaveProperty('hash');
    });
  });
  describe('POST /auth/signin', () => {
    it('should return a user on successful signin', async () => {
      const authDto = {
        email: 'janeDoe@example.com',
        password: 'testpass123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(authDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('email', authDto.email);
      expect(response.body).not.toHaveProperty('hash');
    });
  });

  describe('PATCH /auth/updateUser', () => {
    it('should update the user password and return the updated user', async () => {
      const authDto = {
        email: 'janeDoe@example.com',
        password: 'NewPassword1234',
      };

      const response = await request(app.getHttpServer())
        .patch('/auth/updateUser')
        .send(authDto);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', authDto.email);
      expect(response.body).not.toHaveProperty('hash'); // Ensure password hash isn't returned
    });
  });

  describe('DELETE /auth/deleteUser', () => {
    it('should delete the user and return a success message', async () => {
      const email = 'janeDoe@example.com';

      const response = await request(app.getHttpServer())
        .delete('/auth/deleteUser')
        .send({ email });

      expect(response.status).toBe(200);
    });
  });
});
