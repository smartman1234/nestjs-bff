import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { INestjsBffConfig } from '../../../../../config/nestjs-bff.config';
import { AppSharedProviderTokens } from '../../../../../shared/app/app.shared.constants';
import { CacheStore } from '../../../../../shared/caching/cache-store.shared';
import { CachingProviderTokens } from '../../../../../shared/caching/caching.shared.constants';
import { LoggerSharedService } from '../../../../../shared/logging/logger.shared.service';
import { BaseRepo } from '../../../repo/base.repo';
import { ScopedValidator } from '../../../repo/validators/scoped.validator';
import { FooProviderTokens } from '../foo.constants';
import { FooEntity } from '../model/foo.entity';
import { IFooModel } from '../model/foo.model';

@Injectable()
export class FooRepo extends BaseRepo<FooEntity, IFooModel> {
  constructor(
    readonly loggerService: LoggerSharedService,
    @Inject(AppSharedProviderTokens.Config.App) nestjsBffConfig: INestjsBffConfig,
    @Inject(CachingProviderTokens.Services.CacheStore) cacheStore: CacheStore,
    @Inject(FooProviderTokens.Models.Foo) model: Model<IFooModel>,
  ) {
    super({
      loggerService,
      cacheStore,
      defaultTTL: 60 * 1,
      model,
      entityValidator: new ScopedValidator(loggerService, FooEntity),
    });
  }

  protected generateValidQueryConditionsForCacheClear(entity: FooEntity): FooEntity[] {
    throw new Error('Method not implemented.');
  }
}
