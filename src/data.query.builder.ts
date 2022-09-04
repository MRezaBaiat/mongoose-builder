import mongoose, {
  FilterQuery,
  PopulateOptions,
  QueryWithHelpers,
  RootQuerySelector,
  UpdateQuery,
  UpdateWriteOpResult,
  HydratedDocument, UnpackedIntersection, LeanDocument, PaginateModel
} from 'mongoose';
import {KeysOf, ObjectId} from '../index';

type KeyValType<K, V> = Partial<KeysOf<K, V>> | { [key: string]: any };

export abstract class DataQueryBuilder<T> {
  private id?: string;
  private _updates: UpdateQuery<T>[] = [];
  private _conditions: FilterQuery<T>[] = [];
  private _ors: any[] = [];
  private _projection: KeysOf<T, 0 | 1> | { [key: string]: 0 | 1 } | undefined;
  protected _populations?: (PopulateOptions | string)[];
  private _skip?: number;
  private _limit?: number;
  private _sort?: { [key: string]: 0 | -1 | 1 };

  public withId (id: string | ObjectId) {
    this.id = String(id);
    this._conditions.push({ _id: ObjectId(id) });
    return this;
  }

  public where (entry: FilterQuery<T>) {
    this._conditions.push(entry);
    return this;
  }

  public whereDate (
    what: KeyValType<T, number>,
    mode: 'gte' | 'gt' | 'lt' | 'lte' | 'eq',
    method: 'and' | 'or' = 'and'
  ) {
    Object.keys(what).forEach((key) => {
      if (method === 'and') {
        this.andWhere({ [key]: { [`$${mode}`]: what[key] } });
      } else {
        this.orWhere({ [key]: { [`$${mode}`]: what[key] } });
      }
    });
    return this;
  }

  public whereArrayIncludes (
    what: KeyValType<T, any>,
    method: 'and' | 'or' = 'and'
  ) {
    Object.keys(what).forEach((key) => {
      if (method === 'and') {
        this.andWhere({ [key]: { $in: what[key] } });
      } else {
        this.orWhere({ [key]: { $in: what[key] } });
      }
    });
    return this;
  }

  public populate (populations: ({ path: string; model?: string; populate?: any; select?: string } | string)[]) {
    if(populations){
      if (!this._populations) {
        this._populations = [];
      }
      populations.forEach((val) => {
        this._populations.push(val);
      });
    }
    return this;
  }

  public populateFile (path: string, select?: string) {
    this.populate([{ path, model: 'fs.files', select }]);
    return this;
  }

  public project (
    projection: KeysOf<T, 0 | 1 | any> | { [key: string]: 0 | 1 | any } | KeysOf<T, 0 | 1 | any>[] | { [key: string]: 0 | 1 | any }[]
  ) {
    if(projection){
      if (!this._projection) {
        this._projection = {};
      }
      if(Array.isArray(projection)){
        projection.map(p => this.project(p))
        return this;
      }
      Object.keys(projection).forEach((key) => {
        this._projection[key] = projection[key];
      });
    }
    return this;
  }

  public skip (skip: number) {
    this._skip = skip;
    return this;
  }

  public limit (limit: number) {
    this._limit = limit;
    return this;
  }

  public sort (sort: { [key: string]: 0 | -1 | 1 }) {
    this._sort = sort;
    return this;
  }

  public whereTextLike (
    keyVal: KeyValType<T, string | undefined>,
    method: 'and' | 'or' = 'and'
  ) {
    const objects = [] as RootQuerySelector<any>[];
    Object.keys(keyVal).forEach((k) => {
      if (keyVal[k]) {
        objects.push({ [k]: new RegExp(keyVal[k], 'i') });
        // objects.push({ $text: { $search: '\"' + keyVal[k] + '\"', $caseSensitive: false, $diacriticSensitive: true } });
      }
    });
    if (method === 'and') {
      this.andWhere(objects);
    } else if (method === 'or') {
      this.orWhere(objects);
    }
    return this;
  }

