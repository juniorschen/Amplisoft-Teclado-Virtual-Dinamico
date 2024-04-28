import { AnimationBuilder } from '@angular/animations';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { elementOverAnother, isTestEnv } from 'src/app/common/document-helper';
import { ConfigurationsService } from 'src/app/core/services/configuration.service';

@Component({
  selector: 'app-dasher-on-screen-player',
  templateUrl: './dasher-on-screen-player.component.html',
  styleUrls: ['./dasher-on-screen-player.component.scss']
})
export class DasherOnScreenPlayerComponent implements OnInit {

  private elementOverCheckSub: Subject<void> = new Subject();
  private wordOrLetterSelected = false;

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

  constructor(public animationBuilder: AnimationBuilder, private configurationService: ConfigurationsService) { }

  ngOnInit(): void {
    this.mouseMovedEvent.subscribe((event) => { });

    this.onResetDasherEvent.subscribe(() => {
      this.wordOrLetterSelected = false;
    });

    if (this.configurationService.isAnyControlConfigured() && !this.configurationService.isSensorialDeviceConfigured()) {
      this.constantCheckElementOverAnother();
    }
  }

  mouseOverWordOrLetterEvent() {
    if ((this.configurationService.isAnyControlConfigured()) && !isTestEnv)
      return;

    this.wordOrLetterSelectedEvent.next(this.wordOrLetter);
  }

  private constantCheckElementOverAnother() {
    this.elementOverCheckSub.pipe(debounceTime(10)).subscribe(() => {
      if (elementOverAnother(document.getElementById("suportDiv"), this.pElementRef.nativeElement) && !this.wordOrLetterSelected) {
        this.wordOrLetterSelected = true;
        this.wordOrLetterSelectedEvent.next(this.wordOrLetter);
      }
      this.elementOverCheckSub.next();
    });

    this.elementOverCheckSub.next();
  }
}
