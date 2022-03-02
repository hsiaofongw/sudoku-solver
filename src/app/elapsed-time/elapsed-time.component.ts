import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-elapsed-time',
  templateUrl: './elapsed-time.component.html',
  styleUrls: ['./elapsed-time.component.scss']
})
export class ElapsedTimeComponent implements OnInit {
  @Input()
  elapsedMs: number = 0;

  years: number = 0;
  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.years = (Math.floor(this.elapsedMs / (365 * 24 * 60 * 60 * 1000)));
    this.days = (Math.floor(this.elapsedMs / (24 * 60 * 60 * 1000))) % 365;
    this.hours = (Math.floor(this.elapsedMs / (60 * 60 * 1000))) % 24;
    this.minutes = (Math.floor(this.elapsedMs / (60 * 1000))) % 60;
    this.seconds = (Math.floor(this.elapsedMs / 1000)) % 60;
  }

}
