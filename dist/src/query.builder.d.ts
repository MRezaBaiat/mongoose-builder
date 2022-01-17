import 'reflect-metadata';
import { QueryWithHelpers, UpdateWriteOpResult } from 'mongoose';
import { DataQueryBuilder } from './data.query.builder';
export default class QueryBuilder<M> extends DataQueryBuilder<M> {
    private metatype;
    private db;
    constructor(db: any, metatype: any);
    private convertIdFields;
    findMany(): Promise<M[] | undefined>;
    findOne(cast?: boolean): Promise<M | undefined>;
    query(): Promise<any>;
    updateMany(): QueryWithHelpers<UpdateWriteOpResult, any>;
    updateOne(): QueryWithHelpers<UpdateWriteOpResult, any>;
    patch(): Promise<boolean>;
    deleteOne(): Promise<{
        n: number;
        deletedCount: number;
        ok: number;
    }>;
    deleteMany(): Promise<{
        n: number;
        deletedCount: number;
        ok: number;
    }>;
    create(data: Partial<M>): Promise<M>;
    clone(modifier?: (value: this) => void): this;
}
