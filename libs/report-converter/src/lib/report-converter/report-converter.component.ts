import { Component, ChangeDetectionStrategy } from '@angular/core';
import { processInputFile } from '@freetrade/converters';
import { Choice } from 'fp-ts/lib/Reader';
import { NgxFileDropEntry } from 'ngx-file-drop';

type Choice = 'ISA' | 'GIA';
type Option = {
  optionId: Choice;
  text: string;
}
@Component({
  selector: 'freetrade-report-converter',
  templateUrl: './report-converter.component.html',
  styleUrls: ['./report-converter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportConverterComponent {
  public options: Option[];
  public selectedOption: Choice;

  constructor() {
    this.options = [
      {
        optionId: 'GIA',
        text: 'GIA report',
      },
      {
        optionId: 'ISA',
        text: 'ISA report',
      },
    ];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.selectedOption = this.options[1]!.optionId;
  }

  public dropped(files: NgxFileDropEntry[]) {
    files.forEach((file) => {
      if (file.fileEntry.isFile) {
        processInputFile({
          entry: file.fileEntry as FileSystemFileEntry,
          reportType: this.selectedOption,
        });
      }
    });
  }
}
