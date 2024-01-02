export const concatTypedArrays = (a, b) => {
    const c = new a.constructor(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
};

export function findClosestIndex(target: number, arrange: number[]): number {
    let closestValue = arrange[0];
    let closestIndex = 0;
    let minimumDifference = Math.abs(target - closestValue);

    for (let i = 1; i < arrange.length; i++) {
        let diferencaAtual = Math.abs(target - arrange[i]);

        if (diferencaAtual < minimumDifference) {
            minimumDifference = diferencaAtual;
            closestValue = arrange[i];
            closestIndex = i;
        }
    }

    return closestIndex;
}