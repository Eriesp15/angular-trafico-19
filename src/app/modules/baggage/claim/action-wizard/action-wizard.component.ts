import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActionWizardService } from "./action-wizard.service";

@Component({
  selector: 'app-action-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './action-wizard.component.html',
  styleUrls: ['./action-wizard.component.scss']
})
export class ActionWizardComponent {
  isOpen = false;
  saving = false;
  step = 1;

  config: any;
  pirData: any;
  formData: any = {};
  message = '';

  constructor(
    public wizardService: ActionWizardService,
    private http: HttpClient
  ) {
    wizardService.show$.subscribe(show => this.isOpen = show);
    wizardService.action$.subscribe(data => {
      if (data) {
        this.config = data.config;
        this.pirData = data.pirData;
        this.step = 1;
        this.formData = this.autofillForm();
      }
    });
  }

  // ─── Autofill estático al abrir el modal ─────────────────────────────────
  // Copia los campos definidos en config.autofill desde pirData al formData.
  // También resuelve el campo virtual 'passengerFullName'.

  autofillForm() {
    const data: any = {};

    // Campo virtual: nombre completo del pasajero
    if (this.pirData) {
      this.pirData['passengerFullName'] =
        `${this.pirData.passengerName ?? ''} ${this.pirData.passengerLastName ?? ''}`.trim();
    }

    if (this.config?.autofill) {
      for (const [formField, pirField] of Object.entries(this.config.autofill)) {
        data[formField] = this.pirData?.[pirField as string] ?? '';
      }
    }

    return data;
  }

  // ─── Cambio de campo: recalcular + aplicar autofillIf ────────────────────

  onFieldChange(fieldName: string, value: any) {
    this.formData[fieldName] = value;

    // Recalcular si hay función de cálculo (ej: total en COMPENSATE)
    if (this.config?.calculate) {
      this.formData = this.config.calculate({ ...this.formData });
    }

    // Aplicar autofillIf en todos los campos que lo tengan
    this.applyConditionalAutofill(fieldName);
  }

  // ─── Autofill condicional (autofillIf) ───────────────────────────────────
  // Se evalúa cada vez que cambia un campo. Si el campo que cambió es el
  // disparador (when.field), se autocompleta el campo destino desde pirData.
  // El campo destino queda editable por el agente.

  private applyConditionalAutofill(changedField: string) {
    if (!this.config?.fields) return;

    for (const field of this.config.fields) {
      if (!field.autofillIf) continue;

      const rules: any[] = Array.isArray(field.autofillIf)
        ? field.autofillIf
        : [field.autofillIf]; // compatibilidad con formato antiguo de objeto simple

      for (const rule of rules) {
        if (rule.when.field === changedField && this.formData[changedField] === rule.when.value) {
          this.formData[field.name] = this.pirData?.[rule.source] ?? '';
          break;
        }
      }
    }
  }

  // ─── Visibilidad condicional (showIf) ────────────────────────────────────
  // Retorna true si el campo debe mostrarse según el valor actual del formData.

  isFieldVisible(field: any): boolean {
    if (!field.showIf) return true;
    const currentValue = this.formData[field.showIf.field];
    return field.showIf.values.includes(currentValue);
  }

  // ─── Navegación del wizard ───────────────────────────────────────────────

  nextStep() {
    this.message = this.config.getMessage(this.formData);
    this.step = 2;
  }

  back() {
    this.step = 1;
  }

  async save() {
    this.saving = true;
    try {
      await this.http.post('/api/v1/claims/action-wizard', {
        claimId:   this.pirData.claim?.id ?? this.pirData.claimId,
        action:    this.config.id,
        data:      this.formData,
        message:   this.message,
        newStatus: this.config.newStatus,
      }).toPromise();

      this.wizardService.close();
      window.location.reload();
    } finally {
      this.saving = false;
    }
  }
}