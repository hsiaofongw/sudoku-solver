import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEvent, interval, Subscription } from 'rxjs';
import { solveSudoku } from '../solve';

type CellDatum = {
  content: string;
  editable: boolean;
  type: 'condition' | 'answer';
  rowId: number;
  colId: number;
  subboxId: number;
  id: number;
  backgroundColor?: string;
  error?: boolean;
};

type Option = {
  label: string;
  value: string;
};

type Mode =
  | 'readOnlyMode'
  | 'conditionWriteOnlyMode'
  | 'answerWriteOnlyMode'
  | 'writeMode';

type SubboxCoord = {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
};
@Component({
  selector: 'app-sudoku',
  templateUrl: './sudoku.component.html',
  styleUrls: ['./sudoku.component.scss'],
})
export class SudokuComponent {
  readonly highlightColor = '#CDD7DD';
  readonly errorHighlightColor = '#FEBDC3';
  readonly defaultSettings = [
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

  private currentSetting = '';

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

  statErrorCount = 0;
  statFillCount = 0;
  statEmptyCount = 0;
  statTotalCount = 0;
  statSuccess = false;
  statStartTime: number = 0;
  elapsedMs: number = 0;

  constructor(private route: ActivatedRoute, private router: Router, private location: Location) {}

  /** 返回每个 sb 的 minRow, maxRow, minCol, maxCol,  */
  private getSubboxArrangement(): SubboxCoord[] {
    const sbCoords: SubboxCoord[] = [];

    for (let sbRowIdx = 0; sbRowIdx <= 2; sbRowIdx++) {
      for (let sbColIdx = 0; sbColIdx <= 2; sbColIdx++) {
        const minRowIdx = sbRowIdx * 3;
        const maxRowIdx = (sbRowIdx + 1) * 3 - 1;
        const minColIdx = sbColIdx * 3;
        const maxColIdx = (sbColIdx + 1) * 3 - 1;
        sbCoords.push({
          minRow: minRowIdx,
          maxRow: maxRowIdx,
          minCol: minColIdx,
          maxCol: maxColIdx,
        });
      }
    }

    return sbCoords;
  }

  ngOnInit(): void {
    interval(1000).subscribe(() => {
      if (this.statEmptyCount === 0) {
        return;
      }

      const now = new Date();
      this.elapsedMs = now.valueOf() - this.statStartTime;
    });

    const sbCoords = this.getSubboxArrangement();
    const emptyGridData: CellDatum[][] = [];
    for (const sb of sbCoords) {
      const subGrid: CellDatum[] = [];
      emptyGridData.push(subGrid);
      for (let i = sb.minRow; i <= sb.maxRow; i++) {
        for (let j = sb.minCol; j <= sb.maxCol; j++) {
          subGrid.push({
            content: '.',
            editable: false,
            type: 'answer',
            rowId: i,
            colId: j,
            id: i * 9 + j,
            subboxId: emptyGridData.length,
          });
        }
      }
    }
    this.gridData = emptyGridData;

    this._modeForm.valueChanges.subscribe((formValue) => {
      this._setMode(formValue.mode ?? this.defaultMode);
    });

    this.route.queryParams.subscribe((queryParams) => {
      const now = new Date();
      this.statStartTime = now.valueOf();
      this.currentSetting = queryParams['setting'];
      this.loadFromURLParam(queryParams['setting']);
    });
  }

  private loadFromURLParam(setting: string): void {
    try {
      const parsedInput = JSON.parse(setting);
      const purifiedInput = this.purifyInput(parsedInput);
      this.loadGrid(purifiedInput);
    } catch (error) {
      console.error(error);
    }
  }

  private purifyInput(input: string[][]): string[][] {
    const result: string[][] = [];
    for (let i = 0; i < 9; i++) {
      const row: string[] = [];
      result.push(row);
      for (let j = 0; j < 9; j++) {
        let cell = '.';
        if (input[i]) {
          if (input[i][j]) {
            const inputCell = input[i][j];
            if (typeof inputCell === 'string') {
              if (inputCell.match(/\d/) && inputCell.length === 1) {
                cell = inputCell;
              }
            }
          }
        }

        row.push(cell);
      }
    }

    return result;
  }

  private loadGrid(input: string[][]): void {
    const gridData: CellDatum[][] = [];
    const sbCoords = this.getSubboxArrangement();
    for (const sbCoord of sbCoords) {
      const { minRow, maxRow, minCol, maxCol } = sbCoord;
      const subGrid: CellDatum[] = [];
      for (let i = minRow; i <= maxRow; i++) {
        for (let j = minCol; j <= maxCol; j++) {
          const cell: CellDatum = {
            content: input[i][j],
            editable: false,
            type: input[i][j] === '.' ? 'answer' : 'condition',
            rowId: i,
            colId: j,
            id: i * 9 + j,
            subboxId: gridData.length,
          };
          subGrid.push(cell);
        }
      }
      gridData.push(subGrid);
    }
    this.gridData = gridData;
    this.checkError();
  }

  private _setMode(mode: Mode): void {
    if (mode === 'readOnlyMode') {
      this.gridData = this.gridData.map((row) =>
        row.map((cell) => ({ ...cell, editable: false }))
      );
    } else if (mode === 'answerWriteOnlyMode') {
      this.gridData = this.gridData.map((row) =>
        row.map((cell) => ({ ...cell, editable: cell.type === 'answer' }))
      );
    } else if (mode === 'conditionWriteOnlyMode') {
      this.gridData = this.gridData.map((row) =>
        row.map((cell) => ({ ...cell, editable: cell.type === 'condition' }))
      );
    } else if (mode === 'writeMode') {
      this.gridData = this.gridData.map((row) =>
        row.map((cell) => ({ ...cell, editable: true }))
      );
    } else {
    }
  }

  handleEnter(cell: CellDatum): void {
    if (this.editingCell) {
      return;
    }

    this.gridData = this.gridData.map((row) =>
      row.map((col) => {
        if (
          (col.colId === cell.colId || col.rowId === cell.rowId) &&
          cell.editable
        ) {
          return { ...col, backgroundColor: this.highlightColor };
        } else {
          return { ...col, backgroundColor: 'unset' };
        }
      })
    );
  }

  handleOut(): void {
    if (this.editingCell) {
      return;
    }

    this.gridData = this.gridData.map((row) =>
      row.map((col) => {
        return { ...col, backgroundColor: 'unset' };
      })
    );
  }

  toggleCellEditMode(cell: CellDatum): void {
    if (cell.editable) {
      if (this.editingCell) {
        this.editingCell = undefined;
      } else {
        this.editingCell = cell;
        this.keyPressSubscription = fromEvent(window, 'keypress').subscribe(
          (event) => {
            const kbEvent = event as KeyboardEvent;
            const key: string = kbEvent.key;
            if (key.length === 1 && key.match(/[1-9]/)) {
              this.updateCellContent(cell, key);
            }

            this.editingCell = undefined;
            this.keyPressSubscription?.unsubscribe();
          }
        );
      }
    }
  }

  private updateCellContent(cell: CellDatum, value: string): void {
    this.gridData = this.gridData.map((sb) =>
      sb.map((c) => {
        if (c.id === cell.id) {
          return { ...c, content: value };
        } else {
          return c;
        }
      })
    );

    this.checkError();
  }

  private checkError(): void {
    const flatten: CellDatum[] = [];
    for (const sb of this.gridData) {
      for (const cell of sb) {
        flatten.push({ ...cell, error: false });
      }
    }

    flatten.sort((a, b) => {
      if (a.rowId < b.rowId) {
        return -1;
      } else if (a.rowId === b.rowId) {
        return a.colId - b.colId;
      } else {
        return 1;
      }
    });

    const newGrid: CellDatum[][] = [];
    for (let i = 0; i < 9; i++) {
      newGrid.push([]);
      for (let j = 0; j < 9; j++) {
        const cell = flatten[i * 9 + j];
        newGrid[newGrid.length - 1].push(cell);
      }
    }

    // 按行查错
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const cell = newGrid[i][j];
        let conflict = false;
        for (let colId = 0; colId < 9; colId++) {
          const compareCell = newGrid[i][colId];
          if (
            cell.content === compareCell.content &&
            cell.content !== '' &&
            cell.content !== '.' &&
            cell.id !== compareCell.id
          ) {
            compareCell.error = true;
            conflict = true;
          }
        }

        if (conflict) {
          cell.error = true;
          break;
        }
      }
    }

