"use strict";
const five = require("johnny-five");

class Current extends five.Sensor {
  constructor(pin) {
    super(pin);

    let aref = this.io.aref || 4.4;
    let cCount = 0;
    let sCount = 0;
    let lastSampleI = 0;
    let sampleI = 0;
    let lastFilteredI = 0;
    let filteredI = 0;
    let offsetI = 0;
    let sumSqI = 0;
    let rmsI = 0;
    // Turn Ratio: 100A:0.05mA
    //             2000:1
    // Burden: 100Ω
    // Calibration: 2000 / 100 = 20
    let calibration = 20;
    let ratioI = calibration * (aref / 1023);
    let last = Date.now();
    let isCalibrated = false;

    this.on("data", () => {
      let now = Date.now();

      if (now > last + 1000) {
        // Calculate Root Mean Squared Current (Amps = I)
        rmsI = ratioI * Math.sqrt(sumSqI / sCount);
        sumSqI = 0;
        sCount = 0;
        last = now;

        if (isCalibrated) {
          this.emit("measurement", rmsI);
        } else {
          if (cCount === 5) {
            this.emit("calibrated");
            isCalibrated = true;
          } else {
            cCount++;
          }
        }
      } else {
        lastSampleI = sampleI;
        sampleI = this.value;
        offsetI = offsetI + ((sampleI - offsetI) / 1023);
        filteredI = sampleI - offsetI;
        sumSqI += filteredI * filteredI;
        sCount++;
      }
    });
  }
}
module.exports = Current;
