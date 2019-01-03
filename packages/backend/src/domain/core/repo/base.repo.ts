import { IEntity } from '@nestjs-bff/global/lib/interfaces/entity.interface';
import * as _ from 'lodash';
import { Document, Model } from 'mongoose';
import { CacheStore } from '../../../shared/caching/cache-store.shared';
import { CachingUtils } from '../../../shared/caching/caching.utils';
import { AppError } from '../../../shared/exceptions/app.exception';
import { LoggerSharedService } from '../../../shared/logging/logger.shared.service';
import { ValidationGroups } from '../core.constants';
import { IEntityValidator } from './validators/entity-validator.interface';

export interface IBaseRepoParams<
  TEntity extends IEntity,
  TModel extends Document & TEntity,
> {
  loggerService: LoggerSharedService;
  model: Model<TModel>;
  cacheStore: CacheStore;
  defaultTTL: number;
  entityValidator: IEntityValidator<TEntity>;
}

/**
 * Base repo query repository
 *
 * Notes:
 *  - By default will try to validate that org and user filtering in in place, unless overridden with params
 *  - FindAll can be achieved with find, passing no conditions
 */
export abstract class BaseRepo<
  TEntity extends IEntity,
  TModel extends Document & TEntity
> {
  private readonly name: string;
  protected readonly loggerService: LoggerSharedService;
  protected readonly model: Model<TModel>;
  public readonly modelName: string;
  protected readonly cacheStore: CacheStore;
  protected readonly defaultTTL: number;
  protected readonly entityValidator: IEntityValidator<TEntity>;

  /**
   *
   * @param options
   */
  constructor(params: IBaseRepoParams<TEntity, TModel>) {
    this.loggerService = params.loggerService;
    this.model = params.model;
    this.name = `RepoBase<${this.model.modelName}>`;
    this.modelName = this.model.modelName;
    this.cacheStore = params.cacheStore;
    this.defaultTTL = params.defaultTTL;
    this.entityValidator = params.entityValidator;
  }

  /**
   *
   * @param conditions
   */
  public async findOne(conditions: Partial<TEntity>, useCache: boolean = true, ttl?: number): Promise<TEntity> {
    let key: string | undefined;
    this.loggerService.trace(`${this.name}.findOne`, conditions);

    await this.entityValidator.validate(conditions, [ValidationGroups.QUERY_REQUIRED]);

    if (useCache) {
      key = CachingUtils.makeCacheKeyFromObject(conditions);
      const cachedResult = await this.cacheStore.get<TEntity>(key);
      if (cachedResult) return cachedResult;
    }

    const result = await this._mongooseFindOne(conditions);
    if (result == null) throw new AppError(`Could not find entity ${this.name} with conditions ${conditions}`);

    if (useCache) {
      // tslint:disable-next-line:no-non-null-assertion
      this.cacheStore.set(key!, result, { ttl: ttl || this.defaultTTL });
    }

    return result;
  }

  /**
   *
   * @param conditions
   */
  public async find(conditions: Partial<TEntity>, useCache: boolean = true, ttl?: number): Promise<TEntity[]> {
    let key: string | undefined;
    this.loggerService.trace(`${this.name}.find`, conditions);

    await this.entityValidator.validate(conditions, [ValidationGroups.QUERY_REQUIRED]);

    if (useCache) {
      key = CachingUtils.makeCacheKeyFromObject(conditions);
      const cachedResult = await this.cacheStore.get<TEntity[]>(key);
      if (cachedResult) return cachedResult;
    }

    const result = await this.model.find(conditions);

    if (useCache) {
      // tslint:disable-next-line:no-non-null-assertion
      this.cacheStore.set(key!, result, { ttl: ttl || this.defaultTTL });
    }

    return result;
  }

  /**
   *
   * @param newEntity
   */
  public async create(newEntity: TEntity): Promise<TEntity> {
    this.loggerService.trace(`${this.name}.create`, newEntity);

    const createModel: TModel = new this.model();
    Object.assign(createModel, newEntity);
    return createModel.save();
  }

  /**
   *
   * @param partialEntity
   */
  public async patch(patchEntity: Partial<TEntity>): Promise<void> {
    this.loggerService.trace(`${this.name}.patch`, patchEntity);

    if (!patchEntity.id) throw new AppError(`${this.modelName} id can not be null`);

    let patchModel = await this.model.findById(patchEntity.id);
    if (!patchModel) throw new AppError(`No ${this.modelName} found with id ${patchEntity.id}`);

    patchModel = _.merge(patchModel, patchEntity);
    await this.entityValidator.validate(patchModel);

    await patchModel.save();

    this.clearCacheByEntity(patchModel);
  }

  /**
   *
   * @param entity
   */
  public async update(entity: TEntity): Promise<void> {
    this.loggerService.trace(`${this.name}.update`, entity);

    await this.entityValidator.validate(entity);

    // update. (at some point in the future, consider changing to findOneAndReplace... wasn't in typescript definitions for some reason)
    await this.model.findByIdAndUpdate(entity.id, entity, {}).exec();
    this.clearCacheByEntity(entity);
  }

  /**
   *
   * @param entityId
   */
  public async delete(conditions: Partial<TEntity>): Promise<void> {
    this.loggerService.trace(`${this.name}.delete`, conditions);

    await this.entityValidator.validate(conditions, [ValidationGroups.QUERY_REQUIRED]);

    const deletedEntity = await this.model.findOneAndDelete(conditions).exec();
    this.clearCacheByEntity(deletedEntity);
  }

  /**
   *
   * @param cacheKey
   */
  protected async clearCacheByEntity(entity: TEntity | null) {
    if (!entity) throw new AppError('entity must not be null to trigger cache clear');
    await this.entityValidator.validate(entity);

    // clear by ID
    this.clearCacheByKey(CachingUtils.makeCacheKeyFromId(entity.id));

    // clear by query conditions
    this.generateValidQueryConditionsForCacheClear(entity).forEach(entity => {
      this.clearCacheByKey(CachingUtils.makeCacheKeyFromObject(entity));
    });
  }

  /**
   *
   * @param cacheKey
   */
  protected clearCacheByKey(cacheKey: string) {
    if (cacheKey.trim.length > 0) throw new AppError('cacheKey can not be null or whitespace');
    return this.cacheStore.del(cacheKey);
  }

  /**
   *
   * @param entity
   */
  protected abstract generateValidQueryConditionsForCacheClear(entity: TEntity): Array<Partial<TEntity>>;

  //
  // Abstracted Mongoose calls, to allow for easier testing through mocked mongoose calls
  //
  protected async _mongooseFindOne(conditions: Partial<TEntity>) {
    return this.model.findOne(conditions);
  }
}
