import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClaimService } from '../../../../services/claim.service';
import { Router } from '@angular/router';
import { BreadcrumbComponent, BreadcrumbItem } from '@erp/components/breadcrumb/breadcrumb.component';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';

@Component({
  selector: 'app-new-claim',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BreadcrumbComponent, FormsModule], 
  templateUrl: './new-claim.component.html',
  styleUrls: ['./new-claim.component.scss']
})
export class NewClaimComponent implements OnInit {
  pIR: FormGroup;
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Lista de Reclamos', url: '/baggage/claim/list' },
    { label: 'Nuevo Reclamo' } // Sin URL 
  ];
  modalIdentificacionAbierto = false;
  indiceActual = 0;
  type = '';
  color = '';
  material = '';
  externalElement = '';
  basicElement = '';

  colors = [
    { value: 'WT', description: 'Blanco (White)' },
    { value: 'BK', description: 'Negro (Black)' },
    { value: 'GY', description: 'Gris (Gray)' },
    { value: 'BU', description: 'Azul (Blue)' },
    { value: 'PU', description: 'Púrpura (Purple)' },
    { value: 'RD', description: 'Rojo (Red)' },
    { value: 'YW', description: 'Amarillo (Yellow)' },
    { value: 'BE', description: 'Beige (Beige)' },
    { value: 'BN', description: 'Café (Brown)' },
    { value: 'GN', description: 'Verde (Green)' },
    { value: 'MC', description: 'Multi-Color' },
    { value: 'PR', description: 'Patron (Pattern)' },
  ];
  types = [
    { value: '01', description: '01' },
    { value: '02', description: '02' },
    { value: '03', description: '03' },
    { value: '04', description: '04' },
    { value: '05', description: '05' },
    { value: '06', description: '06' },
    { value: '07', description: '07' },
    { value: '08', description: '08' },
    { value: '09', description: '09' },
    { value: '10', description: '10' },
    { value: '11', description: '11' },
    { value: '12', description: '12' },
    { value: '13', description: '13' },
    { value: '14', description: '14' },
    { value: '15', description: '15' },
    { value: '16', description: '16' },
    { value: '17', description: '17' },
    { value: '18', description: '18' },
    { value: '19', description: '19' },
    { value: '20', description: '20' },
    { value: '21', description: '21' },
    { value: '22', description: '22' },
    { value: '23', description: '23' },
    { value: '24', description: '24' },
    { value: '25', description: '25' },
    { value: '26', description: '26' },
    { value: '27', description: '27' },
    { value: '28', description: '28' },
    { value: '29', description: '29' }
  ];
  materials = [
    { value: 'D', description: 'Dual / soft/hard' },
    { value: 'L', description: 'Leather' },
    { value: 'M', description: 'Metal' },
    { value: 'R', description: 'Rigid'},
    { value: 'T', description: 'Tweed' }
  ];
  basicElements = [
    { value: 'B', description: 'Single item in a box'},
    { value: 'K', description: 'Cabin size'}
  ];
  externalElements = [
    { value: 'C', description: 'Combination lock'},
    { value: 'H', description: 'Handle'},
    { value: 'S', description: 'Straps'},
    { value: 'W', description: 'Wheels'},
    { value: 'X', description: 'No external descriptive elements'}
  ];

  phoneCountryCodes: Array<{ iso: string; name: string; dialCode: string; label: string }> = [];

  permanentPhoneCountryCode = '+591';
  permanentPhoneNumber = '';
  temporaryPhoneCountryCode = '+591';
  temporaryPhoneNumber = '';
  constructor(
    private fb: FormBuilder,
    private claimService: ClaimService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializePhoneCountryCodes();

    this.pIR = this.fb.group({
      //linea 2.1
      claimType: ['', Validators.required],
      //linea 3
      airportText: [''],
      airline: [''],
      reference: [''],
      //linea 4
      passengerName: ['', Validators.required],
      passengerLastName: ['', Validators.required],
      //linea 5
      initials: [''],
      //linea 6
      bagtags: this.fb.array([], [Validators.minLength(1), Validators.maxLength(5)]),
      //linea 7
      bagDescription: this.fb.array([], [Validators.minLength(1), Validators.maxLength(5)]),
      //linea 8
      traceRoute: this.fb.array([], [Validators.minLength(1), Validators.maxLength(5)]),
      //linea 9
      flightNumber: this.fb.array([], [Validators.minLength(1), Validators.maxLength(5)]),
      //linea 10
      bagIdentification: this.fb.array([], [Validators.maxLength(5)]),
      //linea 11
      contents: this.fb.array([], [Validators.maxLength(5)]),
      //linea 12
      permanentAddress: [''],
      //linea 13
      temporaryAddress: [''],
      //linea anadida
      email: ['', [Validators.required, Validators.email]],
      //linea 14
      permanentPhone: [''],
      temporaryPhone: [''],
      //linea 15
      deliveryInstructions: [''],
      //linea 16
      additionalInfo: [''],
      //equipaje facturado
      checkedBaggageWeight: [null, Validators.required],
      //equipaje entregado
      deliveredBaggageWeight: [null, Validators.required],
      //diferencia de peso
      weightDifference: [null],
      language: [''],
      passportNumber: [''],
      ticketNumber: ['', Validators.required],
      pnr: ['', Validators.required],
      frequentFlyerId: [''],
      lossReason: [''],
      faultStation: [''],
      hasInsurance: [null],
      keysAttached: [null],
      lockCombination: [''],
      nightKit: [null],
      damageType: [null],
      condition: [null],
      damageLocations: this.fb.array([])
    }, {
      validators: [
        this.atLeastOneControlRequired(['permanentAddress', 'temporaryAddress'], 'addressRequired'),
        this.atLeastOneControlRequired(['permanentPhone', 'temporaryPhone'], 'phoneRequired'),
      ],
    });

    this.pIR.get('checkedBaggageWeight')?.valueChanges.subscribe(() => {
      this.calcularDiferenciaPeso();
    });
    this.pIR.get('deliveredBaggageWeight')?.valueChanges.subscribe(() => {
      this.calcularDiferenciaPeso();
    });

    this.pIR.get('claimType')?.valueChanges.subscribe((claimType) => {
      if (claimType !== 'DPR') {
        this.clearDamageInfo();
      }
    });
  
    
    this.agregarBagtag();
    this.agregarBagDescription();
    this.agregarRutaARastrear();
    this.agregarRutaARastrear();
    this.agregarVuelo();
    this.agregarIdentificacion();
    this.agregarContenido();
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.pIR.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  isNestedFieldInvalid(group: AbstractControl, controlName: string): boolean {
    const control = group.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  isGroupRequirementInvalid(errorKey: string): boolean {
    return !!this.pIR.errors?.[errorKey] && (this.pIR.dirty || this.pIR.touched);
  }

  getRequiredFieldMessage(): string {
    return 'El campo es obligatorio';
  }

  onPhoneNumberChange(controlName: 'permanentPhone' | 'temporaryPhone', value: string): void {
    if (controlName === 'permanentPhone') {
      this.permanentPhoneNumber = value;
    } else {
      this.temporaryPhoneNumber = value;
    }

    this.pIR.get(controlName)?.setValue(value);
    this.pIR.get(controlName)?.markAsDirty();
    this.pIR.updateValueAndValidity();
  }

  claimType = [
    { valor: 'AHL', etiqueta: 'AHL' },
    { valor: 'DPR', etiqueta: 'Damaged' },
    { valor: 'PILFERED', etiqueta: 'Pilfered' }
  ];

  damageType = [
    { valor: 'MINOR', etiqueta: 'Menor' },
    { valor: 'MAJOR', etiqueta: 'Mayor' },
    { valor: 'COMPLETE', etiqueta: 'Completo' }
  ];

  condition = [
    { valor: 'GOOD', etiqueta: 'Buena' },
    { valor: 'FAIR', etiqueta: 'Razonable' },
    { valor: 'POOR', etiqueta: 'Mala' }
  ];

  damageLocations = [
    { valor: 'COMBINATION_LOCK', etiqueta: 'Combinacion de cerradura / Combination lock' },
    { valor: 'HANDLE', etiqueta: 'Jalador de mano / Retractable handles' },
    { valor: 'STRAPS', etiqueta: 'Hebillas de seguro / Straps to close/secure' },
    { valor: 'WHEELS', etiqueta: 'Ruedas / wheels rollers' },
    { valor: 'SIDE', etiqueta: 'Lado / Side' },
    { valor: 'END', etiqueta: 'Extremo / End' },
    { valor: 'TOP', etiqueta: 'Arriba / Top' },
    { valor: 'BOTTOM', etiqueta: 'Abajo / Bottom' }
  ];

  locationImages: Record<string, string> = {
    'COMBINATION_LOCK': 'images/claims/combination.png',
    'HANDLE':           'images/claims/handle.png',
    'STRAPS':           'images/claims/straps.png',
    'WHEELS':           'images/claims/wheels.png',
    'SIDE':             'images/claims/side.png',
    'END':              'images/claims/end.png',
    'TOP':              'images/claims/top.png',
    'BOTTOM':           'images/claims/bottom.png',
  };


  get bagtags(): FormArray {
    return this.pIR.get('bagtags') as FormArray;
  }

  get bagDescription(): FormArray {
    return this.pIR.get('bagDescription') as FormArray;
  }

  get traceRoute(): FormArray {
    return this.pIR.get('traceRoute') as FormArray;
  }

  get flightNumber(): FormArray {
    return this.pIR.get('flightNumber') as FormArray;
  }

  get bagIdentification(): FormArray {
    return this.pIR.get('bagIdentification') as FormArray;
  }

  get contents(): FormArray {
    return this.pIR.get('contents') as FormArray;
  }
  
  clearInsurance(): void {
    this.pIR.get('hasInsurance')?.setValue(null);
  }

  clearKeysAttached(): void {
    this.pIR.get('keysAttached')?.setValue(null);
  }

  clearNightKit(): void {
    this.pIR.get('nightKit')?.setValue(null);
  }

  clearDamageType(): void {
    this.pIR.get('damageType')?.setValue(null);
  }

  clearCondition(): void {
    this.pIR.get('condition')?.setValue(null);
  }

  isDprClaim(): boolean {
    return this.pIR.get('claimType')?.value === 'DPR';
  }

  clearDamageInfo(): void {
    this.clearInsurance();
    this.clearKeysAttached();
    this.clearNightKit();
    this.clearDamageType();
    this.clearCondition();
    this.pIR.get('lockCombination')?.setValue('');
    this.damageLocationsArray.clear();
  }



  crearRutaARastrear(): FormGroup {
    return this.fb.group({
      traceRouteStop: ['', Validators.required],
    });
  }

  agregarRutaARastrear(): void {
    if (this.traceRoute.length < 5) {
      this.traceRoute.push(this.crearRutaARastrear());
    }
  }

  eliminarRutaARastrear(index: number): void {
    if (this.traceRoute.length > 1) {
      this.traceRoute.removeAt(index);
    }
  }

  // Métodos para bagtags
  crearBagtag(): FormGroup {
    return this.fb.group({
      number: ['', [Validators.required]]
    });
  }

  agregarBagtag(): void {
    this.bagtags.push(this.crearBagtag());
  }

  eliminarBagtag(index: number): void {
    this.bagtags.removeAt(index);
  }

  // Métodos para descripciones de maletas
  crearBagDescription(): FormGroup {
    return this.fb.group({
      description: ['', [Validators.required]]
    });
  }

  agregarBagDescription(): void {
    this.bagDescription.push(this.crearBagDescription());
  }

  eliminarBagDescription(index: number): void {
    this.bagDescription.removeAt(index);
  }

  aplicarCodigo(): void {
    const codigo =  this.color + this.type + this.material + this.basicElement + this.externalElement;
    this.bagDescription.at(this.indiceActual).get('description')?.setValue(codigo);
    
    // Limpiar y cerrar
    this.type = '';
    this.color = '';
    this.material = '';
    this.externalElement = '';
    this.basicElement = '';
    this.modalIdentificacionAbierto = false;
  }

  crearVuelo(): FormGroup {
    return this.fb.group({
      flightNo: ['', Validators.required],
      flightDate: ['', Validators.required],
    });
  }

  agregarVuelo(): void {
    if (this.flightNumber.length < 5) {
      this.flightNumber.push(this.crearVuelo());
    }
  }

  eliminarVuelo(index: number): void {
    if (this.flightNumber.length > 1) {
      this.flightNumber.removeAt(index);
    }
  }

  crearIdentificacion(): FormGroup {
    return this.fb.group({
      mark: ['']
    });
  }

  agregarIdentificacion(): void {
    if (this.bagIdentification.length < 5) {
      this.bagIdentification.push(this.crearIdentificacion());
    }
  }

  eliminarIdentificacion(index: number): void {
    if (this.bagIdentification.length > 1) {
      this.bagIdentification.removeAt(index);
    }
  }

  crearContenido(): FormGroup {
    return this.fb.group({
      description: ['']
    });
  }

  agregarContenido(): void {
    if (this.contents.length < 5) {
      this.contents.push(this.crearContenido());
    }
  }

  eliminarContenido(index: number): void {
    if (this.contents.length > 1) {
      this.contents.removeAt(index);
    }
  }

  get damageLocationsArray(): FormArray {
    return this.pIR.get('damageLocations') as FormArray;
  }

  onUbicacionChange(event: any, ubicacion: string): void {
    if (event.target.checked) {
      this.damageLocationsArray.push(this.fb.control(ubicacion));
    } else {
      const index = this.damageLocationsArray.controls.findIndex(
        x => x.value === ubicacion
      );
      if (index >= 0) {
        this.damageLocationsArray.removeAt(index);
      }
    }
  }
  
  isUbicacionSelected(ubicacion: string): boolean {
    return this.damageLocationsArray.controls.some(
      x => x.value === ubicacion
    );
  }

  calcularDiferenciaPeso(): void {
    const pesoFacturado = this.pIR.get('checkedBaggageWeight')?.value;
    const pesoEntregado = this.pIR.get('deliveredBaggageWeight')?.value;
    
    if (pesoFacturado !== null && pesoEntregado !== null) {
      const diferencia = pesoFacturado - pesoEntregado;
      const diferenciaRedondeada = Math.round(diferencia * 100) / 100;
      this.pIR.get('weightDifference')?.setValue(diferenciaRedondeada);
    } else {
      this.pIR.get('weightDifference')?.setValue(null);
    }
  }

  onSubmit(): void {
    this.syncPhoneControls();

    if (this.pIR.valid) {
      this.pIR.patchValue({
        permanentPhone: this.buildInternationalPhone(this.permanentPhoneCountryCode, this.permanentPhoneNumber),
        temporaryPhone: this.buildInternationalPhone(this.temporaryPhoneCountryCode, this.temporaryPhoneNumber),
      });

      const datos = { ...this.pIR.value };
      if (datos.claimType !== 'DPR') {
        datos.hasInsurance = null;
        datos.keysAttached = null;
        datos.lockCombination = '';
        datos.nightKit = null;
        datos.damageType = null;
        datos.condition = null;
        datos.damageLocations = [];
      }
      console.log('Datos del formulario:', datos);
      this.claimService.createClaim(datos).subscribe({
        next: (response) => {
          console.log('Éxito:', response);
          const pirNumber = response.pirNumber;
          alert('Claim creado exitosamente');
          // this.pIR.reset();  // Limpia el formulario, si se quisiera hacer varios
          // redirige a lista de reclamos
          this.router.navigate(['/baggage/claim/view', pirNumber]);
        },
        error: (error) => {
          console.error('Error:', error);
          alert('Error al crear el claim');
        },
        complete: () => {
          console.log('Petición completada');
        }
      });
    } else {
      this.pIR.markAllAsTouched();
      alert('Por favor completa todos los campos requeridos');
    }
  }

  private syncPhoneControls(): void {
    this.pIR.patchValue({
      permanentPhone: this.permanentPhoneNumber,
      temporaryPhone: this.temporaryPhoneNumber,
    }, { emitEvent: false });

    this.pIR.updateValueAndValidity();
  }

  private atLeastOneControlRequired(controlNames: string[], errorKey: string): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const hasValue = controlNames.some((controlName) => {
        const value = form.get(controlName)?.value;
        return value !== null && value !== undefined && String(value).trim().length > 0;
      });

      return hasValue ? null : { [errorKey]: true };
    };
  }

  private buildInternationalPhone(countryCode: string, phoneNumber: string): string {
    const cleanNumber = (phoneNumber || '').replace(/[^\d]/g, '').trim();
    if (!cleanNumber) {
      return '';
    }

    const code = (countryCode || '+591').trim();
    return `${code} ${cleanNumber}`;
  }

  private initializePhoneCountryCodes(): void {
    const displayNames =
      typeof Intl !== 'undefined' && typeof Intl.DisplayNames !== 'undefined'
        ? new Intl.DisplayNames(['es'], { type: 'region' })
        : null;

    this.phoneCountryCodes = getCountries()
      .map((iso) => {
        const dialCode = `+${getCountryCallingCode(iso)}`;
        const countryName = displayNames?.of(iso) || iso;
        return {
          iso,
          name: countryName,
          dialCode,
          label: `${countryName} (${dialCode})`,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }
}
