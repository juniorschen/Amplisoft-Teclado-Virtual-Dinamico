export const WordsText = `Tenho um animal categorizado pelas suas quatro patas o grande focinho e dentes caninos Estou me referindo ao cachorro o melhor amigo do homem por diversas
geracoes ele vem sendo domesticado para variados propositos Comecando nos tempos antigos eram utilizados para conduzir os rebanhos de ovelhas e carneiros Ainda hoje podemos encontrar
pastores que utilizam das mesmas tecnicas dessa geracao passada De fato encontramos em sua maioria o uso como companheiro para vida em tempos atuais sendo ate mesmo utilizados como
substitutos a filhos em determinadas culturas onde o crescimento desenfreado do capitalismo e populacao vem fazendo cada vez mais jovens tomarem a decisao de nao ter filhos
`

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

export function CalcularDelayRealizarAcao(origin, target: HTMLElement, dpi: number) {
    const distancia = Math.abs(origin.getBoundingClientRect().x - target.getBoundingClientRect().x);
    return distancia / dpi;
}

export const cenariosTestePonteiro = [
    /* { texto: WordsText, dpi: 600 },
    { texto: WordsText, dpi: 600 },
    { texto: WordsText, dpi: 600 },

    { texto: WordsText, dpi: 1200 },
    { texto: WordsText, dpi: 1200 },
    { texto: WordsText, dpi: 1200 },

    { texto: WordsText, dpi: 1800 },
    { texto: WordsText, dpi: 1800 }, */
    { texto: WordsText, dpi: 1800 },
];

export const cenariosTesteSensorial = [
    { texto: WordsText, delayMsEscolha: 500, delayIteracoes: 100 },
    { texto: WordsText, delayMsEscolha: 3000, delayIteracoes: 200 },
];