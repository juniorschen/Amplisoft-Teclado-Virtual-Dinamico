import * as openAI from 'openai';
import { environment } from 'src/environments/environment';

const apiModel = 'gpt-3.5-turbo';
const GPT_3 = new openAI.OpenAI({ apiKey: environment.openAiToken, dangerouslyAllowBrowser: true });
const basePrompt = `
Voce é uma inteligencia artificial responsável por completar palavras.
Voce recebe dados no seguinte formato:
"""
{
    currentPhrase: "<CURRENT_PHRASE_HERE>",
    currentWord: "<CURRENT_WORD>"
}
"""
Voce recebera as palavras atuais de forma parcial onde seu objetivo é completalas.
Voce devera retornar até no maximo 10 possiveis palavras que completam a entrada parcial, 
apenas devem ser retornar dados com acuracias acima de 60% de precisão, isso é uma regra que não pode ser quebrada.
Voce tambem deve retornar o alfabeto portugues organizado com base na possível próxima letra que continue a palavra, para este retorno
voce pode ignorar a taxa de precisão, mas precisa como regra organizar o alfabeto de acordo com a precisão.
O formato do seu retorno deve ser da seguinte forma:
{predicoes: ["<POSSIBLE_WORD_1>", "<POSSIBLE_WORD_2>", ...], alfabetoOrganizado: ["<WORD_1>", "<WORD_2>", ...]}
`;

export async function predictNextWord(currentPhrase, currentWord) {
    try {
        const userPrompt = `{
            currentPhrase: "${currentPhrase}",
            currentWord: "${currentWord}"
        }`;

        const response = await GPT_3.chat.completions.create({
            messages: [
                { role: 'assistant', content: basePrompt },
                { role: 'user', content: userPrompt }
            ],
            model: apiModel,
        });
        try {
            return [];
        }
        catch (error) {
            console.warn(`Error during parse: ${error}`);
            return [];
        }
    } catch (error) {
        console.error(`Error generating response: ${error}`);
        throw error;
    }
}