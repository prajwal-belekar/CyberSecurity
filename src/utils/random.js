/**
 * Deterministic pseudo-random helpers.
 * Mock telemetry must be *believable and reproducible* — a seeded generator
 * keeps demo data stable between reloads while still feeling alive.
 */
export function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
export function hashString(input) {
    let h = 2166136261;
    for (let i = 0; i < input.length; i += 1) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}
export function seededRandom(seed) {
    return mulberry32(typeof seed === 'number' ? seed : hashString(seed));
}
export function pick(rng, items) {
    return items[Math.floor(rng() * items.length) % items.length];
}
export function intBetween(rng, min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
}
export function hexString(rng, length) {
    const chars = '0123456789abcdef';
    let out = '';
    for (let i = 0; i < length; i += 1)
        out += chars[Math.floor(rng() * 16)];
    return out;
}
