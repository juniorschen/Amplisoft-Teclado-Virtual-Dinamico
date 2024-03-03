import { CalcularDelayRealizarAcao, VaiErrar, cenariosTestePonteiro } from "cypress/support/texts";
import promisify from 'cypress-promise';

describe('Validar Desempenho do Software', () => {
    it('y dpi, 1~~3 erros a cada 100 palavras', async () => {
        const dc = await promisify(cy.document());
        // espera 30 segundos para que a base seja configurada
        await promisify(cy.wait(30));

        for (let index = 0; index < 10; index++) {
            for (let cenarioTeste of cenariosTestePonteiro) {
                window["Cypress"]["Tipo"] = "Ponteiro";
                window["Cypress"]["Dpi"] = cenarioTeste.dpi;

                await promisify(cy.visit('/'));
                await promisify(cy.get('div[id="playerDivElementRef"]', { timeout: 10000 }).should('be.visible'));

                const limparEl = dc.getElementById("limparElementRef");
                const espacoEl = dc.getElementById("espacoElementRef");
                const centerEl = dc.getElementById("centerDivElementRef");

                const textoDivididoPorEspacoVazio = cenarioTeste.texto.replace(/\n/g, '').toLowerCase().split(" ");
                for (let [indexPalavra, palavraAtual] of textoDivididoPorEspacoVazio.entries()) {
                    const letrasPalavra = palavraAtual.split("");
                    let defaultDelayAcharLetra;
                    let jaInseriuEspaco = false;

                    for (let [_, letra] of letrasPalavra.entries()) {
                        let wordElement = dc.getElementById(palavraAtual);
                        if (wordElement) {
                            await promisify(cy.wait(defaultDelayAcharLetra));
                            await promisify(cy.get(`p[id="${letra}"]`).trigger('mouseover'));
                            jaInseriuEspaco = true;
                            break;
                        }

                        let letraElement = dc.getElementById(letra);
                        defaultDelayAcharLetra = CalcularDelayRealizarAcao(centerEl, letraElement, cenarioTeste.dpi) * 1000;
                        await promisify(cy.wait(defaultDelayAcharLetra));

                        const vaiErrar = VaiErrar();
                        if (vaiErrar) {
                            await promisify(cy.get('input[id="input"]').type("5"));

                            await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, limparEl, cenarioTeste.dpi) * 1000));
                            await promisify(cy.get('p[id="limparElementRef"]').trigger('mouseover'));

                            await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, letraElement, cenarioTeste.dpi) * 1000));
                        }

                        await promisify(cy.get(`p[id="${letra}"]`).trigger('mouseover'));
                    }

                    // insere espaço se não for a ultima palavra
                    if (indexPalavra + 1 != textoDivididoPorEspacoVazio.length && !jaInseriuEspaco) {
                        await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, espacoEl, cenarioTeste.dpi) * 1000));
                        await promisify(cy.get('p[id="espacoElementRef"]').trigger('mouseover'));
                    }
                }

                // espera para que o software fique afk e printe os resultados
                await promisify(cy.contains('Resultados dos Testes', { timeout: 1000000 }).should('be.visible'));
                await promisify(cy.screenshot(window["Cypress"]["Tipo"] + "_Dpi" + window["Cypress"]["Dpi"] + "_Loop" + index));
            }
        }

    });
});