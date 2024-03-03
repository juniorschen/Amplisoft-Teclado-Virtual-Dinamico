import { Injectable, inject } from "@angular/core";
import { Firestore, doc, setDoc } from "@angular/fire/firestore";
import { IdentifierService } from "../services/identifier.service";
import { DeviceDetectorService } from "ngx-device-detector";
import { calcularDiferencaEmSegundos } from "src/app/common/date";
import { ConfigurationsService } from "../services/configuration.service";
import { isTestEnv } from "src/app/common/document-helper";
import { MatDialog } from "@angular/material/dialog";
import { DasherOnScreenFeedbackModalComponent } from "src/app/dasher-on-screen/dasher-on-screen-feedback-modal/dasher-on-screen-feedback-modal.component";

@Injectable({
    providedIn: 'root'
})
export class PerfomanceIndicatorService {

    private firestore: Firestore = inject(Firestore);
    private miniumUsageSeconds = (isTestEnv ? 1 : 15) * 60; // 15 minutos normalmente, 1 minuto para teste
    private startDate: Date;
    private endDate: Date;
    private backSpaceDateList = new Array<Date>();
    private predictonsDateList = new Array<Date>();
    private predictionClassifierList = new Array<{
        word: string;
        predictionWord: string;
        charactersOtimization: number;
    }>();
    private fullInput = "";

    constructor(private deviceService: DeviceDetectorService, private identifierService: IdentifierService, private controlProviderService: ConfigurationsService,
        public dialog: MatDialog) { }

    public start() {
        this.startDate = new Date();
    }

    public async end(afkDelay = 0) {
        this.endDate = new Date();
        this.endDate.setMilliseconds(this.endDate.getMilliseconds() - afkDelay);
        if (calcularDiferencaEmSegundos(this.startDate, this.endDate) > this.miniumUsageSeconds) {
            await this.sendPerfomaceIndicatior();
        }
        this.resetCache();
    }

    public backSpace() {
        if (this.fullInput.length > 1) {
            this.backSpaceDateList.push(new Date());
            this.fullInput = this.fullInput.substring(0, this.fullInput.length - 1);
        }
    }

    public blankSpace() {
        this.fullInput = this.fullInput + " ";
    }

    public wordSelected(word: string) {
        if (word.length > 1) {
            const wordsList = this.fullInput.split(" ");
            const lastWord = wordsList[wordsList.length - 1];

            const diff = word.length - lastWord.length;
            if (diff > 1) {
                this.predictonsDateList.push(new Date());
                this.predictionClassifierList.push({
                    charactersOtimization: diff,
                    predictionWord: word,
                    word: lastWord
                });
            }

            this.fullInput = this.fullInput.substring(0, this.fullInput.length - lastWord.length);
            this.fullInput = this.fullInput + word;
        } else {
            this.fullInput = this.fullInput + word;
        }
    }


