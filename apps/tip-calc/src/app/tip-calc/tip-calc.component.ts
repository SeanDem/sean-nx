import { Component, computed, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmInputModule } from '@spartan-ng/helm/input';
import { HlmLabelModule } from '@spartan-ng/helm/label';
import { HlmButtonModule } from '@spartan-ng/helm/button';
import { HlmSlider } from '@spartan-ng/helm/slider';

type RoundMode = 'none' | 'up' | 'down' | 'nearest';

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
    CurrencyPipe
  ],
  templateUrl: './tip-calc.component.html'
})
export class TipCalcComponent {
  bill = signal<number>(0);
  tipPercentages = [15, 18, 20, 22, 25, 30] as const;
  selectedPercent = signal<number>(20);
  useCustom = signal(false);
  customPercent = signal<number | null>(null);
  people = signal(1);
  roundMode = signal<RoundMode>('none');

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
    return m === 'up' ? Math.ceil(t) : m === 'down' ? Math.floor(t) : t;
  });

  perPerson = computed(() => this.totalRounded() / Math.max(1, this.people()));

  onBillInput(v: string | number) {
    const n = typeof v === 'number' ? v : Number(v);
    this.bill.set(Number.isFinite(n) ? Math.max(0, n) : 0);
  }

  onCustomInput(v: unknown) {
    const n = typeof v === 'number' ? v : Number(v);
    if (v === '') {
      this.customPercent.set(null);
    } else {
      const pct = Number.isFinite(n) ? Math.max(0, n) : 0;
      this.customPercent.set(pct);
      this.useCustom.set(true);
      this.selectedPercent.set(pct);
    }
  }

  choosePreset(percent: number) {
    this.useCustom.set(false);
    this.selectedPercent.set(percent);
  }

  chooseCustom() {
    this.useCustom.set(true);
    this.selectedPercent.set(this.customPercent() ?? 0);
  }

  changePeople(delta: number) {
    this.people.update(percent => Math.max(1, percent + delta));
  }

  toggleRound(mode: RoundMode) {
    this.roundMode.set(this.roundMode() === mode ? 'none' : mode);
  }

  getAmount(percent: number) {
    return this.bill() * (percent / 100);
  }

  getTotalAmount(percent: number) {
    return this.bill() + this.getAmount(percent);
  }
}
