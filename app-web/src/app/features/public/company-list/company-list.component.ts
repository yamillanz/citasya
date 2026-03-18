import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Avatar } from 'primeng/avatar';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Message } from 'primeng/message';
import { CompanyService } from '../../../core/services/company.service';
import { Company } from '../../../core/models/company.model';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    Button,
    Card,
    Avatar,
    ProgressSpinner,
    Message
  ],
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss']
})
export class CompanyListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private companyService = inject(CompanyService);
  private userService = inject(UserService);

  company: Company | null = null;
  employees: User[] = [];
  loading = true;
  error = '';

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('companySlug');
    if (!slug) {
      this.error = 'Empresa no encontrada';
      this.loading = false;
      return;
    }

    this.company = await this.companyService.getBySlug(slug);
    if (!this.company) {
      this.error = 'Empresa no encontrada';
      this.loading = false;
      return;
    }

    this.employees = await this.userService.getEmployeesByCompany(this.company.id);
    this.loading = false;
  }
}
