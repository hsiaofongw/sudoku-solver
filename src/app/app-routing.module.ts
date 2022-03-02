import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntryComponent } from './entry/entry.component';
import { SudokuComponent } from './sudoku/sudoku.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'entry',
  },
  {
    path: 'entry',
    component: EntryComponent,
  },
  {
    path: 'sudoku',
    component: SudokuComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
