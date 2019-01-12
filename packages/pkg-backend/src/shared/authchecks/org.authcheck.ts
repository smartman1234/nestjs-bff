import { AppError } from '../exceptions/app.exception';
import { AuthCheckContract } from './authcheck.contract';
import { hasOrganization, isStaffAdmin } from './authcheck.utils';
import { AuthorizationCheckParams } from './authorization-params';
import { ScopedData } from './scoped-data';

export class OrgAuthCheck extends AuthCheckContract<ScopedData, any> {
  public async isAuthorized(params: AuthorizationCheckParams<any, any>): Promise<boolean> {
    if (!params.targetResource || !params.targetResource.orgIdForTargetResource) throw new AppError('organizationSlugForRequestedResource can not be null');

    if (!params.accessPermissions) return false;
    if (isStaffAdmin(params.accessPermissions)) return true;
    return hasOrganization(params.accessPermissions, params.targetResource.orgIdForTargetResource);
  }
}
