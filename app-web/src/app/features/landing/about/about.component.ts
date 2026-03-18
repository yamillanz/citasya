import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { PanelModule } from 'primeng/panel';
import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, CardModule, DividerModule, AvatarModule, PanelModule, TimelineModule, TagModule],
  templateUrl: './about.component.html'
})
export class AboutComponent {}
