"use strict";
/// <reference path="../typings/readable-stream.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module through
 * @license MIT
 * @version 2017/10/25
 */
const utils_1 = require("./utils");
const readable_stream_1 = require("readable-stream");
/**
 * @class DestroyableTransform
 */
class DestroyableTransform extends readable_stream_1.Transform {
    /**
     * @constructor
     * @param {Object} options
     */
    constructor(options) {
        super(options);
        this._destroyed = false;
    }
    /**
     * @method destroy
     * @param {any} error
     */
    destroy(error) {
        if (this._destroyed)
            return;
        this._destroyed = true;
        const self = this;
        process.nextTick(function () {
            if (error)
                self.emit('error', error);
            self.emit('close');
        });
    }
}
exports.DestroyableTransform = DestroyableTransform;
/**
 * @function noop
 * @description A noop _transform function
 * @param {any} chunk
 * @param {string} encoding
 * @param {Function} next
 */
function noop(chunk, _encoding, next) {
    next(null, chunk);
}
/**
 * @function throuth
 * @description Create a new export function, contains common logic for dealing with arguments
 * @param {Object} [options]
 * @param {Function} transform
 * @param {Function} [flush]
 * @returns {DestroyableTransform}
 */
function through(options, transform, flush) {
    if (utils_1.typeIs(options, 'function')) {
        flush = transform;
        transform = options;
        options = {};
    }
    options = options || {};
    options.objectMode = options.objectMode || false;
    options.highWaterMark = options.highWaterMark || 16;
    if (!utils_1.typeIs(transform, 'function'))
        transform = noop;
    if (!utils_1.typeIs(flush, 'function'))
        flush = null;
    const stream = new DestroyableTransform(options);
    stream._transform = transform;
    if (flush)
        stream._flush = flush;
    return stream;
}
exports.default = through;