  public andWhere (and: KeyValType<T, any>[] | KeyValType<T, any>) {
    if (Array.isArray(and)) {
      // @ts-ignore
      this._conditions.push(...and);
    } else {
      // @ts-ignore
      this._conditions.push(and);
    }
    return this;
  }

  public orWhere (or: KeyValType<T, any>[] | KeyValType<T, any>) {
    if (Array.isArray(or)) {
      this._ors.push(...or);
    } else {
      this._ors.push(or);
    }
    return this;
  }

  public nearCoordinates (
    entry: KeyValType<T, { lat: number; lng: number }>,
    distanceKilometers: number
  ) {
    const radius = distanceKilometers / 6371;
    Object.keys(entry).forEach((key) => {
      this._conditions.push({
        [key]: {
          $geoWithin: {
            $center: [[entry[key].lat, entry[key].lng], radius]
          }
        }
      } as any);
    });
    return this;
  }

  public whiteList (ids: string[] = []) {
    return this.andWhere({
      _id: {
        $in: ids.map((i) => ({ _id: i }))
      }
    });
  }

  public set (entry: UpdateQuery<T>) {
    this._updates.push(entry);
    return this;
  }

  public addToSet (
    entry: Partial<{ [P in keyof T]: any }> | Record<string, any>
  ) {
    Object.keys(entry).forEach((key) => {
      // @ts-ignore
      this._updates.push({ $addToSet: { [key]: entry[key] } });
    });
    return this;
  }

  public pull (entry: Partial<{ [P in keyof T]: any }> | Record<string, any>) {
    Object.keys(entry).forEach((key) => {
      // @ts-ignore
      this._updates.push({ $pull: { [key]: entry[key] } });
    });
    return this;
  }

  public push (entry: Partial<{ [P in keyof T]: any }> | Record<string, any>) {
    Object.keys(entry).forEach((key) => {
      // @ts-ignore
      this._updates.push({ $push: { [key]: entry[key] } });
    });
    return this;
  }

  public getCondition () {
    const condition: any = {};
    this._conditions.forEach((cond) => {
      Object.keys(cond).forEach(key =>{
        condition[key] = cond[key];
      })
    });
    if (this._ors.length > 0) {
      condition.$or = condition.$or || [];
      this._ors.forEach((val) => {
        condition.$or.push(val);
      });
    }
    return condition;
  }

  public getUpdates (): UpdateQuery<T> {
    const updates = {};
    this._updates.forEach((cond) => {
      Object.keys(cond).forEach(key =>{
        updates[key] = cond[key];
      })
    });
    return updates;
  }

  public getQuery (): {
    condition: any;
    projection?: any;
    populations?: any;
    skip?: any;
    limit?: any;
    sort?: any;
    } {
    const condition = this.getCondition();
    return {
      condition,
      projection: this._projection,
      populations: this._populations,
      limit: this._limit,
      skip: this._skip,
      sort: this._sort
    };
  }

  public getId () {
    return this.id;
  }

  public abstract query(): ReturnType<PaginateModel<T>['paginate']>;

  public abstract findOne(cast?: boolean): Promise<UnpackedIntersection<HydratedDocument<T>, {}> | undefined>;

  public abstract findMany(): Promise<Omit<HydratedDocument<T>, never>[]>;

  public abstract create(data: Partial<Omit<T, '_id'>>): Promise<HydratedDocument<T>>;

  public abstract patch(): Promise<boolean>;

  public abstract updateMany(): QueryWithHelpers<UpdateWriteOpResult, T>;

  public abstract updateOne(): QueryWithHelpers<UpdateWriteOpResult, T>;

  public abstract deleteOne(): Promise<{
    n: number;
    deletedCount: number;
    ok: number;
  }>;

  public abstract deleteMany(): Promise<{
    n: number;
    deletedCount: number;
    ok: number;
  }>;

  public clone (modifier?: (value: this)=>void): this {
    modifier && modifier(this);
    return Object.assign(Object.create(this), this);
  }
}
