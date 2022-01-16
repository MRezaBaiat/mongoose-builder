import { FilterQuery, PopulateOptions, QueryWithHelpers, UpdateQuery, UpdateWriteOpResult } from 'mongoose';
import { KeysOf } from '../index';
declare type KeyValType<K, V> = Partial<KeysOf<K, V>> | {
    [key: string]: any;
};
export declare abstract class DataQueryBuilder<T> {
    private id?;
    private _updates;
    private _conditions;
    private _ors;
    private _projection;
    protected _populations?: (PopulateOptions | string)[];
    private _skip?;
    private _limit?;
    private _sort?;
    whiteListFilter: (whiteList?: string[]) => this;
    withId(id: string): this;
    where(entry: Partial<KeysOf<T, any>> | FilterQuery<T>): this;
    whereDate(what: KeyValType<T, number>, mode: 'gte' | 'gt' | 'lt' | 'lte' | 'eq', method?: 'and' | 'or'): this;
    whereArrayIncludes(what: KeyValType<T, any>, method?: 'and' | 'or'): this;
    populate(populations: ({
        path: string;
        model?: string;
        populate?: any;
        select?: string;
    } | string)[]): this;
    populateFile(path: string, select?: string): this;
    project(projection: KeysOf<T, 0 | 1 | any> | {
        [key: string]: 0 | 1 | any;
    }): this;
    skip(skip: number): this;
    limit(limit: number): this;
    sort(sort: {
        [key: string]: 0 | -1 | 1;
    }): this;
    searchId: (keyVal: {
        [key: string]: string;
    }, method: 'and' | 'or') => this;
    whereTextLike(keyVal: KeyValType<T, string | undefined>, method?: 'and' | 'or'): this;
    whereLocaleBaseLike(keyVal: KeyValType<T, string | undefined>, method?: 'and' | 'or'): this;
    andWhere(and: KeyValType<T, any>[] | KeyValType<T, any>): this;
    orWhere(or: KeyValType<T, any>[] | KeyValType<T, any>): this;
    nearCoordinates(entry: KeyValType<T, {
        lat: number;
        lng: number;
    }>, distanceKilometers: number): this;
    whiteList(whiteList?: string[]): void;
    set(entry: UpdateQuery<T>): this;
    addToSet(entry: Partial<{
        [P in keyof T]: any;
    }> | Record<string, any>): this;
    pull(entry: Partial<{
        [P in keyof T]: any;
    }> | Record<string, any>): this;
    push(entry: Partial<{
        [P in keyof T]: any;
    }> | Record<string, any>): this;
    getCondition(): any;
    getUpdates(): UpdateQuery<T>;
    getQuery(): {
        condition: any;
        projection?: any;
        populations?: any;
        skip?: any;
        limit?: any;
        sort?: any;
    };
    getId(): string;
    abstract query(): Promise<{
        total: number;
        currentPageIndex: number;
        maxPageIndex: number;
        results: T[];
    }>;
    abstract findOne(cast?: boolean): Promise<T | undefined>;
    abstract findMany(): Promise<T[]>;
    abstract create(data: Partial<T>): Promise<T>;
    abstract patch(): Promise<boolean>;
    abstract updateMany(): QueryWithHelpers<UpdateWriteOpResult, any>;
    abstract updateOne(): QueryWithHelpers<UpdateWriteOpResult, any>;
    abstract deleteOne(): Promise<{
        n: number;
        deletedCount: number;
        ok: number;
    }>;
    abstract deleteMany(): Promise<{
        n: number;
        deletedCount: number;
        ok: number;
    }>;
    clone(modifier?: (value: this) => void): this;
}
export {};
