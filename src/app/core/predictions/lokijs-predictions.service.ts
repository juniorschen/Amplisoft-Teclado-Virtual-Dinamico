import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import Loki from 'lokijs';

import { allWords } from 'src/app/common/words';
import { DasherOnScreenFeedbackModalComponent } from 'src/app/dasher-on-screen/dasher-on-screen-feedback-modal/dasher-on-screen-feedback-modal.component';

@Injectable({
    providedIn: 'root'
})
export class LokiJsPredictionsService {

    private dbLoki: Loki;
    private rankTreshHoldWord = 25000;

    constructor(private http: HttpClient, public dialog: MatDialog) { }

    getWord(current: string) {
        if (current.length < 2) {
            return [];
        }

        const regex = new RegExp('^' + current, 'i');
        const collection = this.dbLoki.getCollection(current.charAt(0));
        return collection.chain()
            .find({ 'word': { '$regex': regex } })
            .simplesort('rank', { desc: true })
            .limit(20)
            .data();
    }

    async doAddWordOnDb(word: string) {
        const collection = this.dbLoki.getCollection(word.charAt(0));

        const topRegistersOnCollection = collection.chain()
            .find({ 'word': { '$regex': word.charAt(0) + word.charAt(1) + word.charAt(2) } })
            .simplesort('rank', { desc: true })
            .limit(10)
            .data();

        const wordOnCollection = collection.findOne({ 'word': word });
        if (wordOnCollection) {
            wordOnCollection.rank += 1;
            if (topRegistersOnCollection.length > 0) {
                if (wordOnCollection.rank < topRegistersOnCollection[topRegistersOnCollection.length - 1].rank) {
                    wordOnCollection.rank = topRegistersOnCollection[topRegistersOnCollection.length - 1].rank + 1;
                }
            }

            collection.update(wordOnCollection);
        } else {
            let rank = 1;
            if (topRegistersOnCollection.length > 0) {
                rank = topRegistersOnCollection[topRegistersOnCollection.length - 1].rank + 1;
            }
            collection.insert({ 'word': word, 'rank': rank });
        }
    }

    async ensureHasCreatedDatabases() {
        this.dialog.open(DasherOnScreenFeedbackModalComponent, {
            data: {
                message: `Carregando Database`,
                showSpinner: true
            }
        });

        if (localStorage.getItem('CreatedLocalDatabase') != "true") {
            this.dbLoki = new Loki('wordsDb', {
                adapter: new Loki.LokiLocalStorageAdapter(),
            });

            const databaseContent = await firstValueFrom(this.http.get('assets/tf.txt', { responseType: 'text' }));
            let wordsArray = databaseContent.split('\n');
            wordsArray = wordsArray.filter(l => l);
            wordsArray = wordsArray.filter(l => Number(l.split(',')[1]) >= this.rankTreshHoldWord);

            allWords.forEach((n1) => {
                this.inserOnColletion(wordsArray, n1.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
            });

            this.dbLoki.saveDatabase();
            localStorage.setItem('CreatedLocalDatabase', 'true');
            this.dialog.closeAll();
        } else {
            const loki = new Loki('wordsDb', {
                adapter: new Loki.LokiLocalStorageAdapter(),
            });

            loki.loadDatabase({}, () => {
                console.log('Banco de dados carregado com sucesso.');
                this.dialog.closeAll();
                this.dbLoki = loki;
            });
        }
    }

    private inserOnColletion(wordsArray, collecion) {
        const collection = this.dbLoki.addCollection(collecion);

        const wordsN1 = wordsArray.filter(l => {
            let prefix = '';
            for (let index = 0; index < collecion.length; index++) {
                prefix += l.charAt(index);
            }
            return prefix == collecion;
        });
        const objWordRank = wordsN1.map(l => {
            return { word: l.split(',')[0], rank: Number(l.split(',')[1]) };
        });
        objWordRank.sort((a, b) => a.rank - b.rank);
        const objWordRankOrdened = objWordRank.map((l, index) => {
            return { word: l.word.normalize('NFD').replace(/[\u0300-\u036f]/g, ''), rank: index + 1 };
        });

        objWordRankOrdened.forEach(obj => {
            collection.insert(obj);
        });
    }
}