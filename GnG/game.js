/* Game (lib/game.js)
Holds collections of the movingObjects, bullets, and your ship.
#step method calls #move on all the objects, and #checkCollisions checks for colliding objects.
#draw(ctx) draws the game.
Keeps track of dimensions of the space; wraps objects around when they drift off the screen.
*/

(function () {
  if (typeof GnG === "undefined") { window.GnG = {}; }

  var SIZE = Math.min(window.innerWidth, window.innerHeight);
  var SQUARE = SIZE / 20;
  var DIM_X = window.innerWidth;
  var DIM_Y = window.innerHeight;
  var GAME_DIRS = { UP: [0, -1], DOWN: [0, 1], LEFT: [-1, 0], RIGHT: [1, 0],
                    NORTH: [0, 1, 0], SOUTH: [0, -1, 0], WEST: [-1, 0, 0], EAST: [1, 0, 0],
                  };

  var Game = GnG.Game = function (options) {
    this.size = SIZE;
    this.square = SQUARE; // size of one square on the grid
    this.dim_x = SIZE || DIM_X;
    this.dim_y = SIZE || DIM_Y;
    this.seed = 127;
    this.stage = new GnG.Stage({ game: this, worldPos: [1, 1, 1], });
    this.player = new GnG.Player({ pos: [500, 500], game: this, });
    this.mouse = {}; // for handling the mousePos.  not currently usedd...

    this.textObjects = [];
    this.movingObjects = [this.player]; // move to stage?
    this.visualFX = [];

    this.counter = 50;
    this.score = 0;
    this.pause = false;

    this.start();
  };

  Game.dim_x = function () { return window.innerWidth; };
  Game.dim_y = function () { return window.innerHeight; };

  Game.prototype.rand = function (s) {
    var hash = 5831;
    if ( typeof(s) === 'number' ) { s = s.toString(); }
    if (s.length === 0) { return hash; }
    for (var i = 0; i < s.length; i++) {
      var char = s.charCodeAt(i);
      hash = ( ((hash << 5) + hash ) + char) ^ (char * char); // << is a bitwise left shift
      hash = (hash & hash); // Convert to 32bit integer
    }
    return hash >>> 0;
  };

  Game.prototype.start = function () {
    this.buildStage([1, 1, 1]);
    this.reset();
  };

  Game.prototype.buildStage = function (worldPos) {
    this.stage = new GnG.Stage({ worldPos: worldPos, game: this });
  };

  Game.prototype.reset = function () {
    // this.movingObjects = [];
  };

  Game.prototype.addText = function (attrs) {
    attrs.game = this;
    var text = new GnG.Text(attrs);
    this.textObjects.push(text);
  };

  Game.prototype.addFX = function (attrs) {
    attrs.game = this;
    var fx = new GnG.VisualEffect(attrs);
    this.visualFX.push(fx);
  };

  Game.prototype.allObjects = function (attrs) {
    return this.movingObjects;
  };

  Game.prototype.draw = function (ctx) {
    ctx.clearRect(0, 0, DIM_X, DIM_Y); //this will empty the canvas

    this.stage.draw(ctx);
    this.allObjects().forEach(function (object) { object.draw(ctx); });
    this.textObjects.forEach(function (text) { text.draw(ctx); });
    this.visualFX.forEach(function (effect) { effect.draw(ctx); });
  };

  Game.prototype.moveObjects = function () {
    this.movingObjects.forEach(function (object) { object.move(); });
  };

  Game.prototype.updateTextObjects = function () {
    this.textObjects.forEach(function (text) { text.update(); });
  };

  Game.prototype.cleanUp = function () {
    var self = this;
    this.movingObjects.forEach(function (object) {
      if ( GnG.Util.offScreen(object) ) {
        if (object.type === 'PLAYER') {
          var dir = GnG.Util.offScreen(object);
          var newPlayerPos;
          var oldWorldPos = game.stage.worldPos; // build new stage;
          var newWorldPos = v(oldWorldPos).plus(v(GAME_DIRS[dir]));
          if ( dir === 'NORTH' ) { newPlayerPos = [0, SIZE]; } // player exits top of screen, appears at bottom
          if ( dir === 'SOUTH' ) { newPlayerPos = [0, -SIZE]; } // player exits bottom of screen, appears at top
          if ( dir === 'EAST' ) { newPlayerPos = [-SIZE, 0]; } // player exits screen right, appears at left
          if ( dir === 'WEST' ) { newPlayerPos = [SIZE, 0]; } // player exists screen left, apepars at right
          this.buildStage(newWorldPos);
          this.player.pos = this.player.pos.plus(v(newPlayerPos));
        } else { game.remove(object); }
      }
    }.bind(this));
  };

  Game.prototype.getBounds = function () { return [SIZE, SIZE]; };

  Game.prototype.bounds = function (pos) {
    var origX = pos[0];
    var origY = pos[1];

    if (origX >= DIM_X) { origX = DIM_X; }
    if (origX <= 0) { origX = 0; }
    if (origY >= DIM_Y) { origY = DIM_Y; }
    if (origY <= 0) { origY = 0; }

    return [origX, origY];
  };

  Game.prototype.checkCollisions = function () {
    // begin by getting the squares of each object;
    // then check for collisions against adjacent squares;
    var self = this;
    // hoping to improve the smarts of this one to optimize performance;
    for (var i = 0; i < self.movingObjects.length; i++) {
      var obj = self.movingObjects[i];

      // check for tile collisions
      var objCoords = self.stage.coords(obj);
      var adjTiles = self.stage.adjacentSquares(objCoords);
      var tileKeys = adjTiles.map(function (coord) { return v(coord).x + "," + v(coord).y; });

      tileKeys.forEach(function (key) {
        var tile = self.stage.tiles[key];
        if ( tile && obj.isCollidedWith(tile) ) {
          obj.collideWith(tile);
        }
      });
    }
  };

  Game.prototype.step = function () {
    if (!this.pause) {
      this.updateTextObjects();
      this.moveObjects();
      this.checkCollisions();
      this.cleanUp();
    }
  };

  Game.prototype.remove = function (object) {
    var i = this.movingObjects.indexOf(object);
    return this.movingObjects.splice(i, 1); // use splice to delete elements at index i...
  };

  Game.prototype.removeText = function (object) {
    var i = this.textObjects.indexOf(object);
    return this.textObjects.splice(i, 1);
  };

  Game.prototype.removeFX = function (object) {
    var i = this.visualFX.indexOf(object);
    return this.visualFX.splice(i, 1);
  };

  Game.prototype.destroy = function (object) {};

  Game.prototype.spawnObjects = function () {};

  Game.prototype.spawn = function (spawn) {};

})();
