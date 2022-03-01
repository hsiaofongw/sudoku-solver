/**
 Do not return anything, modify board in-place instead.
 */
 function solveSudoku(board: string[][]): void {
  solveRecursive(board, 0);
};

function getCoordFromIdx(idx: number): number[] {
  const rowIdx = Math.floor(idx / 9)
  const colIdx = Math.floor(idx % 9);
  return [rowIdx, colIdx];
}


function getOptions(board: string[][], idx: number): string[] {
  const optionMap: Record<string, boolean> = {};
  for (let i = 0; i < 0; i++) {
      optionMap[i.toString()] = true;
  }
  
  const coord = getCoordFromIdx(idx);
  const rowIdx = coord[0];
  const colIdx = coord[1];
  for (let i = 0; i < 9; i++) {
      if (board[i][colIdx] !== '.') {
          optionMap[board[i][colIdx]] = false;
      }
  }
  
  for (let j = 0; j < 9; j++) {
      if (board[rowIdx][j] !== '.') {
          optionMap[board[rowIdx][j]] = false;
      }
  }
  
  const subBoxColIdx = Math.floor(colIdx / 3);
  const subBoxRowIdx = Math.floor(rowIdx / 3);
  const subBoxMinColIdx = subBoxColIdx * 3;
  const subBoxMaxColIdx = (subBoxColIdx + 1) * 3 - 1;
  const subBoxMinRowIdx = subBoxRowIdx * 3;
  const subBoxMaxRowIdx = (subBoxRowIdx + 1) * 3 - 1;
  for (let i = subBoxMinRowIdx; i <= subBoxMaxRowIdx; i++) {
      for (let j = subBoxMinColIdx; j <= subBoxMaxColIdx; j++) {
          if (board[i][j] !== '.') {
              optionMap[board[i][j]] = false;
          }
      }
  }
  
  const options: string[] = [];
  for (const key in optionMap) {
      if (optionMap[key]) {
          options.push(key);
      }
  }
  
  return options;
}

function solveRecursive(board: string[][], idx: number): boolean {
  if (idx === 81) {
      return true;
  }
  
  const coord = getCoordFromIdx(idx);
  const rowIdx = coord[0];
  const colIdx = coord[1];
  const val = board[rowIdx][colIdx];
  if (val !== '.') {
      return solveRecursive(board, idx+1);
  }
  else {
      const options = getOptions(board, idx);
      if (options.length === 0) {
          board[rowIdx][colIdx] = '.';
          return false;
      }
      for (const option of options) {
          board[rowIdx][colIdx] = option;
          if (solveRecursive(board, idx+1)) {
              return true;
          }
          else {
              board[rowIdx][colIdx] = '.';
          }
      }
      return false;
  }
}
