"use strict";
/**
 * # Pattern matching
 **/
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.match = exports.__ = void 0;
exports.__ = '__CATCH_ALL__';
/**
 * ## match
 * Entry point to create pattern matching code branches. It returns an
 * empty builder
 */
exports.match = function (value) { return builder(value, []); };
/**
 * ## builder
 * This is the implementation of our pattern matching, using the
 * builder pattern.
 * This builder pattern is neat because we can have complexe type checking
 * for each of the methods adding new behavior to our pattern matching.
 */
var builder = function (value, patterns) { return ({
    "with": function (pattern, f) {
        return builder(value, __spreadArrays(patterns, [[matchPattern(pattern), f]]));
    },
    when: function (predicate, f) {
        return builder(value, __spreadArrays(patterns, [[predicate, f]]));
    },
    withWhen: function (pattern, predicate, f) {
        var doesMatch = function (value) {
            return Boolean(matchPattern(pattern)(value) && predicate(value));
        };
        return builder(value, __spreadArrays(patterns, [[doesMatch, f]]));
    },
    otherwise: function (f) {
        return builder(value, __spreadArrays(patterns, [
            [matchPattern(exports.__), f],
        ]));
    },
    run: function () {
        var tupple = patterns.find(function (_a) {
            var predicate = _a[0];
            return predicate(value);
        });
        if (!tupple) {
            throw new Error("Pattern matching error: no pattern matches value " + value);
        }
        var mapper = tupple[1];
        return mapper(value);
    }
}); };
var isObject = function (value) {
    return value && typeof value === 'object';
};
var wildcards = [String, Boolean, Number];
// tells us if the value matches a given pattern.
var matchPattern = function (pattern) { return function (value) {
    if (pattern === exports.__)
        return true;
    if (pattern === String)
        return typeof value === 'string';
    if (pattern === Boolean)
        return typeof value === 'boolean';
    if (pattern === Number) {
        return typeof value === 'number' && !Number.isNaN(value);
    }
    if (typeof pattern !== typeof value)
        return false;
    if (Array.isArray(pattern) && Array.isArray(value)) {
        return pattern.length === 1
            ? value.every(function (v, i) { return matchPattern(pattern[0])(v); })
            : pattern.length === value.length
                ? value.every(function (v, i) {
                    return pattern[i] ? matchPattern(pattern[i])(v) : false;
                })
                : false;
    }
    if (value instanceof Map && pattern instanceof Map) {
        return __spreadArrays(pattern.keys()).every(function (key) {
            return matchPattern(pattern.get(key))(value.get(key));
        });
    }
    if (value instanceof Set && pattern instanceof Set) {
        var patternValues = __spreadArrays(pattern.values());
        var allValues_1 = __spreadArrays(value.values());
        return patternValues.length === 0
            ? allValues_1.length === 0
            : patternValues.length === 1
                ? patternValues.every(function (subPattern) {
                    return wildcards.includes(subPattern)
                        ? matchPattern([subPattern])(allValues_1)
                        : value.has(subPattern);
                })
                : patternValues.every(function (subPattern) { return value.has(subPattern); });
    }
    if (isObject(value) && isObject(pattern)) {
        return Object.keys(pattern).every(function (k) {
            // @ts-ignore
            return matchPattern(pattern[k])(value[k]);
        });
    }
    return value === pattern;
}; };
