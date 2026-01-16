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
      route: this.fb.array([], [Validators.minLength(2), Validators.maxLength(5)]),
      bagtags: this.fb.array([], [Validators.minLength(1), Validators.maxLength(5)]),
      bagDescription: this.fb.array([], [Validators.minLength(1), Validators.maxLength(5)]),
      traceRoute: this.fb.array([], [Validators.minLength(1), Validators.maxLength(5)]),
      flightNumber: this.fb.array([], [Validators.minLength(1), Validators.maxLength(5)]),
      bagIdentification: this.fb.array([], [Validators.minLength(1), Validators.maxLength(5)]),
      airport: ['', Validators.required],
      airportText: ['', Validators.required],
      airline: ['', Validators.required],
      reference: ['', Validators.required],

      passengerName: ['', Validators.required],
      passengerLastName: ['', Validators.required],
      initials: ['', Validators.required],
    });
    
    // Inicializar con 2 rutas por defecto
    this.agregarRuta();
    this.agregarRuta();
    this.agregarBagtag();
    this.agregarBagDescription();
    this.agregarRutaARastrear();
    this.agregarVuelo();
    this.agregarIdentificacion();
  }

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

  onSubmit(): void {
    if (this.pIR.valid) {
      const datos = this.pIR.value;
      
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