import { AfterViewInit, Component, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { elementOverAnother } from '../common/document-helper';

import { ControlProviderService } from '../core/services/control-provider.service';
import { DasherOnScreenPlayerComponent } from './dasher-on-screen-player/dasher-on-screen-player.component';
import { findClosestIndex } from '../common/array-consts';
import { calcularDiferencaEmMilissegundos } from '../common/date';
import { Sector } from '../common/sector-enums';

@Component({
  selector: 'app-dasher-on-screen',
  templateUrl: './dasher-on-screen.component.html',
  styleUrls: ['./dasher-on-screen.component.scss'],
})
export class DasherOnScreenComponent implements AfterViewInit, OnDestroy {

  // Controle Privado
  private currentSector = Sector.CenterActions;
  private words = new Array<string>();
  private lastSpeaked = "";
  private suportDiv: HTMLDivElement;
  private isControlOver = {
    resetLast: false,
    speak: false,
    resetFull: false,
    start: false
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

  @ViewChild('supportDivFatherElementRef')
  public supportDivFatherElementRef: ElementRef<HTMLDivElement>;

  @ViewChild('startElementRef')
  public startElementRef: ElementRef<HTMLDivElement>;

  @ViewChild('leftElementRef')
  public leftElementRef: ElementRef<HTMLDivElement>;

  @ViewChild('centerElementRef')
  public centerElementRef: ElementRef<HTMLDivElement>;

  @ViewChild('rightElementRef')
  public rightElementRef: ElementRef<HTMLDivElement>;

  @ViewChildren(DasherOnScreenPlayerComponent) wordsElements: QueryList<DasherOnScreenPlayerComponent>

  // Controle Geral Html
  public pausedPlayer = true;
  public onStartStopDasherEvent: Subject<boolean> = new Subject();
  public mouseMovedEvent: Subject<MouseEvent> = new Subject();
  public onResetDasherEvent: Subject<void> = new Subject();
  public showDasherWords = true;
  public displayVideo = false;
  public input = '';
  public wordsOnScreen: Array<string> = [
    "Olá",
    "Oi",
    "Eaew",
    "Bom dia",
    "Como vai",
    "Fala mano",
    "Tudo certo",
    "Vamos indo",
    "Estou bem",
    "Mostrar opções",
  ];

  constructor(private controlProviderService: ControlProviderService) {
    speechSynthesis.addEventListener("voiceschanged", () => { });
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
  }

  onStartStopDasher() {
    this.pausedPlayer = !this.pausedPlayer;
    this.onStartStopDasherEvent.next(this.pausedPlayer);
  }

  mouseMovedOutDasher() {
    if (!this.controlProviderService.isAnyControlConfigured()) {
      this.pausedPlayer = true;
      this.onStartStopDasherEvent.next(this.pausedPlayer);
    }
  }

  mouseMovedDasher(event: MouseEvent) {
    if (!this.controlProviderService.isAnyControlConfigured()) {
      this.mouseMovedEvent.next(event);
    }
  }

  mouseOverBlankSpace() {
    this.words.push(" ");
    this.input = this.input + " ";
    this.redefinedWords();
  }

  mouseOverReset(fullReset = false) {
    if (!this.controlProviderService.isAnyControlConfigured()) {
      this.reset(fullReset);
    }
  }

  private reset(fullReset = false) {
    if (fullReset) {
      this.words = [];
      this.input = "";
    } else {
      this.words.pop();
      this.input = this.words.join(" ");
    }
    this.redefinedWords();

    // TODO
    this.showDasherWords = false;
    setTimeout(() => {
      this.showDasherWords = true;
    });
  }

  mouseOverSpeak() {
    if (!this.controlProviderService.isAnyControlConfigured()) {
      this.speak();
    }
  }

  private speak() {
    this.lastSpeaked = this.input;
    this.synthesizeSpeechFromText(this.input);
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
    this.words.push(word);
    this.input = this.words.join(" ");
    this.redefinedWords();
    this.onResetDasherEvent.next();
  }

  private synthesizeSpeechFromText(text: string): void {
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.getVoices()[0];
    speechSynthesis.speak(utterance);
  }

  private redefinedWords() {
    this.wordsOnScreen[0] = "Olá";
    this.wordsOnScreen[1] = "Oi";
    this.wordsOnScreen[2] = "Eaew";
    this.wordsOnScreen[3] = "Bom dia";
    this.wordsOnScreen[4] = "Como vai";
    this.wordsOnScreen[5] = "Fala mano";
    this.wordsOnScreen[6] = "Tudo certo";
    this.wordsOnScreen[7] = "Vamos indo";
    this.wordsOnScreen[8] = "Estou bem";
    this.wordsOnScreen[9] = "Mostrar opções";
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
      let domOcularRad = Math.atan2(packet.y, packet.x);
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
      }

    } else {
      // TODO DUALSHOCK E MICROSOFT
      const percentLeft = Number(this.suportDiv.style.left.substring(0, this.suportDiv.style.left.indexOf('%')));
      const percentTop = Number(this.suportDiv.style.top.substring(0, this.suportDiv.style.top.indexOf('%')));
    }

    /* if (this.controlProviderService.getActiveControl().includes("Sensorial") && calcularDiferencaEmMilissegundos(this.lastSensorialDetectionTime, new Date()) < 45000) {
      return;
    } */

    if (elementOverAnother(this.suportDiv, this.limparElementRef.nativeElement)) {
      if (this.isControlOver.resetLast)
        return;
      this.isControlOver = {
        resetLast: true,
        speak: false,
        resetFull: false,
        start: false
      };
      this.reset();
      return;
    } else if (elementOverAnother(this.suportDiv, this.falarElementRef.nativeElement)) {
      if (this.isControlOver.speak)
        return;
      this.isControlOver = {
        resetLast: false,
        speak: true,
        resetFull: false,
        start: false
      };
      this.speak();
      return;
    } else if (elementOverAnother(this.suportDiv, this.limparTudoElementRef.nativeElement)) {
      if (this.isControlOver.resetFull)
        return;
      this.isControlOver = {
        resetLast: false,
        speak: false,
        resetFull: true,
        start: false
      };
      this.reset(true);
      return;
    } else if (elementOverAnother(this.suportDiv, this.startElementRef.nativeElement)) {
      if (this.isControlOver.start)
        return;
      this.isControlOver = {
        resetLast: false,
        speak: false,
        resetFull: false,
        start: true
      };
      this.onStartStopDasher();
      return;
    }

    this.isControlOver = {
      resetLast: false,
      speak: false,
      resetFull: false,
      start: false
    };
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

