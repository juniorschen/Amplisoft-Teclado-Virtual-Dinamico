import { AfterViewInit, Component, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { elementOverAnother } from '../common/document-helper';

import { ControlProviderService } from '../core/services/control-provider.service';
import { DasherOnScreenPlayerComponent } from './dasher-on-screen-player/dasher-on-screen-player.component';
import { findClosestIndex } from '../common/array-consts';
import { calcularDiferencaEmMilissegundos } from '../common/date';
import { Sector } from '../common/sector-enums';
import { PerfomanceIndicatorService } from '../core/performance-indicators/performance-indicators.service';

@Component({
  selector: 'app-dasher-on-screen',
  templateUrl: './dasher-on-screen.component.html',
  styleUrls: ['./dasher-on-screen.component.scss'],
})
export class DasherOnScreenComponent implements AfterViewInit, OnDestroy {

  // Controle Privado
  private lastActionExecuted = new Date();
  private currentSector = Sector.CenterActions;
  private lastSpeaked = "";
  private suportDiv: HTMLDivElement;
  private isControlOver = {
    resetLast: false,
    speak: false,
    resetFull: false,
    space: false,
    moreOptions: false
  };

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

  @ViewChildren(DasherOnScreenPlayerComponent) wordsElements: QueryList<DasherOnScreenPlayerComponent>

  // Controle Geral Html
  public mouseMovedEvent: Subject<MouseEvent> = new Subject();
  public onResetDasherEvent: Subject<void> = new Subject();
  public displayVideo = false;
  public input = '';
  public wordsOnScreen: Array<string> = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
  ];

  constructor(private controlProviderService: ControlProviderService, private perfomanceIndicatorService: PerfomanceIndicatorService) {
    speechSynthesis.addEventListener("voiceschanged", () => { });
    this.perfomanceIndicatorService.start();
  }

  async ngAfterViewInit() {
    if (this.controlProviderService.isAnyControlConfigured()) {
      this.createAuxDisplay();
      setTimeout(() => {
        this.controlProviderService.initializeControl();
      });
      this.controlProviderService.getPacketOutput().pipe(debounceTime(this.controlProviderService.getControlDebounceTime())).subscribe((e) => {
        this.reciveControlMovedEvent(e.detail);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.suportDiv) {
      document.body.removeChild(this.suportDiv);
    }
    this.perfomanceIndicatorService.end();
  }

  checkDasherAfk() {
    if (calcularDiferencaEmMilissegundos(this.lastActionExecuted, new Date()) > 15000) {
      this.perfomanceIndicatorService.end(15000);
    }
  }

  mouseMovedDasher(event: MouseEvent) {
    if (!this.controlProviderService.isAnyControlConfigured()) {
      this.mouseMovedEvent.next(event);
    }
  }

  mouseOverBlankSpace() {
    if (!this.controlProviderService.isAnyControlConfigured()) {
      this.insertBlankSpace();
    }
  }

  private insertBlankSpace() {
    this.input = this.input + " ";
    this.perfomanceIndicatorService.blankSpace();
    this.redefinedWords();
    this.lastActionExecuted = new Date();
  }

  mouseOverMoreOptions() {
    if (!this.controlProviderService.isAnyControlConfigured()) {
      this.moreOptions();
    }
  }

  private moreOptions() {
    this.redefinedWords();
    this.lastActionExecuted = new Date();
  }

  mouseOverReset(fullReset = false) {
    if (!this.controlProviderService.isAnyControlConfigured()) {
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
    this.redefinedWords();
    this.lastActionExecuted = new Date();
  }

  mouseOverSpeak() {
    if (!this.controlProviderService.isAnyControlConfigured()) {
      this.speak();
    }
  }

  private speak() {
    this.lastSpeaked = this.input;
    this.synthesizeSpeechFromText(this.input);
    this.lastActionExecuted = new Date();
  }

  mouseOverRepeat() {
    if (!this.controlProviderService.isAnyControlConfigured()) {
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
    this.redefinedWords();
    this.onResetDasherEvent.next();
    this.lastActionExecuted = new Date();
  }

  private synthesizeSpeechFromText(text: string): void {
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.getVoices()[0];
    speechSynthesis.speak(utterance);
  }

  private redefinedWords() {
    this.wordsOnScreen[0] = "a";
    this.wordsOnScreen[1] = "b";
    this.wordsOnScreen[2] = "c";
    this.wordsOnScreen[3] = "d";
    this.wordsOnScreen[4] = "e";
    this.wordsOnScreen[5] = "f";
    this.wordsOnScreen[6] = "g";
    this.wordsOnScreen[7] = "h";
    this.wordsOnScreen[8] = "i";
    this.wordsOnScreen[9] = "j";
  }

  //#region Suporte Controles HID
  private createAuxDisplay() {
    this.displayVideo = this.controlProviderService.isOcularDeviceConfigured();
    if (!this.displayVideo) {
      this.suportDiv = document.createElement("div");
      this.suportDiv.style.position = "absolute";
      this.suportDiv.style.left = "50%";
      this.suportDiv.style.top = "50%";
      this.suportDiv.style.width = "20px";
      this.suportDiv.style.height = "20px";
      this.suportDiv.style.background = "red";
      this.suportDiv.style.zIndex = "1";
      document.body.appendChild(this.suportDiv);
    }
  }

  private reciveControlMovedEvent(packet) {
    if (!packet) {
      return;
    }


    if (this.controlProviderService.getActiveControl().includes("Joycon")) {
      const percentLeft = Number(this.suportDiv.style.left.substring(0, this.suportDiv.style.left.indexOf('%')));
      const percentTop = Number(this.suportDiv.style.top.substring(0, this.suportDiv.style.top.indexOf('%')));

      if (this.controlProviderService.getActiveControl().includes("Sensorial")) {
        /* if (Math.abs(packet.actualAccelerometer.y) > 0.009) {
          if (packet.actualAccelerometer.y > 0) {
            this.suportDiv.style.left = (percentLeft + 0.6) > 100 ? '100%' : ((percentLeft + 0.6) < 0 ? '0%' : (percentLeft + 0.6) + "%");
          } else {
            this.suportDiv.style.left = (percentLeft + -0.6) > 100 ? '100%' : ((percentLeft + -0.6) < 0 ? '0%' : (percentLeft + -0.6) + "%");
          }
          this.mouseMovedEvent.next({
            clientX: this.suportDiv.getBoundingClientRect().x,
            HTMLDivElement: this.suportDiv
          } as any);
        } */

        if (Math.abs(packet.actualAccelerometer.y) > 0.009) {
          if (packet.actualAccelerometer.y > 0) {
            this.suportDiv.style.left = "95%";
            this.currentSector = Sector.RightAction;

            this.wordsElements.forEach((w, index) => {
              if (elementOverAnother(this.suportDiv, w.pElementRef.nativeElement) && this.lastWordDetectionIndex != index) {
                w.pElementRef.nativeElement.style.backgroundColor = "red";
                this.lastSensorialDetectionTime = new Date();
                this.lastWordDetectionIndex = index;
              } else if (this.lastWordDetectionIndex != index) {
                w.pElementRef.nativeElement.style.backgroundColor = "unset";
              } else if (calcularDiferencaEmMilissegundos(this.lastSensorialDetectionTime, new Date()) > 45000) {
                this.onWordSelectedEvent(w.word);
                return;
              }
            });
          } else {
            this.suportDiv.style.left = "5%";
            this.currentSector = Sector.LeftActions;
          }
        } else if (Math.abs(packet.actualAccelerometer.y) < 0.001) {
          this.suportDiv.style.left = "15%";
          this.currentSector = Sector.CenterActions;
        }

        if (packet.actualAccelerometer.x > 0 && Math.abs(packet.actualAccelerometer.x) > 0.005) {
          this.suportDiv.style.top = (percentTop + -1) > 100 ? '100%' : ((percentTop + -1) < 0 ? '0%' : (percentTop + -1) + "%");
        } else if (packet.actualAccelerometer.x < 0 && Math.abs(packet.actualAccelerometer.x) > 0.003) {
          this.suportDiv.style.top = (percentTop + 1) > 100 ? '100%' : ((percentTop + 1) < 0 ? '0%' : (percentTop + 1) + "%");
        }
      } else {
        const joystick = this.controlProviderService.getActiveControl().includes("Esquerdo") ? packet.analogStickLeft : packet.analogStickRight;
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
    } else if (this.controlProviderService.getActiveControl().includes("Ocular")) {
      /* let domOcularRad = Math.atan2(packet.y, packet.x);
      let domOcularGraus = domOcularRad * (180 / Math.PI);
      let domWordsGraus = [];
      this.wordsElements.forEach(w => {
        const domWord = w.pElementRef.nativeElement.getBoundingClientRect();
        let domWordRad = Math.atan2(domWord.y, domWord.x);
        let domWordGraus = domWordRad * (180 / Math.PI);
        domWordsGraus.push(domWordGraus);
      });
      const closestIndex = findClosestIndex(domOcularGraus, domWordsGraus);

      if (Math.abs(domOcularGraus - domWordsGraus[closestIndex]) <= 1) {
        if (this.lastWordDetectionIndex != closestIndex) {
          this.wordsElements.forEach((w, index) => {
            if (index != closestIndex) {
              w.pElementRef.nativeElement.style.backgroundColor = "unset";
            } else {
              w.pElementRef.nativeElement.style.backgroundColor = "red";
            }
          });
          this.lastSensorialDetectionTime = new Date();
          this.lastWordDetectionIndex = closestIndex;
        } else {
          if (calcularDiferencaEmMilissegundos(this.lastSensorialDetectionTime, new Date()) >= 45000) {
            this.onWordSelectedEvent(this.wordsElements.toArray()[closestIndex].word);
            this.lastSensorialDetectionTime = undefined;
            this.lastWordDetectionIndex = undefined;
          }
        }
      } */

    } else {
      // TODO DUALSHOCK E MICROSOFT
      const percentLeft = Number(this.suportDiv.style.left.substring(0, this.suportDiv.style.left.indexOf('%')));
      const percentTop = Number(this.suportDiv.style.top.substring(0, this.suportDiv.style.top.indexOf('%')));
    }

    this.isControlOver = {
      resetLast: elementOverAnother(this.suportDiv, this.limparElementRef.nativeElement) && !this.isControlOver.resetLast,
      speak: elementOverAnother(this.suportDiv, this.falarElementRef.nativeElement) && !this.isControlOver.speak,
      resetFull: elementOverAnother(this.suportDiv, this.limparTudoElementRef.nativeElement) && !this.isControlOver.resetFull,
      space: elementOverAnother(this.suportDiv, this.espacoElementRef.nativeElement) && !this.isControlOver.space,
      moreOptions: elementOverAnother(this.suportDiv, this.mostrarMaisElementRef.nativeElement) && !this.isControlOver.moreOptions
    };

    if (this.isControlOver.resetLast ||
      this.isControlOver.speak ||
      this.isControlOver.resetFull ||
      this.isControlOver.space ||
      this.isControlOver.moreOptions
    ) {
      if (this.controlProviderService.getActiveControl().includes("Sensorial") && calcularDiferencaEmMilissegundos(this.lastSensorialDetectionTime, new Date()) < 45000)
        return;

      if (this.isControlOver.resetLast) {
        this.reset();
      } else if (this.isControlOver.speak) {
        this.speak();
      } else if (this.isControlOver.resetFull) {
        this.reset(true);
      } else if (this.isControlOver.space) {
        this.insertBlankSpace();
      } else if (this.isControlOver.moreOptions) {
        this.moreOptions();
      }
    } else {
      this.checkDasherAfk();
    }
  }

  dispatchMouseEvent(type: string, deltaX: number, deltaY: number) {
    const event = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      movementX: deltaX,
      movementY: deltaY
    });
    document.dispatchEvent(event);
  }
  //#endregion
}

