import { OrganizationRoles } from '@nestjs-bff/global/lib/constants/roles.constants';
import { IUserCredentials } from '@nestjs-bff/global/lib/interfaces/credentials.interface';
import { hasOrganizationRole, isSystemAdmin } from './authorizationcheck.utils';
import { ScopedAuthorizationCheck, ScopedData } from './scoped-authorizationcheck.interface';

export class CheckUserParam extends ScopedAuthorizationCheck {
  constructor() {
    super();
  }

  public async isAuthorized(credentials: IUserCredentials, scopedData: ScopedData): Promise<boolean> {
    if (!credentials) throw Error('No authentication credentials found');
    if (!scopedData.userIdForTargetResource) throw Error('userIdForTargetResource can not be null');

    // if self, then true
    // tslint:disable-next-line:triple-equals - necessary because requestingEntity.userId is actually an mongoId that evaluates to a string
    if (credentials.userId == scopedData.userIdForTargetResource) return true;

    // if system admin, then true
    if (isSystemAdmin(credentials)) return true;

    // if org admin, then true
    return hasOrganizationRole(credentials, scopedData.userIdForTargetResource, [OrganizationRoles.admin]);
  }
}
