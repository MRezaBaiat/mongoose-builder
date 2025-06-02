import mongoose, { PaginateModel, PopulateOptions, UpdateQuery, QueryOptions, QuerySelector } from 'mongoose';
import 'mongoose-paginate-v2';
import { ObjectId } from '../index';
declare type WhereType<T> = {
    [K in keyof T]?: QuerySelector<T[K]>;
} | Record<string, QuerySelector<any>> | Record<keyof T, any> | Record<string, any>;
declare type KeyValType<T> = Partial<{
    [K in keyof T]: T[K];
}> | Record<string, WhereType<T>>;
export declare class QueryBuilder<T> {
    private model;
    private _conditions;
    private _updates;
    private _updateFilters?;
    private _projection?;
    private _populations?;
    private _skip?;
    private _limit?;
    private _sort?;
    constructor(model: PaginateModel<T>);
    where(condition: WhereType<T>, mode?: 'and' | 'or'): this;
    and(condition: WhereType<T>): this;
    or(condition: WhereType<T>): this;
    withId(id: string | ObjectId): this;
    arrayIncludes(values: KeyValType<T>): this;
    populate(populations: (PopulateOptions | string)[]): this;
    project(projection: Record<string, 0 | 1> | Array<Record<string, 0 | 1>>): this;
    page(page: number, limit: number): this;
    skip(skip: number): this;
    limit(limit: number): this;
    sort(sort: Record<string, 0 | -1 | 1>): this;
    textLike(fields: KeyValType<T>, mode?: 'and' | 'or'): this;
    geoNear(locations: Record<string, {
        lat: number;
        lng: number;
    }>, distanceKm: number, mode?: 'and' | 'or'): this;
    valueMatches(values: Record<string, any[]>): this;
    valueNotMatches(values: Record<string, any[]>): this;
    whiteListIds(ids?: string[]): this;
    set(fields: Record<string, any>): this;
    unset(fields: Record<string, any>): this;
    modifyArrayElement(fields: Record<string, any>): this;
    modifyArrayElements(fields: Record<string, {
        value: any;
        where?: Record<string, any>;
    }>): this;
    addUpdateFilter(options: QueryOptions<T>): this;
    setCurrentDateOn(fields: Record<string, 'date' | 'timestamp'>): this;
    addToSet(fields: Record<string, any>): this;
    pull(fields: Record<string, any>): this;
    push(fields: Record<string, any>, options?: {
        each?: boolean;
        $sort?: Record<string, 1 | 0 | -1>;
    }): this;
    getModel(): PaginateModel<T>;
    getCondition(): any;
    getModified(): UpdateQuery<T>;
    getQuery(): {
        condition: any;
        projection: Record<string, 0 | 1>;
        populate: any[];
        skip: number;
        limit: number;
        sort: Record<string, 0 | 1 | -1>;
    };
    paginate(options?: Partial<mongoose.PaginateOptions>): Promise<any>;
    findOne(): Promise<any>;
    findMany(): Promise<any>;
    create(data: Partial<T>): Promise<any>;
    updateOne(): Promise<any>;
    updateMany(): Promise<any>;
    deleteOne(): Promise<any>;
    deleteMany(): Promise<any>;
    clone(modifier?: (value: this) => void): this;
}
export {};
