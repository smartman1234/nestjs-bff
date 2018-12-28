import { Module } from '@nestjs/common';
import { UserAuthApplicationModule } from '../../../application/user-auth/user-auth.module';
import { AuthenticationModule } from '../../../domain/authentication/authentication.module';
import { AuthorizationModule } from '../../../domain/authorization/authorization.module';
import { CoreHttpModule } from '../core/core.module';
import { OrganizationHttpController } from './organization.controller';

@Module({
  imports: [CoreHttpModule, UserAuthApplicationModule, AuthenticationModule, AuthorizationModule],
  controllers: [OrganizationHttpController],
  providers: [],
  exports: [],
})
export class HttpAuthModule {}
