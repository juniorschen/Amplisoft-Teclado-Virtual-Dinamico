import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ControlProviderService } from '../core/services/control-provider.service';

@Component({
  selector: 'app-dasher-control-settings',
  templateUrl: './dasher-control-settings.component.html',
  styleUrls: ['./dasher-control-settings.component.scss']
})
export class DasherControlSettingsComponent implements OnInit, AfterViewInit {

  public form: FormGroup;

  constructor(private fbBuilder: FormBuilder, private controlProviderService: ControlProviderService) {
  }

  ngOnInit() {
    this.initForm();
  }

  ngAfterViewInit() {
    let div = document.createElement("div");
    div.style.position = "absolute";
    div.style.left = "0px";
    div.style.top = "0px";
    div.style.width = "20px";
    div.style.height = "20px";
    div.style.background = "red";
    div.style.color = "blue";

    document.body.appendChild(div);

    var mousePosition;
    var offset = [0, 0];
    var isOver = false;

    div.addEventListener('mouseout', function (e) {
      isOver = false;
      offset = [
        div.offsetLeft - e.clientX,
        div.offsetTop - e.clientY
      ];
    }, true);

    document.addEventListener('mouseover', function () {
      isOver = true;
    }, true);

    document.addEventListener('mousemove', function (event) {
      event.preventDefault();
      if (isOver) {
        mousePosition = {

          x: event.clientX,
          y: event.clientY

        };
        div.style.left = (mousePosition.x + offset[0]) + 'px';
        div.style.top = (mousePosition.y + offset[1]) + 'px';
      }
    }, true);
  }

  private initForm() {
    this.form = this.fbBuilder.group({
      NinetendoJoycon: [this.controlProviderService.getActiveControl('NinetendoJoycon') ?? Boolean(this.controlProviderService.getActiveControl('NinetendoJoycon'))],
    });
    this.listenFormChanges();
  }

  private listenFormChanges() {
    this.form.get('NinetendoJoycon').valueChanges.subscribe(async v => {
      if (!v) {
        this.controlProviderService.desactiveControl('NinetendoJoycon');
        this.controlProviderService.forgetDevice();
      } else {
        const connected = await this.controlProviderService.connectControlHid([
          {
            vendorId: 0x057e, // Nintendo Co., Ltd
            productId: 0x2006 // Joy-Con Left
          },
          {
            vendorId: 0x057e, // Nintendo Co., Ltd
            productId: 0x2007 // Joy-Con Right
          }
        ]);
        if (!connected) {
          this.form.get('NinetendoJoycon').setValue(false, { emitEvent: false });
        } else {
          this.controlProviderService.setActiveControl('NinetendoJoycon');
        }
      }
    });
  }

}