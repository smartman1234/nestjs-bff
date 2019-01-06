import { CreateOrganizationMemberCommand } from '@nestjs-bff/global/lib/commands/auth/create-organization-member.command';
import { OrganizationRoles } from '@nestjs-bff/global/lib/constants/roles.constants';
import { Body, Controller, Post } from '@nestjs/common';
import { OrganizationOrchestrationService } from '../../../application/organization-orchestration/organization-orchestration.service';
import { CheckOrgRoles } from '../../../domain/core/authchecks/org-roles.authcheck';
import { Authorization } from '../core/decorators/authorization.decorator';

@Controller('organization')
export class OrganizationOrchestrationController {
  constructor(private readonly organizationService: OrganizationOrchestrationService) {}

  @Post('create-member')
  @Authorization([new CheckOrgRoles([OrganizationRoles.admin])])
  async createOrganizationMember(@Body() cmd: CreateOrganizationMemberCommand): Promise<void> {
    await this.organizationService.createMember(cmd);
  }
}
