import { OrganizationRoles } from '@nestjs-bff/global/lib/constants/roles.constants';
import { AccessPermissionsContract } from '../../../../../pkg-global/lib/interfaces/access-permissions.contract';
import { AppError } from '../../../shared/exceptions/app.exception';
import { AuthCheckContract } from './authcheck.contract';
import { hasOrganizationRole, isStaffAdmin } from './authcheck.utils';
import { AuthorizationTarget } from './authorization-target';
import { ScopedData } from './scoped-data';

export class UserAuthCheck extends AuthCheckContract<ScopedData> {
  constructor() {
    super();
  }

  public async isAuthorized(accessPermissions: AccessPermissionsContract | undefined | null, target: AuthorizationTarget<ScopedData>): Promise<boolean> {
    if (!target || !target.resource || !target.resource.userIdForTargetResource) throw new AppError('userIdForTargetResource can not be null');

    if (!accessPermissions) return false;

    // if self, then true
    // tslint:disable-next-line:triple-equals - necessary because requestingEntity.userId is actually an mongoId that evaluates to a string
    if (accessPermissions.userId == target.resource.userIdForTargetResource) return true;

    // if system admin, then true
    if (isStaffAdmin(accessPermissions)) return true;

    // if doesn't have orgId, can't verify access through org scope.  Return false
    if (!target.resource.orgIdForTargetResource) return false;

    // if org admin, then true
    return hasOrganizationRole(accessPermissions, target.resource.orgIdForTargetResource, [OrganizationRoles.facilitator, OrganizationRoles.admin]);
  }
}
