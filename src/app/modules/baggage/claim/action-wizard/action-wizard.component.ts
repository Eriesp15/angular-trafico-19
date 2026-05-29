import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActionWizardService } from "./action-wizard.service";
import { ExpenseService } from "../../services/expense.service";

import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-action-wizard',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule
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
    onSuccessCallback?: () => void;
    repairCompanyOptions: any[] = [];
    transportCompanyOptions: any[] = [];

    // Nuevos para validación y mensajes bonitos
    fieldErrors: Record<string, string> = {};
    generalError = '';

    constructor(
        public wizardService: ActionWizardService,
        private http: HttpClient,
        private expenseService: ExpenseService
    ) {
        wizardService.show$.subscribe(show => {
            this.isOpen = show;

            if (!show) {
                this.resetState();
            }
        });

        wizardService.action$.subscribe(data => {
            if (data) {
                this.config = data.config;
                this.pirData = data.pirData;
                this.onSuccessCallback = data.onSuccess;
                this.step = 1;
                this.message = '';
                this.generalError = '';
                this.fieldErrors = {};

                // método de autocompletado
                this.formData = this.autofillForm();

                if (this.hasOptionsFrom('repairCompanies')) {
                    this.loadRepairCompanies();
                }

                if (this.hasOptionsFrom('transportCompanies')) {
                    this.loadTransportCompanies();
                }
            }
        });
    }

    resetState() {
        this.step = 1;
        this.saving = false;
        this.message = '';
        this.generalError = '';
        this.fieldErrors = {};
        this.formData = {};
    }

  // Función que llena los campos automáticamente
  autofillForm() {
    let data: any = {};

    if (this.config?.fields?.length) {
      for (const field of this.config.fields) {
        if (field.defaultValue !== undefined) {
          data[field.name] = typeof field.defaultValue === 'function'
            ? field.defaultValue()
            : field.defaultValue;
        }
      }
    }

    if (this.config.autofill) {
      // Para cada campo que tiene autofill
      for (const [formField, pirField] of Object.entries(this.config.autofill)) {
        // Copiar valor del PIR al formulario
        data[formField] = this.pirData[pirField as string];
      }
    }

        if (this.config?.id === 'DELIVER') {
            data.deliveryAddressType = data.deliveryAddressType || 'PERMANENT';
            data.deliveryAddress = this.getDeliveryAddress(data.deliveryAddressType);
        }

        if (this.config?.id === 'PICKUP_REPAIRED') {
            data.pickupDay = this.getDayName(data.pickupDate);
        }

        if (this.config?.calculate) {
            data = this.config.calculate(data);
        }

        return data;
    }
    loadRepairCompanies() {
        this.http
            .get<any[]>(`${environment.protocol}//${environment.host}/api/v1/companies?active=true`)
            .subscribe((companies) => {
                this.repairCompanyOptions = companies
                    .filter(c => c.serviceType?.name === 'Reparación')
                    .map(c => ({
                        value: c.id,
                        label: c.name
                    }));
            });
    }

    loadTransportCompanies() {
        this.http
            .get<any[]>(`${environment.protocol}//${environment.host}/api/v1/companies?active=true`)
            .subscribe((companies) => {
                this.transportCompanyOptions = companies
                    .filter(c => this.normalizeText(c.serviceType?.name) === 'transporte')
                    .map(c => ({
                        value: c.id,
                        label: c.name || c.name
                    }));
            });
    }

    getOptions(field: any) {
        if (field.optionsFrom === 'repairCompanies') {
            return this.repairCompanyOptions;
        }

        if (field.optionsFrom === 'transportCompanies') {
            return this.transportCompanyOptions;
        }

        return field.options || [];
    }
    validateFields(): boolean {
        this.fieldErrors = {};
        this.generalError = '';

        if (!this.config?.fields?.length) {
            return true;
        }

        for (const field of this.config.fields) {
            if (!field.required) continue;

            const value = this.formData[field.name];

            const isEmpty =
                value === null ||
                value === undefined ||
                value === '';

            if (isEmpty) {
                this.fieldErrors[field.name] = `El campo "${field.label}" es obligatorio.`;
            }
        }

        if (Object.keys(this.fieldErrors).length > 0) {
            this.generalError = 'Completa los campos obligatorios antes de continuar.';
            return false;
        }

        return true;
    }

    nextStep() {
        if (!this.validateFields()) {
            return;
        }

        this.generalError = '';

        if (this.config?.id === 'ASSIGN_REPAIR_COMPANY') {
            const company = this.repairCompanyOptions.find((item: any) =>
                String(item.value) === String(this.formData?.repairCompanyId)
            );

            this.formData = {
                ...this.formData,
                repairCompanyName: company?.label || this.formData?.repairCompanyId
            };
        }

        if (this.config?.id === 'DELIVER') {
            const company = this.transportCompanyOptions.find((item: any) =>
                String(item.value) === String(this.formData?.deliveryCompanyId)
            );

            this.formData = {
                ...this.formData,
                deliveryCompanyName: company?.label || this.formData?.deliveryCompanyId,
                deliveryAddress: this.formData?.deliveryAddressType === 'OTHER'
                    ? this.formData?.deliveryAddress
                    : this.getDeliveryAddress(this.formData?.deliveryAddressType)
            };
        }

        if (this.config?.id === 'ASSIGN_TRANSPORT') {
            const company = this.transportCompanyOptions.find((item: any) =>
                String(item.value) === String(this.formData?.transportCompanyId)
            );

            this.formData = {
                ...this.formData,
                transportCompanyName: company?.label || this.formData?.transportCompanyId
            };
        }

        this.message = this.config.getMessage(this.formData);
        this.step = 2;
    }

    back() {
        this.step = 1;
    }

    async save() {
        this.saving = true;
        this.generalError = '';

        const payload = {
            pirId: this.pirData?.id,
            action: this.config?.id,
            formData: this.formData,
            trackingMessage: this.message,
            newStatus: this.config?.newStatus
        };

        console.log('Payload:', payload);

        try {
            const response = await this.http
                .post(`${environment.protocol}//${environment.host}/api/v1/pir/action`, payload)                .toPromise();
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
            this.generalError = 'No se pudo guardar la acción.';
        } finally {
            this.saving = false;
        }
    }

    onFieldChange(fieldName: string, value: any) {
        // Actualizar el valor en formData
        this.formData[fieldName] = value;

        // Limpiar error de ese campo al escribir/cambiar
        if (this.fieldErrors[fieldName]) {
            delete this.fieldErrors[fieldName];
        }

        // Limpiar error general si ya se está corrigiendo
        if (this.generalError) {
            this.generalError = '';
        }

        // Recalcular si hay función de cálculo
        if (this.config?.calculate) {
            this.formData = this.config.calculate(this.formData);
        }

        if (this.config?.id === 'DELIVER' && fieldName === 'deliveryAddressType') {
            this.formData.deliveryAddress = value === 'OTHER'
                ? ''
                : this.getDeliveryAddress(value);
        }

        if (this.config?.id === 'PICKUP_REPAIRED' && fieldName === 'pickupDate') {
            this.formData.pickupDay = this.getDayName(value);
        }
    }
    //funcion que devuelve nombre del la empresa
    // función que devuelve el texto visible de un campo en el resumen
    getDisplayValue(field: any): string {
        const value = this.formData?.[field.name];

        if (!value) return '-';

        if (field.optionsFrom === 'repairCompanies') {
            const company = this.repairCompanyOptions.find((item: any) =>
                String(item.value) === String(value)
            );

            return company?.label || value;
        }

        if (field.optionsFrom === 'transportCompanies') {
            const company = this.transportCompanyOptions.find((item: any) =>
                String(item.value) === String(value)
            );

            return company?.label || value;
        }

        return value;
    }

    isFieldReadonly(field: any): boolean {
        if (field.readonly) {
            return true;
        }

        return this.config?.id === 'DELIVER' &&
            field.name === 'deliveryAddress' &&
            this.formData?.deliveryAddressType !== 'OTHER';
    }

    private getDeliveryAddress(addressType: string): string {
        if (addressType === 'TEMPORARY') {
            return this.pirData?.temporaryAddress || '';
        }

        if (addressType === 'PERMANENT') {
            return this.pirData?.permanentAddress || '';
        }

        return '';
    }

    private hasOptionsFrom(optionsFrom: string): boolean {
        return this.config?.fields?.some((field: any) => field.optionsFrom === optionsFrom);
    }

    private normalizeText(value: any): string {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toLowerCase();
    }

    private getDayName(value: any): string {
        if (!value) {
            return '';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        return date.toLocaleDateString('es-BO', { weekday: 'long' });
    }

    //------------------
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
      `Precio por kg: Bs. ${this.formData?.pricePerKg ?? 0}.`;

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
