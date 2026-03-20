import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActionWizardService } from "./action-wizard.service";


@Component({
  selector: 'app-action-wizard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule  // ← Para que funcione [(ngModel)]
  ],
  templateUrl: './action-wizard.component.html',
  styleUrls: ['./action-wizard.component.scss']
})

export class ActionWizardComponent {
  isOpen = false;
  step = 1;
  saving = false;
  
  config: any;
  pirData: any;
  formData: any = {};
  message = '';
  onSuccessCallback?: () => void;  // Función para recargar después de guardar

  constructor(
    public wizardService: ActionWizardService,
    private http: HttpClient
  ) {
    wizardService.show$.subscribe(show => this.isOpen = show);
    wizardService.action$.subscribe(data => {
      if (data) {
        this.config = data.config;
        this.pirData = data.pirData;
        this.onSuccessCallback = data.onSuccess;
        this.step = 1;
        this.message = '';

        //metodo de autocompletado
        this.formData = this.autofillForm();
      }
    });
  }

  // Función que llena los campos automáticamente
  autofillForm() {
    let data: any = {};
    
    if (this.config.autofill) {
      // Para cada campo que tiene autofill
      for (const [formField, pirField] of Object.entries(this.config.autofill)) {
        // Copiar valor del PIR al formulario
        data[formField] = this.pirData[pirField as string];
      }
    }

    if (this.config.fields) {
      this.config.fields.forEach((field: any) => {
        if (field.defaultValue !== undefined && data[field.name] === undefined) {
          data[field.name] = field.defaultValue;  // ← Aquí se aplica
        }
      });
    }

    if (this.config.calculate) {
      data = this.config.calculate(data);
    }
    
    return data;
  }

  nextStep() {
    this.message = this.config.getMessage(this.formData);
    this.step = 2;
  }

  back() {
    this.step = 1;
  }

  async save() {
    this.saving = true;
    
    const payload = {
      pirId: this.pirData.id,
      action: this.config.id,
      formData: this.formData,
      trackingMessage: this.message,
      newStatus: this.config.newStatus
    };
    
    console.log('Payload:', payload);
    
    try {
      const response = await this.http.post('/api/pir/action', payload).toPromise();
      console.log('Respuesta:', response);
      
      if (this.onSuccessCallback) {
        this.onSuccessCallback();
      }
      
      this.wizardService.close();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la acción');
    } finally {
      this.saving = false;
    }
  }
  onFieldChange(fieldName: string, value: any) {
    // Actualizar el valor en formData
    this.formData[fieldName] = value;
    // formData.pricePerKg = 50
    
    // Recalcular si hay función de cálculo
    if (this.config.calculate) {
      this.formData = this.config.calculate(this.formData);
      // Ahora: formData.total = 5 * 50 = 250
    }
  }
}