export const initialTopWords = ["b", "c", "d", "f", "g", "j", "l", "m", "n", "p", "s", "t", "h"];
export const initialBottomWords = ["a", "e", "i", "o", "u", "q", "r", "v", "w", "x", "y", "k", "z"];
export const allWords = ["b", "c", "d", "f", "g", "j", "l", "m", "n", "p", "s", "t", "h", "a", "e", "i", "o", "u", "q", "r", "v", "w", "x", "y", "k", "z"];


function mostFrequentLetters(stringArray: string[]) {
    const letterFrequency: { [key: string]: number } = {};

    // Itera sobre cada string no array
    stringArray.forEach(string => {
        string = string.replace(/\s/g, '').toLowerCase();
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

export function getTopAndBottomWordsByPredictions(predictions: Array<{ word: string }>) {
    const topWords = [predictions[0].word];
    const bottomWords = [predictions[1].word];

    const mostFrenquently = mostFrequentLetters(predictions.map(obj => obj.word));
    mostFrenquently.forEach((f, i) => {
        isEven(i) ? topWords.push(f) : bottomWords.push(f);
    });

    topWords.push(predictions[2].word);
    bottomWords.push(predictions[3].word);

    initialTopWords.forEach(t => {
        const i = topWords.findIndex(l => l == t);
        if (i == -1) {
            topWords.push(t);
        }
    });

    initialBottomWords.forEach(b => {
        const i = bottomWords.findIndex(l => l == b);
        if (i == -1) {
            bottomWords.push(b);
        }
    });

    return { topWords, bottomWords };
}