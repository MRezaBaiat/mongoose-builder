"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataQueryBuilder = exports.QueryBuilder = exports.isValidObjectId = exports.ObjectId = void 0;
const tslib_1 = require("tslib");
const data_query_builder_1 = require("./src/data.query.builder");
Object.defineProperty(exports, "DataQueryBuilder", { enumerable: true, get: function () { return data_query_builder_1.DataQueryBuilder; } });
const query_builder_1 = tslib_1.__importDefault(require("./src/query.builder"));
exports.QueryBuilder = query_builder_1.default;
exports.ObjectId = require('mongoose').Types.ObjectId;
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
