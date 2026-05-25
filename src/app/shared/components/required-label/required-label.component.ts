import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-required-label',
  template: `{{ label }}<span *ngIf="required" class="required">*</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequiredLabelComponent {
  @Input({ required: true }) label = '';
  @Input() required = true;
}
