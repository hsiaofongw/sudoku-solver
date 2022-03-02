import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SudokuComponent } from './sudoku/sudoku.component';
import { EntryComponent } from './entry/entry.component';
import { ElapsedTimeComponent } from './elapsed-time/elapsed-time.component';

@NgModule({
  declarations: [
    AppComponent,
    SudokuComponent,
    EntryComponent,
    ElapsedTimeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
