export const concatTypedArrays = (a, b) => {
    const c = new a.constructor(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
};