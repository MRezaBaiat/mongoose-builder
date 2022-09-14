import 'mongoose-paginate-v2';
import mongoose, { PopulateOptions, PaginateModel, UpdateQuery, QueryOptions, QuerySelector } from 'mongoose';
import { KeysOf, ObjectId } from '../index';
declare type KeyValType<T> = Partial<{
    [K in keyof T]: T[K];
}> | {
    [key: string]: WhereType<T>;
};
declare type WhereType<T> = {
    [key in keyof T]?: QuerySelector<T[key]>;
} | {
    [key in keyof T]?: QuerySelector<any>;
} | Record<string, QuerySelector<any>> | Record<keyof T, any> | Record<string, any>;
export declare class QueryBuilder<T> {
    protected model: PaginateModel<T>;
    protected _conditions: WhereType<T>[];
    protected _updates: UpdateQuery<T>[];
    protected _updateFilters?: QueryOptions<T>;
    protected _projection?: KeysOf<T, 0 | 1> | {
        [key: string]: 0 | 1;
    };
    protected _populations?: (PopulateOptions | string)[];
    protected _skip?: number;
    protected _limit?: number;
    protected _sort?: {
        [key: string]: 0 | -1 | 1;
    };
    constructor(model: PaginateModel<T>);
    where(condition: WhereType<T>, mode?: 'and' | 'or'): this;
    and(condition: WhereType<T>): this;
    or(condition: WhereType<T>): this;
    withId(id: string | ObjectId): this;
    arrayIncludes(what: KeyValType<T>): this;
    populate(populations: (PopulateOptions | string)[]): this;
    project(projection: KeysOf<T, 0 | 1 | any> | {
        [key: string]: 0 | 1 | any;
    } | KeysOf<T, 0 | 1 | any>[] | {
        [key: string]: 0 | 1 | any;
    }[]): this;
    skip(skip: number): this;
    limit(limit: number): this;
    sort(sort: {
        [key: string]: 0 | -1 | 1;
    }): this;
    textLike(keyVal: KeyValType<T>, method?: 'and' | 'or'): this;
    geoNear(entry: Record<keyof T, {
        lat: number;
        lng: number;
    }> | Record<string, {
        lat: number;
        lng: number;
    }>, distanceKilometers: number, method?: 'and' | 'or'): this;
    valueNotMatches(what: Record<keyof T, any[]> | Record<string, any[]>): this;
    valueMatches(what: Record<keyof T, any[]> | Record<string, any[]>): this;
    whiteListIds(ids?: string[]): this;
    set(entry: Record<keyof T, any> | Record<string, any>): this;
    unset(entry: Record<keyof T, any> | Record<string, any>): this;
    modifyArrayElement(entry: Record<keyof T, any> | Record<string, any>): this;
    modifyArrayElements(entry: {
        [key in keyof T]: {
            value: any;
            where?: Record<string, any>;
        };
    } | {
        [key: string]: {
            value: any;
            where?: Record<string, any>;
        };
    }): this;
    addUpdateFilter(options: QueryOptions<T>): this;
    setCurrentDateOn(entry: Record<keyof T, 'date' | 'timestamp'> | Record<string, 'date' | 'timestamp'>): this;
    addToSet(entry: Record<keyof T, any> | Record<string, any>): this;
    pull(entry: Record<keyof T, any> | Record<string, any>): this;
    push(entry: Record<keyof T, any> | Record<string, any>, options?: {
        each?: boolean;
        $sort?: Record<string, 1 | 0 | -1>;
    }): this;
    getModel(): mongoose.PaginateModel<T, {}, {}>;
    getCondition(): any;
    getModified(): UpdateQuery<T>;
    getQuery(): {
        condition: any;
        projection?: any;
        populate?: any;
        skip?: any;
        limit?: any;
        sort?: any;
    };
    query(options?: Partial<mongoose.PaginateOptions>): Promise<mongoose.PaginateResult<mongoose.HydratedDocument<T, {}, Partial<mongoose.PaginateOptions>>>>;
    findOne(): Promise<mongoose.HydratedDocument<T, {}, {}>>;
    findMany(): Promise<mongoose.HydratedDocument<T, {}, {}>[]>;
    create(data: Partial<T>): Promise<mongoose.HydratedDocument<T, {}, {}>>;
    updateMany(): Promise<import("mongodb").UpdateResult>;
    updateOne(): Promise<import("mongodb").UpdateResult>;
    deleteOne(): Promise<any>;
    deleteMany(): Promise<any>;
    clone(modifier?: (value: this) => void): this;
}
export {};
