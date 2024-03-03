import { AfterViewInit, Component, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { elementOverAnother, isTestEnv } from '../common/document-helper';

import { ConfigurationsService } from '../core/services/configuration.service';
import { DasherOnScreenPlayerComponent } from './dasher-on-screen-player/dasher-on-screen-player.component';
import { calcularDiferencaEmMilissegundos } from '../common/date';
import { PerfomanceIndicatorService } from '../core/performance-indicators/performance-indicators.service';
import { endCalibrateCamera } from '../core/support/camera/camera-support';
import { initialTopLetters, initialBottomLetters, getTopAndBottomWordsLettersByPredictions } from '../common/words-letters';
import { Sector } from '../common/sector.enum';
import { LokiJsPredictionsService } from '../core/predictions/lokijs-predictions.service';

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
  private lastSpeaked = "";
  private suportDiv: HTMLDivElement;

  // Detecção sensorial
  private canSelectWordLetter: boolean = true;
  private suportDivOnDirection: 'top' | 'bottom';
  private suportDivOnSector: Sector;
  private lastSensorialDetectionTime: Date;
  private lastWordLetterDetected: string;
  private actionSensorialDetectionBuffer = { top: undefined, right: undefined, bottom: undefined, left: undefined };

  // Referencias do html
  @ViewChild('limparElementRef')
  public limparElementRef: ElementRef<HTMLParagraphElement>;

  @ViewChild('falarElementRef')
  public falarElementRef: ElementRef<HTMLParagraphElement>;

  @ViewChild('limparTudoElementRef')
  public limparTudoElementRef: ElementRef<HTMLParagraphElement>;

  @ViewChild('espacoElementRef')
  public espacoElementRef: ElementRef<HTMLParagraphElement>;

  @ViewChild('centerDivElementRef')
  public centerDivElementRef: ElementRef<HTMLDivElement>;

  @ViewChild('playerDivElementRef')
  public playerDivElementRef: ElementRef<HTMLDivElement>;

  @ViewChildren(DasherOnScreenPlayerComponent) wordsOrLettersElements: QueryList<DasherOnScreenPlayerComponent>

  // Controle Geral Html
  public mouseMovedEvent: Subject<MouseEvent> = new Subject();
  public onResetDasherEvent: Subject<void> = new Subject();
  public isAfk = false;
  public input = '';
  public wordsOrLetterOnScreenTop: Array<string> = initialTopLetters;
  public wordsOrLetterOnScreenBottom: Array<string> = initialBottomLetters;

  // Calibracao
  public clickElementsCount = new Map<string, number>();
  public defaultCalibrationCount = 5;

  constructor(private configurationService: ConfigurationsService, private perfomanceIndicatorService: PerfomanceIndicatorService,
    private predicionsService: LokiJsPredictionsService) {
    speechSynthesis.addEventListener("voiceschanged", () => { });
  }

  async ngAfterViewInit() {
    await this.predicionsService.ensureHasCreatedDatabases();
    this.initHidControl();
    this.lastActionExecuted = new Date();
    this.afkInterval = setInterval(() => this.checkDasherAfk(), 1000);
    this.perfomanceIndicatorService.start();
  }

  async ngOnDestroy(): Promise<void> {
    clearInterval(this.afkInterval);
    await this.perfomanceIndicatorService.end();
  }

  onClickElementCalibration(elementId, prefix) {
    const defaultActionElementsCount = 4 + this.wordsOrLetterOnScreenTop.length + this.wordsOrLetterOnScreenBottom.length;

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

    if (totalElementsClicksCount == (defaultActionElementsCount * this.defaultCalibrationCount)) {
      this.clickElementsCount = new Map<string, number>();
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

  mouseOverBlankSpace() {
    if (!this.configurationService.isAnyControlConfigured()) {
      this.insertBlankSpace();
    }
  }

  private insertBlankSpace(shouldRedefinedWords = true) {
    const wordsList = this.input.split(" ");
    this.input = this.input + " ";
    this.perfomanceIndicatorService.blankSpace();

    if (wordsList.length > 0) {
      this.predicionsService.doAddWordOnDb(wordsList[wordsList.length - 1]);
    }

    if (shouldRedefinedWords)
      this.redefinedWords();

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
    this.redefinedWords(fullReset);
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

  wordOrLetterSelectedEvent(wordOrLetter: string) {
    if (!this.canSelectWordLetter) {
      return;
    }

    this.canSelectWordLetter = false;

    this.resetAuxDisplay();
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

    this.redefinedWords();
    this.onResetDasherEvent.next();
    this.lastActionExecuted = new Date();

    setTimeout(() => {
      this.canSelectWordLetter = true;
    }, 500);
  }

  private synthesizeSpeechFromText(text: string): void {
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.getVoices()[0];
    speechSynthesis.speak(utterance);
  }

  private redefinedWords(fullReset = false) {
    if (fullReset) {
      this.wordsOrLetterOnScreenTop = initialTopLetters;
      this.wordsOrLetterOnScreenBottom = initialBottomLetters;
    } else {
      const wordsList = this.input.split(" ");
      const lastWord = wordsList[wordsList.length - 1];
      var result = this.predicionsService.getWord(lastWord);
      if (result.length > 0) {
        const wordsByPredictions = getTopAndBottomWordsLettersByPredictions(result);
        this.wordsOrLetterOnScreenTop = wordsByPredictions.topWords;
        this.wordsOrLetterOnScreenBottom = wordsByPredictions.bottomWords;
      } else {
        this.wordsOrLetterOnScreenTop = initialTopLetters;
        this.wordsOrLetterOnScreenBottom = initialBottomLetters;
      }
    }
  }

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

  private setAuxDisplayPositionCenterOn(onElementRef) {
    const leftPx = (onElementRef.nativeElement.offsetLeft + onElementRef.nativeElement.offsetWidth / 2);
    const totalWidth = this.playerDivElementRef.nativeElement.clientWidth;
    const topPx = (onElementRef.nativeElement.offsetTop + onElementRef.nativeElement.offsetHeight / 2);
    const totalHeight = this.playerDivElementRef.nativeElement.clientHeight;
    this.suportDiv.style.left = (leftPx * 100 / totalWidth) + "%";
    this.suportDiv.style.top = (topPx * 100 / totalHeight) + "%";
  }

  private doResetSensorialPosition() {
    this.suportDivOnSector = undefined;
    this.suportDivOnDirection = undefined;
  }

  private doResetSensorialDetection() {
    if (!this.configurationService.getActiveControl().includes("Sensorial"))
      return;

    this.lastSensorialDetectionTime = undefined;
    this.lastWordLetterDetected = undefined;
    this.wordsOrLettersElements.forEach((w, index) => {
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
  }

  private moveByJoystick(packet) {
    const percentLeft = Number(this.suportDiv.style.left.substring(0, this.suportDiv.style.left.indexOf('%')));
    const percentTop = Number(this.suportDiv.style.top.substring(0, this.suportDiv.style.top.indexOf('%')));
    const joystick = this.configurationService.getActiveControl().includes("Esquerdo") ? packet.analogStickLeft : packet.analogStickRight;
    if (joystick.horizontal > 0.1 || joystick.horizontal < -0.1) {
      this.suportDiv.style.left = (percentLeft + joystick.horizontal) > 100 ? '100%' : ((percentLeft + joystick.horizontal) < 0 ? '0%' : (percentLeft + joystick.horizontal) + "%");
      this.mouseMovedEvent.next({
        clientX: this.suportDiv.getBoundingClientRect().x,
        clientY: this.suportDiv.getBoundingClientRect().y,
        HTMLDivElement: this.suportDiv
      } as any);
    }

    if (joystick.vertical > 0.1 || joystick.vertical < -0.1) {
      this.suportDiv.style.top = (percentTop + joystick.vertical) > 100 ? '100%' : ((percentTop + joystick.vertical) < 0 ? '0%' : (percentTop + joystick.vertical) + "%");
    }
  }

  private wordOrLetterDetectedBySensorial() {
    let wordOrLetterDetected = false;

    this.wordsOrLettersElements.forEach((w, index) => {
      if (elementOverAnother(this.suportDiv, w.pElementRef.nativeElement) && this.lastWordLetterDetected != w.wordOrLetter) {
        w.pElementRef.nativeElement.style.backgroundColor = "lightgoldenrodyellow";
        this.lastSensorialDetectionTime = new Date();
        this.lastWordLetterDetected = w.wordOrLetter;
        wordOrLetterDetected = true;
      } else if (this.lastWordLetterDetected != w.wordOrLetter) {
        w.pElementRef.nativeElement.style.backgroundColor = "unset";
      } else if (calcularDiferencaEmMilissegundos(this.lastSensorialDetectionTime, new Date()) > this.configurationService.sensorialSelectionDelayMs) {
        this.doTriggerAction();
      } else {
        wordOrLetterDetected = true;
      }
    });

    return wordOrLetterDetected;
  }

  private detectSensorialSectorPosition(goToRight, goToLeft, goToTop, goToBottom) {
    let currentWordLetterComponent;
    let currentWords;

    const defineWordSectorPosition = (reverse = false) => {
      for (let index = 0; index < currentWords.length; index++) {
        if (!this.lastWordLetterDetected || this.lastWordLetterDetected == currentWords[index]) {
          const indexToNavigate = index + (!this.lastWordLetterDetected ? 0 : (reverse ? -1 : 1));
          const currentWordOrLetterComponent = this.wordsOrLettersElements.find(l => l.wordOrLetter == currentWords[indexToNavigate]);
          if (currentWordOrLetterComponent)
            this.setAuxDisplayPositionCenterOn(currentWordOrLetterComponent.wordOrLetterElementRef);
          break;
        }
      }
    };

    if (this.suportDivOnSector == Sector.SectorOne && goToRight) {
      this.setAuxDisplayPositionCenterOn(this.suportDivOnDirection == 'top' ? this.espacoElementRef : this.limparElementRef);
      this.suportDivOnSector = Sector.SectorTwo;
    } else if (this.suportDivOnSector == Sector.SectorOne && goToLeft) {
      currentWordLetterComponent = this.suportDivOnDirection == 'top' ? this.wordsOrLettersElements.find(l => l.wordOrLetter == this.wordsOrLetterOnScreenTop[this.wordsOrLetterOnScreenTop.length - 1]) : this.wordsOrLettersElements.find(l => l.wordOrLetter == this.wordsOrLetterOnScreenBottom[this.wordsOrLetterOnScreenBottom.length - 1]);
      this.setAuxDisplayPositionCenterOn(currentWordLetterComponent.wordOrLetterElementRef);
      this.suportDivOnSector = Sector.SectorTree;
    } else if (this.suportDivOnSector == Sector.SectorOne && goToTop) {
      this.setAuxDisplayPositionCenterOn(this.limparTudoElementRef);
      if (this.suportDivOnDirection == 'top') {
        this.doTriggerAction();
      }
    } else if (this.suportDivOnSector == Sector.SectorOne && goToBottom) {
      this.setAuxDisplayPositionCenterOn(this.falarElementRef);
      if (this.suportDivOnDirection == 'bottom') {
        this.doTriggerAction();
      }
    } else if (this.suportDivOnSector == Sector.SectorTwo && goToRight) {
      currentWordLetterComponent = this.suportDivOnDirection == 'top' ? this.wordsOrLettersElements.find(l => l.wordOrLetter == this.wordsOrLetterOnScreenTop[0]) : this.wordsOrLettersElements.find(l => l.wordOrLetter == this.wordsOrLetterOnScreenBottom[0]);
      this.setAuxDisplayPositionCenterOn(currentWordLetterComponent.wordOrLetterElementRef);
      this.suportDivOnSector = Sector.SectorTree;
    } else if (this.suportDivOnSector == Sector.SectorTwo && goToLeft) {
      this.setAuxDisplayPositionCenterOn(this.suportDivOnDirection == 'top' ? this.limparTudoElementRef : this.falarElementRef);
      this.suportDivOnSector = Sector.SectorOne;
    } else if (this.suportDivOnSector == Sector.SectorTwo && goToTop) {
      this.setAuxDisplayPositionCenterOn(this.espacoElementRef);
      if (this.suportDivOnDirection == 'top') {
        this.doTriggerAction();
      }
    } else if (this.suportDivOnSector == Sector.SectorTwo && goToBottom) {
      this.setAuxDisplayPositionCenterOn(this.limparElementRef);
      if (this.suportDivOnDirection == 'bottom') {
        this.doTriggerAction();
      }
    } else if (this.suportDivOnSector == Sector.SectorTree && goToRight) {
      currentWords = this.suportDivOnDirection == 'top' ? this.wordsOrLetterOnScreenTop : this.wordsOrLetterOnScreenBottom;
      const lastIndex = currentWords.findIndex(l => l == this.lastWordLetterDetected);
      if (lastIndex + 1 == (this.suportDivOnDirection == 'top' ? this.wordsOrLetterOnScreenTop.length : this.wordsOrLetterOnScreenBottom.length)) {
        this.setAuxDisplayPositionCenterOn(this.suportDivOnDirection == 'top' ? this.limparTudoElementRef : this.falarElementRef);
        this.suportDivOnSector = Sector.SectorOne;
      } else {
        defineWordSectorPosition();
      }
    } else if (this.suportDivOnSector == Sector.SectorTree && goToLeft) {
      currentWords = this.suportDivOnDirection == 'top' ? this.wordsOrLetterOnScreenTop : this.wordsOrLetterOnScreenBottom;
      if (this.lastWordLetterDetected == currentWords[0]) {
        this.setAuxDisplayPositionCenterOn(this.suportDivOnDirection == 'top' ? this.espacoElementRef : this.limparElementRef);
        this.suportDivOnSector = Sector.SectorTwo;
      } else {
        const currentIndex = currentWords.findIndex(l => l == this.lastWordLetterDetected);
        currentWordLetterComponent = this.wordsOrLettersElements.find(l => l.wordOrLetter == currentWords[currentIndex - 1]);
        this.setAuxDisplayPositionCenterOn(currentWordLetterComponent.wordOrLetterElementRef);
      }
    } else if (this.suportDivOnSector == Sector.SectorTree && goToTop) {
      if (this.lastWordLetterDetected && this.suportDivOnDirection == 'bottom') {
        const currentIndex = this.wordsOrLetterOnScreenBottom.findIndex(l => l == this.lastWordLetterDetected);
        currentWords = this.wordsOrLetterOnScreenTop;
        currentWordLetterComponent = this.wordsOrLettersElements.find(l => l.wordOrLetter == currentWords[currentIndex]);
        this.setAuxDisplayPositionCenterOn(currentWordLetterComponent.wordOrLetterElementRef);
      } else if (this.suportDivOnDirection == 'top') {
        this.doTriggerAction();
      }
    } else if (this.suportDivOnSector == Sector.SectorTree && goToBottom) {
      if (this.lastWordLetterDetected && this.suportDivOnDirection == 'top') {
        const currentIndex = this.wordsOrLetterOnScreenTop.findIndex(l => l == this.lastWordLetterDetected);
        currentWords = this.wordsOrLetterOnScreenBottom;
        currentWordLetterComponent = this.wordsOrLettersElements.find(l => l.wordOrLetter == currentWords[currentIndex]);
        this.setAuxDisplayPositionCenterOn(currentWordLetterComponent.wordOrLetterElementRef);
      } else if (this.suportDivOnDirection == 'bottom') {
        this.doTriggerAction();
      }
    } else if (this.suportDivOnSector == undefined) {
      currentWordLetterComponent = this.wordsOrLettersElements.find(l => l.wordOrLetter == this.wordsOrLetterOnScreenTop[0]);
      this.setAuxDisplayPositionCenterOn(currentWordLetterComponent.wordOrLetterElementRef);
      this.suportDivOnSector = Sector.SectorTree;
      this.suportDivOnDirection = 'top';
    }

    this.doResetSensorialDetection();
  }

  private moveBySensorialAcelerometers(packet) {
    if (!packet.actualAccelerometer?.y || !packet.actualAccelerometer?.x) {
      return false;
    }

    let goToRight = packet.actualAccelerometer.y > 0.005;
    let goToLeft = packet.actualAccelerometer.y < -0.005;

    let goToTop = packet.actualAccelerometer.x > 0.005;
    let goToBottom = packet.actualAccelerometer.x < -0.005;

    const positionVariated = (this.actionSensorialDetectionBuffer.right != goToRight) || (this.actionSensorialDetectionBuffer.left != goToLeft)
      || (this.actionSensorialDetectionBuffer.top != goToTop) || (this.actionSensorialDetectionBuffer.bottom != goToBottom);

    if (positionVariated) {
      this.detectSensorialSectorPosition(goToRight, goToLeft, goToTop, goToBottom);
    }

    this.suportDivOnDirection = goToTop ? 'top' : (goToBottom ? 'bottom' : this.suportDivOnDirection);
    this.actionSensorialDetectionBuffer = { top: goToTop, right: goToRight, bottom: goToBottom, left: goToLeft };

    return this.wordOrLetterDetectedBySensorial();
  }

  private moveByCamera(packet) {
    this.suportDiv.style.top = packet.y + "px";
    this.suportDiv.style.left = packet.x + "px";

    return this.wordOrLetterDetectedBySensorial();
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
    } else if (this.lastWordLetterDetected) {
      this.wordOrLetterSelectedEvent(this.lastWordLetterDetected);
    }

    this.doResetSensorialPosition();
    this.doResetSensorialDetection();
  }

  private reciveControlMovedEvent(packet) {
    if (!packet) {
      return;
    }

    let wordOrLetterDetected = false;
    if (this.configurationService.getActiveControl().includes("Ocular")) {
      wordOrLetterDetected = this.moveByCamera(packet);
    } else if (this.configurationService.getActiveControl().includes("Joycon")) {
      if (this.configurationService.getActiveControl().includes("Sensorial")) {
        wordOrLetterDetected = this.moveBySensorialAcelerometers(packet);
      } else {
        this.moveByJoystick(packet);
      }
    } else if (this.configurationService.getActiveControl().includes("JoystickDualShock")) {
      this.moveByJoystick(packet);
    } else {
      this.moveByJoystick(packet);
    }

    const overAnyActionElement = elementOverAnother(this.suportDiv, this.limparElementRef.nativeElement) || elementOverAnother(this.suportDiv, this.falarElementRef.nativeElement) ||
      elementOverAnother(this.suportDiv, this.limparTudoElementRef.nativeElement) || elementOverAnother(this.suportDiv, this.espacoElementRef.nativeElement);

    this.setBackGroundColorActions();
    if (overAnyActionElement) {
      if (this.configurationService.getActiveControl().includes("Sensorial") && !this.lastSensorialDetectionTime) {
        this.lastSensorialDetectionTime = new Date();
      }

      if (this.configurationService.getActiveControl().includes("Sensorial") && calcularDiferencaEmMilissegundos(new Date(), this.lastSensorialDetectionTime) < this.configurationService.sensorialSelectionDelayMs)
        return;

      this.doTriggerAction();
    } else if (!overAnyActionElement && !wordOrLetterDetected) {
      this.doResetSensorialDetection();
    }
  }
  //#endregion
}