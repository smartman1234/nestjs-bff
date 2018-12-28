import { CoreDomainModule } from '@nestjs-bff/backend/lib/domain/core/domain.core.module';
import { MongoSharedProviderTokens } from '@nestjs-bff/backend/lib/shared/database/mongo/mongo.shared.constants';
import { Module } from '@nestjs/common';
import { ReminderArchiveDomainSchema } from './model/reminder-archive.domain.schema';
import { ReminderArchiveProviderTokens } from './reminder-archive.domain.constants';
import { ReminderArchiveDomainRepoCache } from './repo/reminder-archive.domain.cache-repo';
import { ReminderArchiveDomainRepo } from './repo/reminder-archive.domain.repo';
import { ReminderArchiveDomainRepoWrite } from './repo/reminder-archive.domain.write-repo';

const ReminderArchiveModelProvider = {
  provide: ReminderArchiveProviderTokens.Models.ReminderArchive,
  useFactory: mongoose => mongoose.connection.model('ReminderArchive', ReminderArchiveDomainSchema),
  inject: [MongoSharedProviderTokens.Connections.Mongoose],
};

@Module({
  imports: [CoreDomainModule],
  providers: [
    ReminderArchiveModelProvider,
    ReminderArchiveDomainRepo,
    ReminderArchiveDomainRepoCache,
    ReminderArchiveDomainRepoWrite,
  ],
  exports: [ReminderArchiveDomainRepo, ReminderArchiveDomainRepoCache, ReminderArchiveDomainRepoWrite],
})
export class ReminderArchiveDomainModule {}
