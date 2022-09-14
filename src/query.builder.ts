import 'mongoose-paginate-v2';
import mongoose, {
  PopulateOptions,
  PaginateModel,
  UpdateQuery,
  QueryOptions,
    QuerySelector
} from 'mongoose';
import {KeysOf, ObjectId} from '../index';
import _ from 'lodash';

type KeyValType<T> = Partial<{[K in keyof T]: T[K]}> | { [key: string]: WhereType<T> };
type WhereType<T> = {[key in keyof T]?: QuerySelector<T[key]>} | {[key in keyof T]?: QuerySelector<any>} | Record<string, QuerySelector<any>> | Record<keyof T, any> | Record<string, any>

export class QueryBuilder<T> {
  protected _conditions: WhereType<T>[] = [];
  protected _updates: UpdateQuery<T>[] = [];
  protected _updateFilters?: QueryOptions<T>;
  protected _projection?: KeysOf<T, 0 | 1> | { [key: string]: 0 | 1 };
  protected _populations?: (PopulateOptions | string)[];
  protected _skip?: number;
  protected _limit?: number;
  protected _sort?: { [key: string]: 0 | -1 | 1 };
  constructor (protected model: PaginateModel<T>) {}

  public where (condition: WhereType<T>,mode: 'and' | 'or' = 'and') {
    if(mode === 'and'){
      this._conditions.push(condition)
    }else{
      this._conditions.push({$or: condition});
    }
    return this;
  }

  public and (condition: WhereType<T>) {
    this.model.find({})
    return this.where(condition);
  }

  public or (condition: WhereType<T>) {
    return this.where(condition,'or')
  }

  public withId (id: string | ObjectId) {
    return this.where({_id: ObjectId(id)});
  }

  public arrayIncludes (what: KeyValType<T>) {
    Object.entries(what).forEach(([key,value])=> this.and({[key]:{$in: value}}));
    return this;
  }

  public populate (populations: (PopulateOptions | string)[]) {
    populations && (this._populations = this._populations || []).push(...populations.map((value) =>{
      if(typeof value === 'string' && value.includes('.')){
        const arr = value.split('.');
        return arr.reduce((total, currentValue, currentIndex) => {
          total.path = currentValue;
          if (currentIndex !== arr.length - 1) {
            total.populate = {};
          }
          return total.populate;
        }, {} as any);
      }
      return value;
    }))
    return this;
  }

