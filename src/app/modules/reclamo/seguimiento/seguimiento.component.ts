import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-seguimiento',
    templateUrl: './seguimiento.component.html',
    styleUrls: ['./seguimiento.component.scss'],
})
export class SeguimientoComponent implements OnInit {
    reclamo: any = null;  // Definir la propiedad 'reclamo'
    loading = false;
    error: string | null = null;

    constructor(private http: HttpClient, private route: ActivatedRoute) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadReclamo(Number(id));  // Llamamos a la función para cargar los datos
        }
    }

    loadReclamo(id: number): void {
        this.loading = true;
        this.error = null;

        this.http.get<any>(`api/reclamos/${id}`).subscribe({
            next: (reclamo) => {
                console.log('Reclamo cargado:', reclamo);  // Ver los datos en la consola
                this.reclamo = reclamo;  // Asignamos el objeto 'reclamo' a la propiedad
                this.loading = false;
            },
            error: (err) => {
                console.error('Error al cargar el reclamo:', err);
                this.error = 'No se pudo cargar el reclamo';
                this.loading = false;
            },
        });
    }
}
