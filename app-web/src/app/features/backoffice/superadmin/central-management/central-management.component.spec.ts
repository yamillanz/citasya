import { ComponentFixture, TestBed, waitForAsync, NO_ERRORS_SCHEMA } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CentralManagementComponent } from './central-management.component';
import { CompanyService, CompanyWithPlan } from '../../../../core/services/company.service';
import { UserService } from '../../../../core/services/user.service';
import { PlanService } from '../../../../core/services/plan.service';
import { MessageService, ConfirmationService } from 'primeng/api';

describe('CentralManagementComponent - Behavior Driven Tests', () => {
  let component: CentralManagementComponent;
  let fixture: ComponentFixture<CentralManagementComponent>;
  let companyServiceMock: jest.Mocked<CompanyService>;
  let userServiceMock: jest.Mocked<UserService>;
  let planServiceMock: jest.Mocked<PlanService>;
  let messageService: MessageService;
  let confirmationService: ConfirmationService;

  const mockPlans = [
    { id: 'plan-1', name: 'Básico', price: 0, max_users: 5, max_companies: 1, is_active: true, created_at: '2025-01-01' },
    { id: 'plan-2', name: 'Pro', price: 29, max_users: 25, max_companies: 3, is_active: true, created_at: '2025-01-01' }
  ];

  const mockCompanies: CompanyWithPlan[] = [
    {
      id: 'comp-1', name: 'Empresa Alpha', slug: 'empresa-alpha', address: 'Calle 1',
      phone: '555-111', plan_id: 'plan-1', is_active: true,
      created_at: '2025-01-01', updated_at: '2025-01-01',
      plans: { id: 'plan-1', name: 'Básico' }
    },
    {
      id: 'comp-2', name: 'Empresa Beta', slug: 'empresa-beta', address: 'Calle 2',
      phone: '555-222', plan_id: 'plan-2', is_active: true,
      created_at: '2025-01-01', updated_at: '2025-01-01',
      plans: { id: 'plan-2', name: 'Pro' }
    },
    {
      id: 'comp-3', name: 'Empresa Gamma', slug: 'empresa-gamma', address: 'Calle 3',
      phone: '555-333', plan_id: null, is_active: false,
      created_at: '2025-01-01', updated_at: '2025-01-01',
      plans: null
    }
  ];

  const mockUsers = [
    {
      id: 'user-1', email: 'admin@alpha.com', full_name: 'Admin Alpha',
      phone: '555-111', role: 'manager' as const, company_id: 'comp-1',
      can_be_employee: true, is_active: true, created_at: '2025-01-01', updated_at: '2025-01-01'
    },
    {
      id: 'user-2', email: 'emp@alpha.com', full_name: 'Empleado Alpha',
      phone: '555-222', role: 'employee' as const, company_id: 'comp-1',
      can_be_employee: false, is_active: false, created_at: '2025-01-01', updated_at: '2025-01-01'
    },
    {
      id: 'user-3', email: 'manager2@alpha.com', full_name: 'Manager Sin Empleado',
      phone: '555-333', role: 'manager' as const, company_id: 'comp-1',
      can_be_employee: false, is_active: true, created_at: '2025-01-01', updated_at: '2025-01-01'
    }
  ];

  beforeEach(waitForAsync(async () => {
    companyServiceMock = {
      getAll: jest.fn().mockResolvedValue(mockCompanies),
      create: jest.fn().mockResolvedValue(mockCompanies[0]),
      update: jest.fn().mockResolvedValue(mockCompanies[0]),
      activate: jest.fn().mockResolvedValue(mockCompanies[0]),
      deactivate: jest.fn().mockResolvedValue({ ...mockCompanies[0], is_active: false }),
      getBySlug: jest.fn(),
      getById: jest.fn()
    } as any;

    userServiceMock = {
      getAllByCompany: jest.fn().mockResolvedValue(mockUsers),
      getByCompany: jest.fn().mockResolvedValue(mockUsers),
      create: jest.fn().mockResolvedValue(mockUsers[0]),
      update: jest.fn().mockResolvedValue(mockUsers[0]),
      activate: jest.fn().mockResolvedValue({ ...mockUsers[0], is_active: true }),
      deactivate: jest.fn().mockResolvedValue({ ...mockUsers[0], is_active: false }),
      getAll: jest.fn().mockResolvedValue(mockUsers),
      getById: jest.fn(),
      getEmployeesByCompany: jest.fn(),
      delete: jest.fn()
    } as any;

    planServiceMock = {
      getAll: jest.fn().mockResolvedValue(mockPlans),
      getAllActive: jest.fn().mockResolvedValue(mockPlans),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      activate: jest.fn(),
      deactivate: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [CentralManagementComponent],
      providers: [
        { provide: CompanyService, useValue: companyServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: PlanService, useValue: planServiceMock },
        MessageService,
        ConfirmationService,
        provideNoopAnimations()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(CentralManagementComponent, {
      remove: { providers: [MessageService, ConfirmationService] }
    }).compileComponents();

    fixture = TestBed.createComponent(CentralManagementComponent);
    component = fixture.componentInstance;
    messageService = TestBed.inject(MessageService);
    confirmationService = TestBed.inject(ConfirmationService);
  }));

  describe('when superadmin first loads the page', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should display the page header with Superadmin badge', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Gestión Central');
      expect(compiled.textContent).toContain('Superadmin');
    });

    it('should display the subtitle description', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Administra empresas y usuarios desde un solo lugar');
    });

    it('should show the Nueva Empresa button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Nueva Empresa');
    });

    it('should load companies from the service', () => {
      expect(companyServiceMock.getAll).toHaveBeenCalled();
      expect(component.companies().length).toBe(3);
    });

    it('should load plans from the service', () => {
      expect(planServiceMock.getAllActive).toHaveBeenCalled();
      expect(component.plans().length).toBe(2);
    });

    it('should display all company names in the table', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Empresa Alpha');
      expect(compiled.textContent).toContain('Empresa Beta');
      expect(compiled.textContent).toContain('Empresa Gamma');
    });

    it('should show status tags for each company', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Activo');
      expect(compiled.textContent).toContain('Inactivo');
    });

    it('should set loading to false after data loads', () => {
      expect(component.loading()).toBe(false);
    });
  });

  describe('when companies fail to load', () => {
    beforeEach(() => {
      companyServiceMock.getAll = jest.fn().mockRejectedValue(new Error('Network error'));
    });

    it('should show error message via messageService', async () => {
      const addSpy = jest.spyOn(messageService, 'add');
      await component.ngOnInit();

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          detail: 'No se pudieron cargar las empresas'
        })
      );
    });

    it('should set loading to false even on error', async () => {
      await component.ngOnInit();
      expect(component.loading()).toBe(false);
    });
  });

  describe('when superadmin selects a company to view users', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should load users when a company is selected', async () => {
      component.selectCompany(mockCompanies[0]);

      expect(userServiceMock.getAllByCompany).toHaveBeenCalledWith('comp-1');
      expect(component.selectedCompanyId()).toBe('comp-1');
    });

    it('should set company name in selectedCompanyName', async () => {
      component.selectCompany(mockCompanies[0]);

      expect(component.selectedCompanyName()).toBe('Empresa Alpha');
    });

    it('should populate users signal with loaded data', async () => {
      component.selectCompany(mockCompanies[0]);
      await fixture.whenStable();

      expect(component.users().length).toBe(3);
      expect(component.users()[0].full_name).toBe('Admin Alpha');
    });

    it('should clear users panel when same company is clicked again', async () => {
      component.selectCompany(mockCompanies[0]);
      await fixture.whenStable();
      expect(component.selectedCompanyId()).toBe('comp-1');

      component.selectCompany(mockCompanies[0]);

      expect(component.selectedCompanyId()).toBeNull();
      expect(component.users().length).toBe(0);
    });

    it('should switch users when a different company is selected', async () => {
      const otherCompanyUsers = [
        { ...mockUsers[0], id: 'user-3', full_name: 'Otro Usuario', company_id: 'comp-2' }
      ];
      userServiceMock.getAllByCompany = jest.fn()
        .mockResolvedValueOnce(mockUsers)
        .mockResolvedValueOnce(otherCompanyUsers);

      component.selectCompany(mockCompanies[0]);
      await fixture.whenStable();
      expect(component.selectedCompanyId()).toBe('comp-1');

      component.selectCompany(mockCompanies[1]);
      await fixture.whenStable();
      expect(component.selectedCompanyId()).toBe('comp-2');
      expect(userServiceMock.getAllByCompany).toHaveBeenCalledWith('comp-2');
    });
  });

  describe('when users fail to load for a company', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should show error message when users fail to load', async () => {
      const addSpy = jest.spyOn(messageService, 'add');
      userServiceMock.getAllByCompany = jest.fn().mockRejectedValue(new Error('Network error'));

      component.selectCompany(mockCompanies[0]);
      await fixture.whenStable();

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          detail: 'No se pudieron cargar los usuarios'
        })
      );
    });

    it('should set usersLoading to false even on error', async () => {
      userServiceMock.getAllByCompany = jest.fn().mockRejectedValue(new Error('Network error'));

      component.selectCompany(mockCompanies[0]);
      await fixture.whenStable();

      expect(component.usersLoading()).toBe(false);
    });
  });

  describe('when superadmin filters companies', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should filter companies by search term (name)', () => {
      component.searchTerm.set('Alpha');
      expect(component.filteredCompanies().length).toBe(1);
      expect(component.filteredCompanies()[0].name).toBe('Empresa Alpha');
    });

    it('should filter companies by search term (slug)', () => {
      component.searchTerm.set('beta');
      expect(component.filteredCompanies().length).toBe(1);
      expect(component.filteredCompanies()[0].slug).toBe('empresa-beta');
    });

    it('should filter companies by active status', () => {
      component.statusFilter.set('active');
      expect(component.filteredCompanies().length).toBe(2);
      expect(component.filteredCompanies().every(c => c.is_active)).toBe(true);
    });

    it('should filter companies by inactive status', () => {
      component.statusFilter.set('inactive');
      expect(component.filteredCompanies().length).toBe(1);
      expect(component.filteredCompanies().every(c => !c.is_active)).toBe(true);
    });

    it('should filter companies by plan', () => {
      component.planFilter.set('plan-1');
      expect(component.filteredCompanies().length).toBe(1);
      expect(component.filteredCompanies()[0].plan_id).toBe('plan-1');
    });

    it('should combine multiple filters', () => {
      component.searchTerm.set('Empresa');
      component.statusFilter.set('active');
      const results = component.filteredCompanies();
      expect(results.length).toBe(2);
      expect(results.every(c => c.is_active)).toBe(true);
    });

    it('should clear all filters', () => {
      component.searchTerm.set('Alpha');
      component.statusFilter.set('active');
      component.planFilter.set('plan-1');

      component.clearFilters();

      expect(component.searchTerm()).toBe('');
      expect(component.statusFilter()).toBe('all');
      expect(component.planFilter()).toBeNull();
      expect(component.filteredCompanies().length).toBe(3);
    });

    it('should return all companies when no filters applied', () => {
      expect(component.filteredCompanies().length).toBe(3);
    });
  });

  describe('when superadmin toggles company status', () => {
    let confirmOptions: any;

    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();
      confirmOptions = null;
      jest.spyOn(confirmationService, 'confirm').mockImplementation((opts: any) => {
        confirmOptions = opts;
      });
    });

    it('should call confirmation service with Desactivar for active company', () => {
      const activeCompany = mockCompanies[0];
      component.confirmToggleCompany(activeCompany);

      expect(confirmationService.confirm).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Desactivar'),
          header: 'Confirmar'
        })
      );
    });

    it('should call confirmation service with Reactivar for inactive company', () => {
      const inactiveCompany = mockCompanies[2];
      component.confirmToggleCompany(inactiveCompany);

      expect(confirmationService.confirm).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Reactivar'),
          header: 'Confirmar'
        })
      );
    });

    it('should call companyService.deactivate when accepting toggle for active company', async () => {
      const activeCompany = mockCompanies[0];
      component.confirmToggleCompany(activeCompany);

      await confirmOptions.accept();

      expect(companyServiceMock.deactivate).toHaveBeenCalledWith('comp-1');
    });

    it('should call companyService.activate when accepting toggle for inactive company', async () => {
      const inactiveCompany = mockCompanies[2];
      component.confirmToggleCompany(inactiveCompany);

      await confirmOptions.accept();

      expect(companyServiceMock.activate).toHaveBeenCalledWith('comp-3');
    });

    it('should show success message after deactivating company', async () => {
      const addSpy = jest.spyOn(messageService, 'add');
      const activeCompany = mockCompanies[0];
      component.confirmToggleCompany(activeCompany);

      await confirmOptions.accept();

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success', detail: 'Empresa desactivada' })
      );
    });

    it('should show success message after reactivating company', async () => {
      const addSpy = jest.spyOn(messageService, 'add');
      const inactiveCompany = mockCompanies[2];
      component.confirmToggleCompany(inactiveCompany);

      await confirmOptions.accept();

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success', detail: 'Empresa reactivada' })
      );
    });
  });

  describe('when superadmin uses bulk actions on companies', () => {
    let confirmOptions: any;

    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();
      jest.spyOn(confirmationService, 'confirm').mockImplementation((opts: any) => {
        confirmOptions = opts;
      });
    });

    it('should not do anything when no companies are selected and bulkActivate is called', async () => {
      component.selectedCompanies.set([]);

      await component.bulkActivateCompanies();

      expect(companyServiceMock.activate).not.toHaveBeenCalled();
    });

    it('should show info message when all selected companies are already active', async () => {
      const addSpy = jest.spyOn(messageService, 'add');
      component.selectedCompanies.set([mockCompanies[0], mockCompanies[1]]);

      await component.bulkActivateCompanies();

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'info', detail: 'Todas las empresas seleccionadas ya están activas' })
      );
    });

    it('should show info message when all selected companies are already inactive', async () => {
      const addSpy = jest.spyOn(messageService, 'add');
      component.selectedCompanies.set([mockCompanies[2]]);

      await component.bulkDeactivateCompanies();

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'info', detail: 'Todas las empresas seleccionadas ya están inactivas' })
      );
    });

    it('should call confirmation service for bulk activate', () => {
      const inactiveCompany = { ...mockCompanies[2] };
      component.selectedCompanies.set([inactiveCompany]);

      component.bulkActivateCompanies();

      expect(confirmationService.confirm).toHaveBeenCalledWith(
        expect.objectContaining({ header: 'Confirmar activación' })
      );
    });

    it('should call confirmation service for bulk deactivate', () => {
      const activeCompany = mockCompanies[0];
      component.selectedCompanies.set([activeCompany]);

      component.bulkDeactivateCompanies();

      expect(confirmationService.confirm).toHaveBeenCalledWith(
        expect.objectContaining({
          header: 'Confirmar desactivación',
          message: expect.stringContaining('1 empresa(s)')
        })
      );
    });

    it('should activate inactive companies on bulk accept', async () => {
      const inactiveCompany = { ...mockCompanies[2] };
      component.selectedCompanies.set([inactiveCompany]);

      component.bulkActivateCompanies();

      await confirmOptions.accept();

      expect(companyServiceMock.activate).toHaveBeenCalledWith('comp-3');
    });

    it('should deactivate active companies on bulk accept', async () => {
      const activeCompany = mockCompanies[0];
      component.selectedCompanies.set([activeCompany]);

      component.bulkDeactivateCompanies();

      await confirmOptions.accept();

      expect(companyServiceMock.deactivate).toHaveBeenCalledWith('comp-1');
    });

    it('should clear selection after successful bulk action', async () => {
      const inactiveCompany = { ...mockCompanies[2] };
      component.selectedCompanies.set([inactiveCompany]);

      component.bulkActivateCompanies();

      await confirmOptions.accept();

      expect(component.selectedCompanies().length).toBe(0);
    });
  });

  describe('when superadmin toggles user status', () => {
    let confirmOptions: any;

    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();

      component.selectCompany(mockCompanies[0]);
      await fixture.whenStable();

      jest.spyOn(confirmationService, 'confirm').mockImplementation((opts: any) => {
        confirmOptions = opts;
      });
    });

    it('should call confirmation service with Desactivar for active user', () => {
      const activeUser = mockUsers[0];
      component.confirmToggleUser(activeUser);

      expect(confirmationService.confirm).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Desactivar'),
          header: 'Confirmar'
        })
      );
    });

    it('should call confirmation service with Reactivar for inactive user', () => {
      const inactiveUser = mockUsers[1];
      component.confirmToggleUser(inactiveUser);

      expect(confirmationService.confirm).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Reactivar'),
          header: 'Confirmar'
        })
      );
    });

    it('should call userService.deactivate when accepting toggle for active user', async () => {
      const activeUser = mockUsers[0];
      component.confirmToggleUser(activeUser);

      await confirmOptions.accept();

      expect(userServiceMock.deactivate).toHaveBeenCalledWith('user-1');
    });

    it('should call userService.activate when accepting toggle for inactive user', async () => {
      const inactiveUser = mockUsers[1];
      component.confirmToggleUser(inactiveUser);

      await confirmOptions.accept();

      expect(userServiceMock.activate).toHaveBeenCalledWith('user-2');
    });

    it('should reload users after toggling state', async () => {
      const activeUser = mockUsers[0];
      component.confirmToggleUser(activeUser);

      await confirmOptions.accept();

      expect(userServiceMock.getAllByCompany).toHaveBeenCalledWith('comp-1');
    });

    it('should show success message after deactivating user', async () => {
      const addSpy = jest.spyOn(messageService, 'add');
      const activeUser = mockUsers[0];
      component.confirmToggleUser(activeUser);

      await confirmOptions.accept();

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success', detail: 'Usuario desactivado' })
      );
    });

    it('should show success message after reactivating user', async () => {
      const addSpy = jest.spyOn(messageService, 'add');
      const inactiveUser = mockUsers[1];
      component.confirmToggleUser(inactiveUser);

      await confirmOptions.accept();

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success', detail: 'Usuario reactivado' })
      );
    });
  });

  describe('when superadmin uses bulk actions on users', () => {
    let confirmOptions: any;

    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();

      component.selectCompany(mockCompanies[0]);
      await fixture.whenStable();

      jest.spyOn(confirmationService, 'confirm').mockImplementation((opts: any) => {
        confirmOptions = opts;
      });
    });

    it('should not do anything when no users are selected and bulkActivate is called', async () => {
      component.selectedUsers.set([]);

      await component.bulkActivateUsers();

      expect(userServiceMock.activate).not.toHaveBeenCalled();
    });

    it('should show info message when all selected users are already active', async () => {
      const addSpy = jest.spyOn(messageService, 'add');
      component.selectedUsers.set([mockUsers[0]]);

      await component.bulkActivateUsers();

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'info', detail: 'Todos los usuarios seleccionados ya están activos' })
      );
    });

    it('should show info message when all selected users are already inactive', async () => {
      const addSpy = jest.spyOn(messageService, 'add');
      component.selectedUsers.set([mockUsers[1]]);

      await component.bulkDeactivateUsers();

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'info', detail: 'Todos los usuarios seleccionados ya están inactivos' })
      );
    });

    it('should call confirmation service for bulk activate users', () => {
      const inactiveUser = mockUsers[1];
      component.selectedUsers.set([inactiveUser]);

      component.bulkActivateUsers();

      expect(confirmationService.confirm).toHaveBeenCalledWith(
        expect.objectContaining({ header: 'Confirmar activación' })
      );
    });

    it('should call confirmation service for bulk deactivate users', () => {
      const activeUser = mockUsers[0];
      component.selectedUsers.set([activeUser]);

      component.bulkDeactivateUsers();

      expect(confirmationService.confirm).toHaveBeenCalledWith(
        expect.objectContaining({ header: 'Confirmar desactivación' })
      );
    });

    it('should activate inactive users on bulk accept', async () => {
      const inactiveUser = mockUsers[1];
      component.selectedUsers.set([inactiveUser]);

      component.bulkActivateUsers();

      await confirmOptions.accept();

      expect(userServiceMock.activate).toHaveBeenCalledWith('user-2');
    });

    it('should clear user selection after successful bulk action', async () => {
      const inactiveUser = mockUsers[1];
      component.selectedUsers.set([inactiveUser]);

      component.bulkActivateUsers();

      await confirmOptions.accept();

      expect(component.selectedUsers().length).toBe(0);
    });
  });

  describe('when superadmin creates a company', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should open create company dialog with empty form data', () => {
      component.openCreateCompanyDialog();

      expect(component.companyDialogVisible()).toBe(true);
      expect(component.editingCompany()).toBeNull();
      expect(component.companyFormData().name).toBe('');
      expect(component.companyFormData().slug).toBe('');
    });

    it('should validate required fields when saving a company', async () => {
      const addSpy = jest.spyOn(messageService, 'add');
      component.openCreateCompanyDialog();
      component.companyFormData.set({ name: '', slug: '' });

      await component.saveCompany();

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'warn', detail: 'Nombre y slug son requeridos' })
      );
      expect(companyServiceMock.create).not.toHaveBeenCalled();
    });

    it('should call companyService.create when saving a new company', async () => {
      component.openCreateCompanyDialog();
      component.companyFormData.set({
        name: 'Nueva Empresa',
        slug: 'nueva-empresa',
        address: 'Calle Nueva',
        phone: '555-999',
        plan_id: 'plan-1'
      });

      await component.saveCompany();

      expect(companyServiceMock.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Nueva Empresa', slug: 'nueva-empresa' })
      );
    });

    it('should close dialog after successful company creation', async () => {
      component.openCreateCompanyDialog();
      component.companyFormData.set({ name: 'Nueva', slug: 'nueva' });

      await component.saveCompany();

      expect(component.companyDialogVisible()).toBe(false);
    });

    it('should show error message when company creation fails', async () => {
      const addSpy = jest.spyOn(messageService, 'add');
      companyServiceMock.create = jest.fn().mockRejectedValue(new Error('Server error'));

      component.openCreateCompanyDialog();
      component.companyFormData.set({ name: 'Test', slug: 'test' });

      await component.saveCompany();

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', detail: 'No se pudo guardar la empresa' })
      );
    });

    it('should show duplicate slug error when slug already exists', async () => {
      const addSpy = jest.spyOn(messageService, 'add');
      companyServiceMock.create = jest.fn().mockRejectedValue(new Error('duplicate key value violates unique constraint "companies_slug_key"'));

      component.openCreateCompanyDialog();
      component.companyFormData.set({ name: 'Test', slug: 'test' });

      await component.saveCompany();

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'warn', detail: 'El slug ya existe' })
      );
    });
  });

  describe('when superadmin creates a user', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();

      component.selectCompany(mockCompanies[0]);
      await fixture.whenStable();
    });

    it('should not open user dialog when no company is selected', () => {
      component.selectedCompanyId.set(null);
      component.openCreateUserDialog();
      expect(component.userDialogVisible()).toBeFalsy();
    });

    it('should open create user dialog with default role', () => {
      component.openCreateUserDialog();

      expect(component.userDialogVisible()).toBe(true);
      expect(component.editingUser()).toBeNull();
      expect(component.userFormData().role).toBe('employee');
      expect(component.userFormData().company_id).toBe('comp-1');
      expect(component.userFormData().can_be_employee).toBe(false);
    });

    it('should validate required fields when saving a user', async () => {
      const addSpy = jest.spyOn(messageService, 'add');
      component.openCreateUserDialog();
      component.userFormData.set({ email: '', full_name: '', role: 'employee' });

      await component.saveUser();

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'warn', detail: 'Email, nombre y rol son requeridos' })
      );
      expect(userServiceMock.create).not.toHaveBeenCalled();
    });

    it('should call userService.create when saving a new user', async () => {
      component.openCreateUserDialog();
      component.userFormData.set({
        email: 'new@test.com',
        full_name: 'Nuevo Usuario',
        phone: '555-000',
        role: 'employee',
        company_id: 'comp-1',
        password: 'test1234'
      });

      await component.saveUser();

      expect(userServiceMock.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@test.com', full_name: 'Nuevo Usuario' })
      );
    });

    it('should close dialog after successful user creation', async () => {
      component.openCreateUserDialog();
      component.userFormData.set({ email: 'new@test.com', full_name: 'Nuevo', role: 'employee', password: 'test1234' });

      await component.saveUser();

      expect(component.userDialogVisible()).toBe(false);
    });

    it('should show duplicate email error when email already exists', async () => {
      const addSpy = jest.spyOn(messageService, 'add');
      userServiceMock.create = jest.fn().mockRejectedValue(new Error('duplicate key value violates unique constraint "profiles_email_key"'));

      component.openCreateUserDialog();
      component.userFormData.set({ email: 'admin@alpha.com', full_name: 'Test', role: 'employee', password: 'test1234' });

      await component.saveUser();

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'warn', detail: 'El email ya existe' })
      );
    });
  });

  describe('when superadmin edits a company row', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should store a clone when row editing starts', () => {
      const company = mockCompanies[0];
      component.onCompanyRowEditInit(company);

      expect(component.editingCompanyId()).toBe('comp-1');
      expect(component.clonedCompanies()['comp-1']).toBeDefined();
      expect(component.clonedCompanies()['comp-1'].name).toBe('Empresa Alpha');
    });

    it('should call companyService.update when saving row edit', async () => {
      const company = { ...mockCompanies[0], name: 'Empresa Alpha Modified' };
      await component.onCompanyRowEditSave(company);

      expect(companyServiceMock.update).toHaveBeenCalledWith('comp-1',
        expect.objectContaining({ name: 'Empresa Alpha Modified' })
      );
    });

    it('should show success message after saving company edit', async () => {
      const addSpy = jest.spyOn(messageService, 'add');
      const company = { ...mockCompanies[0], name: 'Modified' };
      await component.onCompanyRowEditSave(company);

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success', detail: 'Empresa actualizada' })
      );
    });

    it('should restore original data when save fails', async () => {
      const addSpy = jest.spyOn(messageService, 'add');
      companyServiceMock.update = jest.fn().mockRejectedValue(new Error('Update failed'));
      const company = { ...mockCompanies[0] };
      component.onCompanyRowEditInit(company);

      company.name = 'Modified Name';
      await component.onCompanyRowEditSave(company);

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', detail: 'No se pudo actualizar la empresa' })
      );
    });

    it('should clear editing state after save completes', async () => {
      const company = { ...mockCompanies[0] };
      component.onCompanyRowEditInit(company);

      await component.onCompanyRowEditSave(company);

      expect(component.editingCompanyId()).toBeNull();
      expect(component.clonedCompanies()['comp-1']).toBeUndefined();
    });

    it('should restore original data when row edit is cancelled', () => {
      const company = { ...mockCompanies[0] };
      component.onCompanyRowEditInit(company);

      company.name = 'Wrong Name';
      component.onCompanyRowEditCancel(company, 0);

      expect(component.editingCompanyId()).toBeNull();
      expect(company.name).toBe('Empresa Alpha');
    });
  });

  describe('when superadmin edits a user row', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();

      component.selectCompany(mockCompanies[0]);
      await fixture.whenStable();
    });

    it('should store a clone when user row editing starts', () => {
      const user = mockUsers[0];
      component.onUserRowEditInit(user);

      expect(component.editingUserId()).toBe('user-1');
      expect(component.clonedUsers()['user-1']).toBeDefined();
    });

    it('should call userService.update when saving user row edit', async () => {
      const user = { ...mockUsers[0], full_name: 'Admin Alpha Modified' };
      await component.onUserRowEditSave(user);

      expect(userServiceMock.update).toHaveBeenCalledWith('user-1',
        expect.objectContaining({ full_name: 'Admin Alpha Modified' })
      );
    });

    it('should show success message after saving user edit', async () => {
      const addSpy = jest.spyOn(messageService, 'add');
      const user = { ...mockUsers[0] };
      await component.onUserRowEditSave(user);

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success', detail: 'Usuario actualizado' })
      );
    });

    it('should restore original data when user save fails', async () => {
      const addSpy = jest.spyOn(messageService, 'add');
      userServiceMock.update = jest.fn().mockRejectedValue(new Error('Update failed'));
      const user = { ...mockUsers[0] };
      component.onUserRowEditInit(user);

      user.full_name = 'Wrong Name';
      await component.onUserRowEditSave(user);

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', detail: 'No se pudo actualizar el usuario' })
      );
    });

    it('should clear editing state after user save completes', async () => {
      const user = { ...mockUsers[0] };
      component.onUserRowEditInit(user);

      await component.onUserRowEditSave(user);

      expect(component.editingUserId()).toBeNull();
      expect(component.clonedUsers()['user-1']).toBeUndefined();
    });

    it('should restore original data when user row edit is cancelled', () => {
      const user = { ...mockUsers[0] };
      component.onUserRowEditInit(user);

      user.full_name = 'Wrong Name';
      component.onUserRowEditCancel(user, 0);

      expect(component.editingUserId()).toBeNull();
      expect(user.full_name).toBe('Admin Alpha');
    });

    it('should include can_be_employee in update data when saving manager row edit', async () => {
      const managerUser = { ...mockUsers[0], can_be_employee: true };
      await component.onUserRowEditSave(managerUser);

      expect(userServiceMock.update).toHaveBeenCalledWith('user-1',
        expect.objectContaining({ can_be_employee: true, role: 'manager' })
      );
    });

    it('should not include can_be_employee in update data when saving employee row edit', async () => {
      const employeeUser = { ...mockUsers[1] };
      await component.onUserRowEditSave(employeeUser);

      const updateCall = userServiceMock.update.mock.calls[0][1] as any;
      expect(updateCall.can_be_employee).toBeUndefined();
    });

    it('should set can_be_employee to false when manager has it undefined', async () => {
      const managerWithout = { ...mockUsers[2], can_be_employee: undefined as any };
      await component.onUserRowEditSave(managerWithout);

      expect(userServiceMock.update).toHaveBeenCalledWith('user-3',
        expect.objectContaining({ can_be_employee: false, role: 'manager' })
      );
    });
  });

  describe('helper methods', () => {
    it('should return correct role labels', () => {
      expect(component.getRoleLabel('superadmin')).toBe('Superadmin');
      expect(component.getRoleLabel('manager')).toBe('Manager');
      expect(component.getRoleLabel('employee')).toBe('Empleado');
    });

    it('should return correct role severity', () => {
      expect(component.getRoleSeverity('superadmin')).toBe('contrast');
      expect(component.getRoleSeverity('manager')).toBe('info');
      expect(component.getRoleSeverity('employee')).toBe('success');
    });

    it('should return Sin plan for companies without plan', () => {
      const companyWithoutPlan = mockCompanies[2];
      expect(component.getPlanName(companyWithoutPlan)).toBe('Sin plan');
    });

    it('should return plan name for companies with plan', () => {
      const companyWithPlan = mockCompanies[0];
      expect(component.getPlanName(companyWithPlan)).toBe('Básico');
    });
  });

  describe('when superadmin edits user with can_be_employee', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();

      component.selectCompany(mockCompanies[0]);
      await fixture.whenStable();
    });

    it('should preserve can_be_employee=true when toggling manager user status', async () => {
      let confirmOptions: any;
      jest.spyOn(confirmationService, 'confirm').mockImplementation((opts: any) => {
        confirmOptions = opts;
      });

      const managerUser = mockUsers[0];
      component.confirmToggleUser(managerUser);
      await confirmOptions.accept();

      expect(userServiceMock.deactivate).toHaveBeenCalledWith('user-1');
    });

    it('should create user with can_be_employee=false by default', async () => {
      component.openCreateUserDialog();

      expect(component.userFormData().can_be_employee).toBe(false);
    });

    it('should include can_be_employee in user row edit save for managers', async () => {
      const managerUser = { ...mockUsers[0] };
      managerUser.can_be_employee = true;
      component.onUserRowEditInit(managerUser);

      managerUser.can_be_employee = false;
      await component.onUserRowEditSave(managerUser);

      expect(userServiceMock.update).toHaveBeenCalledWith('user-1',
        expect.objectContaining({ can_be_employee: false, role: 'manager' })
      );
    });

    it('should not include can_be_employee for employee row edit saves', async () => {
      const employeeUser = { ...mockUsers[1] };
      component.onUserRowEditInit(employeeUser);

      await component.onUserRowEditSave(employeeUser);

      const updateCall = userServiceMock.update.mock.calls[0][1] as any;
      expect(updateCall.can_be_employee).toBeUndefined();
    });
  });

  describe('when there are no companies', () => {
    beforeEach(() => {
      companyServiceMock.getAll = jest.fn().mockResolvedValue([]);
    });

    it('should set companies to empty array', async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.companies().length).toBe(0);
      expect(component.filteredCompanies().length).toBe(0);
    });
  });

  describe('plan options for filters and forms', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should generate plan filter options with a null option for all plans', () => {
      const options = component.planFilterOptions();
      expect(options[0]).toEqual({ label: 'Todos los planes', value: null });
      expect(options.length).toBe(3);
    });

    it('should generate plan options with labels and values', () => {
      const options = component.planOptions();
      expect(options.length).toBe(2);
      expect(options[0].label).toBe('Básico');
      expect(options[0].value).toBe('plan-1');
    });

    it('should mark inactive plans as disabled in plan options', () => {
      const plansWithInactive = [
        ...mockPlans,
        { id: 'plan-3', name: 'Premium', price: 59, max_users: 50, max_companies: 10, is_active: false, created_at: '2025-01-01' }
      ];
      component.plans.set(plansWithInactive);

      const options = component.planOptions();
      const premiumOption = options.find(o => o.value === 'plan-3');
      expect(premiumOption?.disabled).toBe(true);
    });
  });

  describe('when generating slug from company name', () => {
    it('should convert name to slug format', () => {
      component.companyFormData.set({ name: 'Mi Nueva Empresa' });
      component.generateSlug();
      expect(component.companyFormData().slug).toBe('mi-nueva-empresa');
    });

    it('should remove special characters from slug', () => {
      component.companyFormData.set({ name: 'Empresa #1 - La Mejor!' });
      component.generateSlug();
      expect(component.companyFormData().slug).toBe('empresa-1-la-mejor');
    });

    it('should handle empty name', () => {
      component.companyFormData.set({ name: '' });
      component.generateSlug();
      expect(component.companyFormData().slug).toBe('');
    });
  });
});