import { UserCredentialsContract } from '@nestjs-bff/global/lib/interfaces/credentials.contract';
import { AuthCheckContract } from './authcheck.contract';
import { hasOrganizationRole, isSystemAdmin } from './authcheck.utils';
import { ScopedData } from './scoped-authcheck.contract';

export class CheckOrgRoles implements AuthCheckContract {
  constructor(private readonly qualifyingRoles: string[]) {}

  public async isAuthorized(credentials: UserCredentialsContract | undefined | null, scopedData: ScopedData): Promise<boolean> {
    if (!credentials) throw Error('No authentication credentials found');
    if (!scopedData.orgIdForTargetResource) throw Error('orgIdForTargetResource can not be null');

    if (isSystemAdmin(credentials)) return true;
    return hasOrganizationRole(credentials, scopedData.orgIdForTargetResource, this.qualifyingRoles);
  }
}
