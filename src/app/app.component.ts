import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { solveRecursive, solveSudoku } from './solve';

type CellDatum = {
  content: string;
  editable: boolean;
  type: 'condition' | 'answer';
};

type Option = {
  label: string;
  value: string;
};

type Mode = 'readOnlyMode' | 'conditionWriteOnlyMode' | 'answerWriteOnlyMode' | 'writeMode';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'sudoku-solver';

  gridData: CellDatum[][] = [];

  modeOptions: Option[] = [
    { label: '查看', value: 'readOnlyMode' },
    { label: '仅条件可编辑', value: 'conditionWriteOnlyMode' },
    { label: '仅答案可编辑', value: 'answerWriteOnlyMode' },
    { label: '条件和答案都可编辑', value: 'writeMode' },
  ];

  readonly defaultMode: Mode = 'readOnlyMode';

  _modeForm = new FormGroup({
    mode: new FormControl('readOnlyMode'),
  });

  ngOnInit(): void {

    const input = [
      ['5', '3', '.', '.', '7', '.', '.', '.', '.'],
      ['6', '.', '.', '1', '9', '5', '.', '.', '.'],
      ['.', '9', '8', '.', '.', '.', '.', '6', '.'],
      ['8', '.', '.', '.', '6', '.', '.', '.', '3'],
      ['4', '.', '.', '8', '.', '3', '.', '.', '1'],
      ['7', '.', '.', '.', '2', '.', '.', '.', '6'],
      ['.', '6', '.', '.', '.', '.', '2', '8', '.'],
      ['.', '.', '.', '4', '1', '9', '.', '.', '5'],
      ['.', '.', '.', '.', '8', '.', '.', '7', '9'],
    ];

    this.gridData = input.map((row) =>
      row.map((char) => ({ content: char, editable: false, type: char === '.' ? 'answer' : 'condition' }))
    );

    this._modeForm.valueChanges.subscribe((formValue) => {
      this._setMode(formValue.mode ?? this.defaultMode);
    });
  }

  private _setMode(mode: Mode): void {
    if (mode === 'readOnlyMode') {
      this.gridData = this.gridData.map(row => row.map(cell => ({ ...cell, editable: false })));
    }
    else if (mode === 'answerWriteOnlyMode') {
      this.gridData = this.gridData.map(row => row.map(cell => ({ ...cell, editable: cell.type === 'answer' })));
    }
    else if (mode === 'conditionWriteOnlyMode') {
      this.gridData = this.gridData.map(row => row.map(cell => ({ ...cell, editable: cell.type === 'condition' })));
    }
    else if (mode === 'writeMode') {
      this.gridData = this.gridData.map(row => row.map(cell => ({ ...cell, editable: true })));
    }
    else { }
  }
}
