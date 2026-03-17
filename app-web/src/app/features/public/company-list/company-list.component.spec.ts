import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanyListComponent } from './company-list.component';
import { ActivatedRoute } from '@angular/router';
import { CompanyService } from '../../../core/services/company.service';
import { UserService } from '../../../core/services/user.service';

describe('CompanyListComponent', () => {
  let component: CompanyListComponent;
  let fixture: ComponentFixture<CompanyListComponent>;
  let companyServiceMock: jest.Mocked<CompanyService>;
  let userServiceMock: jest.Mocked<UserService>;

  const mockCompany = {
    id: 'company-1',
    name: 'Peluquería Juan',
    slug: 'peluqueria-juan',
    address: 'Calle 123',
    phone: '12345678',
    logo_url: null
  };

  const mockEmployees = [
    { id: 'emp-1', full_name: 'Juan Pérez', photo_url: null },
    { id: 'emp-2', full_name: 'María López', photo_url: null }
  ];

  beforeEach(async () => {
    companyServiceMock = {
      getBySlug: jest.fn().mockResolvedValue(mockCompany)
    } as any;

    userServiceMock = {
      getEmployeesByCompany: jest.fn().mockResolvedValue(mockEmployees)
    } as any;

    await TestBed.configureTestingModule({
      imports: [CompanyListComponent],
      providers: [
        { provide: CompanyService, useValue: companyServiceMock },
        { provide: UserService, useValue: userServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => {
                  if (key === 'companySlug') return 'peluqueria-juan';
                  return null;
                }
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar la empresa por slug', () => {
    expect(companyServiceMock.getBySlug).toHaveBeenCalledWith('peluqueria-juan');
  });

  it('debe cargar los empleados de la empresa', () => {
    expect(userServiceMock.getEmployeesByCompany).toHaveBeenCalledWith('company-1');
  });

  it('debe mostrar nombre de la empresa', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Peluquería Juan');
  });

  it('debe mostrar dirección y teléfono de la empresa', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Calle 123');
    expect(compiled.textContent).toContain('12345678');
  });

  it('debe mostrar lista de empleados', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Juan Pérez');
    expect(compiled.textContent).toContain('María López');
  });

  it('debe mostrar mensaje cuando no hay empleados', async () => {
    userServiceMock.getEmployeesByCompany.mockResolvedValueOnce([]);
    component.employees = [];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No hay profesionales disponibles');
  });

  it('debe mostrar error cuando empresa no existe', async () => {
    companyServiceMock.getBySlug.mockResolvedValueOnce(null);
    component.company = null;
    component.error = 'Empresa no encontrada';
    component.loading = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Empresa no encontrada');
  });

  it('debe tener enlaces a calendarios de empleados', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('a');
    expect(links.length).toBeGreaterThan(0);
    expect(links[0].getAttribute('href')).toContain('/c/peluqueria-juan/e/');
  });
});
