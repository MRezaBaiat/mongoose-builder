import { DataQueryBuilder } from "./src/data.query.builder";
import QueryBuilder from "./src/query.builder";
import { Schema } from "mongoose";
export declare type KeysOf<K, V> = {
    [P in keyof K]: V;
};
export declare const ObjectId: any;
export declare type ObjectId = Schema.Types.ObjectId;
export declare function isValidObjectId(id: any): boolean;
export { QueryBuilder, DataQueryBuilder };
