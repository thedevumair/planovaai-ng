import { Component } from '@angular/core';
import { TimeDebtService } from '../../services/time-debt.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-time-debt',
  imports: [CommonModule],
  templateUrl: './time-debt.component.html',
  styleUrl: './time-debt.component.scss'
})
export class TimeDebtComponent {

  tasks: any[] = [];

  constructor(private timeDebtService: TimeDebtService) {}

  ngOnInit() {
    this.timeDebtService.getTimeDebt(1).subscribe((res: any) => {
      this.tasks = res;
    });
  }
}
