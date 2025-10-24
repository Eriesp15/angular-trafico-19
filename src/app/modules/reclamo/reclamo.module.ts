import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReclamoRoutingModule } from './reclamo-routing.module';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';

@NgModule({
    declarations: [ ],
    imports: [
        CommonModule,
        ReclamoRoutingModule,
        MatDividerModule,
        MatCardModule,
        MatTableModule,
    ]
})
export class ReclamoModule { }
