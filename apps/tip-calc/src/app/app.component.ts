import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TipCalcComponent } from './tip-calc/tip-calc.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TipCalcComponent],
  template: `
    <app-tip-calc /> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
}
