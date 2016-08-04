// Base class for anything that moves
(function () {
  if (typeof GnG === "undefined") { window.GnG = {}; }

  var Stage = GnG.Stage = function (attrs) {
    this.game = attrs.game;
    this.seed = this.game.seed;
    this.worldPos = attrs.worldPos; // expects [x, y, z]
    this.type = attrs.type || "STAGE";  // dungeon, forest, etc.
    this.pos = attrs.pos; // expects [x, y, z] ?
    this.tiles = [];

    this.buildFromSeed({ seed: this.seed, worldPos: this.worldPos, });
  };

  // GnG.Util.inherits(Player, GnG.MovingObject);

  Stage.prototype.buildFromSeed = function (o) {
    var self = this;
    for (var x = 0; x < 20; x++) {
      for (var y = 0; y < 20; y++) {
        var tile = new GnG.Tile({ seed: o.seed, worldPos: o.worldPos, x: x, y: y });
        self.tiles.push(tile);
      }
    }
  };

  Stage.prototype.draw = function () {
    this.tiles.forEach(function (tile) { tile.draw(); });
  };
})();