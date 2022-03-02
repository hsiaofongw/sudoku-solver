import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { fromEvent, Subscription } from 'rxjs';
import { solveRecursive, solveSudoku } from './solve';

type CellDatum = {
  content: string;
  editable: boolean;
  type: 'condition' | 'answer';
  rowId: number;
  colId: number;
  id: number;
  backgroundColor?: string;
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
  readonly highlightColor = '#CDD7DD';
  readonly errorHighlightColor = '#FEBDC3';

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

  editingCell: undefined | CellDatum = undefined;
  keyPressSubscription?: Subscription;

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

    const gridData: CellDatum[][] = [];
    for (let sbRowIdx = 0; sbRowIdx <= 2; sbRowIdx++) {
      for (let sbColIdx = 0; sbColIdx <= 2; sbColIdx++) {
        const minRowIdx = sbRowIdx * 3;
        const maxRowIdx = (sbRowIdx+1) * 3 - 1;
        const minColIdx = sbColIdx * 3;
        const maxColIdx = (sbColIdx+1) * 3 - 1;
        const subGrid: CellDatum[] = [];
        for (let i = minRowIdx; i <= maxRowIdx; i++) {
          for (let j = minColIdx; j <= maxColIdx; j++) {
            const cell: CellDatum = {
              content: input[i][j],
              editable: false,
              type: input[i][j] === '.' ? 'answer' : 'condition',
              rowId: i,
              colId: j,
              id: i * 9 + j,
            };
            subGrid.push(cell);
          }
        }
        gridData.push(subGrid);
      }
    }
    this.gridData = gridData;

    this._modeForm.valueChanges.subscribe((formValue) => {
      console.log({change:formValue});
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

  handleEnter(cell: CellDatum): void {
    if (this.editingCell) {
      return;
    }

    this.gridData = this.gridData.map(row => row.map(col => {
      if ((col.colId === cell.colId || col.rowId === cell.rowId) && cell.editable) {
        return { ...col, backgroundColor: this.highlightColor };
      }
      else {
        return { ...col, backgroundColor: 'unset' };
      }
    }));
  }

  handleOut(): void {
    if (this.editingCell) {
      return;
    }

    this.gridData = this.gridData.map(row => row.map(col => {
      return { ...col, backgroundColor: 'unset' };
    }));
  }

  toggleCellEditMode(cell: CellDatum): void {
    console.log({click:cell});
    if (cell.editable) {
      if (this.editingCell) {
        this.editingCell = undefined;
      }
      else {
        this.editingCell = cell;
        this.keyPressSubscription = fromEvent(window, 'keypress').subscribe(event => {
          const kbEvent = event as KeyboardEvent;
          const key: string = kbEvent.key;
          if (key.length === 1 && key.match(/[1-9]/)) {
            this.updateCellContent(cell, key);
          }

          this.editingCell = undefined;
          this.keyPressSubscription?.unsubscribe();
        });
      }
    }
  }

  private updateCellContent(cell: CellDatum, value: string): void {
    this.gridData = this.gridData.map(row => row.map(c => {
      if (c.id === cell.id) {
        return { ...c, content: value };
      }
      else {
        return c;
      }
    }));
  }
}
