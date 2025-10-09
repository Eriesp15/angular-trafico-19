import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-cerrado',
    standalone: true,
    imports: [
        CommonModule,  // Importa CommonModule
        MatCardModule,
        MatProgressSpinnerModule,  // Importa MatProgressSpinnerModule
    ],
    templateUrl: './cerrado.component.html',
    styleUrls: ['./cerrado.component.scss'],
})
export class CerradoComponent implements OnInit {
    reclamo: any = null;
    error: string | null = null;
    loading = false;

    constructor(private http: HttpClient, private route: ActivatedRoute) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadReclamo(Number(id));
        }
    }

    loadReclamo(id: number): void {
        this.loading = true;
        this.error = null;

        // Realizar la solicitud a la API Mock para obtener los datos del reclamo
        this.http.get<any>(`/api/reclamos/${id}`).subscribe({
            next: (reclamo) => {
                console.log('Datos del reclamo:', reclamo);  // Asegúrate de que se está obteniendo el reclamo
                this.reclamo = reclamo;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error al cargar el reclamo:', err);
                this.error = 'No se pudo cargar el reclamo';
                this.loading = false;
            }
        });
    }
}
