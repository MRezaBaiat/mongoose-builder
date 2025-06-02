"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
require("mongoose-paginate-v2");
const index_1 = require("../index");
class QueryBuilder {
    constructor(model) {
        this.model = model;
        this._conditions = [];
        this._updates = [];
    }
    where(condition, mode = 'and') {
        this._conditions.push(mode === 'or' ? { $or: condition } : condition);
        return this;
    }
    and(condition) {
        return this.where(condition, 'and');
    }
    or(condition) {
        return this.where(condition, 'or');
    }
    withId(id) {
        return this.where({ _id: (0, index_1.ObjectId)(id) });
    }
    arrayIncludes(values) {
        Object.entries(values).forEach(([key, val]) => {
            this.and({ [key]: { $in: val } });
        });
        return this;
    }
    populate(populations) {
        if (!populations)
            return this;
        this._populations = this._populations || [];
        populations.forEach(value => {
            if (typeof value === 'string' && value.includes('.')) {
                const paths = value.split('.');
                const nestedPopulate = paths.reduceRight((acc, path) => ({ path, populate: acc }), null);
                this._populations.push(nestedPopulate);
            }
            else {
                this._populations.push(value);
            }
        });
        return this;
    }
    project(projection) {
        if (!projection)
            return this;
        this._projection = this._projection || {};
        const projections = Array.isArray(projection) ? projection : [projection];
        projections.forEach(p => Object.entries(p).forEach(([key, value]) => {
            this._projection[key] = value;
        }));
        return this;
    }
    page(page, limit) {
        this.skip((page - 1) * limit);
        this.limit(limit);
        return this;
    }
    skip(skip) {
        this._skip = skip;
        return this;
    }
    limit(limit) {
        this._limit = limit;
        return this;
    }
    sort(sort) {
        this._sort = sort;
        return this;
    }
    textLike(fields, mode = 'and') {
        Object.entries(fields).forEach(([key, val]) => {
            this.where({ [key]: new RegExp(val, 'i') }, mode);
        });
        return this;
    }
    geoNear(locations, distanceKm, mode = 'and') {
        const radius = distanceKm / 6371;
        Object.entries(locations).forEach(([key, { lat, lng }]) => {
            this.where({
                [key]: {
                    $geoWithin: {
                        $center: [[lat, lng], radius]
                    }
                }
            }, mode);
        });
        return this;
    }
    valueMatches(values) {
        Object.entries(values).forEach(([key, val]) => this.where({ [key]: { $in: val } }));
        return this;
    }
    valueNotMatches(values) {
        Object.entries(values).forEach(([key, val]) => this.where({ [key]: { $nin: val } }));
        return this;
    }
    whiteListIds(ids = []) {
        return this.valueMatches({ _id: ids });
    }
    set(fields) {
        this._updates.push({ $set: fields });
        return this;
    }
    unset(fields) {
        this._updates.push({ $unset: fields });
        return this;
    }
    modifyArrayElement(fields) {
        const updated = Object.entries(fields).reduce((acc, [key, val]) => {
            acc[`${key}.$`] = val;
            return acc;
        }, {});
        return this.set(updated);
    }
    modifyArrayElements(fields) {
        Object.entries(fields).forEach(([key, { value, where }]) => {
            const filterKey = where ? Object.keys(where).map(k => `$[${k}]`).join('.') : '$[]';
            this.set({ [`${key}.${filterKey}`]: value });
            if (where)
                this.addUpdateFilter({ arrayFilters: [where] });
        });
        return this;
    }
    addUpdateFilter(options) {
        this._updateFilters = this._updateFilters || {};
        Object.entries(options).forEach(([key, value]) => {
            if (Array.isArray(this._updateFilters[key])) {
                this._updateFilters[key].push(...value);
            }
            else if (typeof value === 'object' && typeof this._updateFilters[key] === 'object') {
                this._updateFilters[key] = Object.assign(Object.assign({}, this._updateFilters[key]), value);
            }
            else {
                this._updateFilters[key] = value;
            }
        });
        return this;
    }
    setCurrentDateOn(fields) {
        this._updates.push({ $currentDate: fields });
        return this;
    }
    addToSet(fields) {
        this._updates.push({ $addToSet: fields });
        return this;
    }
    pull(fields) {
        this._updates.push({ $pull: fields });
        return this;
    }
    push(fields, options = {}) {
        Object.entries(fields).forEach(([key, value]) => {
            const update = { $each: options.each ? value : [value] };
            if (options.$sort)
                update.$sort = options.$sort;
            this._updates.push({ $push: { [key]: update } });
        });
        return this;
    }
    getModel() {
        return this.model;
    }
    getCondition() {
        return lodash_1.default.merge({}, ...this._conditions);
    }
    getModified() {
        return lodash_1.default.merge({}, ...this._updates);
    }
    getQuery() {
        return {
            condition: this.getCondition(),
            projection: this._projection,
            populate: this._populations,
            skip: this._skip,
            limit: this._limit,
            sort: this._sort
        };
    }
    paginate(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { condition, projection, populate, sort, skip = 0, limit = 20 } = this.getQuery();
            return this.model.paginate(condition, Object.assign({ populate,
                projection, offset: skip, limit,
                sort, lean: false, pagination: true, leanWithId: false }, options));
        });
    }
    findOne() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { condition, projection, populate, sort } = this.getQuery();
            return this.model.findOne(condition, projection, { sort, populate });
        });
    }
    findMany() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { condition, projection, populate, sort, skip, limit } = this.getQuery();
            return this.model.find(condition, projection, { sort, populate, skip, limit });
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.model.create(data);
        });
    }
    updateOne() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.model.updateOne(this.getCondition(), this.getModified(), this._updateFilters);
        });
    }
    updateMany() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.model.updateMany(this.getCondition(), this.getModified(), this._updateFilters);
        });
    }
    deleteOne() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.model.deleteOne(this.getCondition());
        });
    }
    deleteMany() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.model.deleteMany(this.getCondition());
        });
    }
    clone(modifier) {
        const instance = new this.constructor(this.model);
        Object.assign(instance, lodash_1.default.cloneDeep(this));
        if (modifier)
            modifier(instance);
        return instance;
    }
}
exports.QueryBuilder = QueryBuilder;
