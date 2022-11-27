import { AnimationPlayer, AnimationBuilder } from '@angular/animations';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { debounce, debounceTime, Subject } from 'rxjs';
import { animationIn, animationOut } from 'src/app/common/animation';
import { AnimationParams } from 'src/app/common/animation-model';

@Component({
  selector: 'app-dasher-on-screen-player',
  templateUrl: './dasher-on-screen-player.component.html',
  styleUrls: ['./dasher-on-screen-player.component.scss']
})
export class DasherOnScreenPlayerComponent implements OnInit {

  private player: AnimationPlayer;
  private pausedPlayer = true;
  private lastWordXPosition = 0;
  private defaultAnimationDelay = 3000;

  @Input('word')
  public word: string;
  @Input('onStartStopDasherEvent')
  public onStartStopDasherEvent: Subject<boolean> = new Subject();
  @Input('mouseMovedEvent')
  public mouseMovedEvent: Subject<MouseEvent> = new Subject();
  @Input('onResetDasherEvent')
  public onResetDasherEvent: Subject<void> = new Subject();

  @Output('wordSelectedEvent')
  public wordSelectedEvent: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('wordRef')
  public wordElement: ElementRef;
  public animationParams: AnimationParams = {
    isInRightDirection: false,
    timeIn: '3000ms',
    timeOut: '3000ms'
  };

  constructor(public animationBuilder: AnimationBuilder) { }

  ngOnInit(): void {
    this.onStartStopDasherEvent.subscribe((paused) => {
      this.onStartStopDasher(paused);
    });

    this.mouseMovedEvent.subscribe((event) => {
      this.mouseMoved(event);
    });

    this.onResetDasherEvent.subscribe(() => {
      this.resetPlayer();
    });
  }

  private redefineOrCreatePlayerAnimation(shouldPlay = false) {
    let animationFactory;
    if (this.animationParams.isInRightDirection) {
      this.animationParams.timeIn = this.calculateAnimationDuration() + 'ms';
      animationFactory = this.animationBuilder.build(animationIn);
    } else {
      this.animationParams.timeOut = this.calculateAnimationDuration() + 'ms';
      animationFactory = this.animationBuilder.build(animationOut);
    }
    this.player = animationFactory.create(this.wordElement.nativeElement, { params: this.animationParams });

    if (shouldPlay && !this.pausedPlayer) {
      this.player.play();
    }
  }

  private calculateAnimationDuration() {
    if (!this.player)
      return this.defaultAnimationDelay;
    return this.defaultAnimationDelay * Number(this.player.getPosition().toFixed(2));
  }

  private onStartStopDasher(paused: boolean) {
    if (!paused) {
      if (this.player)
        this.player.play();
      this.pausedPlayer = false;
    } else {
      if (this.player)
        this.player.pause();
      this.pausedPlayer = true;
    }
  }

  private mouseMoved(event: MouseEvent) {
    if (this.pausedPlayer)
      return;

    if (Math.abs(this.lastWordXPosition - event.clientX) < 25)
      return;

    if (this.animationParams.isInRightDirection == this.lastWordXPosition < event.clientX) {
      this.lastWordXPosition = event.clientX;
      return;
    }

    this.animationParams.isInRightDirection = this.lastWordXPosition < event.clientX;
    this.redefineOrCreatePlayerAnimation(true);
    this.lastWordXPosition = event.clientX;
  }

  private resetPlayer() {
    if (!this.player)
      return;
      
    this.player.reset();
    this.animationParams.isInRightDirection = true;
    this.lastWordXPosition = 0;
    this.player = undefined;
    this.redefineOrCreatePlayerAnimation(true);
  }

  mouseOverWordEvent() {
    if (!this.player)
      return;

    this.wordSelectedEvent.next(this.word);
  }
}
