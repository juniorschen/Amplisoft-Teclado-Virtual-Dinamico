import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "src/environments/environment";

const basePrompt2 = "Voce recebera como entrada: {textoAtual: <CURRENT_PHRASE_HERE>, palavraAtual: <CURRENT_WORD>}. Seu objetivo é sugerir no maximo 10 palavras que completem a palavraAtual levando em conta o contexto do textoAtual com precisao superior a 60%. Me retorne essas palavras em uma lista com virgulas e nada mais alem disso.";

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

const input = {
    debug: false,
    top_k: -1,
    top_p: 1,
    prompt: "Tell me how to tailor a men's suit so I look fashionable.",
    temperature: 0.75,
    system_prompt: basePrompt,
    max_new_tokens: 800,
    min_new_tokens: -1,
    repetition_penalty: 1
};

export async function predictNextWord(currentPhrase, currentWord, http: HttpClient) {
    const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Token ${environment.replicateToken}`);

    input.prompt = `{
        currentPhrase: "${currentPhrase}",
        currentWord: "${currentWord}"
    }`;

    const output = await http.post('https://api.replicate.com/v1/models/meta/llama-2-7b-chat/predictions', { version: "acdbe5a4987a29261ba7d7d4195ad4fa6b62ce27b034f989fcb9ab0421408a7c", input }, { headers: headers }).toPromise();
    console.log(output);
}