    // 按列查错
    for (let j = 0; j < 9; j++) {
      for (let i = 0; i < 9; i++) {
        const cell = newGrid[i][j];
        let conflict = false;
        for (let rowId = 0; rowId < 9; rowId++) {
          const compareCell = newGrid[rowId][j];
          if (
            cell.content === compareCell.content &&
            cell.content !== '' &&
            cell.content !== '.' &&
            cell.id !== compareCell.id
          ) {
            compareCell.error = true;
            conflict = true;
          }
        }

        if (conflict) {
          cell.error = true;
          break;
        }
      }
    }

    // 按子 box 查错
    const sbCoords = this.getSubboxArrangement();
    for (const sb of sbCoords) {
      const { minRow, maxRow, minCol, maxCol } = sb;
      for (let i = minRow; i <= maxRow; i++) {
        for (let j = minCol; j <= maxCol; j++) {
          const cell = newGrid[i][j];
          let conflict = false;
          for (let i1 = minRow; i1 <= maxRow; i1++) {
            for (let i2 = minCol; i2 <= maxCol; i2++) {
              const compareCell = newGrid[i1][i2];
              if (
                compareCell.content === cell.content &&
                cell.content !== '' &&
                cell.content !== '.' &&
                cell.id !== compareCell.id
              ) {
                compareCell.error = true;
                conflict = true;
              }
            }
          }

          if (conflict) {
            cell.error = true;
            break;
          }
        }
      }
    }