    private async sendPerfomaceIndicatior() {
        const characters = this.fullInput.split("");

        const cpmIndicator = (characters.length / calcularDiferencaEmSegundos(this.startDate, this.endDate)) * 60;

        const wpmIndicator = cpmIndicator / 5;

        let epmIndicator = 0;
        if (this.backSpaceDateList.length > 0) {
            epmIndicator = (this.backSpaceDateList.length / calcularDiferencaEmSegundos(this.startDate, this.endDate)) * 60;
        }

        let ppmIndicator = 0;
        if (this.predictonsDateList.length > 0) {
            ppmIndicator = (this.predictonsDateList.length / calcularDiferencaEmSegundos(this.startDate, this.endDate)) * 60;
        }

        const deviceInfo = this.deviceService.getDeviceInfo();
        if (isTestEnv) {
            let title = "";
            let id = "";
            if (window["Cypress"]["Tipo"] == "Sensorial") {
                title = `Resultados dos Testes ${window["Cypress"]["Tipo"]} DelayMsEscolha ${window["Cypress"]["DelayMsEscolha"]}, DelayMsIteracao ${window["Cypress"]["DelayMsIteracao"]}}:`;
                id = window["Cypress"]["Tipo"] + "_DelayMsEscolha_" + window["Cypress"]["DelayMsEscolha"] + "_DelayMsIteracao_" + window["Cypress"]["DelayMsIteracao"] + "_Loop_" + window["Cypress"]["Loop"];
            } else {
                title = `Resultados dos Testes ${window["Cypress"]["Tipo"]} Dpi ${window["Cypress"]["Dpi"]}}:`;
                id = window["Cypress"]["Tipo"] + "_DPI_" + window["Cypress"]["Dpi"] + "_Loop_" + window["Cypress"]["Loop"];
            }

            await setDoc(doc(this.firestore, "Testes", id), {
                "browser": window.navigator.userAgent,
                "os": deviceInfo.os,
                "os_version": deviceInfo.os_version,
                "device": deviceInfo.deviceType,
                "deviceId": this.identifierService.getDeviceId(),
                "control": this.controlProviderService.getActiveControl(),
                "data": {
                    "cpmIndicator": cpmIndicator,
                    "wpmIndicator": wpmIndicator,
                    "epmIndicator": epmIndicator,
                    "ppmIndicator": ppmIndicator,
                    "startDate": this.startDate,
                    "endDate": this.endDate,
                    "predictionClassifierList": this.predictionClassifierList,
                    "totalUsageSeconds": calcularDiferencaEmSegundos(this.startDate, this.endDate)
                }
            });

            this.dialog.open(DasherOnScreenFeedbackModalComponent, {
                data: {
                    message: `${title}
                    "cpmIndicator": ${cpmIndicator}
                    "wpmIndicator": ${wpmIndicator}
                    "epmIndicator": ${epmIndicator}
                    "ppmIndicator": ${ppmIndicator}
                    "startDate": ${this.startDate}
                    "endDate": ${this.endDate}
                    "totalUsageSeconds": ${calcularDiferencaEmSegundos(this.startDate, this.endDate)}
                    `
                }
            });
        } else {
            /* await setDoc(doc(this.firestore, "feedback", this.identifierService.generateUUIDV4()), {
                "browser": window.navigator.userAgent,
                "os": deviceInfo.os,
                "os_version": deviceInfo.os_version,
                "device": deviceInfo.deviceType,
                "deviceId": this.identifierService.getDeviceId(),
                "control": this.controlProviderService.getActiveControl(),
                "data": {
                    "cpmIndicator": cpmIndicator,
                    "wpmIndicator": wpmIndicator,
                    "epmIndicator": epmIndicator,
                    "ppmIndicator": ppmIndicator,
                    "startDate": this.startDate,
                    "endDate": this.endDate,
                    "predictionClassifierList": this.predictionClassifierList,
                    "totalUsageSeconds": calcularDiferencaEmSegundos(this.startDate, this.endDate)
                }
            }); */
            console.log("feedback sended", {
                "browser": window.navigator.userAgent,
                "os": deviceInfo.os,
                "os_version": deviceInfo.os_version,
                "device": deviceInfo.deviceType,
                "deviceId": this.identifierService.getDeviceId(),
                "control": this.controlProviderService.getActiveControl(),
                "data": {
                    "cpmIndicator": cpmIndicator,
                    "wpmIndicator": wpmIndicator,
                    "epmIndicator": epmIndicator,
                    "ppmIndicator": ppmIndicator,
                    "startDate": this.startDate,
                    "endDate": this.endDate,
                    "predictionClassifierList": this.predictionClassifierList,
                    "totalUsageSeconds": calcularDiferencaEmSegundos(this.startDate, this.endDate)
                }
            });
        }
    }

    private resetCache() {
        this.startDate = undefined;
        this.endDate = undefined;
        this.backSpaceDateList = new Array<Date>();
        this.predictonsDateList = new Array<Date>();
        this.predictionClassifierList = new Array<any>();
        this.fullInput = "";
    }

}