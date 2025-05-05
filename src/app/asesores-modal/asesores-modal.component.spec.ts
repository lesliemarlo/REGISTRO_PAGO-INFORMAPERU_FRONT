import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsesoresModalComponent } from './asesores-modal.component';

describe('AsesoresModalComponent', () => {
  let component: AsesoresModalComponent;
  let fixture: ComponentFixture<AsesoresModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsesoresModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsesoresModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
