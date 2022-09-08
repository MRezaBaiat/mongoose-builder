"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataQueryBuilder = void 0;
const index_1 = require("../index");
class DataQueryBuilder {
    constructor() {
        this._updates = [];
        this._conditions = [];
        this._selection = [];
        this._ors = [];
    }
    withId(id) {
        this.id = String(id);
        this._conditions.push({ _id: (0, index_1.ObjectId)(id) });
        return this;
    }
    where(entry) {
        this._conditions.push(entry);
        return this;
    }
    whereDate(what, mode, method = 'and') {
        Object.keys(what).forEach((key) => {
            if (method === 'and') {
                this.andWhere({ [key]: { [`$${mode}`]: what[key] } });
            }
            else {
                this.orWhere({ [key]: { [`$${mode}`]: what[key] } });
            }
        });
        return this;
    }
    whereArrayIncludes(what, method = 'and') {
        Object.keys(what).forEach((key) => {
            if (method === 'and') {
                this.andWhere({ [key]: { $in: what[key] } });
            }
            else {
                this.orWhere({ [key]: { $in: what[key] } });
            }
        });
        return this;
    }
    populate(populations) {
        if (populations) {
            if (!this._populations) {
                this._populations = [];
            }
            populations.forEach((val) => {
                this._populations.push(val);
            });
        }
        return this;
    }
    populateFile(path, select) {
        this.populate([{ path, model: 'fs.files', select }]);
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
    select(selection) {
        this._selection.push(...selection);
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
    whereTextLike(keyVal, method = 'and') {
        const objects = [];
        Object.keys(keyVal).forEach((k) => {
            if (keyVal[k]) {
                objects.push({ [k]: new RegExp(keyVal[k], 'i') });
            }
        });
        if (method === 'and') {
            this.andWhere(objects);
        }
        else if (method === 'or') {
            this.orWhere(objects);
        }
        return this;
    }
    andWhere(and) {
        if (Array.isArray(and)) {
            this._conditions.push(...and);
        }
        else {
            this._conditions.push(and);
        }
        return this;
    }
    orWhere(or) {
        if (Array.isArray(or)) {
            this._ors.push(...or);
        }
        else {
            this._ors.push(or);
        }
        return this;
    }
    nearCoordinates(entry, distanceKilometers) {
        const radius = distanceKilometers / 6371;
        Object.keys(entry).forEach((key) => {
            this._conditions.push({
                [key]: {
                    $geoWithin: {
                        $center: [[entry[key].lat, entry[key].lng], radius]
                    }
                }
            });
        });
        return this;
    }
    whiteList(ids = []) {
        return this.andWhere({
            _id: {
                $in: ids.map((i) => ({ _id: i }))
            }
        });
    }
    set(entry) {
        this._updates.push(entry);
        return this;
    }
    addToSet(entry) {
        Object.keys(entry).forEach((key) => {
            this._updates.push({ $addToSet: { [key]: entry[key] } });
        });
        return this;
    }
    pull(entry) {
        Object.keys(entry).forEach((key) => {
            this._updates.push({ $pull: { [key]: entry[key] } });
        });
        return this;
    }
    push(entry) {
        Object.keys(entry).forEach((key) => {
            this._updates.push({ $push: { [key]: entry[key] } });
        });
        return this;
    }
    getCondition() {
        const condition = {};
        this._conditions.forEach((cond) => {
            Object.keys(cond).forEach(key => {
                condition[key] = cond[key];
            });
        });
        if (this._ors.length > 0) {
            condition.$or = condition.$or || [];
            this._ors.forEach((val) => {
                condition.$or.push(val);
            });
        }
        return condition;
    }
    getUpdates() {
        const updates = {};
        this._updates.forEach((cond) => {
            Object.keys(cond).forEach(key => {
                updates[key] = cond[key];
            });
        });
        return updates;
    }
    getQuery() {
        const condition = this.getCondition();
        return {
            condition,
            projection: this._projection,
            populations: this._populations,
            limit: this._limit,
            skip: this._skip,
            sort: this._sort,
            select: this._selection
        };
    }
    getId() {
        return this.id;
    }
    clone(modifier) {
        modifier && modifier(this);
        return Object.assign(Object.create(this), this);
    }
}
exports.DataQueryBuilder = DataQueryBuilder;
