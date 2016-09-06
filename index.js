"use strict";
const got = require("got");
const Tessel = require("tessel-io");
const five = require("johnny-five");
const AC = require("./ac");
const config = require("./config");

const board = new five.Board({
  io: new Tessel()
});

board.on("ready", () => {
  const url = `http://data.sparkfun.com/input/${config.phant.public}.json`;
  const payload = {
    body: null,
    headers: {
      "Phant-Private-Key": config.phant.private, // <-- don't publish this!
    }
  };

  const ac = new AC({
    pin: "A7",
    minimumI: 1
  });
  // Once the AC instance is calibrated,
  // setup the BME280 and report status to phant
  // according to the specified interval.
  ac.on("calibrated", () => {
    const env = new five.Multi({
      controller: "BME280",
    });
    board.loop(config.interval, () => {
      if (env.isReady) {
        payload.body = {
          celsius: env.thermometer.celsius,
          humidity: env.hygrometer.relativeHumidity,
          pressure: env.barometer.pressure,
          acactive: Number(ac.isActive),
        };
        got.post(url, payload);
      }
    });
  });
});
