import { VaiErrar, cenariosTesteSensorial } from "cypress/support/texts";
import promisify from 'cypress-promise';

// quantidadeIteracoesNecessariasAcao aqui pode variar, quando se refere as letras num layout padrão de 11, a média seria 4 com alfabeto organizado, no central apenas uma ação no esquerdo 2
function getDelaySensorial(delayEscolha, delayIteracao, setor) {
    let quantidadeIteracoesNecessariasAcao = 4;
    if (setor == "centro") {
        quantidadeIteracoesNecessariasAcao = 1;
    } else if (setor == "esquerda") {
        quantidadeIteracoesNecessariasAcao = 2;
    }

    return delayEscolha + (delayIteracao * (quantidadeIteracoesNecessariasAcao));
}

describe('Validar Desempenho do Software', () => {
    it('y dpi, 1~~3 erros a cada 100 palavras', async () => {
        for (let index = 0; index < 10; index++) {
            await promisify(cy.visit('/'));
            await promisify(cy.get('div[id="playerDivElementRef"]', { timeout: 10000 }).should('be.visible'));

            // espera 30 segundos para que a base seja configurada
            await promisify(cy.wait(30));
            
            const dc = await promisify(cy.document());
            for (let cenarioTeste of cenariosTesteSensorial) {
                window["Cypress"]["Tipo"] = "Sensorial";
                window["Cypress"]["DelayMsEscolha"] = cenarioTeste.delayMsEscolha;
                window["Cypress"]["DelayMsIteracao"] = cenarioTeste.delayIteracoes;

                const textoDivididoPorEspacoVazio = cenarioTeste.texto.replace(/\n/g, '').toLowerCase().split(" ");
                for (let [indexPalavra, palavraAtual] of textoDivididoPorEspacoVazio.entries()) {
                    const letrasPalavra = palavraAtual.split("");
                    let jaInseriuEspaco = false;

                    for (let [_, letra] of letrasPalavra.entries()) {
                        // simula delay para para fazer a escolha + confirmar
                        await promisify(cy.wait(getDelaySensorial(cenarioTeste.delayMsEscolha, cenarioTeste.delayIteracoes, "direita")));

                        let wordElement = dc.getElementById(palavraAtual);
                        if (wordElement && palavraAtual.length > 1) {
                            await promisify(cy.get(`p[id="${palavraAtual}"]`).trigger('mouseover'));
                            jaInseriuEspaco = true;
                            break;
                        }

                        const vaiErrar = VaiErrar();
                        if (vaiErrar) {
                            await promisify(cy.get('input[id="input"]').type("5"));

                            await promisify(cy.wait(getDelaySensorial(cenarioTeste.delayMsEscolha, cenarioTeste.delayIteracoes, "esquerda")));
                            await promisify(cy.get('p[id="limparElementRef"]').trigger('mouseover'));

                            await promisify(cy.wait(getDelaySensorial(cenarioTeste.delayMsEscolha, cenarioTeste.delayIteracoes, "direita")));
                        }

                        await promisify(cy.get(`p[id="${letra}"]`).trigger('mouseover'));
                    }

                    // insere espaço se não for a ultima palavra
                    if (indexPalavra + 1 != textoDivididoPorEspacoVazio.length && !jaInseriuEspaco) {
                        await promisify(cy.wait(getDelaySensorial(cenarioTeste.delayMsEscolha, cenarioTeste.delayIteracoes, "centro")));
                        await promisify(cy.get('p[id="espacoElementRef"]').trigger('mouseover'));
                    }
                }

                // espera para que o software fique afk e printe os resultados
                await promisify(cy.contains('Resultados dos Testes', { timeout: 1000000 }).should('be.visible'));
                await promisify(cy.screenshot(window["Cypress"]["Tipo"] + "_DMsE" + window["Cypress"]["DelayMsEscolha"] + "_DMsI" + window["Cypress"]["DelayMsIteracao"] + "_Loop" + index));
            }
        }
    });
});