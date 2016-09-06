"use strict";
const Current = require("./current");

class AC extends Current {
  constructor(setup) {
    super(setup.pin);

    let isActive = false;

    this.on("measurement", rmsI => {
      if (Math.round(rmsI) < setup.minimumI) {
        isActive = false;
        return;
      }

      isActive = true;
    });

    Object.defineProperty(this, "isActive", {
      get() {
        return isActive;
      },
    });
  }
}
module.exports = AC;
