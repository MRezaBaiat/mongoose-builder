"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
const tslib_1 = require("tslib");
require("mongoose-paginate-v2");
const index_1 = require("../index");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
class QueryBuilder {
    constructor(model) {
        this.model = model;
        this._conditions = [];
        this._updates = [];
    }
    where(condition, mode = 'and') {
        if (mode === 'and') {
            this._conditions.push(condition);
        }
        else {
            this._conditions.push({ $or: condition });
        }
        return this;
    }
    and(condition) {
        this.model.find({});
        return this.where(condition);
    }
    or(condition) {
        return this.where(condition, 'or');
    }
    withId(id) {
        return this.where({ _id: (0, index_1.ObjectId)(id) });
    }
    arrayIncludes(what) {
        Object.entries(what).forEach(([key, value]) => this.and({ [key]: { $in: value } }));
        return this;
    }
    populate(populations) {
        populations && (this._populations = this._populations || []).push(...populations.map((value) => {
            if (typeof value === 'string' && value.includes('.')) {
                const arr = value.split('.');
                return arr.reduce((total, currentValue, currentIndex) => {
                    total.path = currentValue;
                    if (currentIndex !== arr.length - 1) {
                        total.populate = {};
                    }
                    return total.populate;
                }, {});
            }
            return value;
        }));
        return this;
    }
    project(projection) {
        if (projection) {
            if (!this._projection) {
                this._projection = {};
            }
            if (Array.isArray(projection)) {
                projection.map(p => this.project(p));
                return this;
            }
            Object.keys(projection).forEach((key) => {
                this._projection[key] = projection[key];
            });
        }
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
    textLike(keyVal, method = 'and') {
        Object.keys(keyVal).forEach((k) => this.where({ [k]: new RegExp(keyVal[k], 'i') }, method));
        return this;
    }
    geoNear(entry, distanceKilometers, method = 'and') {
        const radius = distanceKilometers / 6371;
        Object.keys(entry).forEach((key) => {
            this.where({
                [key]: {
                    $geoWithin: {
                        $center: [[entry[key].lat, entry[key].lng], radius]
                    }
                }
            }, method);
        });
        return this;
    }
    valueNotMatches(what) {
        Object.entries(what).forEach(([key, value]) => this.where({ [key]: { $nin: value } }));
        return this;
    }
    valueMatches(what) {
        Object.entries(what).forEach(([key, value]) => this.where({ [key]: { $in: value } }));
        return this;
    }
    whiteListIds(ids = []) {
        return this.valueMatches({ _id: ids });
    }
    set(entry) {
        Object.entries(entry).forEach(([key, value]) => this._updates.push({ $set: { [key]: value } }));
        return this;
    }
    unset(entry) {
        Object.entries(entry).forEach(([key, value]) => this._updates.push({ $unset: { [key]: value } }));
        return this;
    }
    modifyArrayElement(entry) {
        Object.entries(entry).forEach(([key, value]) => this.set({ [`${key}.$`]: value }));
        return this;
    }
    modifyArrayElements(entry) {
        Object.entries(entry).forEach(([key, { value, where }]) => {
            const filterKey = (where && Object.keys(where).map(k => (`$[${k}]`)).join('.')) || '$[]';
            this.set({ [`${key}.${filterKey}`]: value });
            if (where) {
                this.addUpdateFilter({ arrayFilters: [where] });
            }
        });
        return this;
    }
    addUpdateFilter(options) {
        this._updateFilters = this._updateFilters || {};
        Object.entries(options).forEach(([key, value]) => {
            const existing = this._updateFilters[key];
            if (!existing || typeof existing !== 'object') {
                this._updateFilters[key] = options[key];
            }
            else if (Array.isArray(existing)) {
                this._updateFilters[key].push(...value);
            }
            else {
                this._updateFilters[key] = Object.assign(Object.assign({}, this._updateFilters[key]), value);
            }
        });
        return this;
    }
    setCurrentDateOn(entry) {
        Object.entries(entry).forEach(([key, value]) => this._updates.push({ $currentDate: { [key]: value } }));
        return this;
    }
    addToSet(entry) {
        Object.entries(entry).forEach(([key, value]) => this._updates.push({ $addToSet: { [key]: value } }));
        return this;
    }
    pull(entry) {
        Object.entries(entry).forEach(([key, value]) => this._updates.push({ $pull: { [key]: value } }));
        return this;
    }
    push(entry, options = {}) {
        Object.entries(entry).forEach(([key, value]) => {
            let update = { $each: options.each ? value : [value] };
            if (options.$sort) {
                update['$sort'] = options.$sort;
            }
            this._updates.push({ $push: { [key]: update } });
        });
        return this;
    }
    getModel() {
        return this.model;
    }
    getCondition() {
        return this._conditions;
    }
    getModified() {
        return lodash_1.default.merge(...this._updates);
    }
    getQuery() {
        const condition = this.getCondition();
        return {
            condition,
            projection: this._projection,
            populate: this._populations,
            limit: this._limit,
            skip: this._skip,
            sort: this._sort,
        };
    }
    query(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { skip = 0, limit = 20, projection, populate, sort, condition } = this.getQuery();
            options = Object.assign({ populate,
                projection, offset: skip, limit,
                sort, lean: false, pagination: true, leanWithId: false }, options);
            return this.model.paginate(condition, options);
        });
    }
    findOne() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { condition, projection, populate, sort } = this.getQuery();
            return this.model.findOne(condition, projection, {
                sort,
                populate
            });
        });
    }
    findMany() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { condition, projection, populate, sort, skip, limit } = this.getQuery();
            return this.model.find(condition, projection, {
                sort,
                populate,
                skip,
                limit
            });
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.model.create(data);
        });
    }
    updateMany() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.model.updateMany(this.getCondition(), this.getModified());
        });
    }
    updateOne() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.model.updateOne(this.getCondition(), this.getModified());
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
        const _a = this, { model } = _a, rest = tslib_1.__rest(_a, ["model"]);
        const c = Object.assign(Object.create(Object.getPrototypeOf(this)), JSON.parse(JSON.stringify(rest)));
        c.model = this.model;
        modifier && modifier(c);
        return c;
    }
}
exports.QueryBuilder = QueryBuilder;
