import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerDashboardComponent } from './player-dashboard.component';

describe('PlayerDashboardComponent', () => {
  let component: PlayerDashboardComponent;
  let fixture: ComponentFixture<PlayerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
