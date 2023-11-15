import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { elementOverAnother } from '../common/document-helper';

import { ControlProviderService } from '../core/services/control-provider.service';

@Component({
  selector: 'app-dasher-on-screen',
  templateUrl: './dasher-on-screen.component.html',
  styleUrls: ['./dasher-on-screen.component.scss'],
})
export class DasherOnScreenComponent implements AfterViewInit, OnDestroy {

  private pausedPlayer = true;
  private words = new Array<string>();
  private lastSpeaked = "";
  private suportDiv: HTMLDivElement;
  private isControlOver = {
    repeat: false,
    speak: false,
    back: false,
    start: false
  };

  @ViewChild('voltarElementRef')
  public voltarElementRef: ElementRef<HTMLDivElement>;

  @ViewChild('falarElementRef')
  public falarElementRef: ElementRef<HTMLParagraphElement>;

  @ViewChild('repetirElementRef')
  public repetirElementRef: ElementRef<HTMLDivElement>;

  @ViewChild('startElementRef')
  public startElementRef: ElementRef<HTMLDivElement>;

  public onStartStopDasherEvent: Subject<boolean> = new Subject();
  public mouseMovedEvent: Subject<MouseEvent> = new Subject();
  public onResetDasherEvent: Subject<void> = new Subject();
  public showDasherWords = true;
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
    if (this.controlProviderService.isAnyDeviceConfigured()) {
      this.createAuxDisplay();
      await this.controlProviderService.connectControlHid();
      this.controlProviderService.getHIDPacketOutput().pipe(debounceTime(this.controlProviderService.getControlDebounceTime())).subscribe((e) => {
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
    if (!this.controlProviderService.isAnyDeviceConfigured()) {
      this.pausedPlayer = true;
      this.onStartStopDasherEvent.next(this.pausedPlayer);
    }
  }

  mouseMovedDasher(event: MouseEvent) {
    if (!this.controlProviderService.isAnyDeviceConfigured()) {
      this.mouseMovedEvent.next(event);
    }
  }

  mouseOverReset() {
    if (!this.controlProviderService.isAnyDeviceConfigured()) {
      this.reset();
    }
  }

  private reset() {
    this.words.pop();
    this.input = this.words.join(" ");
    this.redefinedWords(true);

    // TODO
    this.showDasherWords = false;
    setTimeout(() => {
      this.showDasherWords = true;
    });
  }

  mouseOverSpeak() {
    if (!this.controlProviderService.isAnyDeviceConfigured()) {
      this.speak();
    }
  }

  private speak() {
    this.lastSpeaked = this.input;
    this.synthesizeSpeechFromText(this.input);
  }

  mouseOverRepeat() {
    if (!this.controlProviderService.isAnyDeviceConfigured()) {
      this.repeat();
    }
  }

  private repeat() {
    this.synthesizeSpeechFromText(this.lastSpeaked);
  }

  onWordSelectedEvent(word: string) {
    this.words.push(word);
    this.input = this.words.join(" ");
    this.redefinedWords(false);
    this.onResetDasherEvent.next();
  }

  private synthesizeSpeechFromText(text: string): void {
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.getVoices()[0];
    speechSynthesis.speak(utterance);
  }

  private redefinedWords(initials: boolean) {
    if (initials) {
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
    } else {
      this.wordsOnScreen[0] = "História";
      this.wordsOnScreen[1] = "Matemática";
      this.wordsOnScreen[2] = "Português";
      this.wordsOnScreen[3] = "Ciências";
      this.wordsOnScreen[4] = "Filosofia";
      this.wordsOnScreen[5] = "Sociologia";
      this.wordsOnScreen[6] = "Educação";
      this.wordsOnScreen[7] = "Matérias";
      this.wordsOnScreen[8] = "Física";
      this.wordsOnScreen[9] = "Mostrar opções";
    }
  }

  //#region Suporte Controles HID
  private createAuxDisplay() {
    this.suportDiv = document.createElement("div");
    this.suportDiv.style.position = "absolute";
    this.suportDiv.style.left = "50%";
    this.suportDiv.style.top = "50%";
    this.suportDiv.style.width = "20px";
    this.suportDiv.style.height = "20px";
    this.suportDiv.style.background = "red";
    this.suportDiv.style.color = "blue";

    document.body.appendChild(this.suportDiv);
  }

  private reciveControlMovedEvent(packet) {
    if (!packet || !packet.actualOrientation) {
      return;
    }    

    const {
      actualAccelerometer: accelerometer,
      buttonStatus: buttons,
      actualGyroscope: gyroscope,
      actualOrientation: orientation,
      actualOrientationQuaternion: orientationQuaternion,
      ringCon: ringCon,
    } = packet;

    if (buttons.up) {
      this.onStartStopDasher();
      return;
    }

    const percentLeft = Number(this.suportDiv.style.left.substring(0, this.suportDiv.style.left.indexOf('%')));
    const percentTop = Number(this.suportDiv.style.top.substring(0, this.suportDiv.style.top.indexOf('%')));

    if (this.controlProviderService.getActiveControlType() == 'gyroscope') {
      if (Math.abs(accelerometer.y) > 0.009) {
        if (accelerometer.y > 0) {
          this.suportDiv.style.left = (percentLeft + 0.6) > 100 ? '100%' : ((percentLeft + 0.6) < 0 ? '0%' : (percentLeft + 0.6) + "%");
        } else {
          this.suportDiv.style.left = (percentLeft + -0.6) > 100 ? '100%' : ((percentLeft + -0.6) < 0 ? '0%' : (percentLeft + -0.6) + "%");
        }
        this.mouseMovedEvent.next({
          clientX: this.suportDiv.getBoundingClientRect().x,
          HTMLDivElement: this.suportDiv
        } as any);
      }

      if (accelerometer.x > 0 && Math.abs(accelerometer.x) > 0.005) {
        this.suportDiv.style.top = (percentTop + -1) > 100 ? '100%' : ((percentTop + -1) < 0 ? '0%' : (percentTop + -1) + "%");
      } else if (Math.abs(accelerometer.x) > 0.003) {
        this.suportDiv.style.top = (percentTop + 1) > 100 ? '100%' : ((percentTop + 1) < 0 ? '0%' : (percentTop + 1) + "%");
      }
    } else {
      const joystick = packet.analogStickLeft ?? packet.analogStickLeft;
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

    if (elementOverAnother(this.suportDiv, this.voltarElementRef.nativeElement)) {
      if (this.isControlOver.back)
        return;
      this.isControlOver = {
        repeat: false,
        speak: false,
        back: true,
        start: false
      };
      this.reset();
      return;
    } else if (elementOverAnother(this.suportDiv, this.falarElementRef.nativeElement)) {
      if (this.isControlOver.speak)
        return;
      this.isControlOver = {
        repeat: false,
        speak: true,
        back: false,
        start: false
      };
      this.speak();
      return;
    } else if (elementOverAnother(this.suportDiv, this.repetirElementRef.nativeElement)) {
      if (this.isControlOver.repeat)
        return;
      this.isControlOver = {
        repeat: true,
        speak: false,
        back: false,
        start: false
      };
      this.repeat();
      return;
    } else if (elementOverAnother(this.suportDiv, this.startElementRef.nativeElement)) {
      if (this.isControlOver.start)
        return;
      this.isControlOver = {
        repeat: true,
        speak: false,
        back: false,
        start: true
      };
      this.onStartStopDasher();
      return;
    }

    this.isControlOver = {
      repeat: false,
      speak: false,
      back: false,
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

