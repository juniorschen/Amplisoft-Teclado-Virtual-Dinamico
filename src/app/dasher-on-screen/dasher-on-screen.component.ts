import { AfterViewInit, Component, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { elementOverAnother, getOffset } from '../common/document-helper';

import { ConfigurationsService } from '../core/services/configuration.service';
import { DasherOnScreenPlayerComponent } from './dasher-on-screen-player/dasher-on-screen-player.component';
import { calcularDiferencaEmMilissegundos } from '../common/date';
import { PerfomanceIndicatorService } from '../core/performance-indicators/performance-indicators.service';
import { Sector } from '../common/sector.enum';
import { WordType } from '../common/word-type.enum';
import { endCalibrateCamera } from '../core/support/camera/camera-support';
import { getMixedAlphabet, getMixedConsonants, getVowels } from '../common/words';

@Component({
  selector: 'app-dasher-on-screen',
  templateUrl: './dasher-on-screen.component.html',
  styleUrls: ['./dasher-on-screen.component.scss'],
})
export class DasherOnScreenComponent implements AfterViewInit, OnDestroy {

  // Controle Privado
  private lastActionExecuted = new Date();
  private afkCheckDelayMs = 1000 * 45;
  private afkInterval;
  private lastSpeaked = "";
  private suportDiv: HTMLDivElement;
  private sector: Sector;
  private wordType = WordType.Mixed;

  // Detecção sensorial
  private lastSensorialDetectionTime: Date;
  private lastWordDetectionIndex: number;

  // Referencias do html
  @ViewChild('limparElementRef')
  public limparElementRef: ElementRef<HTMLParagraphElement>;

  @ViewChild('falarElementRef')
  public falarElementRef: ElementRef<HTMLParagraphElement>;

  @ViewChild('limparTudoElementRef')
  public limparTudoElementRef: ElementRef<HTMLParagraphElement>;

  @ViewChild('espacoElementRef')
  public espacoElementRef: ElementRef<HTMLParagraphElement>;

  @ViewChild('mostrarMaisElementRef')
  public mostrarMaisElementRef: ElementRef<HTMLParagraphElement>;

  @ViewChild('vogaisElementRef')
  public vogaisElementRef: ElementRef<HTMLParagraphElement>;

  @ViewChild('consoantesElementRef')
  public consoantesElementRef: ElementRef<HTMLParagraphElement>;

  @ViewChild('centerDivElementRef')
  public centerDivElementRef: ElementRef<HTMLDivElement>;

  @ViewChild('playerDivElementRef')
  public playerDivElementRef: ElementRef<HTMLDivElement>;

  @ViewChildren(DasherOnScreenPlayerComponent) wordsElements: QueryList<DasherOnScreenPlayerComponent>

  // Controle Geral Html
  public mouseMovedEvent: Subject<MouseEvent> = new Subject();
  public onResetDasherEvent: Subject<void> = new Subject();
  public isAfk = false;
  public input = '';
  public wordsOnScreen: Array<string> = getMixedAlphabet(this.configurationService.maxWordsOnScreen, false);

  // Calibracao
  public clickElementsCount = new Map<number, number>();
  public defaultCalibrationCount = 5;

  constructor(private configurationService: ConfigurationsService, private perfomanceIndicatorService: PerfomanceIndicatorService) {
    speechSynthesis.addEventListener("voiceschanged", () => { });
    this.perfomanceIndicatorService.start();
  }

  async ngAfterViewInit() {
    if (this.configurationService.isAnyControlConfigured()) {
      this.createAuxDisplay();
      setTimeout(() => {
        this.configurationService.initializeControl();
      });
      this.configurationService.getPacketOutput().pipe(debounceTime(this.configurationService.getControlDebounceTime())).subscribe((e) => {
        this.reciveControlMovedEvent(e.detail);
      });
    }

    this.afkInterval = setInterval(() => this.checkDasherAfk(), 1000);
  }

  async ngOnDestroy(): Promise<void> {
    clearInterval(this.afkInterval);
    await this.perfomanceIndicatorService.end();
  }

  onClickElementCalibration(elementIndex) {
    const defaultActionElementsCount = 7 + this.wordsOnScreen.length;

    const clickElementCount = this.clickElementsCount.get(elementIndex);
    if (clickElementCount && clickElementCount < this.defaultCalibrationCount) {
      this.clickElementsCount.set(elementIndex, clickElementCount + 1);
    } else if (!clickElementCount) {
      this.clickElementsCount.set(elementIndex, 1);
    }

    let totalElementsClicksCount = 0;
    for (let value of this.clickElementsCount.values()) {
      totalElementsClicksCount += value;
    }

    if (totalElementsClicksCount == (defaultActionElementsCount * this.defaultCalibrationCount)) {
      this.clickElementsCount = new Map<number, number>();
      // deixei bem especifico para camera por enquanto mas esse é o unico controlador que é calibrado se precisar no futuro melhorar este código para ser mais genérico
      endCalibrateCamera();
      this.configurationService.initializeControl();
    }
  }

  checkDasherAfk() {
    this.isAfk = calcularDiferencaEmMilissegundos(new Date(), this.lastActionExecuted) > this.afkCheckDelayMs;
    if (this.isAfk) {
      this.perfomanceIndicatorService.end(this.afkCheckDelayMs);
    }
  }

  mouseMovedDasher(event: MouseEvent) {
    if (!this.configurationService.isAnyControlConfigured()) {
      this.mouseMovedEvent.next(event);
    }
  }

  mouseOverVowels() {
    if (!this.configurationService.isAnyControlConfigured()) {
      this.showVowels();
    }
  }

  private showVowels() {
    this.redefinedWords(WordType.Vowels);
    this.lastActionExecuted = new Date();
  }

  mouseOverConsonants() {
    if (!this.configurationService.isAnyControlConfigured()) {
      this.showConsonants();
    }
  }

  private showConsonants() {
    this.redefinedWords(WordType.Consonants);
    this.lastActionExecuted = new Date();
  }

  mouseOverBlankSpace() {
    if (!this.configurationService.isAnyControlConfigured()) {
      this.insertBlankSpace();
    }
  }

  private insertBlankSpace() {
    this.input = this.input + " ";
    this.perfomanceIndicatorService.blankSpace();
    this.redefinedWords(WordType.Mixed);
    this.lastActionExecuted = new Date();
  }

  mouseOverMoreOptions() {
    if (!this.configurationService.isAnyControlConfigured()) {
      this.moreOptions();
    }
  }

  private moreOptions() {
    this.redefinedWords(this.wordType);
    this.lastActionExecuted = new Date();
  }

  mouseOverReset(fullReset = false) {
    if (!this.configurationService.isAnyControlConfigured()) {
      this.reset(fullReset);
    }
  }

  private reset(fullReset = false) {
    if (fullReset) {
      this.input = "";
    } else {
      this.input = this.input.substring(0, this.input.length - 1);
      this.perfomanceIndicatorService.backSpace();
    }
    this.redefinedWords(WordType.Mixed);
    this.lastActionExecuted = new Date();
  }

  mouseOverSpeak() {
    if (!this.configurationService.isAnyControlConfigured()) {
      this.speak();
    }
  }

  private speak() {
    this.lastSpeaked = this.input;
    this.synthesizeSpeechFromText(this.input);
    this.lastActionExecuted = new Date();
  }

  mouseOverRepeat() {
    if (!this.configurationService.isAnyControlConfigured()) {
      this.repeat();
    }
  }

  private repeat() {
    this.synthesizeSpeechFromText(this.lastSpeaked);
  }

  onWordSelectedEvent(word: string) {
    if (word.length > 1) {
      const wordsList = this.input.split(" ");
      const lastWord = wordsList[word.length - 1];
      if (lastWord != " ") {
        this.input = this.input.substring(0, this.input.length - lastWord.length);
        this.input = this.input + word;
      }
    } else {
      this.input = this.input + word;
    }

    this.perfomanceIndicatorService.wordSelected(word);
    this.redefinedWords(WordType.Mixed, true);
    this.onResetDasherEvent.next();
    this.lastActionExecuted = new Date();
  }

  private synthesizeSpeechFromText(text: string): void {
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.getVoices()[0];
    speechSynthesis.speak(utterance);
  }

  private redefinedWords(type: WordType, fullReset = false) {
    const changedType = this.wordType != type;
    switch (type) {
      case WordType.Vowels:
        if (!changedType) {
          this.wordsOnScreen = getMixedAlphabet(this.configurationService.maxWordsOnScreen, false);
          this.wordType = WordType.Mixed;
        } else {
          this.wordsOnScreen = getVowels();
          this.wordType = WordType.Vowels;
        }
        break;
      case WordType.Consonants:
        this.wordsOnScreen = getMixedConsonants(this.configurationService.maxWordsOnScreen, !changedType && !fullReset);
        this.wordType = WordType.Consonants;
        if (this.wordsOnScreen.length == 0) {
          this.wordsOnScreen = getMixedAlphabet(this.configurationService.maxWordsOnScreen, false);
          this.wordType = WordType.Mixed;
        }
        break;
      case WordType.Mixed:
        this.wordsOnScreen = getMixedAlphabet(this.configurationService.maxWordsOnScreen, !changedType && !fullReset);
        this.wordType = WordType.Mixed;
        break;
    }
  }

  //#region Suporte Controles HID
  private createAuxDisplay() {
    setTimeout(() => {
      this.suportDiv = document.createElement("div");
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
      if (!this.configurationService.getActiveControl().includes("Sensorial")) {
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

  private doResetSensorialDetection() {
    if (!this.configurationService.getActiveControl().includes("Sensorial"))
      return;

    this.lastSensorialDetectionTime = undefined;
    this.lastWordDetectionIndex = undefined;
    this.wordsElements.forEach((w, index) => {
      w.pElementRef.nativeElement.style.backgroundColor = "unset";
    });
  }

  private setBackGroundColorActions() {
    if (elementOverAnother(this.suportDiv, this.limparElementRef.nativeElement)) {
      this.limparElementRef.nativeElement.style.backgroundColor = "lightgoldenrodyellow";
    } else {
      this.limparElementRef.nativeElement.style.backgroundColor = "unset";
    }

    if (elementOverAnother(this.suportDiv, this.falarElementRef.nativeElement)) {
      this.falarElementRef.nativeElement.style.backgroundColor = "lightgoldenrodyellow";
    } else {
      this.falarElementRef.nativeElement.style.backgroundColor = "unset";
    }

    if (elementOverAnother(this.suportDiv, this.limparTudoElementRef.nativeElement)) {
      this.limparTudoElementRef.nativeElement.style.backgroundColor = "lightgoldenrodyellow";
    } else {
      this.limparTudoElementRef.nativeElement.style.backgroundColor = "unset";
    }

    if (elementOverAnother(this.suportDiv, this.espacoElementRef.nativeElement)) {
      this.espacoElementRef.nativeElement.style.backgroundColor = "lightgoldenrodyellow";
    } else {
      this.espacoElementRef.nativeElement.style.backgroundColor = "unset";
    }

    if (elementOverAnother(this.suportDiv, this.mostrarMaisElementRef.nativeElement)) {
      this.mostrarMaisElementRef.nativeElement.style.backgroundColor = "lightgoldenrodyellow";
    } else {
      this.mostrarMaisElementRef.nativeElement.style.backgroundColor = "unset";
    }

    if (elementOverAnother(this.suportDiv, this.vogaisElementRef.nativeElement)) {
      this.vogaisElementRef.nativeElement.style.backgroundColor = "lightgoldenrodyellow";
    } else {
      this.vogaisElementRef.nativeElement.style.backgroundColor = "unset";
    }

    if (elementOverAnother(this.suportDiv, this.consoantesElementRef.nativeElement)) {
      this.consoantesElementRef.nativeElement.style.backgroundColor = "lightgoldenrodyellow";
    } else {
      this.consoantesElementRef.nativeElement.style.backgroundColor = "unset";
    }
  }

  private moveByJoystick(packet) {
    const percentLeft = Number(this.suportDiv.style.left.substring(0, this.suportDiv.style.left.indexOf('%')));
    const percentTop = Number(this.suportDiv.style.top.substring(0, this.suportDiv.style.top.indexOf('%')));
    const joystick = this.configurationService.getActiveControl().includes("Esquerdo") ? packet.analogStickLeft : packet.analogStickRight;
    if (joystick.horizontal > 0.1 || joystick.horizontal < -0.1) {
      this.suportDiv.style.left = (percentLeft + joystick.horizontal) > 100 ? '100%' : ((percentLeft + joystick.horizontal) < 0 ? '0%' : (percentLeft + joystick.horizontal) + "%");
      this.mouseMovedEvent.next({
        clientX: this.suportDiv.getBoundingClientRect().x,
        HTMLDivElement: this.suportDiv
      } as any);
    }

    if (joystick.vertical > 0.1 || joystick.vertical < -0.1) {
      this.suportDiv.style.top = (percentTop + joystick.vertical) > 100 ? '100%' : ((percentTop + joystick.vertical) < 0 ? '0%' : (percentTop + joystick.vertical) + "%");
    }
  }

  private wordDetectedBySensorial() {
    let wordDetected = false;

    this.wordsElements.forEach((w, index) => {
      if (elementOverAnother(this.suportDiv, w.pElementRef.nativeElement) && this.lastWordDetectionIndex != index) {
        w.pElementRef.nativeElement.style.backgroundColor = "lightgoldenrodyellow";
        this.lastSensorialDetectionTime = new Date();
        this.lastWordDetectionIndex = index;
        wordDetected = true;
      } else if (this.lastWordDetectionIndex != index) {
        w.pElementRef.nativeElement.style.backgroundColor = "unset";
      } else if (calcularDiferencaEmMilissegundos(this.lastSensorialDetectionTime, new Date()) > this.configurationService.sensorialSelectionDelayMs) {
        this.doResetSensorialDetection();
        this.onWordSelectedEvent(w.word);
      } else {
        wordDetected = true;
      }
    });

    return wordDetected;
  }

  private moveBySensorialAcelerometers(packet) {
    let wordDetected = false;

    if (Math.abs(packet?.actualAccelerometer?.y) > 0.009) {
      if (packet.actualAccelerometer.y > 0) {
        this.sector = Sector.Right;
        this.suportDiv.style.left = "99%";
        wordDetected = this.wordDetectedBySensorial();
      } else if (this.sector != Sector.Left) {
        this.doResetSensorialDetection();
        this.sector = Sector.Left;
        this.suportDiv.style.left = (this.limparElementRef.nativeElement.offsetLeft + this.limparElementRef.nativeElement.offsetWidth / 2) + "px";
      }
    } else if (Math.abs(packet?.actualAccelerometer?.y) < 0.001 && this.sector != Sector.Center) {
      this.doResetSensorialDetection();
      this.sector = Sector.Center;
      this.suportDiv.style.left = (this.centerDivElementRef.nativeElement.offsetLeft + this.centerDivElementRef.nativeElement.offsetWidth / 2) + "px";
    }

    const percentTop = Number(this.suportDiv.style.top.substring(0, this.suportDiv.style.top.indexOf('%')));
    if (packet.actualAccelerometer.x > 0 && Math.abs(packet.actualAccelerometer.x) > 0.005) {
      if (this.sector == Sector.Center) {
        const topPx = (this.espacoElementRef.nativeElement.offsetTop + this.espacoElementRef.nativeElement.offsetHeight / 2);
        const totalHeight = this.playerDivElementRef.nativeElement.clientHeight;
        this.suportDiv.style.top = (topPx * 100 / totalHeight) + "%";
      } else {
        this.suportDiv.style.top = (percentTop + -2.5) > 100 ? '100%' : ((percentTop + -2.5) < 0 ? '0%' : (percentTop + -2.5) + "%");
      }
    } else if (packet.actualAccelerometer.x < 0 && Math.abs(packet.actualAccelerometer.x) > 0.003) {
      if (this.sector == Sector.Center) {
        const topPx = (this.mostrarMaisElementRef.nativeElement.offsetTop + this.mostrarMaisElementRef.nativeElement.offsetHeight / 2);
        const totalHeight = this.playerDivElementRef.nativeElement.clientHeight;
        this.suportDiv.style.top = (topPx * 100 / totalHeight) + "%";
      } else {
        this.suportDiv.style.top = (percentTop + 2.5) > 100 ? '100%' : ((percentTop + 2.5) < 0 ? '0%' : (percentTop + 2.5) + "%");
      }
    }

    return wordDetected;
  }

  private moveByCamera(packet) {
    this.suportDiv.style.top = packet.y + "px";
    this.suportDiv.style.left = packet.x + "px";

    return this.wordDetectedBySensorial();
  }

  private reciveControlMovedEvent(packet) {
    if (!packet) {
      return;
    }

    let wordDetected = false;

    if (this.configurationService.getActiveControl().includes("Ocular")) {
      wordDetected = this.moveByCamera(packet);
    } else if (this.configurationService.getActiveControl().includes("Joycon")) {
      if (this.configurationService.getActiveControl().includes("Sensorial")) {
        wordDetected = this.moveBySensorialAcelerometers(packet);
      } else {
        this.moveByJoystick(packet);
      }
    } else if (this.configurationService.getActiveControl().includes("JoystickDualShock")) {
      this.moveByJoystick(packet);
    } else {
      this.moveByJoystick(packet);
    }

    const overAnyActionElement = elementOverAnother(this.suportDiv, this.limparElementRef.nativeElement) || elementOverAnother(this.suportDiv, this.falarElementRef.nativeElement) ||
      elementOverAnother(this.suportDiv, this.limparTudoElementRef.nativeElement) || elementOverAnother(this.suportDiv, this.espacoElementRef.nativeElement) ||
      elementOverAnother(this.suportDiv, this.mostrarMaisElementRef.nativeElement) || elementOverAnother(this.suportDiv, this.vogaisElementRef.nativeElement) ||
      elementOverAnother(this.suportDiv, this.consoantesElementRef.nativeElement);

    this.setBackGroundColorActions();
    if (overAnyActionElement) {
      if (this.configurationService.getActiveControl().includes("Sensorial") && !this.lastSensorialDetectionTime) {
        this.lastSensorialDetectionTime = new Date();
      }

      if (this.configurationService.getActiveControl().includes("Sensorial") && calcularDiferencaEmMilissegundos(new Date(), this.lastSensorialDetectionTime) < this.configurationService.sensorialSelectionDelayMs)
        return;

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
      } else if (elementOverAnother(this.suportDiv, this.mostrarMaisElementRef.nativeElement)) {
        this.moreOptions();
        this.resetAuxDisplay();
      } else if (elementOverAnother(this.suportDiv, this.vogaisElementRef.nativeElement)) {
        this.redefinedWords(WordType.Vowels);
        this.resetAuxDisplay();
      } else if (elementOverAnother(this.suportDiv, this.consoantesElementRef.nativeElement)) {
        this.redefinedWords(WordType.Consonants);
        this.resetAuxDisplay();
      }
      this.doResetSensorialDetection();
    } else if (!overAnyActionElement && !wordDetected) {
      this.doResetSensorialDetection();
    }
  }
  //#endregion
}