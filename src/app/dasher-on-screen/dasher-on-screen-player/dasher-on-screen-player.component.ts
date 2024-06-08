import { AnimationBuilder } from '@angular/animations';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { calcularDiferencaEmMilissegundos } from 'src/app/common/date';
import { elementOverAnother } from 'src/app/common/document-helper';
import { ConfigurationsService } from 'src/app/core/services/configuration.service';

@Component({
  selector: 'app-dasher-on-screen-player',
  templateUrl: './dasher-on-screen-player.component.html',
  styleUrls: ['./dasher-on-screen-player.component.scss']
})
export class DasherOnScreenPlayerComponent implements OnInit {

  private elementOverCheckSub: Subject<void> = new Subject();
  private bufferDoDetectSensorial = 100;
  private lastSensorialDetectionTime: Date;
  private intervalSensorialDetection;

  @Input('wordOrLetter')
  public wordOrLetter: string;
  @Input('mouseMovedEvent')
  public mouseMovedEvent: Subject<MouseEvent> = new Subject();
  @Input('onResetDasherEvent')
  public onResetDasherEvent: Subject<void> = new Subject();

  @Output('wordOrLetterSelectedEvent')
  public wordOrLetterSelectedEvent: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('wordOrLetterElementRef')
  public wordOrLetterElementRef: ElementRef<HTMLDivElement>;

  @ViewChild('pElementRef')
  public pElementRef: ElementRef<HTMLParagraphElement>;

  public animateDivSelection = false;
  public wordOrLetterSelected = false;

  constructor(public animationBuilder: AnimationBuilder, private configurationService: ConfigurationsService, private hostEl: ElementRef) { }

  ngOnInit(): void {
    this.mouseMovedEvent.subscribe((event) => { });

    this.onResetDasherEvent.subscribe(() => {
      this.wordOrLetterSelected = false;
    });

    if (this.configurationService.isAnyControlConfigured()) {
      this.constantCheckElementOverAnother();
    }
  }

  mouseOverWordOrLetterEvent() {
    if (this.configurationService.isAnyControlConfigured())
      return;

    let detect = () => {
      this.clearSensorialBufers();
      this.wordOrLetterSelectedEvent.next(this.wordOrLetter);
    };

    if (this.doDetect()) {
      detect();
    } else if (!this.intervalSensorialDetection) {
      this.intervalSensorialDetection = setInterval(() => { detect(); }, this.configurationService.sensorialSelectionDelayMs - this.bufferDoDetectSensorial);
    }
  }

  mouseOutWordOrLetterEvent() {
    if (this.configurationService.isAnyControlConfigured())
      return;

    this.clearSensorialBufers();
  }

  private constantCheckElementOverAnother() {
    this.elementOverCheckSub.pipe(debounceTime(10)).subscribe(() => {
      if (elementOverAnother(document.getElementById("suportDiv"), this.pElementRef.nativeElement)) {
        this.wordOrLetterSelected = true;
        if (this.doDetect()) {
          this.wordOrLetterSelectedEvent.next(this.wordOrLetter);
        }
      } else {
        this.wordOrLetterSelected = false;
        this.clearSensorialBufers();
      }
      this.elementOverCheckSub.next();
    });

    this.elementOverCheckSub.next();
  }

  private clearSensorialBufers() {
    this.animateDivSelection = false;
    this.lastSensorialDetectionTime = undefined;
    if (this.intervalSensorialDetection) {
      clearInterval(this.intervalSensorialDetection);
      this.intervalSensorialDetection = undefined;
    }
  }

  private doDetect() {
    if (this.configurationService.isDelayedDetectionAction()) {
      if (!this.animateDivSelection) {
        this.hostEl.nativeElement.style.setProperty('--animation-duration', `${this.configurationService.sensorialSelectionDelayMs / 1000}s`);
        this.animateDivSelection = true;
      }

      if (!this.lastSensorialDetectionTime)
        this.lastSensorialDetectionTime = new Date();

      return calcularDiferencaEmMilissegundos(this.lastSensorialDetectionTime, new Date()) >= this.configurationService.sensorialSelectionDelayMs;
    }

    return true;
  }
}
