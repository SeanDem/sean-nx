import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmInputModule } from '@spartan-ng/helm/input';
import { HlmLabelModule } from '@spartan-ng/helm/label';

interface Tip {
  percentage: number;
  amount: number;
  total: number;
}

@Component({
  selector: 'tip-calc',
  standalone: true,
  imports: [CommonModule, FormsModule, HlmInputModule, HlmLabelModule, CurrencyPipe],
  templateUrl: './tip-calc.component.html'
})
export class TipCalcComponent {
  billAmount: number | null = null;
  tipPercentages = [15, 18, 20, 25, 30];
  tips: Tip[] = [];

  constructor() {
    this.calculateTips();
  }

  onBillAmountChange(): void {
    this.calculateTips();
  }

  private calculateTips(): void {
    const bill = this.billAmount ?? 0;
    this.tips = this.tipPercentages.map((percentage) => {
      const tipAmount = bill * (percentage / 100);
      const totalAmount = bill + tipAmount;
      return {
        percentage,
        amount: tipAmount,
        total: totalAmount
      };
    });
  }
}
