import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReportConverterModule } from '@freetrade/report-converter';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, ReportConverterModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
