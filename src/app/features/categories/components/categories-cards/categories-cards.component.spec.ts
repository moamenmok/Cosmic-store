import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesCardsComponent } from './categories-cards.component';

describe('CategoriesCardsComponent', () => {
  let component: CategoriesCardsComponent;
  let fixture: ComponentFixture<CategoriesCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesCardsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesCardsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
