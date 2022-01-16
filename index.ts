import {DataQueryBuilder} from "./src/data.query.builder";
import QueryBuilder from "./src/query.builder";
import mongoose from "mongoose";

export type KeysOf<K, V> = {
    [P in keyof K]: V
};

export const ObjectId = require('mongoose').Types.ObjectId;

export function addWhiteListFilter (query: DataQueryBuilder<any>, whiteList?: string[]) {
    if (whiteList && whiteList.length !== 0) {
        query.andWhere({ _id: { $in: whiteList.map(i => { return { _id: i }; }) } });
    }
}

export function isValidObjectId (id: any) {
    return id && mongoose.isValidObjectId(id);
}

export {
    QueryBuilder,
    DataQueryBuilder
}
