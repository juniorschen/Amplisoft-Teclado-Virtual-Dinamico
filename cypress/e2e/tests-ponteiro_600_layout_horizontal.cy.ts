import { CalcularDelayRealizarAcao, VaiErrar, WordsText } from "cypress/support/texts";
import promisify from 'cypress-promise';

describe('Validar Desempenho do Software', () => {
    it('y dpi, 1~~3 erros a cada 100 palavras', async () => {
        const dpi = 600;

        window["Cypress"]["TipoLayout"] = 1;
        await promisify(cy.visit('/'));
        await promisify(cy.get('div[id="playerDivElementRef"]', { timeout: 10000 }).should('be.visible'));

        // espera 15 segundos para que a base seja configurada
        await promisify(cy.wait(15000));

        const dc = await promisify(cy.document());

        window["Cypress"]["Tipo"] = "Ponteiro";
        window["Cypress"]["Dpi"] = dpi;
        window["Cypress"]["Loop"] = '0';

        const limparEl = dc.getElementById("limparElementRef");
        const espacoEl = dc.getElementById("espacoElementRef");
        const centerEl = dc.getElementById("centerDivElementRef");

        const textoDivididoPorEspacoVazio = WordsText.replace(/\n/g, '').toLowerCase().split(" ");
        for (let [indexPalavra, palavraAtual] of textoDivididoPorEspacoVazio.entries()) {
            const letrasPalavra = palavraAtual.split("");
            let jaInseriuEspaco = false;

            for (let [_, letra] of letrasPalavra.entries()) {
                let wordElement = dc.getElementById(palavraAtual);
                if (wordElement && palavraAtual.length > 1) {
                    await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, wordElement, dpi) * 1000));
                    await promisify(cy.get(`p[id="${palavraAtual}"]`).trigger('mouseover'));
                    jaInseriuEspaco = true;
                    break;
                }

                let letraElement = dc.getElementById(letra);
                await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, letraElement, dpi) * 1000));

                const vaiErrar = VaiErrar();
                if (vaiErrar) {
                    await promisify(cy.get('input[id="input"]').type("5"));

                    await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, limparEl, dpi) * 1000));
                    await promisify(cy.get('p[id="limparElementRef"]').trigger('mouseover'));

                    await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, letraElement, dpi) * 1000));
                }

                await promisify(cy.get(`p[id="${letra}"]`).first().trigger('mouseover'));
            }

            // insere espaço se não for a ultima palavra
            if (indexPalavra + 1 != textoDivididoPorEspacoVazio.length && !jaInseriuEspaco) {
                await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, espacoEl, dpi) * 1000));
                await promisify(cy.get('p[id="espacoElementRef"]').trigger('mouseover'));
            }
        }

        // espera para que o software fique afk para contabilizar os resultados
        await promisify(cy.contains('Resultados dos Testes', { timeout: 1000000 }).should('be.visible'));
    });

    it('y dpi, 1~~3 erros a cada 100 palavras', async () => {
        const dpi = 600;

        window["Cypress"]["TipoLayout"] = 1;
        await promisify(cy.visit('/'));
        await promisify(cy.get('div[id="playerDivElementRef"]', { timeout: 10000 }).should('be.visible'));

        // espera 15 segundos para que a base seja configurada
        await promisify(cy.wait(15000));

        const dc = await promisify(cy.document());

        window["Cypress"]["Tipo"] = "Ponteiro";
        window["Cypress"]["Dpi"] = dpi;
        window["Cypress"]["Loop"] = '1';

        const limparEl = dc.getElementById("limparElementRef");
        const espacoEl = dc.getElementById("espacoElementRef");
        const centerEl = dc.getElementById("centerDivElementRef");

        const textoDivididoPorEspacoVazio = WordsText.replace(/\n/g, '').toLowerCase().split(" ");
        for (let [indexPalavra, palavraAtual] of textoDivididoPorEspacoVazio.entries()) {
            const letrasPalavra = palavraAtual.split("");
            let jaInseriuEspaco = false;

            for (let [_, letra] of letrasPalavra.entries()) {
                let wordElement = dc.getElementById(palavraAtual);
                if (wordElement && palavraAtual.length > 1) {
                    await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, wordElement, dpi) * 1000));
                    await promisify(cy.get(`p[id="${palavraAtual}"]`).trigger('mouseover'));
                    jaInseriuEspaco = true;
                    break;
                }

                let letraElement = dc.getElementById(letra);
                await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, letraElement, dpi) * 1000));

                const vaiErrar = VaiErrar();
                if (vaiErrar) {
                    await promisify(cy.get('input[id="input"]').type("5"));

                    await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, limparEl, dpi) * 1000));
                    await promisify(cy.get('p[id="limparElementRef"]').trigger('mouseover'));

                    await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, letraElement, dpi) * 1000));
                }

                await promisify(cy.get(`p[id="${letra}"]`).first().trigger('mouseover'));
            }

            // insere espaço se não for a ultima palavra
            if (indexPalavra + 1 != textoDivididoPorEspacoVazio.length && !jaInseriuEspaco) {
                await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, espacoEl, dpi) * 1000));
                await promisify(cy.get('p[id="espacoElementRef"]').trigger('mouseover'));
            }
        }

        // espera para que o software fique afk para contabilizar os resultados
        await promisify(cy.contains('Resultados dos Testes', { timeout: 1000000 }).should('be.visible'));
    });

    it('y dpi, 1~~3 erros a cada 100 palavras', async () => {
        const dpi = 600;

        window["Cypress"]["TipoLayout"] = 1;
        await promisify(cy.visit('/'));
        await promisify(cy.get('div[id="playerDivElementRef"]', { timeout: 10000 }).should('be.visible'));

        // espera 15 segundos para que a base seja configurada
        await promisify(cy.wait(15000));

        const dc = await promisify(cy.document());

        window["Cypress"]["Tipo"] = "Ponteiro";
        window["Cypress"]["Dpi"] = dpi;
        window["Cypress"]["Loop"] = '2';

        const limparEl = dc.getElementById("limparElementRef");
        const espacoEl = dc.getElementById("espacoElementRef");
        const centerEl = dc.getElementById("centerDivElementRef");

        const textoDivididoPorEspacoVazio = WordsText.replace(/\n/g, '').toLowerCase().split(" ");
        for (let [indexPalavra, palavraAtual] of textoDivididoPorEspacoVazio.entries()) {
            const letrasPalavra = palavraAtual.split("");
            let jaInseriuEspaco = false;

            for (let [_, letra] of letrasPalavra.entries()) {
                let wordElement = dc.getElementById(palavraAtual);
                if (wordElement && palavraAtual.length > 1) {
                    await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, wordElement, dpi) * 1000));
                    await promisify(cy.get(`p[id="${palavraAtual}"]`).trigger('mouseover'));
                    jaInseriuEspaco = true;
                    break;
                }

                let letraElement = dc.getElementById(letra);
                await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, letraElement, dpi) * 1000));

                const vaiErrar = VaiErrar();
                if (vaiErrar) {
                    await promisify(cy.get('input[id="input"]').type("5"));

                    await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, limparEl, dpi) * 1000));
                    await promisify(cy.get('p[id="limparElementRef"]').trigger('mouseover'));

                    await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, letraElement, dpi) * 1000));
                }

                await promisify(cy.get(`p[id="${letra}"]`).first().trigger('mouseover'));
            }

            // insere espaço se não for a ultima palavra
            if (indexPalavra + 1 != textoDivididoPorEspacoVazio.length && !jaInseriuEspaco) {
                await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, espacoEl, dpi) * 1000));
                await promisify(cy.get('p[id="espacoElementRef"]').trigger('mouseover'));
            }
        }

        // espera para que o software fique afk para contabilizar os resultados
        await promisify(cy.contains('Resultados dos Testes', { timeout: 1000000 }).should('be.visible'));
    });

    it('y dpi, 1~~3 erros a cada 100 palavras', async () => {
        const dpi = 600;

        window["Cypress"]["TipoLayout"] = 1;
        await promisify(cy.visit('/'));
        await promisify(cy.get('div[id="playerDivElementRef"]', { timeout: 10000 }).should('be.visible'));

        // espera 15 segundos para que a base seja configurada
        await promisify(cy.wait(15000));

        const dc = await promisify(cy.document());

        window["Cypress"]["Tipo"] = "Ponteiro";
        window["Cypress"]["Dpi"] = dpi;
        window["Cypress"]["Loop"] = '3';

        const limparEl = dc.getElementById("limparElementRef");
        const espacoEl = dc.getElementById("espacoElementRef");
        const centerEl = dc.getElementById("centerDivElementRef");

        const textoDivididoPorEspacoVazio = WordsText.replace(/\n/g, '').toLowerCase().split(" ");
        for (let [indexPalavra, palavraAtual] of textoDivididoPorEspacoVazio.entries()) {
            const letrasPalavra = palavraAtual.split("");
            let jaInseriuEspaco = false;

            for (let [_, letra] of letrasPalavra.entries()) {
                let wordElement = dc.getElementById(palavraAtual);
                if (wordElement && palavraAtual.length > 1) {
                    await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, wordElement, dpi) * 1000));
                    await promisify(cy.get(`p[id="${palavraAtual}"]`).trigger('mouseover'));
                    jaInseriuEspaco = true;
                    break;
                }

                let letraElement = dc.getElementById(letra);
                await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, letraElement, dpi) * 1000));

                const vaiErrar = VaiErrar();
                if (vaiErrar) {
                    await promisify(cy.get('input[id="input"]').type("5"));

                    await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, limparEl, dpi) * 1000));
                    await promisify(cy.get('p[id="limparElementRef"]').trigger('mouseover'));

                    await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, letraElement, dpi) * 1000));
                }

                await promisify(cy.get(`p[id="${letra}"]`).first().trigger('mouseover'));
            }

            // insere espaço se não for a ultima palavra
            if (indexPalavra + 1 != textoDivididoPorEspacoVazio.length && !jaInseriuEspaco) {
                await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, espacoEl, dpi) * 1000));
                await promisify(cy.get('p[id="espacoElementRef"]').trigger('mouseover'));
            }
        }

        // espera para que o software fique afk para contabilizar os resultados
        await promisify(cy.contains('Resultados dos Testes', { timeout: 1000000 }).should('be.visible'));
    });

    it('y dpi, 1~~3 erros a cada 100 palavras', async () => {
        const dpi = 600;

        window["Cypress"]["TipoLayout"] = 1;
        await promisify(cy.visit('/'));
        await promisify(cy.get('div[id="playerDivElementRef"]', { timeout: 10000 }).should('be.visible'));

        // espera 15 segundos para que a base seja configurada
        await promisify(cy.wait(15000));

        const dc = await promisify(cy.document());

        window["Cypress"]["Tipo"] = "Ponteiro";
        window["Cypress"]["Dpi"] = dpi;
        window["Cypress"]["Loop"] = '4';

        const limparEl = dc.getElementById("limparElementRef");
        const espacoEl = dc.getElementById("espacoElementRef");
        const centerEl = dc.getElementById("centerDivElementRef");

        const textoDivididoPorEspacoVazio = WordsText.replace(/\n/g, '').toLowerCase().split(" ");
        for (let [indexPalavra, palavraAtual] of textoDivididoPorEspacoVazio.entries()) {
            const letrasPalavra = palavraAtual.split("");
            let jaInseriuEspaco = false;

            for (let [_, letra] of letrasPalavra.entries()) {
                let wordElement = dc.getElementById(palavraAtual);
                if (wordElement && palavraAtual.length > 1) {
                    await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, wordElement, dpi) * 1000));
                    await promisify(cy.get(`p[id="${palavraAtual}"]`).trigger('mouseover'));
                    jaInseriuEspaco = true;
                    break;
                }

                let letraElement = dc.getElementById(letra);
                await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, letraElement, dpi) * 1000));

                const vaiErrar = VaiErrar();
                if (vaiErrar) {
                    await promisify(cy.get('input[id="input"]').type("5"));

                    await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, limparEl, dpi) * 1000));
                    await promisify(cy.get('p[id="limparElementRef"]').trigger('mouseover'));

                    await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, letraElement, dpi) * 1000));
                }

                await promisify(cy.get(`p[id="${letra}"]`).first().trigger('mouseover'));
            }

            // insere espaço se não for a ultima palavra
            if (indexPalavra + 1 != textoDivididoPorEspacoVazio.length && !jaInseriuEspaco) {
                await promisify(cy.wait(CalcularDelayRealizarAcao(centerEl, espacoEl, dpi) * 1000));
                await promisify(cy.get('p[id="espacoElementRef"]').trigger('mouseover'));
            }
        }

        // espera para que o software fique afk para contabilizar os resultados
        await promisify(cy.contains('Resultados dos Testes', { timeout: 1000000 }).should('be.visible'));
    });
});