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

    // Nuevos para validación y mensajes bonitos
    fieldErrors: Record<string, string> = {};
    generalError = '';

    constructor(
        public wizardService: ActionWizardService,
        private http: HttpClient
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

        if (this.config?.autofill) {
            for (const [formField, pirField] of Object.entries(this.config.autofill)) {
                data[formField] = this.pirData?.[pirField as string];
            }
        }

        if (this.config?.calculate) {
            data = this.config.calculate(data);
        }

        return data;
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
            const response = await this.http.post('/api/pir/action', payload).toPromise();
            console.log('Respuesta:', response);

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
    }
}
