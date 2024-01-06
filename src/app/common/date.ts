export function calcularDiferencaEmMilissegundos(data1: Date, data2: Date): number {
    if (!data1 || !data2)
        return 0;
    return Math.abs(data1.getTime() - data2.getTime());
}

export function calcularDiferencaEmSegundos(data1: Date, data2: Date): number {
    if (!data1 || !data2)
        return 0;
    const milissegundos = Math.abs(data1.getTime() - data2.getTime());
    return  milissegundos / 1000;
}