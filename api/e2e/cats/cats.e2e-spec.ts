import 'jest';
import supertest from 'supertest';
import { Test } from '@nestjs/testing';
import { CatsModule } from '../../src/cats/cats.module';
import { CatsService } from '../../src/cats/cats.service';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '../../src/auth/auth.service';
import { AccessTokenWithMetadata } from '../../src/auth/interfaces/jwt-accessTokenData.interface';
import { users } from '../../src/auth/users.const';

describe('Cats', () => {
  let app: INestApplication;
  let userAuthToken: AccessTokenWithMetadata;
  let staffAuthToken: AccessTokenWithMetadata;

  //
  // Setup mock data & services
  //
  const userJwtPayload = {
    user: users.find(user => user.username === 'user@mydomain.com'),
  };

  const staffJwtPayload = {
    user: users.find(user => user.username === 'staff@mydomain.com'),
  };

  const catsService = { findAll: () => ['test'] };

  beforeAll(async () => {
    //
    // Instantiate nest application
    //
    const module = await Test.createTestingModule({
      imports: [CatsModule],
    })
      .overrideProvider(CatsService)
      .useValue(catsService)
      .compile();

    app = module.createNestApplication();
    await app.init();

    userAuthToken = await app.get(AuthService).createToken(userJwtPayload);
    staffAuthToken = await app.get(AuthService).createToken(staffJwtPayload);
  });

  it(`/GET cats`, () => {
    return supertest(app.getHttpServer())
      .get('/cats')
      .expect(200)
      .expect({
        data: catsService.findAll(),
      });
  });

  it(`/GET cats with auth token`, () => {
    return supertest(app.getHttpServer())
      .get('/cats')
      .set('authorization', `Bearer ${userAuthToken}`)
      .expect(200)
      .expect({
        data: catsService.findAll(),
      });
  });

  it(`/GET protected cats without auth token`, () => {
    return supertest(app.getHttpServer())
      .get('/cats/protected')
      .expect(401);
  });

  it(`/GET protected cats with user auth token`, () => {
    return supertest(app.getHttpServer())
      .get('/cats/protected')
      .set('authorization', `Bearer ${userAuthToken.accessToken}`)
      .expect(403);
  });

  it(`/GET protected cats with staff auth token`, () => {
    return supertest(app.getHttpServer())
      .get('/cats/protected')
      .set('authorization', `Bearer ${staffAuthToken.accessToken}`)
      .expect(200)
      .expect({
        data: catsService.findAll(),
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
