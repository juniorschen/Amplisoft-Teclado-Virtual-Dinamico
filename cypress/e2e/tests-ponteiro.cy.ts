import { CalcularDelayRealizarAcao, LetraVogal, VaiErrar, VaiPredizer, cenariosTestePonteiro, velocidadeIncrementalPonteiroAnimacao } from "cypress/support/texts";
import promisify from 'cypress-promise';

describe('Validar Desempenho do Software', () => {
    it('x palavras, y dpi, z% precision, 1~~3 erros a cada 100 palavras', async () => {

        for (let cenarioTeste of cenariosTestePonteiro) {
            window["Cypress"]["Tipo"] = "Ponteiro";
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
                                    await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, vogaisEl, cenarioTeste.dpi) * 1000));
                                    await promisify(cy.get('p[id="vogaisElementRef"]').trigger('mouseover'));
                                } else {
                                    await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, mostrarMaisEl, cenarioTeste.dpi) * 1000));
                                    await promisify(cy.get('p[id="mostrarMaisElementRef"]').trigger('mouseover'));
                                }
                            } else {
                                break;
                            }
                        }

                        defaultDelayAcharLetra = CalcularDelayRealizarAcao(centerEl, letraElement, cenarioTeste.dpi * velocidadeIncrementalPonteiroAnimacao) * 1000;
                        await promisify(cy.wait(defaultDelayAcharLetra));

                        const vaiErrar = VaiErrar();
                        if (vaiErrar) {
                            await promisify(cy.get('input[id="input"]').type("5"));

                            await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, limparEl, cenarioTeste.dpi) * 1000));
                            await promisify(cy.get('p[id="limparElementRef"]').trigger('mouseover'));

                            await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, letraElement, cenarioTeste.dpi * velocidadeIncrementalPonteiroAnimacao) * 1000));
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
            await promisify(cy.screenshot(window["Cypress"]["Tipo"] + "_Dpi" +  window["Cypress"]["Dpi"] + "_Prec" + window["Cypress"]["Precisao"]));
        }

    });
});