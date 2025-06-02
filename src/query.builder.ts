import mongoose, {
  PaginateModel,
  PopulateOptions,
  UpdateQuery,
  QueryOptions,
  QuerySelector
} from 'mongoose';
import _ from 'lodash';
import 'mongoose-paginate-v2';
import { KeysOf, ObjectId } from '../index';

type WhereType<T> =
    | { [K in keyof T]?: QuerySelector<T[K]> }
    | Record<string, QuerySelector<any>>
    | Record<keyof T, any>
    | Record<string, any>;

type KeyValType<T> = Partial<{ [K in keyof T]: T[K] }> | Record<string, WhereType<T>>;

export class QueryBuilder<T> {
  private _conditions: WhereType<T>[] = [];
  private _updates: UpdateQuery<T>[] = [];
  private _updateFilters?: QueryOptions<T>;
  private _projection?: Record<string, 0 | 1>;
  private _populations?: (PopulateOptions | string)[];
  private _skip?: number;
  private _limit?: number;
  private _sort?: Record<string, 0 | 1 | -1>;

  constructor(private model: PaginateModel<T>) {}

  public where(condition: WhereType<T>, mode: 'and' | 'or' = 'and') {
    this._conditions.push(mode === 'or' ? { $or: condition as any } : condition);
    return this;
  }

  public and(condition: WhereType<T>) {
    return this.where(condition, 'and');
  }

  public or(condition: WhereType<T>) {
    return this.where(condition, 'or');
  }

  public withId(id: string | ObjectId) {
    return this.where({ _id: ObjectId(id) } as any);
  }

  public arrayIncludes(values: KeyValType<T>) {
    Object.entries(values).forEach(([key, val]) => {
      this.and({ [key]: { $in: val } } as any);
    });
    return this;
  }

  public populate(populations: (PopulateOptions | string)[]) {
    if (!populations) return this;
    this._populations = this._populations || [];

    populations.forEach(value => {
      if (typeof value === 'string' && value.includes('.')) {
        const paths = value.split('.');
        const nestedPopulate = paths.reduceRight((acc, path) => ({ path, populate: acc }), null);
        this._populations!.push(nestedPopulate!);
      } else {
        this._populations!.push(value);
      }
    });

    return this;
  }

  public project(projection: Record<string, 0 | 1> | Array<Record<string, 0 | 1>>) {
    if (!projection) return this;
    this._projection = this._projection || {};

    const projections = Array.isArray(projection) ? projection : [projection];
    projections.forEach(p =>
        Object.entries(p).forEach(([key, value]) => {
          this._projection![key] = value;
        })
    );

    return this;
  }

  public page(page: number,limit: number){
    this.skip((page - 1) * limit);
    this.limit(limit);
    return this;
  }

  public skip(skip: number) {
    this._skip = skip;
    return this;
  }

  public limit(limit: number) {
    this._limit = limit;
    return this;
  }

  public sort(sort: Record<string, 0 | -1 | 1>) {
    this._sort = sort;
    return this;
  }

  public textLike(fields: KeyValType<T>, mode: 'and' | 'or' = 'and') {
    Object.entries(fields).forEach(([key, val]) => {
      this.where({ [key]: new RegExp(val as any, 'i') } as any, mode);
    });
    return this;
  }

  public geoNear(locations: Record<string, { lat: number; lng: number }>, distanceKm: number, mode: 'and' | 'or' = 'and') {
    const radius = distanceKm / 6371;
    Object.entries(locations).forEach(([key, { lat, lng }]) => {
      this.where({
        [key]: {
          $geoWithin: {
            $center: [[lat, lng], radius]
          }
        }
      } as any, mode);
    });
    return this;
  }

  public valueMatches(values: Record<string, any[]>) {
    Object.entries(values).forEach(([key, val]) => this.where({ [key]: { $in: val } } as any));
    return this;
  }

  public valueNotMatches(values: Record<string, any[]>) {
    Object.entries(values).forEach(([key, val]) => this.where({ [key]: { $nin: val } } as any));
    return this;
  }

  public whiteListIds(ids: string[] = []) {
    return this.valueMatches({ _id: ids });
  }

