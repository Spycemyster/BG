const mult = 75;
const increment = 74;
export const mod = 65537;
/**
 * A pseudo random number generator for creating deterministic number sequences on both the server and client.
 * Useful for combat validation for combat sessions.
 */
export class RandomNumberGenerator {
    seed: number;
    constructor(seed: number) {
        this.seed = seed;
    }

    generate() {
        const x = this.seed;
        this.seed = (mult * x + increment) % mod;
        return this.seed;
    }

    convert(value: number) {
        return value / mod;
    }
}
