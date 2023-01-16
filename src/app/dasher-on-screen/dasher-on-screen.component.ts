import { AnimationBuilder } from '@angular/animations';
import { AfterViewInit, Component } from '@angular/core';
import { Subject } from 'rxjs';
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
      await this.controlProviderService.connectControlHid();
      this.controlProviderService.getHIDPacketOutput().subscribe((e) => {
        console.log(e, 'b');
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

}

