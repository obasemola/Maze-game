const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const width = window.innerWidth;
const height = window.innerHeight;
const cellsHorizontal = 14;
const cellsVertical = 10;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;
 

const engine = Engine.create();

//Disable gravity in the y direction
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height
  } 
});

Render.run(render);
Runner.run(Runner.create(), engine);

//Walls

const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, {isStatic: true}),
  Bodies.rectangle(width / 2, height, width, 2, {isStatic: true}),
  Bodies.rectangle(0, height / 2, 2, height, {isStatic: true}),
  Bodies.rectangle(width, height / 2, 2, height, {isStatic: true})
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

const grid = Array(cellsVertical)
.fill(null)
.map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
.fill(null)
.map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
.fill(null)
.map(() => Array(cellsHorizontal).fill(false));


const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);


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
      nextRow >= cellsVertical||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal
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

horizontals.forEach((row,rowIndex) => {
  row.forEach((open, columnIndex) => {
    if(open){
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      5,
      {
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: 'red'
        }
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row,rowIndex) => {
  row.forEach((open, columnIndex) => {
    if(open){
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      5,
      unitLengthX,
      {
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: 'red'
        }
      }
    );
    World.add(world, wall);
  });
});

//Goal

const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * .7,
  unitLengthY * .7,
  {
    label: 'goal',
    isStatic: true,
    render: {
      fillStyle: 'green'
    }
  }
);
World.add(world, goal);

// Ball

const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
  unitLengthX / 2,
  unitLengthY /2,
  ballRadius,
  {
    label: 'ball',
    render: {
      fillStyle: 'blue'
    }
  }
);

World.add(world, ball);

//Configure keys to be able to move the ball
document.addEventListener('keydown', (e) => {
  const { x, y } = ball.velocity;

  if (e.keyCode === 38) {
    Body.setVelocity(ball, { x: x, y: y - 5 });
  }
  if (e.keyCode === 40) {
    Body.setVelocity(ball, { x: x, y: y + 5 });
  }
  if (e.keyCode === 37) {
    Body.setVelocity(ball, { x: x - 5, y: y });
  }
  if (e.keyCode === 39) {
    Body.setVelocity(ball, { x: x + 5, y: y });
  }
});

Events.on(engine, 'collisionStart', e => {
  e.pairs.forEach((collision) => {
    const labels = ['ball', 'goal'];

    if(
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)) {
        document.querySelector('.winner').classList.remove('hidden');
        world.gravity.y = 1;
        world.bodies.forEach((body) => {
          if (body.label === 'wall') {
            Body.setStatic(body, false);
          }
        })
      }
  })
})