import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupEditionComponent } from './group-edition.component';

describe('GroupEditionComponent', () => {
  let component: GroupEditionComponent;
  let fixture: ComponentFixture<GroupEditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupEditionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupEditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
