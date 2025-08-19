import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TipCalcComponent } from './tip-calc/tip-calc.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TipCalcComponent],
  template: `
    <div class="h-full w-full">
      <tip-calc />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'h-full',
  },
})
export class AppComponent {}