  public set(fields: Record<string, any>) {
    this._updates.push({ $set: fields } as any);
    return this;
  }

  public unset(fields: Record<string, any>) {
    this._updates.push({ $unset: fields } as any);
    return this;
  }

  public modifyArrayElement(fields: Record<string, any>) {
    const updated = Object.entries(fields).reduce((acc, [key, val]) => {
      acc[`${key}.$`] = val;
      return acc;
    }, {} as Record<string, any>);
    return this.set(updated);
  }

  public modifyArrayElements(fields: Record<string, { value: any; where?: Record<string, any> }>) {
    Object.entries(fields).forEach(([key, { value, where }]) => {
      const filterKey = where ? Object.keys(where).map(k => `$[${k}]`).join('.') : '$[]';
      this.set({ [`${key}.${filterKey}`]: value });
      if (where) this.addUpdateFilter({ arrayFilters: [where] });
    });
    return this;
  }

  public addUpdateFilter(options: QueryOptions<T>) {
    this._updateFilters = this._updateFilters || {};
    Object.entries(options).forEach(([key, value]) => {
      if (Array.isArray(this._updateFilters![key])) {
        (this._updateFilters![key] as any[]).push(...(value as any[]));
      } else if (typeof value === 'object' && typeof this._updateFilters![key] === 'object') {
        this._updateFilters![key] = {
          ...this._updateFilters![key],
          ...value
        };
      } else {
        this._updateFilters![key] = value;
      }
    });
    return this;
  }

  public setCurrentDateOn(fields: Record<string, 'date' | 'timestamp'>) {
    this._updates.push({ $currentDate: fields } as any);
    return this;
  }

  public addToSet(fields: Record<string, any>) {
    this._updates.push({ $addToSet: fields } as any);
    return this;
  }

  public pull(fields: Record<string, any>) {
    this._updates.push({ $pull: fields } as any);
    return this;
  }

  public push(fields: Record<string, any>, options: { each?: boolean; $sort?: Record<string, 1 | 0 | -1> } = {}) {
    Object.entries(fields).forEach(([key, value]) => {
      const update: any = { $each: options.each ? value : [value] };
      if (options.$sort) update.$sort = options.$sort;
      this._updates.push({ $push: { [key]: update } } as any);
    });
    return this;
  }

  public getModel() {
    return this.model;
  }

  public getCondition() {
    return _.merge({}, ...this._conditions);
  }

  public getModified(): UpdateQuery<T> {
    return _.merge({}, ...this._updates);
  }

  public getQuery() {
    return {
      condition: this.getCondition(),
      projection: this._projection,
      populate: this._populations,
      skip: this._skip,
      limit: this._limit,
      sort: this._sort
    };
  }

  public async paginate(options?: Partial<mongoose.PaginateOptions>) {
    const { condition, projection, populate, sort, skip = 0, limit = 20 } = this.getQuery();

    return this.model.paginate(condition, {
      populate,
      projection,
      offset: skip,
      limit,
      sort,
      lean: false,
      pagination: true,
      leanWithId: false,
      ...options
    });
  }

  public async findOne() {
    const { condition, projection, populate, sort } = this.getQuery();
    return this.model.findOne(condition, projection, { sort, populate });
  }

  public async findMany() {
    const { condition, projection, populate, sort, skip, limit } = this.getQuery();
    return this.model.find(condition, projection, { sort, populate, skip, limit });
  }

  public async create(data: Partial<T>) {
    return this.model.create(data);
  }

  public async updateOne() {
    return this.model.updateOne(this.getCondition(), this.getModified(), this._updateFilters);
  }

  public async updateMany() {
    return this.model.updateMany(this.getCondition(), this.getModified(), this._updateFilters);
  }

  public async deleteOne() {
    return this.model.deleteOne(this.getCondition());
  }

  public async deleteMany() {
    return this.model.deleteMany(this.getCondition());
  }

  public clone(modifier?: (value: this) => void): this {
    const instance = new (this.constructor as { new(model: PaginateModel<T>): this })(this.model);
    Object.assign(instance, _.cloneDeep(this));
    if (modifier) modifier(instance);
    return instance;
  }
}
