import { AfterViewInit, Component, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { elementOverAnother, findClosestElement, findElementsAround, isTestEnv } from '../common/document-helper';

import { ConfigurationsService } from '../core/services/configuration.service';
import { DasherOnScreenPlayerComponent } from './dasher-on-screen-player/dasher-on-screen-player.component';
import { calcularDiferencaEmMilissegundos } from '../common/date';
import { PerfomanceIndicatorService } from '../core/performance-indicators/performance-indicators.service';
import { endCalibrateCamera, removeVideo } from '../core/support/camera/camera-support';
import { initialTopLetters, initialBottomLetters, getTopAndBottomWordsLettersByPredictions, sugestionBottomLetters, sugestionTopLetters, simbolsNumericTop, simbolsBottom, symbolCombCharacterDic } from '../common/words-letters';
import { LokiJsPredictionsService } from '../core/predictions/lokijs-predictions.service';
import { LayoutType } from '../common/layout-type.enum';
import { AngularResizeElementDirection, AngularResizeElementEvent } from 'angular-resize-element';

@Component({
  selector: 'app-dasher-on-screen',
  templateUrl: './dasher-on-screen.component.html',
  styleUrls: ['./dasher-on-screen.component.scss'],
})
export class DasherOnScreenComponent implements AfterViewInit, OnDestroy {

  // Controle Privado
  private lastActionExecuted = new Date();
  private afkCheckDelayMs = 1000 * (isTestEnv ? 10 : 45);
  private afkInterval;
  private suportDiv: HTMLDivElement;
  private joystickSide: "left" | "right";
  private showingSimbols = false;

  // Detecção sensorial
  private intervalSensorialDetection;
  private canSelectWordLetter: boolean = true;
  private lastSensorialDetectionTime: Date;
  private actionSensorialDetectionBuffer = { top: undefined, right: undefined, bottom: undefined, left: undefined };
  private bufferDoDetectSensorial = 100;

  // Referencias do html
  @ViewChild('limparElementRef')
  public limparElementRef: ElementRef<HTMLParagraphElement>;
  public limparBackGround;
  public limparCaracterColor;
  public limparFontSize = "18px";

  @ViewChild('falarElementRef')
  public falarElementRef: ElementRef<HTMLParagraphElement>;
  public falarBackGround;
  public falarCaracterColor;
  public falarFontSize = "18px";

  @ViewChild('limparTudoElementRef')
  public limparTudoElementRef: ElementRef<HTMLParagraphElement>;
  public limparTudoBackGround;
  public limparTudoCaracterColor;
  public limparTudoFontSize = "18px";

  @ViewChild('espacoElementRef')
  public espacoElementRef: ElementRef<HTMLParagraphElement>;
  public espacoBackGround;
  public espacoCaracterColor;
  public espacoFontSize = "18px";

  @ViewChild('simboloElementRef')
  public simboloElementRef: ElementRef<HTMLDivElement>;
  public simboloBackGround;
  public simboloCaracterColor;
  public simboloFontSize = "18px";

  @ViewChild('centerDivElementRef')
  public centerDivElementRef: ElementRef<HTMLDivElement>;

  @ViewChild('playerDivElementRef')
  public playerDivElementRef: ElementRef<HTMLDivElement>;

  @ViewChildren(DasherOnScreenPlayerComponent) wordsOrLettersElements: QueryList<DasherOnScreenPlayerComponent>

  // Controle Geral Html
  public mouseMovedEvent: Subject<MouseEvent> = new Subject();
  public onResetDasherEvent: Subject<void> = new Subject();
  public onContentChangedEvent: Subject<{ id: string, value: string }> = new Subject();
  public isAfk = false;
  public input = '';
  public initialTopLetters: Array<string> = initialTopLetters;
  public splitIndexHeader = Math.ceil(this.initialTopLetters.length / 2);
  public initialBottomLetters: Array<string> = initialBottomLetters;
  public splitIndexBottom = Math.ceil(this.initialBottomLetters.length / 2);
  public layoutTypes = LayoutType;
  public layoutType = this.configurationService.layoutType;
  public lastLayoutType = this.configurationService.lastLayoutType;
  public animateDivSelectionSpace = false;
  public animateDivSelectionClear = false;
  public animateDivSelectionClearAll = false;
  public animateDivSelectionSpeak = false;
  public animateDivSelectionSimbols = false;
  public readonly AngularResizeElementDirection = AngularResizeElementDirection;
  public enableLayoutEdition = false;
  getIdPrefix = () => {
    if (this.showingSimbols) {
      return "simb_"
    }
    return "default_";
  };

  // Calibracao
  public clickElementsCount = new Map<string, number>();
  public defaultCalibrationCount = 1;

  constructor(private configurationService: ConfigurationsService, private perfomanceIndicatorService: PerfomanceIndicatorService,
    private predicionsService: LokiJsPredictionsService, private hostEl: ElementRef) {
    speechSynthesis.addEventListener("voiceschanged", () => { });
    this.listenEditLayout();
  }

  async ngAfterViewInit() {
    await this.predicionsService.ensureHasCreatedDatabases();
    this.initHidControl();
    this.lastActionExecuted = new Date();
    this.perfomanceIndicatorService.start();
    this.afkInterval = setInterval(() => this.checkDasherAfk(), 1000);
    this.doSetDynamicLayout();
    this.redefinedWords(true);
  }

  async ngOnDestroy(): Promise<void> {
    clearInterval(this.afkInterval);
    await this.perfomanceIndicatorService.end();
  }

  onClickElementCalibration(elementId, prefix) {
    if (this.configurationService.isOcularDeviceConfigured() && localStorage.getItem('CalibratedEyeControl') != "true") {
      const defaultActionElementsCount = 5 + this.initialBottomLetters.length + this.initialTopLetters.length;

      const clickElementCount = this.clickElementsCount.get(prefix + "_" + elementId);
      if (clickElementCount && clickElementCount < this.defaultCalibrationCount) {
        this.clickElementsCount.set(prefix + "_" + elementId, clickElementCount + 1);
      } else if (!clickElementCount) {
        this.clickElementsCount.set(prefix + "_" + elementId, 1);
      }

      let totalElementsClicksCount = 0;
      for (let value of this.clickElementsCount.values()) {
        totalElementsClicksCount += value;
      }

      if (totalElementsClicksCount > 1) {
        removeVideo();
      }

      if (totalElementsClicksCount == (defaultActionElementsCount * this.defaultCalibrationCount)) {
        this.clickElementsCount = new Map<string, number>();
        // deixei bem especifico para camera por enquanto mas esse é o unico controlador que é calibrado se precisar no futuro melhorar este código para ser mais genérico
        endCalibrateCamera();
        this.configurationService.initializeControl();
      }
    }
  }

  checkDasherAfk() {
    const isAfkLastvalue = this.isAfk;
    this.isAfk = calcularDiferencaEmMilissegundos(new Date(), this.lastActionExecuted) > this.afkCheckDelayMs;
    if (this.isAfk && this.isAfk != isAfkLastvalue) {
      this.perfomanceIndicatorService.end(this.afkCheckDelayMs);
    } else if (this.isAfk != isAfkLastvalue) {
      this.perfomanceIndicatorService.start();
    }
  }

  mouseMovedDasher(event: MouseEvent) {
    if (!this.configurationService.isAnyControlConfigured()) {
      this.mouseMovedEvent.next(event);
    }
  }

  mouseOverBlankSpace() {
    if (!this.configurationService.isAnyControlConfigured() && !this.enableLayoutEdition) {

      let detect = () => {
        this.doResetSensorialDetection();
        this.insertBlankSpace();
      };

      if (this.doDetect("animateDivSelectionSpace")) {
        detect();
      } else if (!this.intervalSensorialDetection) {
        this.intervalSensorialDetection = setInterval(() => { detect(); }, this.configurationService.sensorialSelectionDelayMs - this.bufferDoDetectSensorial);
      }

    }
  }

  mouseOutBlankSpace() {
    if (this.configurationService.isAnyControlConfigured())
      return;

    this.doResetSensorialDetection();
  }

  private insertBlankSpace(shouldRedefinedWords = true) {
    if (this.input) {
      const wordsList = this.input.split(" ");
      this.input = this.input + " ";
      this.perfomanceIndicatorService.blankSpace();

      if (wordsList[wordsList.length - 1].trim().length > 3) {
        this.predicionsService.doAddWordOnDb(wordsList[wordsList.length - 1]);
      }

      if (shouldRedefinedWords)
        this.redefinedWords();

      this.lastActionExecuted = new Date();
    }
  }

  mouseOverReset(fullReset = false) {
    if (!this.configurationService.isAnyControlConfigured() && !this.enableLayoutEdition) {

      let detect = () => {
        this.doResetSensorialDetection();
        this.reset(fullReset);
      };

      if (this.doDetect(fullReset ? "animateDivSelectionClearAll" : "animateDivSelectionClear")) {
        detect();
      } else if (!this.intervalSensorialDetection) {
        this.intervalSensorialDetection = setInterval(() => { detect(); }, this.configurationService.sensorialSelectionDelayMs - this.bufferDoDetectSensorial);
      }

    }
  }

  mouseOutReset() {
    if (this.configurationService.isAnyControlConfigured())
      return;

    this.doResetSensorialDetection();
  }

  private reset(fullReset = false) {
    if (fullReset) {
      this.input = "";
    } else {
      this.input = this.input.substring(0, this.input.length - 1);
      this.perfomanceIndicatorService.backSpace();
    }
    this.redefinedWords(fullReset);
    this.lastActionExecuted = new Date();
  }

  mouseOverSpeak() {
    if (!this.configurationService.isAnyControlConfigured() && !this.enableLayoutEdition) {

      let detect = () => {
        this.doResetSensorialDetection();
        this.speak();
      };

      if (this.doDetect("animateDivSelectionSpeak")) {
        detect();
      } else if (!this.intervalSensorialDetection) {
        this.intervalSensorialDetection = setInterval(() => { detect(); }, this.configurationService.sensorialSelectionDelayMs - this.bufferDoDetectSensorial);
      }

    }
  }

  mouseOutSpeak() {
    if (this.configurationService.isAnyControlConfigured())
      return;

    this.doResetSensorialDetection();
  }

  private speak() {
    this.synthesizeSpeechFromText(this.input);
    this.lastActionExecuted = new Date();
  }

  mouseOverSimbols() {
    if (!this.configurationService.isAnyControlConfigured() && !this.enableLayoutEdition) {

      let detect = () => {
        this.changeToSimbols();
        this.doResetSensorialDetection();
      };

      if (this.doDetect("animateDivSelectionSimbols")) {
        detect();
      } else if (!this.intervalSensorialDetection) {
        this.intervalSensorialDetection = setInterval(() => { detect(); }, this.configurationService.sensorialSelectionDelayMs - this.bufferDoDetectSensorial);
      }

    }
  }

  mouseOutSimbols() {
    if (this.configurationService.isAnyControlConfigured())
      return;

    this.doResetSensorialDetection();
  }

  private changeToSimbols() {
    if (!this.showingSimbols) {
      simbolsNumericTop.forEach((l, i) => {
        this.onContentChangedEvent.next({ id: this.getIdPrefix() + 'ptop' + i.toString(), value: l });
      });
      simbolsBottom.forEach((l, i) => {
        this.onContentChangedEvent.next({ id: this.getIdPrefix() + 'pbottom' + i.toString(), value: l });
      });
      this.showingSimbols = true;

      setTimeout(() => {
        this.doSetDynamicLayout();
      }, 1);
    } else {
      this.redefinedWords();
      this.showingSimbols = false;

      setTimeout(() => {
        this.doSetDynamicLayout();
      }, 1);
    }
  }

  wordOrLetterSelectedEvent(wordOrLetter: string) {
    if (!this.canSelectWordLetter && !this.enableLayoutEdition) {
      return;
    }

    this.canSelectWordLetter = false;

    this.resetAuxDisplay();

    if (this.showingSimbols) {
      if (symbolCombCharacterDic[wordOrLetter]) {
        this.input += symbolCombCharacterDic[wordOrLetter];
      } else {
        this.input = this.input + wordOrLetter;
      }
    } else {
      this.perfomanceIndicatorService.wordSelected(wordOrLetter);

      if (wordOrLetter.length > 1) {
        const wordsList = this.input.split(" ");
        const lastWord = wordsList[wordsList.length - 1];
        this.input = this.input.substring(0, this.input.length - lastWord.length);
        this.input = this.input + wordOrLetter;
        this.insertBlankSpace(false);
      } else {
        this.input = this.input + wordOrLetter;
      }
    }

    this.redefinedWords();
    this.doResetSensorialDetection();
    this.onResetDasherEvent.next();
    this.lastActionExecuted = new Date();

    setTimeout(() => {
      const inputEl = document.getElementById("input") as HTMLInputElement;
      inputEl.focus();
      inputEl.setSelectionRange(this.input.length, this.input.length);
      this.canSelectWordLetter = true;
    }, 100);
  }

  private synthesizeSpeechFromText(text: string): void {
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.getVoices()[0];
    speechSynthesis.speak(utterance);
  }

  private redefinedWords(fullReset = false) {
    if (fullReset) {
      initialTopLetters.forEach((l, i) => {
        this.onContentChangedEvent.next({ id: this.getIdPrefix() + 'ptop' + i.toString(), value: l });
      });
      initialBottomLetters.forEach((l, i) => {
        this.onContentChangedEvent.next({ id: this.getIdPrefix() + 'pbottom' + i.toString(), value: l });
      });
    } else {
      const wordsList = this.input.split(" ");
      const lastWord = wordsList[wordsList.length - 1];
      var result = this.predicionsService.getWord(lastWord);
      if (result.length > 0) {
        const wordsByPredictions = getTopAndBottomWordsLettersByPredictions(result, this.configurationService.keepOrderLetters);
        wordsByPredictions.topWords.forEach((l, i) => {
          this.onContentChangedEvent.next({ id: this.getIdPrefix() + 'ptop' + i.toString(), value: l });
        });
        wordsByPredictions.bottomWords.forEach((l, i) => {
          this.onContentChangedEvent.next({ id: this.getIdPrefix() + 'pbottom' + i.toString(), value: l });
        });
      } else {
        initialTopLetters.forEach((l, i) => {
          this.onContentChangedEvent.next({ id: this.getIdPrefix() + 'ptop' + i.toString(), value: l });
        });
        initialBottomLetters.forEach((l, i) => {
          this.onContentChangedEvent.next({ id: this.getIdPrefix() + 'pbottom' + i.toString(), value: l });
        });
      }
    }
  }

  private doDetect(div: string) {
    if (this.enableLayoutEdition) {
      return false;
    }

    if (this.configurationService.isDelayedDetectionAction()) {
      if (!this[div]) {
        this.hostEl.nativeElement.style.setProperty('--animation-duration', `${this.configurationService.sensorialSelectionDelayMs / 1000}s`);
        this[div] = true;
      }

      if (!this.lastSensorialDetectionTime)
        this.lastSensorialDetectionTime = new Date();

      return calcularDiferencaEmMilissegundos(this.lastSensorialDetectionTime, new Date()) >= this.configurationService.sensorialSelectionDelayMs;
    }

    return true;
  }

  private doTriggerAction() {
    if (elementOverAnother(this.suportDiv, this.limparElementRef.nativeElement)) {
      this.reset();
      this.resetAuxDisplay();
    } else if (elementOverAnother(this.suportDiv, this.falarElementRef.nativeElement)) {
      this.speak();
      this.resetAuxDisplay();
    } else if (elementOverAnother(this.suportDiv, this.limparTudoElementRef.nativeElement)) {
      this.reset(true);
      this.resetAuxDisplay();
    } else if (elementOverAnother(this.suportDiv, this.espacoElementRef.nativeElement)) {
      this.insertBlankSpace();
      this.resetAuxDisplay();
    } else if (elementOverAnother(this.suportDiv, this.simboloElementRef.nativeElement)) {
      this.changeToSimbols();
      this.resetAuxDisplay();
    }

    this.doResetSensorialDetection();
  }

  private doResetSensorialDetection() {
    if (!this.configurationService.isDelayedDetectionAction())
      return;

    this.animateDivSelectionSpace = false;
    this.animateDivSelectionClearAll = false;
    this.animateDivSelectionClear = false;
    this.animateDivSelectionSpeak = false;
    this.animateDivSelectionSimbols = false;
    this.lastSensorialDetectionTime = undefined;
    if (this.intervalSensorialDetection) {
      clearInterval(this.intervalSensorialDetection);
      this.intervalSensorialDetection = undefined;
    }
  }

  //#region Dynamic Layout
  private listenEditLayout() {
    this.configurationService.enablePageEdition.pipe(debounceTime(500)).subscribe((v) => {
      if (v) {
        if (this.showingSimbols) {
          simbolsNumericTop.forEach((l, i) => {
            this.onContentChangedEvent.next({ id: this.getIdPrefix() + 'ptop' + i.toString(), value: l });
          });
          simbolsBottom.forEach((l, i) => {
            this.onContentChangedEvent.next({ id: this.getIdPrefix() + 'pbottom' + i.toString(), value: l });
          });
        } else {
          sugestionTopLetters.forEach((l, i) => {
            this.onContentChangedEvent.next({ id: this.getIdPrefix() + 'ptop' + i.toString(), value: l });
          });
          sugestionBottomLetters.forEach((l, i) => {
            this.onContentChangedEvent.next({ id: this.getIdPrefix() + 'pbottom' + i.toString(), value: l });
          });
        }
      } else {
        if (this.showingSimbols) {
          simbolsNumericTop.forEach((l, i) => {
            this.onContentChangedEvent.next({ id: this.getIdPrefix() + 'ptop' + i.toString(), value: l });
          });
          simbolsBottom.forEach((l, i) => {
            this.onContentChangedEvent.next({ id: this.getIdPrefix() + 'pbottom' + i.toString(), value: l });
          });
        } else {
          initialTopLetters.forEach((l, i) => {
            this.onContentChangedEvent.next({ id: this.getIdPrefix() + 'ptop' + i.toString(), value: l });
          });
          initialBottomLetters.forEach((l, i) => {
            this.onContentChangedEvent.next({ id: this.getIdPrefix() + 'pbottom' + i.toString(), value: l });
          });
        }
        this.saveLayout();
      }
      this.enableLayoutEdition = v;
    });
  }

  private doSetDynamicLayout() {
    if (this.configurationService.layoutType == LayoutType.Customized) {
      const data = this.configurationService.getDynamicLayout(this.showingSimbols);
      if (data) {
        data.forEach((d) => {
          const element = document.getElementById(d.id);
          if (element) {
            element.style.position = "absolute";
            element.style.flex = "none";
            element.style.transform = d.transform;
            element.style.width = d.width + "px";
            element.style.height = d.height + "px";
            element.style.backgroundColor = d.backGroundColor;
            element.classList.add('el_changed');

            const elementCaracter = document.getElementById(d.caracterId);
            if (elementCaracter) {
              elementCaracter.style.color = d.fontColor;
              elementCaracter.style.fontSize = d.fontSize;
            }
          }
        });
      }
    }
  }

  private saveLayout() {
    const data = [];

    if (this.limparElementRef.nativeElement.parentElement.parentElement.classList.contains('el_changed'))
      data.push({
        id: this.limparElementRef.nativeElement.parentElement.parentElement.id,
        transform: this.limparElementRef.nativeElement.parentElement.parentElement.style.transform,
        width: this.limparElementRef.nativeElement.parentElement.parentElement.getBoundingClientRect().width,
        height: this.limparElementRef.nativeElement.parentElement.parentElement.getBoundingClientRect().height,
        backGroundColor: this.limparElementRef.nativeElement.parentElement.parentElement.style.backgroundColor,
        caracterId: this.limparElementRef.nativeElement.id,
        fontColor: this.limparElementRef.nativeElement.style.color,
        fontSize: this.limparElementRef.nativeElement.style.fontSize
      });

    if (this.limparTudoElementRef.nativeElement.parentElement.parentElement.classList.contains('el_changed'))
      data.push({
        id: this.limparTudoElementRef.nativeElement.parentElement.parentElement.id,
        transform: this.limparTudoElementRef.nativeElement.parentElement.parentElement.style.transform,
        width: this.limparTudoElementRef.nativeElement.parentElement.parentElement.getBoundingClientRect().width,
        height: this.limparTudoElementRef.nativeElement.parentElement.parentElement.getBoundingClientRect().height,
        backGroundColor: this.limparTudoElementRef.nativeElement.parentElement.parentElement.style.backgroundColor,
        caracterId: this.limparTudoElementRef.nativeElement.id,
        fontColor: this.limparTudoElementRef.nativeElement.style.color,
        fontSize: this.limparTudoElementRef.nativeElement.style.fontSize
      });

    if (this.simboloElementRef.nativeElement.parentElement.parentElement.classList.contains('el_changed'))
      data.push({
        id: this.simboloElementRef.nativeElement.parentElement.parentElement.id,
        transform: this.simboloElementRef.nativeElement.parentElement.parentElement.style.transform,
        width: this.simboloElementRef.nativeElement.parentElement.parentElement.getBoundingClientRect().width,
        height: this.simboloElementRef.nativeElement.parentElement.parentElement.getBoundingClientRect().height,
        backGroundColor: this.simboloElementRef.nativeElement.parentElement.parentElement.style.backgroundColor,
        caracterId: this.simboloElementRef.nativeElement.id,
        fontColor: this.simboloElementRef.nativeElement.style.color,
        fontSize: this.simboloElementRef.nativeElement.style.fontSize
      });

    if (this.espacoElementRef.nativeElement.parentElement.parentElement.classList.contains('el_changed'))
      data.push({
        id: this.espacoElementRef.nativeElement.parentElement.parentElement.id,
        transform: this.espacoElementRef.nativeElement.parentElement.parentElement.style.transform,
        width: this.espacoElementRef.nativeElement.parentElement.parentElement.getBoundingClientRect().width,
        height: this.espacoElementRef.nativeElement.parentElement.parentElement.getBoundingClientRect().height,
        backGroundColor: this.espacoElementRef.nativeElement.parentElement.parentElement.style.backgroundColor,
        caracterId: this.espacoElementRef.nativeElement.id,
        fontColor: this.espacoElementRef.nativeElement.style.color,
        fontSize: this.espacoElementRef.nativeElement.style.fontSize
      });

    if (this.falarElementRef.nativeElement.parentElement.parentElement.classList.contains('el_changed'))
      data.push({
        id: this.falarElementRef.nativeElement.parentElement.parentElement.id,
        transform: this.falarElementRef.nativeElement.parentElement.parentElement.style.transform,
        width: this.falarElementRef.nativeElement.parentElement.parentElement.getBoundingClientRect().width,
        height: this.falarElementRef.nativeElement.parentElement.parentElement.getBoundingClientRect().height,
        backGroundColor: this.falarElementRef.nativeElement.parentElement.parentElement.style.backgroundColor,
        caracterId: this.falarElementRef.nativeElement.id,
        fontColor: this.falarElementRef.nativeElement.style.color,
        fontSize: this.falarElementRef.nativeElement.style.fontSize
      });

    this.wordsOrLettersElements.forEach((w) => {
      data.push({
        id: w.wordOrLetterElementRef.nativeElement.id,
        transform: w.wordOrLetterElementRef.nativeElement.style.transform,
        width: w.wordOrLetterElementRef.nativeElement.getBoundingClientRect().width,
        height: w.wordOrLetterElementRef.nativeElement.getBoundingClientRect().height,
        backGroundColor: w.wordOrLetterElementRef.nativeElement.style.backgroundColor,
        caracterId: w.pElementRef.nativeElement.id,
        fontColor: w.pElementRef.nativeElement.style.color,
        fontSize: w.pElementRef.nativeElement.style.fontSize
      });
    });

    this.configurationService.setDynamicLayout(data, this.showingSimbols);
  }

  public onResize(evt: AngularResizeElementEvent, element: string): void {
    const div = this[element].nativeElement.parentElement.parentElement as HTMLDivElement;
    const parentWidh = div.parentElement.getBoundingClientRect().width;
    const parentHeight = div.parentElement.getBoundingClientRect().height;
    div.style.position = "absolute";
    div.style.flex = "none";
    div.style.width = evt.currentWidthValue + "px";
    div.style.height = evt.currentHeightValue + "px";
    div.parentElement.style.width = parentWidh + "px";
    div.parentElement.style.height = parentHeight + "px";
    div.classList.add('el_changed');
  }

  public incFontSize(prop, el) {
    this[prop] = (Number(this[prop].split("px")[0]) + 1).toString() + "px";
    this.setChanged(el);
  }

  public decFontSize(prop, el) {
    this[prop] = (Number(this[prop].split("px")[0]) - 1).toString() + "px";
    this.setChanged(el);
  }

  public setChanged(element: string) {
    const div = this[element].nativeElement.parentElement.parentElement as HTMLDivElement;
    div.classList.add('el_changed');
  }
  //#endregion

  //#region Suporte Controles HID
  private initHidControl() {
    if (this.configurationService.isAnyControlConfigured()) {
      this.createAuxDisplay();
      setTimeout(() => {
        this.configurationService.initializeControl();
      });
      this.configurationService.getPacketOutput().pipe(debounceTime(this.configurationService.getControlDebounceTime())).subscribe((e) => {
        this.reciveControlMovedEvent(e.detail);
      });
    }
  }

  private createAuxDisplay() {
    setTimeout(() => {
      this.suportDiv = document.createElement("div");
      this.suportDiv.id = "suportDiv";
      this.suportDiv.style.position = "absolute";
      const leftPx = (this.centerDivElementRef.nativeElement.offsetLeft + this.centerDivElementRef.nativeElement.offsetWidth / 2);
      const totalWidth = this.playerDivElementRef.nativeElement.clientWidth;
      const topPx = (this.centerDivElementRef.nativeElement.offsetTop + this.centerDivElementRef.nativeElement.offsetHeight / 2);
      const totalHeight = this.playerDivElementRef.nativeElement.clientHeight;
      this.suportDiv.style.left = (leftPx * 100 / totalWidth) + "%";
      this.suportDiv.style.top = (topPx * 100 / totalHeight) + "%";
      this.suportDiv.style.width = "20px";
      this.suportDiv.style.height = "20px";
      this.suportDiv.style.zIndex = "1";
      this.suportDiv.style.background = "red";
      if (!this.configurationService.isSensorialDeviceConfigured()) {
        this.suportDiv.style.background = "red";
      } else {
        this.suportDiv.style.background = "unset";
      }
      this.playerDivElementRef.nativeElement.appendChild(this.suportDiv);
    });
  }

  private resetAuxDisplay() {
    if (this.configurationService.isAnyControlConfigured()) {
      this.playerDivElementRef.nativeElement.removeChild(this.suportDiv);
      this.createAuxDisplay();
    }
  }

  private setAuxDisplayPositionCenterOn(onElement) {
    const leftPx = (onElement.offsetLeft + onElement.offsetWidth / 2);
    const totalWidth = this.playerDivElementRef.nativeElement.clientWidth;
    const topPx = (onElement.offsetTop + onElement.offsetHeight / 2);
    const totalHeight = this.playerDivElementRef.nativeElement.clientHeight;
    this.suportDiv.style.left = (leftPx * 100 / totalWidth) + "%";
    this.suportDiv.style.top = (topPx * 100 / totalHeight) + "%";
  }

  private identifyJoystickSide(packet) {
    if (!this.joystickSide) {
      if (packet?.analogStickLeft) {
        if (Math.abs(packet.analogStickLeft.horizontal) != Math.abs(packet.analogStickLeft.vertical)) {
          this.joystickSide = 'left';
        }
      }

      if (packet?.analogStickRight) {
        if (Math.abs(packet.analogStickRight.horizontal) != Math.abs(packet.analogStickRight.vertical)) {
          this.joystickSide = 'right';
        }
      }
    }
  }

  private moveByJoystick(packet) {
    const percentLeft = Number(this.suportDiv.style.left.substring(0, this.suportDiv.style.left.indexOf('%')));
    const percentTop = Number(this.suportDiv.style.top.substring(0, this.suportDiv.style.top.indexOf('%')));

    this.identifyJoystickSide(packet);
    if (this.joystickSide) {
      const joystick = this.joystickSide == 'left' ? packet?.analogStickLeft : packet?.analogStickRight;
      if (joystick.horizontal > 0.1 || joystick.horizontal < -0.1) {
        this.suportDiv.style.left = (percentLeft + joystick.horizontal * (this.configurationService.dpiSpeed / 1000)) > 100 ? '100%' : ((percentLeft + joystick.horizontal * (this.configurationService.dpiSpeed / 1000)) < 0 ? '0%' : (percentLeft + joystick.horizontal * (this.configurationService.dpiSpeed / 1000)) + "%");
        this.mouseMovedEvent.next({
          clientX: this.suportDiv.getBoundingClientRect().x,
          clientY: this.suportDiv.getBoundingClientRect().y,
          HTMLDivElement: this.suportDiv
        } as any);
      }

      if (joystick.vertical > 0.1 || joystick.vertical < -0.1) {
        this.suportDiv.style.top = (percentTop + joystick.vertical * (this.configurationService.dpiSpeed / 1000)) > 100 ? '100%' : ((percentTop + joystick.vertical * (this.configurationService.dpiSpeed / 1000)) < 0 ? '0%' : (percentTop + joystick.vertical * (this.configurationService.dpiSpeed / 1000)) + "%");
      }
    }
  }

  private moveBySensorial(packet) {
    if (!packet.actualAccelerometer?.y || !packet.actualAccelerometer?.x) {
      return;
    }

    let goToRight = packet.actualAccelerometer.y > 0.005;
    let goToLeft = packet.actualAccelerometer.y < -0.005;

    let goToTop = packet.actualAccelerometer.x > 0.005;
    let goToBottom = packet.actualAccelerometer.x < -0.005;

    const positionVariated = (this.actionSensorialDetectionBuffer.right != goToRight) || (this.actionSensorialDetectionBuffer.left != goToLeft)
      || (this.actionSensorialDetectionBuffer.top != goToTop) || (this.actionSensorialDetectionBuffer.bottom != goToBottom);

    if (positionVariated) {
      const elements = [this.limparElementRef.nativeElement, this.falarElementRef.nativeElement, this.limparTudoElementRef.nativeElement, this.simboloElementRef.nativeElement, this.espacoElementRef.nativeElement, ...this.wordsOrLettersElements.map(l => l.wordOrLetterElementRef.nativeElement)];
      const around = findElementsAround(this.suportDiv, elements);

      let closestElement;
      if (goToRight) {
        closestElement = findClosestElement(this.suportDiv, around.right);
      } else if (goToLeft) {
        closestElement = findClosestElement(this.suportDiv, around.left);
      } else if (goToTop) {
        closestElement = findClosestElement(this.suportDiv, around.above);
      } else if (goToBottom) {
        closestElement = findClosestElement(this.suportDiv, around.below);
      }

      if (closestElement) {
        this.setAuxDisplayPositionCenterOn(closestElement);
      }
    }

    this.actionSensorialDetectionBuffer = { top: goToTop, right: goToRight, bottom: goToBottom, left: goToLeft };
  }

  private moveByCamera(packet) {
    this.suportDiv.style.top = packet.y + "px";
    this.suportDiv.style.left = packet.x + "px";
  }

  private reciveControlMovedEvent(packet) {
    if (!packet) {
      return;
    }

    if (this.configurationService.isOcularDeviceConfigured()) {
      this.moveByCamera(packet);
    } else {
      if (this.configurationService.isSensorialDeviceConfigured()) {
        this.moveBySensorial(packet);
      } else {
        this.moveByJoystick(packet);
      }
    }

    // TODO \/ ESSE CODIGO AQUI FICARIA MELHOR EM OUTRO CANTO, TENDO UMA CHECAGEM AUTOMATICA DE X EM X TEMPO, MAS É CONVENIENTE DEIXAR ELE AQUI POIS SEM CRIAR NOVAS THREADS EU RECEBE EVENTOS DOS CONTROLES ALTERNATIVOS
    const overAnyActionElement = elementOverAnother(this.suportDiv, this.limparElementRef.nativeElement) ||
      elementOverAnother(this.suportDiv, this.falarElementRef.nativeElement) ||
      elementOverAnother(this.suportDiv, this.limparTudoElementRef.nativeElement) ||
      elementOverAnother(this.suportDiv, this.espacoElementRef.nativeElement) ||
      elementOverAnother(this.suportDiv, this.simboloElementRef.nativeElement);
    if (overAnyActionElement) {
      let divName = "";
      if (elementOverAnother(this.suportDiv, this.limparElementRef.nativeElement)) {
        divName = "animateDivSelectionClear";
      } else if (elementOverAnother(this.suportDiv, this.falarElementRef.nativeElement)) {
        divName = "animateDivSelectionSpeak";
      } else if (elementOverAnother(this.suportDiv, this.limparTudoElementRef.nativeElement)) {
        divName = "animateDivSelectionClearAll";
      } else if (elementOverAnother(this.suportDiv, this.espacoElementRef.nativeElement)) {
        divName = "animateDivSelectionSpace";
      } else if (elementOverAnother(this.suportDiv, this.simboloElementRef.nativeElement)) {
        divName = "animateDivSelectionSimbols";
      }

      if (this.doDetect(divName)) {
        this.doTriggerAction();
      }
    } else {
      this.doResetSensorialDetection();
    }
  }
  //#endregion
}