import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxFileDropModule } from 'ngx-file-drop';

import { ReportConverterComponent } from './report-converter/report-converter.component';

@NgModule({
  imports: [CommonModule, NgxFileDropModule],
  declarations: [ReportConverterComponent],
  exports: [ReportConverterComponent]
})
export class ReportConverterModule {}
