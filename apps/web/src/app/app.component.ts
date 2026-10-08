import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="welcome">
      <p class="eyebrow">NỀN TẢNG HỌC TẬP</p>
      <h1>Quản lý lớp học và thi trực tuyến</h1>
      <p class="description">Không gian học tập và kiểm tra dành cho giảng viên và sinh viên.</p>
      <button mat-flat-button type="button">Bắt đầu</button>
    </main>
  `,
  styles: [`
    .welcome { box-sizing: border-box; max-width: 48rem; margin: 12vh auto; padding: 2rem; }
    .eyebrow { color: #2458a6; font-size: .8rem; font-weight: 700; letter-spacing: .12em; }
    h1 { color: #15243b; font-size: clamp(2rem, 6vw, 3.5rem); line-height: 1.1; }
    .description { color: #46566e; font-size: 1.125rem; line-height: 1.6; }
    button { min-height: 48px; min-width: 120px; }
  `],
})
export class AppComponent {}
