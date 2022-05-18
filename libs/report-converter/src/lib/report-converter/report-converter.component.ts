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

    files.forEach(file => {
      if (file.fileEntry.isFile) {
        processInputFile(file.fileEntry as FileSystemFileEntry);
      }
    });
  }
}
