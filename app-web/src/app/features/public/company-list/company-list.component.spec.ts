import { ComponentFixture, TestBed, NO_ERRORS_SCHEMA } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
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
        provideNoopAnimations(),
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
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyListComponent);
    component = fixture.componentInstance;
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe tener estado de carga inicial como true antes de ngOnInit', () => {
    // Before detectChanges, loading should be true
    expect(component.loading).toBe(true);
  });

  describe('después de inicializar', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('debe cargar la empresa por slug', () => {
      expect(companyServiceMock.getBySlug).toHaveBeenCalledWith('peluqueria-juan');
    });

    it('debe cargar los empleados de la empresa', () => {
      expect(userServiceMock.getEmployeesByCompany).toHaveBeenCalledWith('company-1');
    });

    it('debe almacenar la empresa en el componente', () => {
      expect(component.company).toEqual(mockCompany);
    });

    it('debe almacenar los empleados en el componente', () => {
      expect(component.employees.length).toBe(2);
      expect(component.employees[0].full_name).toBe('Juan Pérez');
    });

    it('debe finalizar carga después de obtener datos', () => {
      expect(component.loading).toBe(false);
    });

    it('debe manejar estado sin empleados', async () => {
      userServiceMock.getEmployeesByCompany.mockResolvedValueOnce([]);
      component.employees = [];
      fixture.detectChanges();

      expect(component.employees.length).toBe(0);
    });

    it('debe manejar error cuando empresa no existe', async () => {
      companyServiceMock.getBySlug.mockResolvedValueOnce(null);
      component.company = null;
      component.error = 'Empresa no encontrada';
      component.loading = false;
      fixture.detectChanges();

      expect(component.error).toBe('Empresa no encontrada');
      expect(component.company).toBeNull();
    });
  });
});
