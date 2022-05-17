import { Component, ChangeDetectionStrategy } from '@angular/core';
import { processInputFile } from '@freetrade/converters';
import { NgxFileDropEntry } from 'ngx-file-drop';

@Component({
  selector: 'freetrade-report-converter',
  templateUrl: './report-converter.component.html',
  styleUrls: ['./report-converter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportConverterComponent{

  public dropped(files: NgxFileDropEntry[]) {
    processInputFile(files[0].fileEntry as FileSystemFileEntry);
  }
}
