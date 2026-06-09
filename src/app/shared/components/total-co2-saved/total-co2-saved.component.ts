import {Component, input} from '@angular/core';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-total-co2-saved',
  imports: [
    MatTooltip
  ],
  templateUrl: './total-co2-saved.component.html',
  styleUrl: './total-co2-saved.component.scss'
})
export class TotalCo2SavedComponent {

  amountSign = input<string>("");
  totalAmount = input<string>("0");
  description = input<string>("");
  tooltipText = input<string>("");

}
