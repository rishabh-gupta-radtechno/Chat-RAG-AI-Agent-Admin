import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'istDate' })
export class IstDatePipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(value: string | Date | null | undefined, format = 'dd-MMM-yyyy HH:mm'): string {
    return value ? this.datePipe.transform(value, format, 'IST') ?? '' : '';
  }
}
