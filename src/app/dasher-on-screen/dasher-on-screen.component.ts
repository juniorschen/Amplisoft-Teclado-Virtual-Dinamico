import { AfterViewInit, Component, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { elementOverAnother, findClosestElement, findElementsAround, isTestEnv } from '../common/document-helper';

import { ConfigurationsService } from '../core/services/configuration.service';
import { DasherOnScreenPlayerComponent } from './dasher-on-screen-player/dasher-on-screen-player.component';
import { calcularDiferencaEmMilissegundos } from '../common/date';
import { PerfomanceIndicatorService } from '../core/performance-indicators/performance-indicators.service';
import { endCalibrateCamera } from '../core/support/camera/camera-support';
import { initialTopLetters, initialBottomLetters, getTopAndBottomWordsLettersByPredictions } from '../common/words-letters';
import { LokiJsPredictionsService } from '../core/predictions/lokijs-predictions.service';
import { LayoutType } from '../common/layout-type.enum';

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

  // Detecção sensorial
  private intervalSensorialDetection;
  private canSelectWordLetter: boolean = true;
  private lastSensorialDetectionTime: Date;
  private actionSensorialDetectionBuffer = { top: undefined, right: undefined, bottom: undefined, left: undefined };
  private bufferDoDetectSensorial = 100;

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
  public splitIndexHeader = Math.ceil(initialTopLetters.length / 2);
  public wordsOrLetterOnScreenBottom: Array<string> = initialBottomLetters;
  public splitIndexBottom = Math.ceil(initialBottomLetters.length / 2);
  public layoutTypes = LayoutType;
  public layoutType = this.configurationService.layoutType;
  public animateDivSelectionSpace = false;
  public animateDivSelectionClear = false;
  public animateDivSelectionClearAll = false;
  public animateDivSelectionSpeak = false;

  // Calibracao
  public clickElementsCount = new Map<string, number>();
  public defaultCalibrationCount = 5;

  constructor(private configurationService: ConfigurationsService, private perfomanceIndicatorService: PerfomanceIndicatorService,
    private predicionsService: LokiJsPredictionsService, private hostEl: ElementRef) {
    speechSynthesis.addEventListener("voiceschanged", () => { });
  }

  async ngAfterViewInit() {
    await this.predicionsService.ensureHasCreatedDatabases();
    this.initHidControl();
    this.lastActionExecuted = new Date();
    this.perfomanceIndicatorService.start();
    this.afkInterval = setInterval(() => this.checkDasherAfk(), 1000);
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
    if (!this.configurationService.isAnyControlConfigured()) {

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

  private insertBlankSpace(shouldRedefinedWords = true) {
    if (this.input) {
      const wordsList = this.input.split(" ");
      this.input = this.input + " ";
      this.perfomanceIndicatorService.blankSpace();

      if (wordsList[wordsList.length - 1].trim().length > 0) {
        this.predicionsService.doAddWordOnDb(wordsList[wordsList.length - 1]);
      }

      if (shouldRedefinedWords)
        this.redefinedWords();

      this.lastActionExecuted = new Date();
    }
  }

  mouseOverReset(fullReset = false) {
    if (!this.configurationService.isAnyControlConfigured()) {

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

  private speak() {
    this.synthesizeSpeechFromText(this.input);
    this.lastActionExecuted = new Date();
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

  private doDetect(div: string) {
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
    this.lastSensorialDetectionTime = undefined;
    if (this.intervalSensorialDetection) {
      clearInterval(this.intervalSensorialDetection);
      this.intervalSensorialDetection = undefined;
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
      if(packet?.analogStickLeft) {
        if (Math.abs(packet.analogStickLeft.horizontal) != Math.abs(packet.analogStickLeft.vertical)) {
          this.joystickSide = 'left';
        }
      }

      if(packet?.analogStickRight) {
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
      const elements = [this.limparElementRef.nativeElement, this.falarElementRef.nativeElement, this.limparTudoElementRef.nativeElement, this.espacoElementRef.nativeElement, ...this.wordsOrLettersElements.map(l => l.wordOrLetterElementRef.nativeElement)];
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
    const overAnyActionElement = elementOverAnother(this.suportDiv, this.limparElementRef.nativeElement) || elementOverAnother(this.suportDiv, this.falarElementRef.nativeElement) || elementOverAnother(this.suportDiv, this.limparTudoElementRef.nativeElement) || elementOverAnother(this.suportDiv, this.espacoElementRef.nativeElement);
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