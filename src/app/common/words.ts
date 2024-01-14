export const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
export const vowels = ["A", "E", "I", "O", "U"];
export const consonants = ["B", "C", "D", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "V", "W", "X", "Y", "Z"];

export function getVowels() {
    var output = [];
    vowels.forEach((l, i) => {
        output.push(l.toLowerCase());
    });
    return output; 
}

export function getMixedConsonants(maxLength, skip = 0) {
    var output = [];
    consonants.forEach((l, i) => {
        if (output.length < maxLength && (i + 1) > skip) {
            output.push(l.toLowerCase());
        }
    });
    return output;
}

export function getMixedAlphabet(maxLength, skip = 0) {
    var output = [];
    alphabet.forEach((l, i) => {
        if (output.length < maxLength && (i + 1) > skip) {
            output.push(l.toLowerCase());
        }
    });
    return output;
}