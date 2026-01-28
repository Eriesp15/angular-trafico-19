import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClaimService } from '../../../../services/claim.service';

@Component({
  selector: 'app-new-claim',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './new-claim.component.html',
  styleUrls: ['./new-claim.component.scss']
})
export class NewClaimComponent implements OnInit {
  pIR: FormGroup;

  constructor(
    private fb: FormBuilder,
    private claimService: ClaimService
  ) {}

  ngOnInit() {
    this.pIR = this.fb.group({
      //linea 1
      route: this.fb.array([], [Validators.minLength(2), Validators.maxLength(5)]),
      //linea 2
      airport: ['', Validators.required],
      //linea 2.1
      claimType: ['', Validators.required],
      //linea 3
      airportText: ['', Validators.required],
      airline: ['', Validators.required],
      reference: ['', Validators.required],
      //linea 4
      passengerName: ['', Validators.required],
      passengerLastName: ['', Validators.required],
      //linea 5
      initials: ['', Validators.required],
      //linea 6
      bagtags: this.fb.array([], [Validators.minLength(1), Validators.maxLength(5)]),
      //linea 7
      bagDescription: this.fb.array([], [Validators.minLength(1), Validators.maxLength(5)]),
      //linea 8
      traceRoute: this.fb.array([], [Validators.minLength(1), Validators.maxLength(5)]),
      //linea 9
      flightNumber: this.fb.array([], [Validators.minLength(1), Validators.maxLength(5)]),
      //linea 10
      bagIdentification: this.fb.array([], [Validators.minLength(1), Validators.maxLength(5)]),
      //linea 11
      contents: this.fb.array([], [Validators.minLength(1), Validators.maxLength(5)]),
      //linea 12
      permanentAddress: [''],
      //linea 13
      temporaryAddress: [''],
      //linea 14
      permanentPhone: [''],
      temporaryPhone: [''],
      //linea 15
      deliveryInstructions: [''],
      //linea 16
      additionalInfo: [''],
      //equipaje facturado
      checkedBaggageWeight: [null, [Validators.required, Validators.min(0)]],
      //equipaje entregado
      deliveredBaggageWeight: [null, [Validators.required, Validators.min(0)]],
      //diferencia de peso
      weightDifference: [null],
      language: [''],
      passportNumber: [''],
      ticketNumber: [''],
      pnr: [''],
      frequentFlyerId: [''],
      lossReason: [''],
      faultStation: [''],
      hasInsurance: [null, Validators.required],
      keysAttached: [null],
      lockCombination: [''],
      nightKit: [null],
      damageType: [''],
      condition: [''],
      damageLocations: this.fb.array([])
      
      

    });

    this.pIR.get('checkedBaggageWeight')?.valueChanges.subscribe(() => {
      this.calcularDiferenciaPeso();
    });
    this.pIR.get('deliveredBaggageWeight')?.valueChanges.subscribe(() => {
      this.calcularDiferenciaPeso();
    });
  
    
    // Inicializar con 2 rutas por defecto
    this.agregarRuta();
    this.agregarRuta();
    this.agregarBagtag();
    this.agregarBagDescription();
    this.agregarRutaARastrear();
    this.agregarRutaARastrear();
    this.agregarVuelo();
    this.agregarIdentificacion();
    this.agregarContenido();
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
    { valor: 'COMBINATION_LOCK', etiqueta: 'Menor' },
    { valor: 'HANDLE', etiqueta: 'Mayor' },
    { valor: 'STRAPS', etiqueta: 'Completo' },
    { valor: 'WHEELS', etiqueta: 'Ruedas' },
    { valor: 'SIDE', etiqueta: 'Lado' },
    { valor: 'END', etiqueta: 'Extremo' },
    { valor: 'TOP', etiqueta: 'Parte Superior' },
    { valor: 'BOTTOM', etiqueta: 'Parte Inferior' }
  ];


  get route(): FormArray {
    return this.pIR.get('route') as FormArray;
  }

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

  crearRuta(): FormGroup {
    return this.fb.group({
      stop: ['', Validators.required],
    });
  }

  agregarRuta(): void {
    if (this.route.length < 5) {
      this.route.push(this.crearRuta());
    }
  }

  eliminarRuta(index: number): void {
    if (this.route.length > 2) {
      this.route.removeAt(index);
    }
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
      mark: ['', Validators.required]
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
      description: ['', Validators.required]
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
    if (this.pIR.valid) {
      const datos = this.pIR.value;
      console.log('Datos del formulario:', datos);
      this.claimService.createClaim(datos).subscribe({
        next: (response) => {
          console.log('Éxito:', response);
          alert('Claim creado exitosamente');
          this.pIR.reset();  // Limpia el formulario
          // O redirige: this.router.navigate(['/claims']);
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
      alert('Por favor completa todos los campos requeridos');
    }
  }
}