    // 更新
    const newSubboxGrids: CellDatum[][] = [];
    for (const coord of sbCoords) {
      newSubboxGrids.push([]);
      for (let row = coord.minRow; row <= coord.maxRow; row++) {
        for (let col = coord.minCol; col <= coord.maxCol; col++) {
          newSubboxGrids[newSubboxGrids.length - 1].push(newGrid[row][col]);
        }
      }
    }

    this.gridData = newSubboxGrids;
    this.updateStat();
  }

  private updateStat(): void {
    let errorCount = 0;
    let fillCount = 0;
    let emptyCount = 0;
    let totalCount = 0;
    let succeeded = false;
    for (const sb of this.gridData) {
      for (const cell of sb) {
        totalCount = totalCount + 1;
        if (cell.error) {
          errorCount = errorCount + 1;
        }

        if (cell.content.match(/\d/) && cell.content.length === 1) {
          fillCount = fillCount + 1;
        } else {
          emptyCount = emptyCount + 1;
        }
      }
    }
    if (emptyCount === 0) {
      succeeded = true;
    }

    this.statTotalCount = totalCount;
    this.statEmptyCount = emptyCount;
    this.statErrorCount = errorCount;
    this.statFillCount = fillCount;
    this.statSuccess = succeeded;
  }

  reset(): void {
    this.loadFromURLParam(this.currentSetting);
  }

  solve(): void {
    const boardData: string[][] = [];
    for (let i = 0; i < 9; i++) {
      const row: string[] = [];
        boardData.push(row);
      for (let j = 0; j < 9; j++) {
        row.push('.');
      }
    }

    for (const sb of this.gridData) {
      for (const cell of sb) {
        boardData[cell.rowId][cell.colId] = cell.content;
      }
    }

    solveSudoku(boardData);

    for (const sb of this.gridData) {
      for (const cell of sb) {
        this.updateCellContent(cell, boardData[cell.rowId][cell.colId]);
      }
    }

  }
}
