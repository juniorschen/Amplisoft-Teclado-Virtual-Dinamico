import { AnimationBuilder } from '@angular/animations';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AngularResizeElementDirection, AngularResizeElementEvent } from 'angular-resize-element';
import { Subject } from 'rxjs';
import { calcularDiferencaEmMilissegundos } from 'src/app/common/date';
import { elementOverAnother } from 'src/app/common/document-helper';
import { ConfigurationsService } from 'src/app/core/services/configuration.service';

@Component({
  selector: 'app-dasher-on-screen-player',
  templateUrl: './dasher-on-screen-player.component.html',
  styleUrls: ['./dasher-on-screen-player.component.scss']
})
export class DasherOnScreenPlayerComponent implements OnInit, OnDestroy {

  private bufferDoDetectSensorial = 100;
  private lastSensorialDetectionTime: Date;
  private intervalSensorialDetection;
  private intervalCheckColision;
  
  @Input('elId')
  public elId: string;
  @Input('mouseMovedEvent')
  public mouseMovedEvent: Subject<MouseEvent> = new Subject();
  @Input('onResetDasherEvent')
  public onResetDasherEvent: Subject<void> = new Subject();
  @Input('enableLayoutEdition')
  public enableLayoutEdition: boolean;
  @Input('onContentChangedEvent')
  public onContentChangedEvent: Subject<{id: string, value: string}> = new Subject();
  
  @Output('wordOrLetterSelectedEvent')
  public wordOrLetterSelectedEvent: EventEmitter<string> = new EventEmitter<string>();
  
  @ViewChild('wordOrLetterElementRef')
  public wordOrLetterElementRef: ElementRef<HTMLDivElement>;
  
  @ViewChild('pElementRef')
  public pElementRef: ElementRef<HTMLParagraphElement>;
  
  public wordOrLetter: string;
  public animateDivSelection = false;
  public wordOrLetterSelected = false;
  public readonly AngularResizeElementDirection = AngularResizeElementDirection;

  constructor(public animationBuilder: AnimationBuilder, private configurationService: ConfigurationsService, private hostEl: ElementRef) { }

  ngOnInit(): void {
    this.mouseMovedEvent.subscribe((event) => { });

    this.onResetDasherEvent.subscribe(() => {
      this.wordOrLetterSelected = false;
    });

    this.onContentChangedEvent.subscribe((ev) => {
      if(ev.id == this.elId) {
        this.wordOrLetter = ev.value;
      } 
    });

    if (this.configurationService.isAnyControlConfigured()) {
      this.constantCheckElementOverAnother();
    }
  }

  ngOnDestroy(): void {
    if (this.intervalCheckColision) {
      clearInterval(this.intervalCheckColision);
    }

    if (this.intervalSensorialDetection) {
      clearInterval(this.intervalSensorialDetection);
    }
  }

  mouseOverWordOrLetterEvent() {
    if (this.configurationService.isAnyControlConfigured())
      return;

    let detect = () => {
      if (!this.enableLayoutEdition) {
        this.clearSensorialBufers();
        this.wordOrLetterSelectedEvent.next(this.wordOrLetter);
      }
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

  public onResize(evt: AngularResizeElementEvent): void {
    const div = this.wordOrLetterElementRef.nativeElement;
    const parentWidh = div.parentElement.getBoundingClientRect().width;
    const parentHeight = div.parentElement.getBoundingClientRect().height;
    div.style.position = "absolute";
    div.style.flex = "none"
    div.style.width = evt.currentWidthValue + "px";
    div.style.height = evt.currentHeightValue + "px";
    div.parentElement.style.width = parentWidh + "px";
    div.parentElement.style.height = parentHeight + "px";
    div.classList.add('el_changed');
  }

  public cdkDragStarted() {
    const div = this.wordOrLetterElementRef.nativeElement;
    div.classList.add('el_changed');
  }

  private constantCheckElementOverAnother() {
    this.intervalCheckColision = setInterval(() => {
      if (elementOverAnother(document.getElementById("suportDiv"), this.pElementRef.nativeElement)) {
        this.wordOrLetterSelected = true;
        if (this.doDetect()) {
          this.wordOrLetterSelectedEvent.next(this.wordOrLetter);
        }
      } else {
        this.wordOrLetterSelected = false;
        this.clearSensorialBufers();
      }
    }, 50);
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
    if (this.enableLayoutEdition) {
      return false;
    }

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
