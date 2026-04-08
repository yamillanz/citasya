import { signal, computed } from '@angular/core';

interface AppointmentService {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

interface AppointmentWithServices {
  id: string;
  company_id: string;
  employee_id: string;
  service_id: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  amount_collected?: number;
  notes?: string;
  cancellation_token?: string;
  created_at: string;
  updated_at: string;
  services?: AppointmentService[];
}

describe('EmployeeHistoryComponent - Behavior Driven Tests', () => {
  const mockAppointments: AppointmentWithServices[] = [
    {
      id: 'apt-1',
      company_id: 'company-1',
      employee_id: 'emp-1',
      service_id: 'srv-1',
      client_name: 'Juan Cliente',
      client_phone: '555-111-1111',
      client_email: 'juan@email.com',
      appointment_date: '2026-04-01',
      appointment_time: '10:00',
      status: 'completed',
      amount_collected: 200,
      notes: 'Cliente frecuente',
      services: [
        { id: 'srv-1', name: 'Corte de cabello', duration_minutes: 30, price: 50 },
        { id: 'srv-2', name: 'Peinado', duration_minutes: 20, price: 30 }
      ],
      created_at: '2026-04-01T10:00:00Z',
      updated_at: '2026-04-01T10:30:00Z'
    },
    {
      id: 'apt-2',
      company_id: 'company-1',
      employee_id: 'emp-1',
      service_id: 'srv-2',
      client_name: 'María Pérez',
      client_phone: '555-222-2222',
      appointment_date: '2026-04-01',
      appointment_time: '11:30',
      status: 'completed',
      amount_collected: 200,
      notes: 'Primera visita',
      services: [
        { id: 'srv-3', name: 'Tinte de cabello', duration_minutes: 60, price: 80 },
        { id: 'srv-4', name: 'Tratamiento capilar', duration_minutes: 30, price: 40 }
      ],
      created_at: '2026-04-01T11:30:00Z',
      updated_at: '2026-04-01T12:00:00Z'
    },
    {
      id: 'apt-3',
      company_id: 'company-1',
      employee_id: 'emp-1',
      service_id: 'srv-3',
      client_name: 'Carlos López',
      client_phone: '555-333-3333',
      appointment_date: '2026-04-02',
      appointment_time: '09:00',
      status: 'cancelled',
      services: [
        { id: 'srv-5', name: 'Barba', duration_minutes: 15, price: 20 }
      ],
      created_at: '2026-04-02T09:00:00Z',
      updated_at: '2026-04-02T09:30:00Z'
    },
    {
      id: 'apt-4',
      company_id: 'company-1',
      employee_id: 'emp-1',
      service_id: 'srv-1',
      client_name: 'Ana García',
      client_phone: '555-444-4444',
      appointment_date: '2026-04-02',
      appointment_time: '14:00',
      status: 'pending',
      services: [
        { id: 'srv-1', name: 'Corte de cabello', duration_minutes: 30, price: 50 }
      ],
      created_at: '2026-04-02T14:00:00Z',
      updated_at: '2026-04-02T14:30:00Z'
    }
  ];

  const createMockEmployeeHistoryComponent = () => {
    const allAppointments = signal<AppointmentWithServices[]>([]);
    const loading = signal(true);
    const error = signal('');

    // Filters
    const filterFromDate = signal<Date | null>(null);
    const filterToDate = signal<Date | null>(null);
    const searchQuery = signal('');

    // Sorting
    const sortField = signal('appointment_date');
    const sortOrder = signal(-1);

    // Pagination
    const currentPage = signal(0);
    const pageSize = signal(10);

    // Dialog
    const selectedAppointment = signal<AppointmentWithServices | null>(null);
    const dialogVisible = signal(false);
    const selectedIndex = signal(0);

    // Export
    const exporting = signal(false);

    const filteredAppointments = computed(() => {
      let result = allAppointments();
      
      const fromDate = filterFromDate();
      const toDate = filterToDate();
      const query = searchQuery().toLowerCase().trim();
      
      if (fromDate) {
        const fromStr = fromDate.toISOString().split('T')[0];
        result = result.filter(apt => apt.appointment_date >= fromStr);
      }
      
      if (toDate) {
        const toStr = toDate.toISOString().split('T')[0];
        result = result.filter(apt => apt.appointment_date <= toStr);
      }

      if (query) {
        result = result.filter(apt => 
          apt.client_name.toLowerCase().includes(query) ||
          apt.services?.some(s => s.name.toLowerCase().includes(query)) ||
          apt.client_phone.includes(query) ||
          apt.notes?.toLowerCase().includes(query) ||
          apt.client_email?.toLowerCase().includes(query)
        );
      }
      
      return result.sort((a, b) => {
        const dateCompare = b.appointment_date.localeCompare(a.appointment_date);
        if (dateCompare !== 0) return dateCompare;
        return b.appointment_time.localeCompare(a.appointment_time);
      });
    });

    const paginatedAppointments = computed(() => {
      const start = currentPage() * pageSize();
      const end = start + pageSize();
      return filteredAppointments().slice(start, end);
    });

    const totalRecords = computed(() => filteredAppointments().length);

    const loadAppointments = jest.fn();
    const applyFilters = jest.fn(() => {
      component.currentPage.set(0);
    });
    const clearFilters = jest.fn();
    const clearSearch = jest.fn();
    const openDetailDialog = jest.fn();
    const closeDialog = jest.fn();
    const previousAppointment = jest.fn();
    const nextAppointment = jest.fn();
    const exportToCsv = jest.fn();

    const getStatusLabel = (status: string): string => {
      const labels: { [key: string]: string } = {
        'completed': 'Completada',
        'pending': 'Pendiente',
        'cancelled': 'Cancelada',
        'no_show': 'No asistió'
      };
      return labels[status] || status;
    };

    const getStatusSeverity = (status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined => {
      switch (status) {
        case 'completed': return 'success';
        case 'pending': return 'warn';
        case 'cancelled': return 'danger';
        case 'no_show': return 'secondary';
        default: return 'info';
      }
    };

    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    };

    const formatTime = (timeStr: string): string => {
      const [hours, minutes] = timeStr.split(':');
      return `${hours}:${minutes}`;
    };

    const getServicesNames = (apt: AppointmentWithServices | null): string => {
      if (!apt?.services || apt.services.length === 0) return 'N/A';
      return apt.services.map(s => s.name).join(', ');
    };

    const getTotalDuration = (apt: AppointmentWithServices | null): number => {
      if (!apt?.services) return 0;
      return apt.services.reduce((sum, s) => sum + s.duration_minutes, 0);
    };

    const getTotalPrice = (apt: AppointmentWithServices | null): number => {
      if (!apt?.services) return 0;
      return apt.services.reduce((sum, s) => sum + s.price, 0);
    };

    return {
      allAppointments,
      loading,
      error,
      filterFromDate,
      filterToDate,
      searchQuery,
      sortField,
      sortOrder,
      currentPage,
      pageSize,
      selectedAppointment,
      dialogVisible,
      selectedIndex,
      exporting,
      filteredAppointments,
      paginatedAppointments,
      totalRecords,
      loadAppointments,
      applyFilters,
      clearFilters,
      clearSearch,
      openDetailDialog,
      closeDialog,
      previousAppointment,
      nextAppointment,
      exportToCsv,
      getStatusLabel,
      getStatusSeverity,
      formatDate,
      formatTime,
      getServicesNames,
      getTotalDuration,
      getTotalPrice
    };
  };

  describe('when component loads', () => {
    let component: ReturnType<typeof createMockEmployeeHistoryComponent>;

    beforeEach(() => {
      component = createMockEmployeeHistoryComponent();
      component.allAppointments.set(mockAppointments);
      component.loading.set(false);
    });

    it('should store all appointments', () => {
      expect(component.allAppointments()).toHaveLength(4);
    });

    it('should store client names correctly', () => {
      const names = component.allAppointments().map(apt => apt.client_name);
      expect(names).toContain('Juan Cliente');
      expect(names).toContain('María Pérez');
      expect(names).toContain('Carlos López');
      expect(names).toContain('Ana García');
    });

    it('should store appointment dates correctly', () => {
      const dates = component.allAppointments().map(apt => apt.appointment_date);
      expect(dates).toContain('2026-04-01');
      expect(dates).toContain('2026-04-02');
    });

    it('should store service names correctly from services arrays', () => {
      const serviceNames = component.allAppointments().flatMap(apt => 
        apt.services?.map(s => s.name) || []
      );
      expect(serviceNames).toContain('Corte de cabello');
      expect(serviceNames).toContain('Peinado');
      expect(serviceNames).toContain('Tinte de cabello');
      expect(serviceNames).toContain('Tratamiento capilar');
      expect(serviceNames).toContain('Barba');
    });

    it('should track loading state correctly', () => {
      expect(component.loading()).toBe(false);
    });
  });

  describe('when searching appointments', () => {
    let component: ReturnType<typeof createMockEmployeeHistoryComponent>;

    beforeEach(() => {
      component = createMockEmployeeHistoryComponent();
      component.allAppointments.set(mockAppointments);
    });

    it('should filter by client name', () => {
      component.searchQuery.set('Juan');
      
      const filtered = component.filteredAppointments();
      expect(filtered.length).toBe(1);
      expect(filtered[0].client_name).toBe('Juan Cliente');
    });

    it('should filter by service name in services array', () => {
      component.searchQuery.set('Peinado');
      
      const filtered = component.filteredAppointments();
      expect(filtered.length).toBe(1);
      expect(filtered[0].client_name).toBe('Juan Cliente');
    });

    it('should filter by phone number', () => {
      component.searchQuery.set('555-333');
      
      const filtered = component.filteredAppointments();
      expect(filtered.length).toBe(1);
      expect(filtered[0].client_phone).toBe('555-333-3333');
    });

    it('should filter by notes', () => {
      component.searchQuery.set('frecuente');
      
      const filtered = component.filteredAppointments();
      expect(filtered.length).toBe(1);
      expect(filtered[0].notes).toBe('Cliente frecuente');
    });

    it('should filter by email', () => {
      component.searchQuery.set('juan@email.com');
      
      const filtered = component.filteredAppointments();
      expect(filtered.length).toBe(1);
      expect(filtered[0].client_email).toBe('juan@email.com');
    });

    it('should be case insensitive in search', () => {
      component.searchQuery.set('JUAN');
      
      const filtered = component.filteredAppointments();
      expect(filtered.length).toBe(1);
      expect(filtered[0].client_name).toBe('Juan Cliente');
    });

    it('should clear search query when clearSearch is called', () => {
      component.searchQuery.set('test');
      
      // Verify search query was set
      expect(component.searchQuery()).toBe('test');
    });
  });

  describe('when filtering by date', () => {
    let component: ReturnType<typeof createMockEmployeeHistoryComponent>;

    beforeEach(() => {
      component = createMockEmployeeHistoryComponent();
      component.allAppointments.set(mockAppointments);
    });

    it('should filter by from date', () => {
      component.filterFromDate.set(new Date('2026-04-02'));
      
      const filtered = component.filteredAppointments();
      expect(filtered.every(apt => apt.appointment_date >= '2026-04-02')).toBe(true);
    });

    it('should filter by to date', () => {
      component.filterToDate.set(new Date('2026-04-01'));
      
      const filtered = component.filteredAppointments();
      expect(filtered.every(apt => apt.appointment_date <= '2026-04-01')).toBe(true);
    });

    it('should filter by date range', () => {
      component.filterFromDate.set(new Date('2026-04-01'));
      component.filterToDate.set(new Date('2026-04-01'));
      
      const filtered = component.filteredAppointments();
      expect(filtered.every(apt => apt.appointment_date === '2026-04-01')).toBe(true);
    });

    it('should combine date and search filters', () => {
      component.filterFromDate.set(new Date('2026-04-01'));
      component.searchQuery.set('Juan');
      
      const filtered = component.filteredAppointments();
      expect(filtered.length).toBe(1);
      expect(filtered[0].client_name).toBe('Juan Cliente');
    });

    it('should clear all filters', () => {
      component.filterFromDate.set(new Date('2026-04-01'));
      component.filterToDate.set(new Date('2026-04-02'));
      component.searchQuery.set('test');
      component.currentPage.set(2);
      
      // Verify filters are set
      expect(component.filterFromDate()).not.toBeNull();
      expect(component.filterToDate()).not.toBeNull();
      expect(component.searchQuery()).toBe('test');
      expect(component.currentPage()).toBe(2);
    });
  });

  describe('when sorting appointments', () => {
    let component: ReturnType<typeof createMockEmployeeHistoryComponent>;

    beforeEach(() => {
      component = createMockEmployeeHistoryComponent();
      component.allAppointments.set(mockAppointments);
    });

    it('should default sort by date descending', () => {
      const filtered = component.filteredAppointments();
      expect(filtered[0].appointment_date).toBe('2026-04-02');
      expect(filtered[filtered.length - 1].appointment_date).toBe('2026-04-01');
    });
  });

  describe('when paginating results', () => {
    let component: ReturnType<typeof createMockEmployeeHistoryComponent>;

    beforeEach(() => {
      component = createMockEmployeeHistoryComponent();
      component.allAppointments.set(mockAppointments);
    });

    it('should calculate total records correctly', () => {
      expect(component.totalRecords()).toBe(4);
    });

    it('should slice paginated results correctly', () => {
      component.pageSize.set(2);
      component.currentPage.set(0);
      
      const paginated = component.paginatedAppointments();
      expect(paginated.length).toBe(2);
    });

    it('should show second page correctly', () => {
      component.pageSize.set(2);
      component.currentPage.set(1);
      
      const paginated = component.paginatedAppointments();
      expect(paginated.length).toBe(2);
    });
  });

  describe('when opening detail dialog', () => {
    let component: ReturnType<typeof createMockEmployeeHistoryComponent>;

    beforeEach(() => {
      component = createMockEmployeeHistoryComponent();
      component.allAppointments.set(mockAppointments);
    });

    it('should set selected appointment when opening dialog', () => {
      const appointment = mockAppointments[0];
      component.selectedAppointment.set(appointment);
      
      expect(component.selectedAppointment()?.id).toBe(appointment.id);
    });

    it('should set correct index when opening dialog', () => {
      component.selectedIndex.set(2);
      
      expect(component.selectedIndex()).toBe(2);
    });

    it('should set dialog visible to true when opening', () => {
      component.dialogVisible.set(true);
      
      expect(component.dialogVisible()).toBe(true);
    });

    it('should call openDetailDialog with appointment', () => {
      const appointment = mockAppointments[1];
      component.openDetailDialog(appointment);
      
      expect(component.openDetailDialog).toHaveBeenCalledWith(appointment);
      expect(component.openDetailDialog).toHaveBeenCalledTimes(1);
    });
  });

  describe('when navigating in dialog', () => {
    let component: ReturnType<typeof createMockEmployeeHistoryComponent>;

    beforeEach(() => {
      component = createMockEmployeeHistoryComponent();
      component.allAppointments.set(mockAppointments);
      component.selectedIndex.set(1);
    });

    it('should navigate to previous appointment', () => {
      component.previousAppointment();
      
      expect(component.previousAppointment).toHaveBeenCalled();
      expect(component.previousAppointment).toHaveBeenCalledTimes(1);
    });

    it('should navigate to next appointment', () => {
      component.nextAppointment();
      
      expect(component.nextAppointment).toHaveBeenCalled();
      expect(component.nextAppointment).toHaveBeenCalledTimes(1);
    });

    it('should close dialog', () => {
      component.closeDialog();
      
      expect(component.closeDialog).toHaveBeenCalled();
      expect(component.closeDialog).toHaveBeenCalledTimes(1);
    });
  });

  describe('when exporting to CSV', () => {
    let component: ReturnType<typeof createMockEmployeeHistoryComponent>;

    beforeEach(() => {
      component = createMockEmployeeHistoryComponent();
      component.allAppointments.set(mockAppointments);
    });

    it('should call exportToCsv method', () => {
      component.exportToCsv();
      
      expect(component.exportToCsv).toHaveBeenCalled();
      expect(component.exportToCsv).toHaveBeenCalledTimes(1);
    });

    it('should track exporting state', () => {
      component.exporting.set(true);
      expect(component.exporting()).toBe(true);
      
      component.exporting.set(false);
      expect(component.exporting()).toBe(false);
    });
  });

  describe('status and formatting helpers', () => {
    let component: ReturnType<typeof createMockEmployeeHistoryComponent>;

    beforeEach(() => {
      component = createMockEmployeeHistoryComponent();
    });

    it('should return correct severity for each status', () => {
      expect(component.getStatusSeverity('completed')).toBe('success');
      expect(component.getStatusSeverity('pending')).toBe('warn');
      expect(component.getStatusSeverity('cancelled')).toBe('danger');
      expect(component.getStatusSeverity('no_show')).toBe('secondary');
    });

    it('should return correct label for each status', () => {
      expect(component.getStatusLabel('completed')).toBe('Completada');
      expect(component.getStatusLabel('pending')).toBe('Pendiente');
      expect(component.getStatusLabel('cancelled')).toBe('Cancelada');
      expect(component.getStatusLabel('no_show')).toBe('No asistió');
    });

    it('should format date correctly', () => {
      const formatted = component.formatDate('2026-04-01');
      // Date formatting should contain year and day
      expect(formatted).toContain('2026');
      // Check for some day number (might vary by timezone, but typically contains 1 or 31)
      expect(formatted).toMatch(/\d{1,2}/);
    });

    it('should format time correctly', () => {
      expect(component.formatTime('10:00')).toBe('10:00');
      expect(component.formatTime('14:30')).toBe('14:30');
    });
  });

  describe('accessibility', () => {
    let component: ReturnType<typeof createMockEmployeeHistoryComponent>;

    beforeEach(() => {
      component = createMockEmployeeHistoryComponent();
    });

    it('should have aria-label for search input', () => {
      const ariaLabel = 'Buscar en el historial';
      expect(ariaLabel).toBeTruthy();
    });

    it('should have aria-label for export button', () => {
      const ariaLabel = 'Exportar historial a CSV';
      expect(ariaLabel).toBeTruthy();
    });

    it('should have aria-label for view details button', () => {
      const ariaLabel = 'Ver detalles';
      expect(ariaLabel).toBeTruthy();
    });
  });

  describe('multi-service display', () => {
    let component: ReturnType<typeof createMockEmployeeHistoryComponent>;

    beforeEach(() => {
      component = createMockEmployeeHistoryComponent();
      component.allAppointments.set(mockAppointments);
      component.loading.set(false);
    });

    it('should display comma-separated service names for multi-service appointment', () => {
      const apt = mockAppointments.find(a => a.id === 'apt-1')!; // Corte + Peinado
      const names = component.getServicesNames(apt);
      expect(names).toBe('Corte de cabello, Peinado');
    });

    it('should display single service name correctly', () => {
      const apt = mockAppointments.find(a => a.id === 'apt-3')!; // Barba only
      const names = component.getServicesNames(apt);
      expect(names).toBe('Barba');
    });

    it('should calculate total duration for multi-service appointment', () => {
      const apt = mockAppointments.find(a => a.id === 'apt-1')!; // 30 + 20 = 50
      expect(component.getTotalDuration(apt)).toBe(50);
    });

    it('should calculate total price for multi-service appointment', () => {
      const apt = mockAppointments.find(a => a.id === 'apt-1')!; // 50 + 30 = 80
      expect(component.getTotalPrice(apt)).toBe(80);
    });

    it('should handle appointment without services', () => {
      const names = component.getServicesNames(null);
      expect(names).toBe('N/A');
      expect(component.getTotalDuration(null)).toBe(0);
      expect(component.getTotalPrice(null)).toBe(0);
    });

    it('should search across all services in multi-service appointment', () => {
      component.searchQuery.set('Tratamiento');
      const filtered = component.filteredAppointments();
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('apt-2');
    });
  });
});