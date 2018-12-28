import { AuthHttpModule } from '@nestjs-bff/backend/lib/host/http/auth/auth.module';
import { AttachAuthenticationHttpMiddleware } from '@nestjs-bff/backend/lib/host/http/core/middleware/attach-authentication.middleware';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { WebAppHttpModule } from '../../src/app/host/http/web-app/web-app.module';

@Module({
  imports: [WebAppHttpModule, AuthHttpModule],
  controllers: [],
  providers: [],
  exports: undefined,
})
export class AuthE2eModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AttachAuthenticationHttpMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
