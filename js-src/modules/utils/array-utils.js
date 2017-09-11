'use strict';

var _ = require('lodash');

// Remocve first found matching value
module.exports = {
    // Removes the first matching item in an array determined by iterator function.
    // Returns new array of removed items. Mutates original array
    removeFirst: function (array, func) {
        var matchingIndex = _.findIndex(array, func);
        if (matchingIndex > -1) {
            // we found a match
            var removedItem = array.splice(matchingIndex, 1);
        }
        return removedItem;
    },
    removeFirstValue: function (array, item) {
        var iteratorFunction = function (iterateItem) {
            return item === iterateItem;
        };
        return module.exports.removeFirst(array, iteratorFunction);
    },
    // removes one item from ArrayA for each matching item in ArrayB
    // Contrast to _.difference which remove all items from ArrayA which are in ArrayB
    //
    // example: Array A contains two of the same item, and array B contains one matching item
    //  The returned copy of array A will have one of the items removed.
    // example: Array A contains two of the same item, and array B contains two of the same matching items
    //  The returned copy of array A will have both of the items removed.
    differenceSingle: function (arrayA, arrayB) {
        var itemsNotInArrayB = [];
        var cloneB = _.clone(arrayB);
        _.each(arrayA, function (itemInA) {
            var itemAInArrayBIndex = _.findIndex(cloneB, function (itemInB) {
                return itemInB === itemInA;
            });
            if (itemAInArrayBIndex > -1) {
                // item exists in array B
                // remove this instance of item, so we don't match it again
                cloneB.splice(itemAInArrayBIndex, 1);
            } else {
                itemsNotInArrayB.push(itemInA);
            }
        });

        return itemsNotInArrayB;
    },
    // Returns items from arrayA which are also present in arrayB. Each item from ArrayA is matched
    //  against a single item from arrayB, so that duplicates are not removed unless also duplicated.
    // Contrast this to _.intersection, which only returns unique values present in both arrays
    //
    // example: ArrayA has two of the same item. Array B has one of these matching items. Returned array will contain one item
    // example: ArrayA has two of the same item. Array B has one of these matching items. Returned array will contain two items
    intersectionSingle: function (arrayA, arrayB) {
        var itemsInArrayAandB = [];
        var cloneB = _.clone(arrayB);

        _.each(arrayA, function (itemInA) {
            var itemAInArrayBIndex = _.findIndex(cloneB, function (itemInB) {
                return itemInB === itemInA;
            });
            if (itemAInArrayBIndex > -1) {
                // item exists in array B
                // remove this instance of item, so we don't match it again
                cloneB.splice(itemAInArrayBIndex, 1);
                itemsInArrayAandB.push(itemInA);
            }
        });

        return itemsInArrayAandB;
    }
};
