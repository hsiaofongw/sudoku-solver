import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SudokuComponent } from './sudoku/sudoku.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/sudoku'
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
