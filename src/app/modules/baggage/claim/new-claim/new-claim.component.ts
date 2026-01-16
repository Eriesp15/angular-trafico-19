import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-new-claim',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './new-claim.component.html',
  styleUrls: ['./new-claim.component.scss']
})
export class NewClaimComponent implements OnInit {
  pIR: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.pIR = this.fb.group({
      route: this.fb.array([], [Validators.minLength(2), Validators.maxLength(5)]),
      bagtags: this.fb.array([], [Validators.minLength(1), Validators.maxLength(5)]),
      bagDescriptions: this.fb.array([], [Validators.minLength(1), Validators.maxLength(5)]),
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
  }

  get route(): FormArray {
    return this.pIR.get('route') as FormArray;
  }

  get bagtags(): FormArray {
    return this.pIR.get('bagtags') as FormArray;
  }

  get bagDescriptions(): FormArray {
    return this.pIR.get('bagDescriptions') as FormArray;
  }

  crearRuta(): FormGroup {
    return this.fb.group({
      origen: ['', Validators.required],
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
    this.bagDescriptions.push(this.crearBagDescription());
  }

  eliminarBagDescription(index: number): void {
    this.bagDescriptions.removeAt(index);
  }

  onSubmit(): void {
    if (this.pIR.valid) {
      console.log('Rutas:', this.pIR.value);
      // Aquí procesas el formulario
    }
  }
}