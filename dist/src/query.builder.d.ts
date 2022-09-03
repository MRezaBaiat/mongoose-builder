import 'reflect-metadata';
import 'mongoose-paginate-v2';
import mongoose, { QueryWithHelpers, UpdateWriteOpResult, PaginateModel, HydratedDocument, UnpackedIntersection } from 'mongoose';
import { DataQueryBuilder } from './data.query.builder';
export default class QueryBuilder<T> extends DataQueryBuilder<T> {
    private metatype;
    protected db: PaginateModel<T>;
    constructor(db: any, metatype: any);
    private convertIdFields;
    findMany(): Promise<Omit<HydratedDocument<T>, never>[]>;
    findOne(cast?: boolean): Promise<UnpackedIntersection<HydratedDocument<T>, {}>>;
    query(): Promise<{
        total: number;
        currentPageIndex: number;
        maxPageIndex: number;
        results: mongoose.HydratedDocument<T, {}, mongoose.PaginateOptions>[];
    }>;
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
    create(data: Partial<T>): Promise<HydratedDocument<T>>;
    clone(modifier?: (value: this) => void): this;
}
