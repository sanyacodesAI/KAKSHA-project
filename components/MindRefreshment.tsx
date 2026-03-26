
import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, Check, Lightbulb, Trash2, Brain } from 'lucide-react';

// Sudoku Generator & Solver Logic
const isValid = (grid: number[][], row: number, col: number, num: number) => {
  for (let x = 0; x < 9; x++) if (grid[row][x] === num) return false;
  for (let x = 0; x < 9; x++) if (grid[x][col] === num) return false;
  let startRow = row - (row % 3), startCol = col - (col % 3);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (grid[i + startRow][j + startCol] === num) return false;
  return true;
};

const solveSudoku = (grid: number[][]) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudoku(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

const generateSudoku = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
  const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  // Fill diagonal 3x3 boxes
  for (let i = 0; i < 9; i += 3) {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        let num;
        do { num = Math.floor(Math.random() * 9) + 1; }
        while (!isValid(grid, i + row, i + col, num));
        grid[i + row][i + col] = num;
      }
    }
  }
  solveSudoku(grid);
  const solution = grid.map(row => [...row]);
  
  // Remove numbers based on difficulty
  const attempts = difficulty === 'Easy' ? 30 : difficulty === 'Medium' ? 45 : 55;
  const puzzle = grid.map(row => [...row]);
  let count = attempts;
  while (count > 0) {
    let row = Math.floor(Math.random() * 9);
    let col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      count--;
    }
  }
  return { puzzle, solution };
};

const MindRefreshment: React.FC = () => {
  const [grid, setGrid] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [initial, setInitial] = useState<boolean[][]>([]);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [mistakes, setMistakes] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const startNewGame = useCallback((level: 'Easy' | 'Medium' | 'Hard' = difficulty) => {
    const { puzzle, solution } = generateSudoku(level);
    setGrid(puzzle);
    setSolution(solution);
    setInitial(puzzle.map(row => row.map(cell => cell !== 0)));
    setDifficulty(level);
    setMistakes(0);
    setIsWon(false);
    setSelected(null);
  }, [difficulty]);

  useEffect(() => {
    startNewGame();
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (initial[row][col]) {
        setSelected([row, col]);
        return;
    }
    setSelected([row, col]);
  };

  const handleInput = (num: number) => {
    if (!selected || isWon) return;
    const [r, c] = selected;
    if (initial[r][c]) return;

    if (solution[r][c] === num) {
      const newGrid = grid.map(row => [...row]);
      newGrid[r][c] = num;
      setGrid(newGrid);
      
      // Check Win
      if (newGrid.every((row, ri) => row.every((cell, ci) => cell === solution[ri][ci]))) {
        setIsWon(true);
      }
    } else {
      setMistakes(m => m + 1);
      // Optional: Add visual shake or red highlight
    }
  };

  const clearCell = () => {
    if (!selected || isWon) return;
    const [r, c] = selected;
    if (initial[r][c]) return;
    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = 0;
    setGrid(newGrid);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center gap-8 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
            <Brain size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-blue-900">Sudoku Refresh</h2>
            <div className="flex gap-2 mt-1">
              {(['Easy', 'Medium', 'Hard'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => startNewGame(level)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all
                    ${difficulty === level ? 'bg-indigo-600 text-white' : 'bg-blue-50 text-blue-400 hover:bg-blue-100'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Mistakes</p>
            <p className={`text-xl font-black ${mistakes >= 3 ? 'text-red-500' : 'text-blue-900'}`}>{mistakes}/3</p>
          </div>
          <button 
            onClick={() => startNewGame()}
            className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
        {/* Sudoku Grid */}
        <div className="bg-blue-900 p-1.5 rounded-xl shadow-2xl border-4 border-blue-800">
          <div className="grid grid-cols-9 gap-0.5 bg-blue-200">
            {grid.map((row, ri) => (
              row.map((cell, ci) => {
                const isSelected = selected?.[0] === ri && selected?.[1] === ci;
                const isSameSubgrid = selected && 
                    Math.floor(ri / 3) === Math.floor(selected[0] / 3) && 
                    Math.floor(ci / 3) === Math.floor(selected[1] / 3);
                const isSameLine = selected && (ri === selected[0] || ci === selected[1]);
                const isInitial = initial[ri][ci];
                const isWrong = mistakes > 0 && !isWon && isSelected; // Simplified mistake logic

                return (
                  <div
                    key={`${ri}-${ci}`}
                    onClick={() => handleCellClick(ri, ci)}
                    className={`w-10 h-10 md:w-14 md:h-14 flex items-center justify-center text-xl font-bold cursor-pointer transition-colors
                      ${(ri + 1) % 3 === 0 && ri < 8 ? 'border-b-2 border-blue-900' : ''}
                      ${(ci + 1) % 3 === 0 && ci < 8 ? 'border-r-2 border-blue-900' : ''}
                      ${isSelected ? 'bg-indigo-500 text-white' : 
                        isSameSubgrid || isSameLine ? 'bg-blue-50 text-blue-900' : 'bg-white text-blue-900'}
                      ${isInitial ? 'font-black' : 'font-medium text-indigo-600'}
                    `}
                  >
                    {cell !== 0 ? cell : ''}
                  </div>
                );
              })
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 w-full max-w-[320px]">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handleInput(num)}
                className="h-16 bg-white border border-blue-100 rounded-2xl text-2xl font-black text-indigo-600 hover:bg-indigo-600 hover:text-white hover:scale-105 transition-all shadow-sm active:scale-95"
              >
                {num}
              </button>
            ))}
          </div>
          
          <div className="flex gap-3 mt-2">
            <button 
              onClick={clearCell}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-colors"
            >
              <Trash2 size={20} /> Clear
            </button>
            <button 
              onClick={() => {
                if(selected) {
                    const [r, c] = selected;
                    handleInput(solution[r][c]);
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-amber-50 text-amber-600 rounded-2xl font-bold hover:bg-amber-100 transition-colors"
            >
              <Lightbulb size={20} /> Hint
            </button>
          </div>
        </div>
      </div>

      {/* Win Modal */}
      {isWon && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-blue-900/60 backdrop-blur-md">
           <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center border-8 border-indigo-100">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy size={48} />
              </div>
              <h3 className="text-3xl font-black text-blue-900 mb-2">Mind Refreshed!</h3>
              <p className="text-blue-500 font-medium mb-8">Great job on the {difficulty} puzzle. Your brain is ready for more studying!</p>
              <button 
                onClick={() => startNewGame()}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                <Check size={24} /> Play Again
              </button>
           </div>
        </div>
      )}

      {/* Tutorial/Context */}
      <p className="text-blue-400 text-sm font-medium italic opacity-70">
        Studying is hard work. Take a break to boost your pattern recognition and focus.
      </p>
    </div>
  );
};

export default MindRefreshment;
