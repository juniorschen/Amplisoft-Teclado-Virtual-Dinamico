export const initialTopLetters = ["b", "c", "d", "f", "g", "j", "l", "m", "n", "p", "s", "t", "h",       "a", "e", "i", "o"];
export const initialBottomLetters = ["a", "e", "i", "o", "u", "q", "r", "v", "w", "x", "y", "k", "z",    "b", "c", "d", "l"];

export const sugestionTopLetters = ["Sugestão 1", "Letra 1", "Letra 2", "Letra 3", "Letra 4", "Sugestão 2", "Sugestão 3", "Letra 5", "Letra 6", "Letra 7", "Letra 8", "Letra 9", "Letra 10", "Letra 11", "Letra 12", "Letra 13", "Letra 14"];
export const sugestionBottomLetters = ["Sugestão 1", "Letra 1", "Letra 2", "Letra 3", "Letra 4", "Sugestão 2", "Sugestão 3", "Letra 5", "Letra 6", "Letra 7", "Letra 8", "Letra 9", "Letra 10", "Letra 11", "Letra 12", "Letra 13", "Letra 14"];

export const allLetters = ["b", "c", "d", "f", "g", "j", "l", "m", "n", "p", "s", "t", "h", "a", "e", "i", "o", "u", "q", "r", "v", "w", "x", "y", "k", "z"];


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
            if (i == 5 && predictionsToSugest.length >= 3) {
                topWords.push(predictionsToSugest[2].word);
            } else if (i == 6 && predictionsToSugest.length >= 4) {
                topWords.push(predictionsToSugest[3].word);
            } else {
                topWords.push(t);
            }
        });

        initialBottomLetters.forEach((t, i) => {
            if (i == 5 && predictionsToSugest.length >= 5) {
                bottomWords.push(predictionsToSugest[4].word);
            } else if (i == 6 && predictionsToSugest.length >= 6) {
                bottomWords.push(predictionsToSugest[5].word);
            } else {
                bottomWords.push(t);
            }
        });
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