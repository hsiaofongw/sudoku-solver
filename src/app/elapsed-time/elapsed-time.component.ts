import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-elapsed-time',
  templateUrl: './elapsed-time.component.html',
  styleUrls: ['./elapsed-time.component.scss']
})
export class ElapsedTimeComponent implements OnInit {
  @Input()
  elapsedMs: number = 0;

  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.hours = this.elapsedMs / (60 * 60 * 1000);
    this.minutes = this.elapsedMs / (60 * 1000);
    this.seconds = this.elapsedMs / 1000;
  }

}
