import {DataQueryBuilder} from "./src/data.query.builder";
import QueryBuilder from "./src/query.builder";
import mongoose, {Schema} from "mongoose";

export type KeysOf<K, V> = {
    [P in keyof K]: V
};

export const ObjectId = require('mongoose').Types.ObjectId;
export type ObjectId = Schema.Types.ObjectId;

export function isValidObjectId (id: any) {
    if (!id) {
        return false;
    }
    try {
        ObjectId(id);
        return true;
    } catch (e) {
        return false;
    }
}

export {
    QueryBuilder,
    DataQueryBuilder
}
