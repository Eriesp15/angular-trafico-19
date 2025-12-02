import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClosingReceiptComponent } from './closing-receipt.component';

describe('ClosingReceiptComponent', () => {
  let component: ClosingReceiptComponent;
  let fixture: ComponentFixture<ClosingReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClosingReceiptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClosingReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
