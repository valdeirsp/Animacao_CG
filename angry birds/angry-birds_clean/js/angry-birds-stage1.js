var AngryBirds = AngryBirds || {};

(function (AngryBirds) {
    "use strict";

    AngryBirds.Stage1 = function (denPosition) {
        AngryBirds.Stage.call(this);
        this.denPosition = denPosition || {x: 0, y: 30, z: 48};
    };

    AngryBirds.Stage1.prototype = Object.create(AngryBirds.Stage.prototype);
    AngryBirds.Stage1.prototype.constructor = AngryBirds.Stage1;
    AngryBirds.Stage1.prototype.constructOn = function (world) {
        var dx, dz;
        var baseHeight = 1;
        world.add(this.createBoard(
                {width: 10, height: 2.2, depth: 10},
        {x: this.denPosition.x, y: this.denPosition.y, z: this.denPosition.z},
        {fixed: true, map: AngryBirds.Texture.CLOD, bumpMap: AngryBirds.Texture.CLOD}
        ));
        baseHeight += 0.2 / 2;
    };

}).call(this, AngryBirds);
