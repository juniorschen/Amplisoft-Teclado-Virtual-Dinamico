export function calcularDiferencaEmMilissegundos(data1: Date, data2: Date): number {
    if (!data1 || !data2)
        return 0;
    return Math.abs(data1.getTime() - data2.getTime());
}