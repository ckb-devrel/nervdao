import { Cell } from '@ckb-lumos/base';

export type CellWithType = Cell & { type: 'deposit' | 'withdraw' };

export function sortCells(cells: CellWithType[]): CellWithType[] {
  return cells.sort((a, b) => {
    const blockNumberA = a.blockNumber ? parseInt(a.blockNumber, 16) : 0;
    const blockNumberB = b.blockNumber ? parseInt(b.blockNumber, 16) : 0;
    return blockNumberB - blockNumberA;
  });
}

export function addTypeToCell(cell: Cell, type: 'deposit' | 'withdraw'): CellWithType {
  return { ...cell, type };
}
