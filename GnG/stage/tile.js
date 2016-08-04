(function () {
  if (typeof GnG === "undefined") { window.GnG = {}; }

  var Tile = GnG.Tile = function (attrs) {
    this.x = attrs.x;
    this.y = attrs.y;
    this.z = this.getZ();
    this.game = attrs.game;
    this.seed = this.game.seed;
    this.worldPos = attrs.worldPos; // expects [x, y, z]
    this.type = attrs.type || "TILE";  // stone, water, etc.
    this.pos = attrs.pos; // expects [x, y, z] ?
    this.color = this.getColor();
  };

  // GnG.Util.inherits(Player, GnG.MovingObject);

  Tile.prototype.buildFromSeed = function (o) {
    var self = this;
    for (var x = 0; x < 20; x++) {
      for (var y = 0; y < 20; y++) {
        var tile = new GnG.Tile({ seed: this.seed, worldPos: this.worldPos, x: x, y: y });
        self.tiles.push(tile);
      }
    }
  };

  Tile.prototype.draw = function (ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x * 40, this.y * 40, 40, 40); // xpos, ypos, width, height
    ctx.fill();
  };

  Tile.prototype.getZ = function () {
    return 10; //placeholder...
  };

  Tile.prototype.getColor = function () {
    // very naiive tile colorizer.
    if ( (this.x + this.y) % 2 === 1 ) { return "#ffaa00"; }
    return "#aabbcc";
  };
})();