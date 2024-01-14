const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
const vowels = ["A", "E", "I", "O", "U"];
const consonants = ["B", "C", "D", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "V", "W", "X", "Y", "Z"];

let actualPage = 0;

export function getVowels() {
    var output = [];
    vowels.forEach((l, i) => {
        output.push(l.toLowerCase());
    });
    return output;
}

export function getMixedConsonants(maxLength, incPage: boolean) {
    actualPage = incPage ? actualPage + 1 : 0;
    var output = [];
    consonants.forEach((l, i) => {
        if (output.length < maxLength && (i + 1) > maxLength * actualPage) {
            output.push(l.toLowerCase());
        }
    });
    return output;
}

export function getMixedAlphabet(maxLength, incPage: boolean) {
    actualPage = incPage ? actualPage + 1 : 0;
    var output = [];
    alphabet.forEach((l, i) => {
        if (output.length < maxLength && (i + 1) > maxLength * actualPage) {
            output.push(l.toLowerCase());
        }
    });
    if (output.length == 0) {
        actualPage = 0;
        return getMixedAlphabet(maxLength, false);
    }
    return output;
}