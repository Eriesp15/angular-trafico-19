import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActionWizardService } from "./action-wizard.service";
import { ExpenseService } from "../../services/expense.service";


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
    private http: HttpClient,
    private expenseService: ExpenseService,
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
    if (!this.validateForm()) {
      return;  // No continuar si hay errores
    }
    this.message = this.config.getMessage(this.formData);
    this.step = 2;
  }

  back() {
    this.step = 1;
  }

  validateForm(): boolean {
    const errors: string[] = [];
    
    if (!this.config.fields) {
      return true;
    }
    
    // Revisar cada campo
    this.config.fields.forEach((field: any) => {
      if (field.required) {
        const value = this.formData[field.name];
        
        // Verificar si está vacío
        if (value === undefined || value === null || value === '') {
          errors.push(field.label);
        }
      }
    });
    
    // Si hay errores, mostrar alerta
    if (errors.length > 0) {
      alert(`Los siguientes campos son obligatorios:\n\n• ${errors.join('\n• ')}`);
      return false;
    }
    
    return true;
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
      const response = await this.http.post('http://localhost:3700/api/v1/pir/action',payload).toPromise();
      console.log('Respuesta:', response);

      if (this.config?.id === "COMPENSATE") {
        try {
          await this.registerCompensationExpense();
        } catch (expenseError) {
          console.error("No se pudo registrar el gasto de indemnización", expenseError);
        }
      }
      
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

  private async registerCompensationExpense(): Promise<void> {
    const total = Number(this.formData?.total);
    if (!Number.isFinite(total) || total <= 0) {
      return;
    }

    const claimId = this.pirData?.pirNumber || this.pirData?.id;
    if (!claimId) {
      return;
    }

    const description = `Indemnización registrada desde acción del expediente. ` +
      `Diferencia: ${this.formData?.weightDifference ?? 0}kg, ` +
      `Precio por kg: $${this.formData?.pricePerKg ?? 0}.`;

    const title = this.pirData?.claimType === "AHL"
      ? "Indemnización - Extravío de Maleta"
      : "Indemnización - Faltante de Contenido";

    await this.expenseService.createByPir(claimId, {
      title,
      cost: total,
      description,
    }).toPromise();
  }
}