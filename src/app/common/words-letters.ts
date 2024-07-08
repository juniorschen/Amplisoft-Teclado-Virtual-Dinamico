export const extraTopLetters = ["a", "e", "q", "r"];
export const extraBottomLetters = ["b", "c", "j", "l"];
export const initialTopLetters = ["b", "c", "d", "f", "g", "j", "l", "m", "n", "p", "s", "t", "h"].concat(extraTopLetters);
export const initialBottomLetters = ["a", "e", "i", "o", "u", "q", "r", "v", "w", "x", "y", "k", "z"].concat(extraBottomLetters);

export const simbolsNumericTop = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "=", '+', "-", "*", "|", "'", '"'];
export const simbolsBottom = [".", ',', ":", "^", "~", "[", "]", "`", "´", "!", "?", "/", ";", "(", ")", "{", "}"];

export const sugestionTopLetters = ["Sugestão 1", "Letra 1 (c)", "Letra 2 (d)", "Letra 3 (f)", "Letra 4 (g)", "Sugestão 2", "Sugestão 3", "Letra 5 (m)", "Letra 6 (n)", "Letra 7 (p)", "Letra 8 (s)", "Letra 9 (t)", "Letra 10 (h)", "Letra 11 (a)", "Letra 12 (e)", "Letra 13 (q)", "Letra 14 (r)"];
export const sugestionBottomLetters = ["Sugestão 1", "Letra 1 (e)", "Letra 2 (i)", "Letra 3 (o)", "Letra 4 (u)", "Sugestão 2", "Sugestão 3", "Letra 5 (v)", "Letra 6 (w)", "Letra 7 (x)", "Letra 8 (y)", "Letra 9 (k)", "Letra 10 (z)", "Letra 11 (b)", "Letra 12 (c)", "Letra 13 (j)", "Letra 14 (l)"];

export const allLetters = ["b", "c", "d", "f", "g", "j", "l", "m", "n", "p", "s", "t", "h", "a", "e", "i", "o", "u", "q", "r", "v", "w", "x", "y", "k", "z"];

export const symbolCombCharacterDic = {
    '~': '\u0303',
    '^': '\u0302',
    '`': '\u0300',
    '´': '\u0301'
};


function mostFrequentLetters(stringArray: string[]) {
    const letterFrequency: { [key: string]: number } = {};

    // Itera sobre cada string no array
    stringArray.forEach(string => {
        string = string.replace(/\s/g, '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        for (let i = 0; i < string.length; i++) {
            const letter = string[i];
            letterFrequency[letter] = (letterFrequency[letter] || 0) + 1;
        }
    });

    const frequencyArray = Object.entries(letterFrequency);
    frequencyArray.sort((a: [string, number], b: [string, number]) => {
        return b[1] - a[1];
    });

    const sortedLetters = frequencyArray.map(keyValuePair => keyValuePair[0]);

    return sortedLetters;
}

function isEven(number) {
    return number % 2 === 0;
}

export function getTopAndBottomWordsLettersByPredictions(predictions: Array<{ word: string }>, keepOrderLetters: boolean) {
    const topWords = [];
    const bottomWords = [];

    const predictionsToSugest = predictions.slice(0, 6);
    if (predictionsToSugest.length >= 2) {
        topWords.push(predictionsToSugest[0].word);
        bottomWords.push(predictionsToSugest[1].word);
    }

    if (keepOrderLetters) {
        initialTopLetters.forEach((t, i) => {
            if (i == 5 && i < 7) {
                if (predictionsToSugest.length >= 3) {
                    topWords.push(predictionsToSugest[2].word);
                }
                if (predictionsToSugest.length >= 4) {
                    topWords.push(predictionsToSugest[3].word);
                }
            }
            topWords.push(t);
        });

        let excedentTopLetters = initialTopLetters.length - topWords.length;
        while (excedentTopLetters > 0) {
            topWords.pop();
            excedentTopLetters -= 1;
        }

        initialBottomLetters.forEach((t, i) => {
            if (i == 5 && i < 7) {
                if (predictionsToSugest.length >= 5) {
                    bottomWords.push(predictionsToSugest[4].word);
                }
                if (predictionsToSugest.length >= 6) {
                    bottomWords.push(predictionsToSugest[5].word);
                }
            }
            bottomWords.push(t);
        });

        let excedentBottomLetters = initialBottomLetters.length - bottomWords.length;
        while (excedentBottomLetters > 0) {
            bottomWords.pop();
            excedentBottomLetters -= 1;
        }
    } else {
        const mostFrenquently = mostFrequentLetters(predictions.map(obj => obj.word));
        mostFrenquently.forEach((f, i) => {
            if (i < 8) {
                isEven(i) ? topWords.push(f) : bottomWords.push(f);
            }
        });

        for (let index = 2; index < 6; index++) {
            if (predictionsToSugest[index]) {
                isEven(index) ? topWords.push(predictionsToSugest[index].word) : bottomWords.push(predictionsToSugest[index].word);
            }
        }

        const initialWords = initialTopLetters.concat(initialBottomLetters);
        const initialWordsNotIncluded = [];
        initialWords.forEach((iw, _) => {
            const it = topWords.findIndex(l => l == iw);
            const ib = bottomWords.findIndex(l => l == iw);
            if (it == -1 && ib == -1) {
                initialWordsNotIncluded.push(iw);
            }
        });

        initialWordsNotIncluded.forEach((iw, index) => {
            isEven(index) ? topWords.push(iw) : bottomWords.push(iw);
        });
    }

    return { topWords, bottomWords };
}