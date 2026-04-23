import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingHeaderComponent } from '../../../shared/components/landing-header/landing-header.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, LandingHeaderComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {}
