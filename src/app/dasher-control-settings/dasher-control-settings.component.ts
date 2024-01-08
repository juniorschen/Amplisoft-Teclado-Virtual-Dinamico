import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ControlProviderService } from '../core/services/control-provider.service';

@Component({
  selector: 'app-dasher-control-settings',
  templateUrl: './dasher-control-settings.component.html',
  styleUrls: ['./dasher-control-settings.component.scss']
})
export class DasherControlSettingsComponent implements OnInit, OnDestroy {

  public form: FormGroup;

  constructor(private fbBuilder: FormBuilder, private controlProviderService: ControlProviderService) {
  }

  ngOnInit() {
    this.initForm();
  }

  ngOnDestroy(): void {
  }

  private initForm() {
    this.form = this.fbBuilder.group({
      NinetendoJoyconDireitoJoystick: [this.controlProviderService.getActiveControl() == 'NinetendoJoyconDireitoJoystick'],
      NinetendoJoyconEsquerdoJoystick: [this.controlProviderService.getActiveControl() == 'NinetendoJoyconEsquerdoJoystick'],
      NinetendoJoyconDireitoSensorial: [this.controlProviderService.getActiveControl() == 'NinetendoJoyconDireitoSensorial'],
      NinetendoJoyconEsquerdoSensorial: [this.controlProviderService.getActiveControl() == 'NinetendoJoyconEsquerdoSensorial'],
      JoystickDualShock: [this.controlProviderService.getActiveControl() == 'JoystickDualShock'],
      JoystickMicrosoft: [this.controlProviderService.getActiveControl() == 'JoystickMicrosoft'],
      ControleFocoOcularSensorial: [this.controlProviderService.getActiveControl() == 'ControleFocoOcularSensorial'],
    });
  }

  public async toggleChanged(event, name: string) {
    this.controlProviderService.desactiveControl();
    await this.controlProviderService.forgetDevices();

    if (event.checked)
      this.controlProviderService.setActiveControl(name);

    Object.keys(this.form["controls"]).forEach(async formControlName => {
      if (!event.checked) {
        this.form.get(formControlName).setValue(false);
      } else {
        if (name != formControlName) {
          this.form.get(formControlName).setValue(false);
        } else {
          this.form.get(formControlName).setValue(true);
          let hid = [];
          if (name.includes("NinetendoJoycon")) {
            if (name.includes("Esquerdo")) {
              hid.push({
                vendorId: 0x057e, // Nintendo Co., Ltd
                productId: 0x2006 // Joy-Con Left
              });
            } else {
              hid.push({
                vendorId: 0x057e, // Nintendo Co., Ltd
                productId: 0x2007 // Joy-Con Right
              });
            }
          }

          if (hid.length > 0) {
            const connected = await this.controlProviderService.connectControlHid(hid);
            if (!connected) {
              this.form.get(formControlName).setValue(false);
              this.controlProviderService.desactiveControl();
              alert("Atenção é necessário aceitar as permissões do dispositivo HID para utilizar o mesmo.")
            }
          }
        }
      }
    });
  }

}