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

  private animationRunning: Subject<void> = new Subject();
  private wordSelected = false;

  @Input('word')
  public word: string;
  @Input('mouseMovedEvent')
  public mouseMovedEvent: Subject<MouseEvent> = new Subject();
  @Input('onResetDasherEvent')
  public onResetDasherEvent: Subject<void> = new Subject();

  @Output('wordSelectedEvent')
  public wordSelectedEvent: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('wordElementRef')
  public wordElementRef: ElementRef<HTMLDivElement>;

  @ViewChild('pElementRef')
  public pElementRef: ElementRef<HTMLParagraphElement>;

  constructor(public animationBuilder: AnimationBuilder, private configurationService: ConfigurationsService) { }

  ngOnInit(): void {
    this.mouseMovedEvent.subscribe((event) => { });

    this.onResetDasherEvent.subscribe(() => {
      this.wordSelected = false;
    });

    if (this.configurationService.isAnyControlConfigured() && !this.configurationService.getActiveControl().includes("Sensorial")) {
      this.constantCheckElementOverAnother();
    }
  }

  mouseOverWordEvent() {
    if ((this.configurationService.isAnyControlConfigured()) && !isTestEnv)
      return;

    this.wordSelectedEvent.next(this.word);
  }

  getDivWordFatherClass() {
    return "full-div";
  }

  getActionWordClass() {
    return "label-default-font-size action-border action-sized";
  }

  private constantCheckElementOverAnother() {
    this.animationRunning.pipe(debounceTime(10)).subscribe(() => {
      if (elementOverAnother(document.getElementById("suportDiv"), this.pElementRef.nativeElement) && !this.wordSelected) {
        this.wordSelected = true;
        this.wordSelectedEvent.next(this.word);
      }
      this.animationRunning.next();
    });

    this.animationRunning.next();
  }
}
