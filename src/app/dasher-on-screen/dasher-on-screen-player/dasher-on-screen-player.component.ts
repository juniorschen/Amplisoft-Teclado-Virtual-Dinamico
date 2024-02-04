import { AnimationPlayer, AnimationBuilder } from '@angular/animations';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { animationXIn, animationXOut, animationYIn, animationYOut } from 'src/app/common/animation';
import { AnimationParams } from 'src/app/common/animation-model';
import { elementOverAnother, isTestEnv } from 'src/app/common/document-helper';
import { PlayerType } from 'src/app/common/player-type.enum';
import { ConfigurationsService } from 'src/app/core/services/configuration.service';

@Component({
  selector: 'app-dasher-on-screen-player',
  templateUrl: './dasher-on-screen-player.component.html',
  styleUrls: ['./dasher-on-screen-player.component.scss']
})
export class DasherOnScreenPlayerComponent implements OnInit {

  private lastClientXPosition = 0;
  private defaultAnimationDelay = 2000;
  private animationRunning: Subject<void> = new Subject();
  private wordSelected = false;

  @Input('word')
  public word: string;
  @Input('mouseMovedEvent')
  public mouseMovedEvent: Subject<MouseEvent> = new Subject();
  @Input('onResetDasherEvent')
  public onResetDasherEvent: Subject<void> = new Subject();
  @Input('playerType')
  public playerType: PlayerType;

  @Output('wordSelectedEvent')
  public wordSelectedEvent: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('wordElementRef')
  public wordElementRef: ElementRef<HTMLDivElement>;

  @ViewChild('pElementRef')
  public pElementRef: ElementRef<HTMLParagraphElement>;

  public player: AnimationPlayer;
  public animationParams: AnimationParams = {
    isInRightDirection: false,
    timeIn: '3000ms',
    timeOut: '3000ms'
  };

  constructor(public animationBuilder: AnimationBuilder, private controlProviderService: ConfigurationsService) { }

  ngOnInit(): void {
    this.mouseMovedEvent.subscribe((event) => {
      this.mouseMoved(event);
    });

    this.onResetDasherEvent.subscribe(() => {
      this.resetPlayer();
      this.wordSelected = false;
    });

    if (this.controlProviderService.isAnyControlConfigured()) {
      this.checkElementOverAnotherWhenAnimationRunning();
    }
  }

  mouseOverWordEvent() {
    if ((!this.player || this.controlProviderService.isAnyControlConfigured()) && !isTestEnv)
      return;

    this.wordSelectedEvent.next(this.word);
  }

  private mouseMoved(event: any) {
    if (Math.abs(this.lastClientXPosition - event.clientX) < 25)
      return;

    if (this.animationParams.isInRightDirection == this.lastClientXPosition < event.clientX) {
      this.lastClientXPosition = event.clientX;
      return;
    }

    this.animationParams.isInRightDirection = this.lastClientXPosition < event.clientX;
    this.redefineOrCreatePlayerAnimation(true);
    this.lastClientXPosition = event.clientX;
  }

  private redefineOrCreatePlayerAnimation(shouldPlay = false) {
    let animationFactory;
    if (this.animationParams.isInRightDirection) {
      this.animationParams.timeIn = this.calculateAnimationDuration() + 'ms';
      animationFactory = this.animationBuilder.build(this.getAnimationDiretion(false));
    } else {
      this.animationParams.timeOut = this.calculateAnimationDuration() + 'ms';
      animationFactory = this.animationBuilder.build(this.getAnimationDiretion(true));
    }
    this.player = animationFactory.create(this.wordElementRef.nativeElement, { params: this.animationParams });

    if (shouldPlay) {
      this.player.play();
    }
  }

  private calculateAnimationDuration() {
    if (!this.player)
      return this.defaultAnimationDelay;

    const currentDelay = this.defaultAnimationDelay * Number(this.player.getPosition().toFixed(2));
    if (currentDelay > 500) {
      return currentDelay;
    }
    
    return 500;
  }

  private resetPlayer() {
    if (!this.player)
      return;

    this.player.reset();
    this.animationParams.isInRightDirection = true;
    this.lastClientXPosition = 0;
    this.player = undefined;
    this.redefineOrCreatePlayerAnimation(true);
  }

  private getAnimationDiretion(animationOut: boolean) {
    let animation;
    switch (this.playerType) {
      case PlayerType.Bottom:
        animation = animationYIn;
        if (animationOut) {
          animation = animationYOut;
        }
        break;
      case PlayerType.Right:
        animation = animationXIn;
        if (animationOut) {
          animation = animationXOut;
        }
        break;
      case PlayerType.Top:
        animation = animationYOut;
        if (animationOut) {
          animation = animationYIn;
        }
        break;
    }
    return animation;
  }

  private checkElementOverAnotherWhenAnimationRunning() {
    this.animationRunning.pipe(debounceTime(10)).subscribe(() => {
      if (elementOverAnother(document.getElementById("suportDiv"), this.pElementRef.nativeElement) && !this.wordSelected) {
        this.wordSelected = true;
        this.wordSelectedEvent.next(this.word);
      }

      if (this.player) {
        this.animationRunning.next();
      }
    });

    if (this.player) {
      this.animationRunning.next();
    }
  }
}
