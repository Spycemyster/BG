// Utility functions

/**
 * Performs a deep cloning of the object.
 * @param {object} obj
 * @return {object} cloned object
 */
export function clone(obj: object): object {
    return JSON.parse(JSON.stringify(obj));
}
