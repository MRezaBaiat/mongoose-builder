"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataQueryBuilder = exports.QueryBuilder = exports.isValidObjectId = exports.addWhiteListFilter = exports.ObjectId = void 0;
const tslib_1 = require("tslib");
const data_query_builder_1 = require("./src/data.query.builder");
Object.defineProperty(exports, "DataQueryBuilder", { enumerable: true, get: function () { return data_query_builder_1.DataQueryBuilder; } });
const query_builder_1 = (0, tslib_1.__importDefault)(require("./src/query.builder"));
exports.QueryBuilder = query_builder_1.default;
exports.ObjectId = require('mongoose').Types.ObjectId;
function addWhiteListFilter(query, whiteList) {
    if (whiteList && whiteList.length !== 0) {
        query.andWhere({ _id: { $in: whiteList.map(i => { return { _id: i }; }) } });
    }
}
exports.addWhiteListFilter = addWhiteListFilter;
function isValidObjectId(id) {
    if (!id) {
        return false;
    }
    try {
        (0, exports.ObjectId)(id);
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.isValidObjectId = isValidObjectId;
