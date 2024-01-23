import { WordsText1200, WordsText400, WordsText800 } from "cypress/support/texts";
import promisify from 'cypress-promise'

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

export function LetraVogal(c) {
    return ['a', 'e', 'i', 'o', 'u'].indexOf(c.toLowerCase()) !== -1;
}

const cenariosTeste = [
    { texto: WordsText400, dpi: 200, precisao: 60 },
    /* { texto: WordsText400, dpi: 200, precisao: 75 },
    { texto: WordsText400, dpi: 200, precisao: 90 },

    { texto: WordsText400, dpi: 400, precisao: 60 },
    { texto: WordsText400, dpi: 400, precisao: 75 },
    { texto: WordsText400, dpi: 400, precisao: 90 },

    { texto: WordsText400, dpi: 600, precisao: 60 },
    { texto: WordsText400, dpi: 600, precisao: 75 },
    { texto: WordsText400, dpi: 600, precisao: 90 },

    { texto: WordsText800, dpi: 200, precisao: 60 },
    { texto: WordsText800, dpi: 200, precisao: 75 },
    { texto: WordsText800, dpi: 200, precisao: 90 },

    { texto: WordsText800, dpi: 400, precisao: 60 },
    { texto: WordsText800, dpi: 400, precisao: 75 },
    { texto: WordsText800, dpi: 400, precisao: 90 },

    { texto: WordsText800, dpi: 600, precisao: 60 },
    { texto: WordsText800, dpi: 600, precisao: 75 },
    { texto: WordsText800, dpi: 600, precisao: 90 },

    { texto: WordsText1200, dpi: 200, precisao: 60 },
    { texto: WordsText1200, dpi: 200, precisao: 75 },
    { texto: WordsText1200, dpi: 200, precisao: 90 },

    { texto: WordsText1200, dpi: 400, precisao: 60 },
    { texto: WordsText1200, dpi: 400, precisao: 75 },
    { texto: WordsText1200, dpi: 400, precisao: 90 },

    { texto: WordsText1200, dpi: 600, precisao: 60 },
    { texto: WordsText1200, dpi: 600, precisao: 75 },
    { texto: WordsText1200, dpi: 600, precisao: 90 } */
]

describe('Validar Desempenho do Software', () => {
    it('x palavras, y dpi, z% precision, 1~~3 erros a cada 100 palavras', async () => {

        for(let cenarioTeste of cenariosTeste) {
            window["Cypress"]["Palavras"] = cenarioTeste.texto.replace(/\n/g, '').toLowerCase().split(" ").length;
            window["Cypress"]["Dpi"] = cenarioTeste.dpi;
            window["Cypress"]["Precisao"] = cenarioTeste.precisao;

            await promisify(cy.visit('/'));
            await promisify(cy.get('div[id="playerDivElementRef"]', { timeout: 10000 }).should('be.visible'));
    
            const dc = await promisify(cy.document());
            const limparEl = dc.getElementById("limparElementRef");
            const espacoEl = dc.getElementById("espacoElementRef");
            const vogaisEl = dc.getElementById("vogaisElementRef");
            const centerEl = dc.getElementById("centerDivElementRef");
            const mostrarMaisEl = dc.getElementById("mostrarMaisElementRef");
    
            const textoDivididoPorEspacoVazio = cenarioTeste.texto.replace(/\n/g, '').toLowerCase().split(" ");
            for (let [indexPalavra, palavraAtual] of textoDivididoPorEspacoVazio.entries()) {
    
                let palavraDigitadaAtual = "";
                let defaultDelayAcharLetra;
                const letrasPalavra = palavraAtual.split("");
    
                for (let [indexLetra, letra] of letrasPalavra.entries()) {
                    const vaiPredizer = VaiPredizer(cenarioTeste.precisao, palavraAtual, palavraDigitadaAtual);
                    if (!vaiPredizer) {
                        let letraElement;
                        for (let index = 0; index < 5; index++) {
                            letraElement = dc.getElementById(letra);
                            if (!letraElement) {
                                if (LetraVogal(letra)) {
                                    await promisify(cy.get('p[id="vogaisElementRef"]').trigger('mouseover'));
                                    await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, vogaisEl, cenarioTeste.dpi) * 1000));
                                } else {
                                    await promisify(cy.get('p[id="mostrarMaisElementRef"]').trigger('mouseover'));
                                    await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, mostrarMaisEl, cenarioTeste.dpi) * 1000));
                                }
                            } else {
                                break;
                            }
                        }
    
                        defaultDelayAcharLetra = CalcularDelayRealizarAcao(centerEl, letraElement, cenarioTeste.dpi) * 1000;
                        await promisify(cy.wait(defaultDelayAcharLetra));
    
                        const vaiErrar = VaiErrar();
                        if (vaiErrar) {
                            await promisify(cy.get('input[id="input"]').type("5"));
    
                            await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, limparEl, cenarioTeste.dpi) * 1000));
                            await promisify(cy.get('p[id="limparElementRef"]').realHover());
    
                            await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, letraElement, cenarioTeste.dpi) * 1000));
                        }
    
                        await promisify(cy.get(`p[id="${letra}"]`).trigger('mouseover'));
                        palavraDigitadaAtual += letra;
                    } else {
                        const restantePalavra = palavraAtual.substring(indexLetra);
                        await promisify(cy.wait(defaultDelayAcharLetra));
                        await promisify(cy.get('input[id="input"]').type(restantePalavra));
                        break;
                    }
                }
    
                // insere espaço se não for a ultima palavra
                if (indexPalavra + 1 != textoDivididoPorEspacoVazio.length) {
                    await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, espacoEl, cenarioTeste.dpi) * 1000));
                    await promisify(cy.get('p[id="espacoElementRef"]').trigger('mouseover'));
                }
            }

            // espera 10 segundos para que o software fique afk e printe os resultados
            await promisify(cy.wait(10));
        }

    });
});