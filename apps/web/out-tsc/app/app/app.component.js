import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
export class AppComponent {
    static { this.ɵfac = function AppComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AppComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AppComponent, selectors: [["app-root"]], decls: 9, vars: 0, consts: [[1, "welcome"], [1, "eyebrow"], [1, "description"], ["mat-flat-button", "", "type", "button"]], template: function AppComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "main", 0)(1, "p", 1);
            i0.ɵɵtext(2, "N\u1EC0N T\u1EA2NG H\u1ECCC T\u1EACP");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "h1");
            i0.ɵɵtext(4, "Qu\u1EA3n l\u00FD l\u1EDBp h\u1ECDc v\u00E0 thi tr\u1EF1c tuy\u1EBFn");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "p", 2);
            i0.ɵɵtext(6, "Kh\u00F4ng gian h\u1ECDc t\u1EADp v\u00E0 ki\u1EC3m tra d\u00E0nh cho gi\u1EA3ng vi\u00EAn v\u00E0 sinh vi\u00EAn.");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "button", 3);
            i0.ɵɵtext(8, "B\u1EAFt \u0111\u1EA7u");
            i0.ɵɵelementEnd()();
        } }, dependencies: [MatButtonModule, i1.MatButton], styles: [".welcome[_ngcontent-%COMP%] { box-sizing: border-box; max-width: 48rem; margin: 12vh auto; padding: 2rem; }\n    .eyebrow[_ngcontent-%COMP%] { color: #2458a6; font-size: .8rem; font-weight: 700; letter-spacing: .12em; }\n    h1[_ngcontent-%COMP%] { color: #15243b; font-size: clamp(2rem, 6vw, 3.5rem); line-height: 1.1; }\n    .description[_ngcontent-%COMP%] { color: #46566e; font-size: 1.125rem; line-height: 1.6; }\n    button[_ngcontent-%COMP%] { min-height: 48px; min-width: 120px; }"] }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AppComponent, [{
        type: Component,
        args: [{ selector: 'app-root', standalone: true, imports: [MatButtonModule], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <main class="welcome">
      <p class="eyebrow">NỀN TẢNG HỌC TẬP</p>
      <h1>Quản lý lớp học và thi trực tuyến</h1>
      <p class="description">Không gian học tập và kiểm tra dành cho giảng viên và sinh viên.</p>
      <button mat-flat-button type="button">Bắt đầu</button>
    </main>
  `, styles: ["\n    .welcome { box-sizing: border-box; max-width: 48rem; margin: 12vh auto; padding: 2rem; }\n    .eyebrow { color: #2458a6; font-size: .8rem; font-weight: 700; letter-spacing: .12em; }\n    h1 { color: #15243b; font-size: clamp(2rem, 6vw, 3.5rem); line-height: 1.1; }\n    .description { color: #46566e; font-size: 1.125rem; line-height: 1.6; }\n    button { min-height: 48px; min-width: 120px; }\n  "] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AppComponent, { className: "AppComponent", filePath: "app/app.component.ts", lineNumber: 25 }); })();
