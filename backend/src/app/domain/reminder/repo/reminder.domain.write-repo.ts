import { BaseRepoWrite } from '@nestjs-bff/backend/lib/domain/core/repo/base.repo-write';
import { LoggerSharedService } from '@nestjs-bff/backend/lib/shared/logging/logger.shared.service';
import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ReminderEntity } from '../../../global/entities/reminder.entity';
import { IReminderModel } from '../model/reminder.domain.model';
import { ReminderProviderTokens } from '../reminder.domain.constants';
import { ReminderDomainRepoCache } from './reminder.domain.cache-repo';

@Injectable()
export class ReminderDomainRepoWrite extends BaseRepoWrite<ReminderEntity, IReminderModel> {
  constructor(
    readonly loggerService: LoggerSharedService,
    @Inject(ReminderProviderTokens.Models.Reminder) model: Model<IReminderModel>,
    reminderRepoCache: ReminderDomainRepoCache,
  ) {
    super({ loggerService, model, entityRepoCache: reminderRepoCache });
  }
}
