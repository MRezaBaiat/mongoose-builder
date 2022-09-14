"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = exports.isValidObjectId = exports.ObjectId = void 0;
const query_builder_1 = require("./src/query.builder");
Object.defineProperty(exports, "QueryBuilder", { enumerable: true, get: function () { return query_builder_1.QueryBuilder; } });
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
