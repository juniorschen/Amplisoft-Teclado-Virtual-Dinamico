import { AnimationBuilder } from '@angular/animations';
import { AfterViewInit, Component } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { ControlProviderService } from '../core/services/control-provider.service';

@Component({
  selector: 'app-dasher-on-screen',
  templateUrl: './dasher-on-screen.component.html',
  styleUrls: ['./dasher-on-screen.component.scss'],
})
export class DasherOnScreenComponent implements AfterViewInit {

  private pausedPlayer = true;
  private words = new Array<string>();
  private lastSpeaked = "";
  private suportDiv: HTMLDivElement;

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

  constructor(public animationBuilder: AnimationBuilder, private controlProviderService: ControlProviderService) {
    speechSynthesis.addEventListener("voiceschanged", () => { });
  }

  async ngAfterViewInit() {
    if (this.controlProviderService.isAnyDeviceConfigured()) {
      this.createAuxDisplay();
      await this.controlProviderService.connectControlHid();
      this.controlProviderService.getHIDPacketOutput().pipe(debounceTime(16)).subscribe((e) => {
        this.reciveControlMovedEvent(e.detail);
      });
    }
  }

  onStartStopDasher() {
    this.pausedPlayer = !this.pausedPlayer;
    this.onStartStopDasherEvent.next(this.pausedPlayer);
  }

  mouseMovedOutDasher() {
    this.pausedPlayer = true;
    this.onStartStopDasherEvent.next(this.pausedPlayer);
  }

  mouseMovedDasher(event: MouseEvent) {
    this.mouseMovedEvent.next(event);
  }

  onWordSelectedEvent(word: string) {
    this.words.push(word);
    this.input = this.words.join(" ");
    this.redefinedWords(false);
    this.onResetDasherEvent.next();
  }

  mouseOverReset() {
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
    this.lastSpeaked = this.input;
    this.synthesizeSpeechFromText(this.input);
  }

  mouseOverRepeat() {
    this.synthesizeSpeechFromText(this.lastSpeaked);
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
    console.log(packet.actualOrientation)
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

    const percentLeft = Number(this.suportDiv.style.left.substring(0, this.suportDiv.style.left.indexOf('%')));
    const percentTop = Number(this.suportDiv.style.top.substring(0, this.suportDiv.style.top.indexOf('%')));

    // ANALOGIC
    /* //TODO
    const joystick = packet.analogStickLeft ?? packet.analogStickLeft;
    if (joystick.horizontal > 0.1 || joystick.horizontal < -0.1) {
      this.suportDiv.style.left = (percentLeft + joystick.horizontal) > 100 ? '100%' : ((percentLeft + joystick.horizontal) < 0 ? '0%' : (percentLeft + joystick.horizontal) + "%");
    }

    if (joystick.vertical > 0.1 || joystick.vertical < -0.1) {
      this.suportDiv.style.top = (percentTop + joystick.vertical) > 100 ? '100%' : ((percentTop + joystick.vertical) < 0 ? '0%' : (percentTop + joystick.vertical) + "%");
    } */

    console.log(gyroscope.dps)
    this.suportDiv.style.left = (percentLeft + gyroscope.dps.x) > 100 ? '100%' : ((percentLeft + gyroscope.dps.x) < 0 ? '0%' : (percentLeft + gyroscope.dps.x) + "%");
    this.suportDiv.style.top = (percentTop + gyroscope.dps.y) > 100 ? '100%' : ((percentTop + gyroscope.dps.y) < 0 ? '0%' : (percentTop + gyroscope.dps.y) + "%");

  }
  //#endregion
}
