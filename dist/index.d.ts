import { DataQueryBuilder } from "./src/data.query.builder";
import QueryBuilder from "./src/query.builder";
export declare type KeysOf<K, V> = {
    [P in keyof K]: V;
};
export declare const ObjectId: any;
export declare function addWhiteListFilter(query: DataQueryBuilder<any>, whiteList?: string[]): void;
export declare function isValidObjectId(id: any): boolean;
export { QueryBuilder, DataQueryBuilder };