  public project (projection: KeysOf<T, 0 | 1 | any> | { [key: string]: 0 | 1 | any } | KeysOf<T, 0 | 1 | any>[] | { [key: string]: 0 | 1 | any }[]) {
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

  public textLike (keyVal: KeyValType<T>, method: 'and' | 'or' = 'and') {
    Object.keys(keyVal).forEach((k) => this.where({ [k]: new RegExp(keyVal[k], 'i') as any },method));
    return this;
  }

  public geoNear (
    entry: Record<keyof T, {lat: number; lng: number}> | Record<string, {lat: number; lng: number}>,
    distanceKilometers: number,
    method: 'and' | 'or' = 'and'
  ) {
    const radius = distanceKilometers / 6371;
    Object.keys(entry).forEach((key) => {
      this.where({
        [key]:{
          $geoWithin: {
            $center: [[entry[key].lat, entry[key].lng], radius]
          }
        }
      },method)
    });
    return this;
  }

  public valueNotMatches (what: Record<keyof T, any[]> | Record<string, any[]>) {
    Object.entries(what).forEach(([key,value])=> this.where({[key]: {$nin: value}}));
    return this;
  }

  public valueMatches (what: Record<keyof T, any[]> | Record<string, any[]>) {
    Object.entries(what).forEach(([key,value])=> this.where({[key]: {$in: value}}));
    return this;
  }

  public whiteListIds (ids: string[] = []) {
    return this.valueMatches({_id: ids});
  }

  public set (entry: Record<keyof T, any> | Record<string, any>) {
    Object.entries(entry).forEach(([key,value]) => this._updates.push({ $set: { [key]: value } as never }));
    return this;
  }

  public unset (entry: Record<keyof T, any> | Record<string, any>) {
    Object.entries(entry).forEach(([key,value]) => this._updates.push({ $unset: { [key]: value } as never }));
    return this;
  }

  public modifyArrayElement(entry: Record<keyof T, any> | Record<string, any>){
    Object.entries(entry).forEach(([key,value]) => this.set({[`${key}.$`]: value}));
    return this;
  }

  /**
   * example:
   * modifyArrayElements({myArr:{value:newObject,where:{_id:'1'}}})
   */
  public modifyArrayElements(entry: {[key in keyof T]: {value: any,where?: Record<string, any>}} | {[key: string]: {value: any,where?: Record<string, any>}}){
      Object.entries(entry).forEach(([key,{value,where}]) => {
        const filterKey = (where && Object.keys(where).map(k => (`$[${k}]`)).join('.')) || '$[]';
        this.set({[`${key}.${filterKey}`]: value});
        if(where){
          this.addUpdateFilter({arrayFilters:[where]})
        }
      });
    return this;
  }

  public addUpdateFilter(options: QueryOptions<T>){
    this._updateFilters = this._updateFilters || {};
    Object.entries(options).forEach(([key,value])=>{
      const existing = this._updateFilters[key];
      if(!existing || typeof existing !== 'object'){
        this._updateFilters[key] = options[key]
      }else if(Array.isArray(existing)){
        this._updateFilters[key].push(...value)
      }else{
        this._updateFilters[key] = {
          ...this._updateFilters[key],
          ...value
        }
      }
    })
    return this;
  }

  /**
   * Sets the value of a field to current date, either as a Date or a Timestamp.
   */
  public setCurrentDateOn (entry: Record<keyof T, 'date' | 'timestamp'> | Record<string, 'date' | 'timestamp'>) {
    Object.entries(entry).forEach(([key,value]) => this._updates.push({ $currentDate: { [key]: value } as never }));
    return this;
  }

  public addToSet (entry: Record<keyof T, any> | Record<string, any>) {
    Object.entries(entry).forEach(([key,value]) => this._updates.push({ $addToSet: { [key]: value } as never }));
    return this;
  }

  public pull (entry: Record<keyof T, any> | Record<string, any>) {
    Object.entries(entry).forEach(([key,value]) => this._updates.push({ $pull: { [key]: value } as never }));
    return this;
  }

  /**
   * if {each:true} , the entry value must be an array
   */
  public push (entry: Record<keyof T, any> | Record<string, any>,options:{each?: boolean,$sort?: Record<string, 1 | 0 | -1>} = {}) {
    Object.entries(entry).forEach(([key,value]) => {
      let update = {$each: options.each ? value : [value]};
      if(options.$sort){
        update['$sort'] = options.$sort;
      }
      this._updates.push({ $push: { [key]: update } as never })
    });
    return this;
  }

  public getModel(){
    return this.model;
  }

  public getCondition () {
    return this._conditions;
  }

  public getModified (): UpdateQuery<T> {
    return _.merge(...this._updates);
  }

  public getQuery (): {
    condition: any;
    projection?: any;
    populate?: any;
    skip?: any;
    limit?: any;
    sort?: any;
    } {
    const condition = this.getCondition();
    return {
      condition,
      projection: this._projection,
      populate: this._populations,
      limit: this._limit,
      skip: this._skip,
      sort: this._sort,
    };
  }

  async  query(options?:Partial<mongoose.PaginateOptions>) {
      const { skip = 0, limit = 20, projection, populate, sort,condition } = this.getQuery();

      options = {
        populate,
        projection,
        offset: skip,
        limit,
        sort,
        lean: false,
        pagination: true,
        leanWithId: false,
        ...options
      };

      return this.model.paginate(condition, options)
  }

  async findOne() {
    const {condition,projection,populate,sort} = this.getQuery();
    return this.model.findOne(condition,
        projection,
        {
          sort,
          populate
        });
  }

  async findMany() {
    const {condition,projection,populate,sort,skip,limit} = this.getQuery();
    return this.model.find(condition,
        projection,
        {
          sort,
          populate,
          skip,
          limit
        });
  }

  async create (data: Partial<T>) {
    return this.model.create(data);
  }

  async updateMany () {
    return this.model.updateMany(this.getCondition(), this.getModified());
  }

  async updateOne () {
    return this.model.updateOne(this.getCondition(), this.getModified());
  }

  async deleteOne () {
    return this.model.deleteOne(this.getCondition()) as any;
  }

  async deleteMany () {
    return this.model.deleteMany(this.getCondition()) as any;
  }

  public clone (modifier?: (value: this)=>void): this {
    const {model,...rest} = this;
    const c = Object.assign(Object.create(Object.getPrototypeOf(this)), JSON.parse(JSON.stringify(rest)));
    c.model = this.model;
    modifier && modifier(c);
    return c;
  }
}
