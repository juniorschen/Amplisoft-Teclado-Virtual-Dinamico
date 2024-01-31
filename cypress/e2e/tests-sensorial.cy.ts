import { CalcularDelayRealizarAcao, LetraVogal, VaiErrar, VaiPredizer, cenariosTesteSensorial } from "cypress/support/texts";
import promisify from 'cypress-promise';

// quantidadeIteracoesNecessariasEncontrarSetor para se localizar no setor correto que vai iteragir (centro esquerda direta), 1.5 ação é a média no caso
// quantidadeIteracoesNecessariasAcao aqui pode variar, quando se refere as letras num layout padrão de 11, a média seria 5, no central apenas uma ação no esquerdo 2
function getDelaySensorial(delayEscolha, delayIteracao, setor) {
    const quantidadeIteracoesNecessariasEncontrarSetor = 1.5;
    let quantidadeIteracoesNecessariasAcao = 5;
    if (setor == "centro") {
        quantidadeIteracoesNecessariasAcao = 1;
    } else if (setor == "esquerda") {
        quantidadeIteracoesNecessariasAcao = 2;
    }

    return delayEscolha + (delayIteracao * (quantidadeIteracoesNecessariasAcao + quantidadeIteracoesNecessariasEncontrarSetor));
}

describe('Validar Desempenho do Software', () => {
    it('x palavras, y dpi, z% precision, 1~~3 erros a cada 100 palavras', async () => {

        for (let cenarioTeste of cenariosTesteSensorial) {
            window["Cypress"]["Tipo"] = "Sensorial";
            window["Cypress"]["DelayMsEscolha"] = cenarioTeste.delayMsEscolha;
            window["Cypress"]["DelayMsIteracao"] = cenarioTeste.delayIteracoes;
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
                const letrasPalavra = palavraAtual.split("");

                for (let [indexLetra, letra] of letrasPalavra.entries()) {
                    const vaiPredizer = VaiPredizer(cenarioTeste.precisao, palavraAtual, palavraDigitadaAtual);
                    if (!vaiPredizer) {
                        let letraElement;
                        for (let index = 0; index < 5; index++) {
                            letraElement = dc.getElementById(letra);
                            if (!letraElement) {
                                if (LetraVogal(letra)) {
                                    await promisify(cy.wait(getDelaySensorial(cenarioTeste.delayMsEscolha, cenarioTeste.delayIteracoes, "esquerda")));
                                    await promisify(cy.get('p[id="vogaisElementRef"]').trigger('mouseover'));
                                } else {
                                    await promisify(cy.wait(getDelaySensorial(cenarioTeste.delayMsEscolha, cenarioTeste.delayIteracoes, "centro")));
                                    await promisify(cy.get('p[id="mostrarMaisElementRef"]').trigger('mouseover'));
                                }
                            } else {
                                break;
                            }
                        }

                        await promisify(cy.wait(getDelaySensorial(cenarioTeste.delayMsEscolha, cenarioTeste.delayIteracoes, "direita")));

                        const vaiErrar = VaiErrar();
                        if (vaiErrar) {
                            await promisify(cy.get('input[id="input"]').type("5"));

                            await promisify(cy.wait(getDelaySensorial(cenarioTeste.delayMsEscolha, cenarioTeste.delayIteracoes, "esquerda")));
                            await promisify(cy.get('p[id="limparElementRef"]').trigger('mouseover'));

                            await promisify(cy.wait(getDelaySensorial(cenarioTeste.delayMsEscolha, cenarioTeste.delayIteracoes, "direita")));
                        }

                        await promisify(cy.get(`p[id="${letra}"]`).trigger('mouseover'));
                        palavraDigitadaAtual += letra;
                    } else {
                        const restantePalavra = palavraAtual.substring(indexLetra);
                        await promisify(cy.wait(getDelaySensorial(cenarioTeste.delayMsEscolha, cenarioTeste.delayIteracoes, "direita")));
                        await promisify(cy.get('input[id="input"]').type(restantePalavra));
                        break;
                    }
                }

                // insere espaço se não for a ultima palavra
                if (indexPalavra + 1 != textoDivididoPorEspacoVazio.length) {
                    await promisify(cy.wait(getDelaySensorial(cenarioTeste.delayMsEscolha, cenarioTeste.delayIteracoes, "centro")));
                    await promisify(cy.get('p[id="espacoElementRef"]').trigger('mouseover'));
                }
            }

            // espera 10 segundos para que o software fique afk e printe os resultados
            await promisify(cy.wait(10));
            await promisify(cy.screenshot(window["Cypress"]["Tipo"] + "_DMsE" +  window["Cypress"]["DelayMsEscolha"] + "_DMsI" +  window["Cypress"]["DelayMsIteracao"] + "_Prec" + window["Cypress"]["Precisao"]));
        }

    });
});