import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ControlProviderService } from '../core/services/control-provider.service';

@Component({
  selector: 'app-dasher-control-settings',
  templateUrl: './dasher-control-settings.component.html',
  styleUrls: ['./dasher-control-settings.component.scss']
})
export class DasherControlSettingsComponent implements OnInit {

  public form: FormGroup;

  constructor(private fbBuilder: FormBuilder, private controlProviderService: ControlProviderService) {
  }

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.form = this.fbBuilder.group({
      NinetendoJoycon: [this.controlProviderService.getActiveControl() == 'NinetendoJoycon'],
      ControleAnalogico: [this.controlProviderService.getActiveControlType() == 'joystick'],
      ControleSensorial: [this.controlProviderService.getActiveControlType() == 'gyroscope'],
    });
    this.listenFormChanges();
  }

  private listenFormChanges() {
    this.form.get('NinetendoJoycon').valueChanges.subscribe(async v => {
      if (!v) {
        this.controlProviderService.desactiveControl();
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

    this.form.get('ControleAnalogico').valueChanges.subscribe(async v => {
      this.controlProviderService.setActiveControlType(v ? 'joystick' : 'gyroscope');
      this.form.get('ControleSensorial').setValue(!v, { emitEvent: false });
    });

    this.form.get('ControleSensorial').valueChanges.subscribe(async v => {
      this.controlProviderService.setActiveControlType(v ? 'gyroscope' : 'joystick');
      this.form.get('ControleAnalogico').setValue(!v, { emitEvent: false });
    });
  }

}