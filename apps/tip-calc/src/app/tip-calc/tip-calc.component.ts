import { Component, computed, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmInputModule } from '@spartan-ng/helm/input';
import { HlmLabelModule } from '@spartan-ng/helm/label';
import { HlmButtonModule } from '@spartan-ng/helm/button';
import { HlmSlider } from '@spartan-ng/helm/slider';
import { HlmRadioGroupModule } from '@spartan-ng/helm/radio-group';
import { HlmToggleModule } from '@spartan-ng/helm/toggle';
import { HlmToggleGroupModule } from '@spartan-ng/helm/toggle-group';

type RoundMode = 'up' | 'down' | 'nearest';

@Component({
  selector: 'app-tip-calc',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmInputModule,
    HlmLabelModule,
    HlmButtonModule,
    HlmSlider,
    CurrencyPipe,
    HlmRadioGroupModule,
    HlmToggleModule,
    HlmToggleGroupModule,
  ],
  templateUrl: './tip-calc.component.html',
})
export class TipCalcComponent {
  roundModes: RoundMode[] = ['up', 'nearest', 'down'];
  bill = signal<number | null>(null);
  tipPercentages = [10, 15, 20, 25, 30] as const;
  selectedPercent = signal<number>(20);
  useCustom = signal(false);
  customPercent = signal<number>(25);
  people = signal(1);
  roundMode = signal<RoundMode | null>(null);
  tipPerPerson = computed(() => this.selectedTipAmount() / Math.max(1, this.people()));
  selectedTipAmount = computed(() => {
    const b = this.bill() ?? 0;
    const pct = this.useCustom() ? (this.customPercent() ?? 0) : this.selectedPercent();
    return b * (Math.max(0, pct) / 100);
  });
  subtotal = computed(() => this.bill() ?? 0);

  total = computed(() => this.subtotal() + this.selectedTipAmount());

  totalRounded = computed(() => {
    const t = this.total();
    const m = this.roundMode();
    if (m === 'up') {
      return Math.ceil(t);
    } else if (m === 'down') {
      return Math.floor(t);
    } else if (m === 'nearest') {
      return Math.round(t);
    } else {
      return t;
    }
  });

  perPerson = computed(() => this.totalRounded() / Math.max(1, this.people()));

  onBillInput(v: string | number) {
    const n = typeof v === 'number' ? v : Number(v);
    this.bill.set(Number.isFinite(n) ? Math.max(0, n) : 0);
  }

  onCustomInput(v: unknown) {
    const n = typeof v === 'number' ? v : Number(v);
    if (v === '') {
      this.customPercent.set(0);
    } else {
      const pct = Number.isFinite(n) ? Math.max(0, n) : 0;
      this.customPercent.set(pct);
      this.useCustom.set(true);
      this.selectedPercent.set(pct);
    }
  }

  choosePreset(percent: unknown) {
    this.useCustom.set(false);
    this.selectedPercent.set(percent as number);
  }

  chooseCustom() {
    this.useCustom.set(true);
    this.selectedPercent.set(this.customPercent() ?? 0);
  }

  changePeople(delta: number) {
    this.people.update((percent) => Math.max(1, percent + delta));
  }

  setRoundMode(mode: unknown) {
    if (mode === this.roundMode()) {
      mode = null;
    }
    this.roundMode.set(mode as RoundMode);
  }

  protected readonly console = console;
}
