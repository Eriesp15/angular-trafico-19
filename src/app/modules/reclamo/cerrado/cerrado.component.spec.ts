import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CerradoComponent } from './cerrado.component';

describe('CerradoComponent', () => {
  let component: CerradoComponent;
  let fixture: ComponentFixture<CerradoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CerradoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CerradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
