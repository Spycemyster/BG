/**
 * An optimized way of storing boolean values into individual bits rather than Boolean types. Each BitArray uses
 * 64 bits and can store 64 boolean values.
 */
export class BitArray {
    data: number;
    constructor() {
        this.data = 0b0;
    }

    /**
     * Gets the bit value at the given index.
     * @param index Index of the bit array.
     * @returns The boolean value at the index.
     */
    get(index: number): boolean {
        if (index < 0 || index > 63) {
            throw new RangeError(`Index ${index} is out of bounds. Must be within the range [0, 63].`);
        }
        return Boolean(this.data & (1 << index));
    }

    /**
     * Sets the value at the specific index.
     * @param index The index to be set.
     * @param value The value to be set
     */
    set(index: number, value: boolean) {
        if (index < 0 || index > 63) {
            throw new RangeError(`Index ${index} is out of bounds. Must be within the range [0, 63].`);
        }
        this.data = this.data | (1 << index);
        if (!value) this.data = this.data ^ (1 << index);
    }

    clear() {
        this.data = 0b0;
    }
}
