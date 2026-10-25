export function calculateSpearmanRho(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  
  // Helper to get ranks handling ties (average rank)
  const getRanks = (arr: number[]) => {
    const sorted = [...arr].map((val, idx) => ({ val, idx })).sort((a, b) => a.val - b.val);
    const ranks = new Array(n).fill(0);
    
    let i = 0;
    while (i < n) {
      let j = i;
      let sumRanks = 0;
      while (j < n && sorted[j].val === sorted[i].val) {
        sumRanks += (j + 1);
        j++;
      }
      const avgRank = sumRanks / (j - i);
      for (let k = i; k < j; k++) {
        ranks[sorted[k].idx] = avgRank;
      }
      i = j;
    }
    return ranks;
  };

  const rankX = getRanks(x);
  const rankY = getRanks(y);

  // Pearson correlation on ranks
  const meanX = rankX.reduce((a, b) => a + b, 0) / n;
  const meanY = rankY.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let sumSqX = 0;
  let sumSqY = 0;

  for (let i = 0; i < n; i++) {
    const dx = rankX[i] - meanX;
    const dy = rankY[i] - meanY;
    numerator += dx * dy;
    sumSqX += dx * dx;
    sumSqY += dy * dy;
  }

  if (sumSqX === 0 || sumSqY === 0) return 0;
  return numerator / Math.sqrt(sumSqX * sumSqY);
}

export function calculatePearsonR(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let sumSqX = 0;
  let sumSqY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    sumSqX += dx * dx;
    sumSqY += dy * dy;
  }

  if (sumSqX === 0 || sumSqY === 0) return 0;
  return numerator / Math.sqrt(sumSqX * sumSqY);
}

