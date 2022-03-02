export function solveSudoku(board: string[][]): void {
  solveRecursive(board, 0, { done: false });
}

function getCoordFromIdx(idx: number): number[] {
  const rowIdx = Math.floor(idx / 9);
  const colIdx = idx % 9;
  return [rowIdx, colIdx];
}

function getSubboxIndices(rowIdx: number, colIdx: number): number[][] {
  const subBoxColIdx = Math.floor(colIdx / 3);
  const subBoxRowIdx = Math.floor(rowIdx / 3);
  const subBoxMinColIdx = subBoxColIdx * 3;
  const subBoxMaxColIdx = (subBoxColIdx + 1) * 3 - 1;
  const subBoxMinRowIdx = subBoxRowIdx * 3;
  const subBoxMaxRowIdx = (subBoxRowIdx + 1) * 3 - 1;
  const coords: number[][] = [];
  for (let i = subBoxMinRowIdx; i <= subBoxMaxRowIdx; i++) {
    for (let j = subBoxMinColIdx; j <= subBoxMaxColIdx; j++) {
      coords.push([i, j]);
    }
  }

  return coords;
}

function getOptions(board: string[][], idx: number): string[] {
  const coord = getCoordFromIdx(idx);
  const rowIdx = coord[0];
  const colIdx = coord[1];

  const optionMap: Record<string, boolean> = {};
  for (let i = 1; i <= 9; i++) {
    optionMap[i.toString()] = true;
  }

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

  const subbox = getSubboxIndices(rowIdx, colIdx);
  for (const coord of subbox) {
    const boardVal = board[coord[0]][coord[1]];
    if (boardVal !== '.') {
      optionMap[boardVal] = false;
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

export function solveRecursive(
  board: string[][],
  idx: number,
  state: { done: boolean }
): void {
  const coord = getCoordFromIdx(idx);
  const rowIdx = coord[0];
  const colIdx = coord[1];

  if (idx === board.length * board[0].length) {
    state.done = true;
    return;
  }

  const val = board[rowIdx][colIdx];
  if (val !== '.') solveRecursive(board, idx + 1, state);
  else {
    const options = getOptions(board, idx);
    for (const option of options) {
      board[rowIdx][colIdx] = option;
      solveRecursive(board, idx + 1, state);
      if (state.done) {
        return;
      } else {
        board[rowIdx][colIdx] = '.';
      }
    }
  }
}
