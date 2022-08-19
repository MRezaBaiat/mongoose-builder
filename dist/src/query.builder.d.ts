import 'reflect-metadata';
import { QueryWithHelpers, UpdateWriteOpResult, HydratedDocument, UnpackedIntersection, LeanDocument } from 'mongoose';
import { DataQueryBuilder } from './data.query.builder';
import { ObjectId } from '../index';
export default class QueryBuilder<T> extends DataQueryBuilder<T> {
    private metatype;
    private db;
    constructor(db: any, metatype: any);
    private convertIdFields;
    findMany(): Promise<Omit<HydratedDocument<T>, never>[]>;
    findOne(cast?: boolean): Promise<UnpackedIntersection<HydratedDocument<T>, {}>>;
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
    create(data: Partial<T>): Promise<HydratedDocument<T & {
        _id: ObjectId;
    }> | (LeanDocument<T> & Required<{
        _id: unknown;
    }>)>;
    clone(modifier?: (value: this) => void): this;
}
