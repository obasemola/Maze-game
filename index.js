const { Engine, Render, Runner, World, Bodies } = Matter;

const width = 600;
const height = 600;
const cells = 3;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: true,
    width,
    height
  } 
});

Render.run(render);
Runner.run(Runner.create(), engine);

const walls = [
  Bodies.rectangle(width / 2, 0, width, 40, {isStatic: true}),
  Bodies.rectangle(width / 2, height, width, 40, {isStatic: true}),
  Bodies.rectangle(0, height / 2, 40, height, {isStatic: true}),
  Bodies.rectangle(width, height / 2, 40, height, {isStatic: true})
];
World.add(world, walls);

//Maze generation - first the idea is to create an array with a particular dimension and then create another set of arrays inside of it to track and save changes and movement inside the maze. The verticals array tracks movements from side to side and saves walls between cells as False and the connections between cells that have no walls as True.

// Maze generation approach 1
// const grid = []

// for(let i = 0; i < 3; i++){
//   grid.push([]);
//   for(let j = 0; j < 3; j++){
//     grid[i].push(false);

//   }
// }
// console.log(grid);

// Randomize neighboring cells
const shuffle = (arr) => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);

    counter--;

    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  };

  return arr
};

//Maze generation approach 2

const grid = Array(cells)
.fill(null)
.map(() => Array(cells).fill(false));

const verticals = Array(cells)
.fill(null)
.map(() => Array(cells - 1).fill(false));

const horizontals = Array(cells - 1)
.fill(null)
.map(() => Array(cells).fill(false));


const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);


const moveBetweenCells = (row, column) => {
// If we have visited the cell at [row, column], then return
  if (grid[row][column]){
    return;
  }

  // Mark the cell as visited
  grid[row][column] = true;

  // Assemble randomly ordered list of neighbors
  const neighbors = shuffle([
    [row - 1, column, 'up'],
    [row, column + 1, 'right'],
    [row + 1, column, 'down'],
    [row, column - 1, 'left']
  ]);

  // For each neighbor....
  for(let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;

    // See if thr neighbor is our of bounds

    if(
      nextRow < 0 ||
      nextRow >= cells||
      nextColumn < 0 ||
      nextColumn >= cells
      ){
      continue;
    }

    // If we have visited that neighbor, continue to next neighbor
    if(grid[nextRow][nextColumn]){
      continue;
    }
    
    // Remove a wall from either horizontals or verticals
    if(direction === 'left'){
      verticals[row][column - 1] = true;
    } else if (direction === 'right'){
      verticals[row][column] = true;
    } else if(direction === 'up'){
      horizontals[row - 1][column] = true;
    } else if(direction === 'down') {
      horizontals[row][column] = true;
    }

    moveBetweenCells(nextRow, nextColumn);
    
  }
// Visit the next cell
};
moveBetweenCells(startRow, startColumn);




