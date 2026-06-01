(function () {
  const TILES = { GRASS: 0, PATH: 1, BLOCK: 2, START: 3, END: 4 };
  const clone = value => JSON.parse(JSON.stringify(value));

  function createNormalMap() {
    const width = 42, height = 30;
    const tiles = Array.from({ length: height }, () => Array(width).fill(TILES.GRASS));
    const path = [];
    let row = 2, col = 0;
    function add() {
      if (!path.length || path[path.length - 1][0] !== col || path[path.length - 1][1] !== row) path.push([col, row]);
      tiles[row][col] = TILES.PATH;
    }
    for (let i = 0; i < 3; i++) { add(); col++; }
    col--;
    const segments = [
      ['down',6],['right',7],['down',3],['left',8],['down',5],['right',10],['up',4],['right',3],
      ['down',8],['left',6],['down',2],['right',12],['up',7],['left',4],['down',3],['right',5],
      ['up',5],['right',3],['down',6],['left',9],['up',3],['right',4],['down',4],['left',5],
      ['up',6],['right',8],['down',5],['left',3],['down',4],['right',6]
    ];
    for (const [direction, length] of segments) for (let i = 0; i < length; i++) {
      if (direction === 'down') row++; else if (direction === 'up') row--; else if (direction === 'right') col++; else col--;
      row = Math.max(0, Math.min(height - 1, row)); col = Math.max(0, Math.min(width - 1, col)); add();
    }
    for (let i = 0; i < 4 && col < width - 1; i++) { col++; add(); }
    for (let r = 0; r < height; r++) for (let c = 0; c < width; c++) {
      if (tiles[r][c] !== TILES.GRASS) continue;
      let adjacent = false;
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]) {
        if (tiles[r + dr]?.[c + dc] === TILES.PATH) { adjacent = true; break; }
      }
      if (!adjacent && ((c * 928371 + r * 364479 + 918273) % 1000) / 1000 < 0.25) tiles[r][c] = TILES.BLOCK;
    }
    const [startCol, startRow] = path[0], [endCol, endRow] = path[path.length - 1];
    tiles[startRow][startCol] = TILES.START; tiles[endRow][endCol] = TILES.END;
    return { name: 'Normal Game', width, height, tiles, path, cameraStart: { col: startCol, row: startRow } };
  }

  const gameValues = {
    tileSize: 48, waves: 50, enemiesPerWave: 6, enemiesPerWaveGrowth: 1.4,
    startingGold: 500, startingLives: 25, baseSpawnDelay: 45, minimumSpawnDelay: 10,
    spawnDelayReduction: 0.65, roundGoldBase: 25, roundGoldGrowth: 5,
    speedBase: 1, speedGrowth: 0.025
  };
  window.NimTD = { ...(window.NimTD || {}), TILES, clone, createNormalMap, gameValues };
})();
