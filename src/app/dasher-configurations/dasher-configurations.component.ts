import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ConfigurationsService } from '../core/services/configuration.service';

@Component({
  selector: 'app-dasher-configurations',
  templateUrl: './dasher-configurations.component.html',
  styleUrls: ['./dasher-configurations.component.scss']
})
export class DasherConfigurationsComponent implements OnInit, OnDestroy {

  public formBooleans: FormGroup;
  public formInputs: FormGroup;

  constructor(private fbBuilder: FormBuilder, private configurationService: ConfigurationsService) {
  }

  ngOnInit() {
    this.initForm();
  }

  ngOnDestroy(): void {
    if (this.formInputs.get("DelayControleSensorial").value > 0 && this.formInputs.get("DelayControleSensorial").valid) {
      this.configurationService.sensorialSelectionDelayMs = this.formInputs.get("DelayControleSensorial").value;
    }
  }

  private initForm() {
    this.formBooleans = this.fbBuilder.group({
      NinetendoJoyconDireitoJoystick: [this.configurationService.getActiveControl() == 'NinetendoJoyconDireitoJoystick'],
      NinetendoJoyconEsquerdoJoystick: [this.configurationService.getActiveControl() == 'NinetendoJoyconEsquerdoJoystick'],
      NinetendoJoyconDireitoSensorial: [this.configurationService.getActiveControl() == 'NinetendoJoyconDireitoSensorial'],
      NinetendoJoyconEsquerdoSensorial: [this.configurationService.getActiveControl() == 'NinetendoJoyconEsquerdoSensorial'],
      JoystickDualShock: [this.configurationService.getActiveControl() == 'JoystickDualShock'],
      ControleFocoOcularSensorial: [this.configurationService.getActiveControl() == 'ControleFocoOcularSensorial']
    });
    this.formInputs = this.fbBuilder.group({
      DelayControleSensorial: [this.configurationService.sensorialSelectionDelayMs, [Validators.required, Validators.min(1)]],
    });
  }

  public async toggleChanged(event, name: string) {
    this.configurationService.desactiveControl();
    await this.configurationService.forgetDevices();

    if (event.checked)
      this.configurationService.setActiveControl(name);

    Object.keys(this.formBooleans["controls"]).forEach(async formControlName => {
      if (!event.checked) {
        this.formBooleans.get(formControlName).setValue(false);
      } else {
        if (name != formControlName) {
          this.formBooleans.get(formControlName).setValue(false);
        } else {
          this.formBooleans.get(formControlName).setValue(true);
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
          } else if (name.includes("JoystickDualShock")) {
            hid = [
              // Official Sony Controllers
              { vendorId: 0x054C, productId: 0x0BA0 },
              { vendorId: 0x054C, productId: 0x05C4 },
              { vendorId: 0x054C, productId: 0x09CC },
              { vendorId: 0x054C, productId: 0x05C5 },
              // Razer Raiju
              { vendorId: 0x1532, productId: 0x1000 },
              { vendorId: 0x1532, productId: 0x1007 },
              { vendorId: 0x1532, productId: 0x1004 },
              { vendorId: 0x1532, productId: 0x1009 },
              // Nacon Revol
              { vendorId: 0x146B, productId: 0x0D01 },
              { vendorId: 0x146B, productId: 0x0D02 },
              { vendorId: 0x146B, productId: 0x0D08 },
              // Other third party controllers
              { vendorId: 0x0F0D, productId: 0x00EE },
              { vendorId: 0x7545, productId: 0x0104 },
              { vendorId: 0x2E95, productId: 0x7725 },
              { vendorId: 0x11C0, productId: 0x4001 },
              { vendorId: 0x0C12, productId: 0x57AB },
              { vendorId: 0x0C12, productId: 0x0E16 },
              { vendorId: 0x0F0D, productId: 0x0084 }
            ];
          }

          if (hid.length > 0) {
            const connected = await this.configurationService.connectControlHid(hid);
            if (!connected) {
              this.formBooleans.get(formControlName).setValue(false);
              this.configurationService.desactiveControl();
            }
          }
        }
      }
    });
  }

}