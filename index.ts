import {DataQueryBuilder} from "./src/data.query.builder";
import QueryBuilder from "./src/query.builder";

export type KeysOf<K, V> = {
    [P in keyof K]: V
};

export const ObjectId = require('mongoose').Types.ObjectId;

export function addWhiteListFilter (query: DataQueryBuilder<any>, whiteList?: string[]) {
    if (whiteList && whiteList.length !== 0) {
        query.andWhere({ _id: { $in: whiteList.map(i => { return { _id: i }; }) } });
    }
}

export {
    QueryBuilder,
    DataQueryBuilder
}
