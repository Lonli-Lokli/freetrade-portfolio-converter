import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxFileDropModule } from 'ngx-file-drop';

import { ReportConverterComponent } from './report-converter/report-converter.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, NgxFileDropModule, FormsModule],
  declarations: [ReportConverterComponent],
  exports: [ReportConverterComponent]
})
export class ReportConverterModule {}
