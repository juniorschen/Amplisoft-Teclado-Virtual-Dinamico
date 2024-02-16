export const WordsText =  `na vastidao do universo somos meros espectadores flutuando sem rumo em meio ao caos cosmico sem razao aparente nossa existencia se desenrola como um filme sem roteiro em um palco improvavel
a vida e um fenomeno efemero em um planeta remoto a evolucao moldando as formas de vida de maneira imprevisivel e inexoravel o ciclo incessante de nascimento e morte um ballet desordenado
as emocoes fluem como rios selvagens sem represas a alegria e a tristeza entrelacadas como fios invisiveis conectando os coracoes humanos em uma teia complexa de experiencias compartilhadas
a linguagem se desenha como arte abstrata sem tramas definidas as palavras dancam no vacuo da comunicacao sem pontos e virgulas para estruturar o significado cada frase uma expressao livre de pensamentos sem amarras
mesmo na ausencia de acentos e pontuacoes a mensagem persiste como um eco na mente do leitor a compreensao emergindo das entrelinhas em um ato de interpretacao pessoal
`

export function VaiErrar() {
    let numeroEscolhido = Math.floor(Math.random() * 101);
    let tentativas = Math.floor(Math.random() * 3) + 1;
    for (let index = 0; index < tentativas; index++) {
        let numeroRandomizado = Math.floor(Math.random() * 101);
        if (numeroRandomizado == numeroEscolhido) {
            return true;
        }
    }
    return false;
}

export function VaiPredizer(percentualPredizer: number, palavraAtual, digitado: string) {
    if (palavraAtual.length > 3 && digitado.length >= 3) {
        let numeroEscolhido = Math.floor(Math.random() * 101);
        for (let index = 0; index < percentualPredizer; index++) {
            let numeroRandomizado = Math.floor(Math.random() * 101);
            if (numeroRandomizado == numeroEscolhido) {
                return true;
            }
        }
    }
    return false;
}

export function CalcularDelayRealizarAcao(origin, target: HTMLElement, dpi: number) {
    const distancia = Math.abs(origin.getBoundingClientRect().x - target.getBoundingClientRect().x);
    return distancia / dpi;
}

export const cenariosTestePonteiro = [
    /* { texto: WordsText, dpi: 200, precisao: 60 },
    { texto: WordsText, dpi: 200, precisao: 75 },
    { texto: WordsText, dpi: 200, precisao: 90 },

    { texto: WordsText, dpi: 400, precisao: 60 },
    { texto: WordsText, dpi: 400, precisao: 75 },
    { texto: WordsText, dpi: 400, precisao: 90 },

    { texto: WordsText, dpi: 600, precisao: 60 },
    { texto: WordsText, dpi: 600, precisao: 75 }, */
    { texto: WordsText, dpi: 600, precisao: 90 },
];

export const cenariosTesteSensorial = [
    { texto: WordsText, delayMsEscolha: 500, delayIteracoes: 100, precisao: 60 },
    { texto: WordsText, delayMsEscolha: 500, delayIteracoes: 100, precisao: 75 },
    { texto: WordsText, delayMsEscolha: 500, delayIteracoes: 100, precisao: 90 },

    { texto: WordsText, delayMsEscolha: 3000, delayIteracoes: 200, precisao: 60 },
    { texto: WordsText, delayMsEscolha: 3000, delayIteracoes: 200, precisao: 75 },
    { texto: WordsText, delayMsEscolha: 3000, delayIteracoes: 200, precisao: 90 },
];