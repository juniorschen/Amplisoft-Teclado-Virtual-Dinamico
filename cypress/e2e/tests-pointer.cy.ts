import { WordsText400 } from "cypress/support/texts";
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

describe('Validar Desempenho do Software', () => {
    it('400 palavras, 200 dpi, 60% precision, 1~~3 erros a cada 100 palavras', async () => {
        await promisify(cy.visit('/'));
        await promisify(cy.get('div[id="playerDivElementRef"]', { timeout: 10000 }).should('be.visible'));

        const dc = await promisify(cy.document());
        const limparEl = dc.getElementById("limparElementRef");
        const espacoEl = dc.getElementById("espacoElementRef");
        const vogaisEl = dc.getElementById("vogaisElementRef");
        const centerEl = dc.getElementById("centerDivElementRef");
        const mostrarMaisEl = dc.getElementById("mostrarMaisElementRef");

        const textoDivididoPorEspacoVazio = WordsText400.replace(/\n/g, '').toLowerCase().split(" ");
        for (let [indexPalavra, palavraAtual] of textoDivididoPorEspacoVazio.entries()) {

            let palavraDigitadaAtual = "";
            let defaultDelayAcharLetra;
            const letrasPalavra = palavraAtual.split("");

            for (let [indexLetra, letra] of letrasPalavra.entries()) {
                const vaiPredizer = VaiPredizer(60, palavraAtual, palavraDigitadaAtual);
                if (!vaiPredizer) {
                    let letraElement;
                    for (let index = 0; index < 5; index++) {
                        letraElement = dc.getElementById(letra);
                        if (!letraElement) {
                            if (LetraVogal(letra)) {
                                await promisify(cy.get('p[id="vogaisElementRef"]').trigger('mouseover'));
                                await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, vogaisEl, 200) * 1000));
                            } else {
                                await promisify(cy.get('p[id="mostrarMaisElementRef"]').trigger('mouseover'));
                                await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, mostrarMaisEl, 200) * 1000));
                            }
                        } else {
                            break;
                        }
                    }

                    defaultDelayAcharLetra = CalcularDelayRealizarAcao(centerEl, letraElement, 200) * 1000;
                    await promisify(cy.wait(defaultDelayAcharLetra));

                    const vaiErrar = VaiErrar();
                    if (vaiErrar) {
                        await promisify(cy.get('input[id="input"]').type("5"));

                        await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, limparEl, 200) * 1000));
                        await promisify(cy.get('p[id="limparElementRef"]').realHover());

                        await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, letraElement, 200) * 1000));
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
                await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, espacoEl, 200) * 1000));
                await promisify(cy.get('p[id="espacoElementRef"]').trigger('mouseover'));
            }
        }
    });
});