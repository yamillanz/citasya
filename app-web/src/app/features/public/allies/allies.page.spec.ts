import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { AlliesPage } from './allies.page';
import { CompanyService } from '../../../core/services/company.service';
import { ServiceService } from '../../../core/services/service.service';

const mockCompanies = [
  { id: 'c1', name: 'Barbería A', slug: 'barberia-a', address: 'Calle 1', phone: '111', logo_url: null, plan_id: null, is_active: true, created_at: '', updated_at: '' },
  { id: 'c2', name: 'Salón B', slug: 'salon-b', address: 'Calle 2', phone: null, logo_url: null, plan_id: null, is_active: true, created_at: '', updated_at: '' },
  { id: 'c3', name: 'Spa C', slug: 'spa-c', address: null, phone: '333', logo_url: null, plan_id: null, is_active: true, created_at: '', updated_at: '' },
];

const mockServicesMap = {
  c1: [
    { id: 's1', name: 'Corte', duration_minutes: 30, price: 15, company_id: 'c1', commission_percentage: 0, is_active: true, created_at: '' },
    { id: 's2', name: 'Barba', duration_minutes: 20, price: 10, company_id: 'c1', commission_percentage: 0, is_active: true, created_at: '' },
  ],
  c2: [
    { id: 's3', name: 'Tinte', duration_minutes: 60, company_id: 'c2', is_active: true, price: undefined, commission_percentage: 0, created_at: '' },
  ],
  c3: [],
};

async function createFixture(opts?: { empty?: boolean; error?: boolean }) {
  let companyServiceMock: jest.Mocked<CompanyService>;
  let serviceServiceMock: jest.Mocked<ServiceService>;

  if (opts?.error) {
    companyServiceMock = {
      getActiveCompaniesPaginated: jest.fn().mockRejectedValue(new Error('fail')),
    } as any;
  } else {
    companyServiceMock = {
      getActiveCompaniesPaginated: jest.fn().mockResolvedValue({
        data: opts?.empty ? [] : mockCompanies,
        hasMore: false,
      }),
    } as any;
  }

  serviceServiceMock = {
    getServicesByCompanies: jest.fn().mockResolvedValue(
      opts?.empty ? {} : mockServicesMap
    ),
  } as any;

  await TestBed.configureTestingModule({
    imports: [AlliesPage],
    providers: [
      provideNoopAnimations(),
      provideRouter([]),
      { provide: CompanyService, useValue: companyServiceMock },
      { provide: ServiceService, useValue: serviceServiceMock },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(AlliesPage);
  const component = fixture.componentInstance;

  // ngAfterViewInit triggers fetchInitial() which is async
  // Need multiple detectChanges + whenStable cycles
  fixture.detectChanges();
  await fixture.whenStable();
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return { fixture, component, companyServiceMock, serviceServiceMock };
}

describe('AlliesPage', () => {
  it('debe crear el componente', async () => {
    const { fixture, component } = await createFixture();
    expect(component).toBeTruthy();
  });

  it('debe llamar getActiveCompaniesPaginated en carga', async () => {
    const { companyServiceMock } = await createFixture();
    expect(companyServiceMock.getActiveCompaniesPaginated).toHaveBeenCalledWith(0, 10, '');
  });

  it('debe llamar getServicesByCompanies con los IDs de empresas', async () => {
    const { serviceServiceMock } = await createFixture();
    expect(serviceServiceMock.getServicesByCompanies).toHaveBeenCalledWith(['c1', 'c2', 'c3']);
  });

  it('debe dejar de cargar tras obtener datos', async () => {
    const { component } = await createFixture();
    expect(component.loading()).toBe(false);
    expect(component.error()).toBe('');
    expect(component.companies().length).toBe(3);
  });

  it('debe mostrar empresas en el grid', async () => {
    const { fixture } = await createFixture();
    const cards = fixture.nativeElement.querySelectorAll('.ally-card:not(.skeleton)');
    expect(cards.length).toBe(3);
  });

  it('debe mostrar el nombre de cada empresa', async () => {
    const { fixture } = await createFixture();
    const names = fixture.nativeElement.querySelectorAll('.ally-name');
    expect(names[0].textContent?.trim()).toBe('Barbería A');
    expect(names[1].textContent?.trim()).toBe('Salón B');
    expect(names[2].textContent?.trim()).toBe('Spa C');
  });

  it('debe mostrar servicios inline', async () => {
    const { fixture } = await createFixture();
    const items = fixture.nativeElement.querySelectorAll('.service-item');
    expect(items.length).toBe(3);
  });

  it('debe mostrar estado vacio', async () => {
    const { fixture } = await createFixture({ empty: true });
    expect(fixture.nativeElement.querySelector('.empty-state')).not.toBeNull();
  });

  it('debe mostrar estado de error', async () => {
    const { fixture } = await createFixture({ error: true });
    expect(fixture.nativeElement.querySelector('.error-state')).not.toBeNull();
  });
});
