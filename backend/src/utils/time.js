

import json from "./json.js";

export default function time(input = "12d") {
  let time = input.split(/[a-z,A-Z]/)[0];
  let value = input.split(/d/)[input.split(/d/).length - 1];

  let vals = {
    d: value.toLowerCase() === "d" ? time : 1,
    h: value.toLowerCase() === "h" ? time : value.toLowerCase() == "d" ? 24 : 1,
    m:
      value.toLowerCase() === "m"
        ? time
        : value.toLowerCase() == "d" || value.toLowerCase() == "h"
        ? 60
        : 1,
    s:
      value.toLowerCase() === "s"
        ? time
        : value.toLowerCase() == "d" ||
          value.toLowerCase() == "h" ||
          value.toLowerCase() == "m"
        ? 60
        : 1,
  };

  //   return 1000 * s * m * h * d;
  return (
    1000 *
    json.int(vals.s) *
    json.int(vals.m) *
    json.int(vals.h) *
    json.int(vals.d)
  );
}

// console.log(new Date(time("1d") + Date.now()).toString());
// returns time in seconds, put numberic value with d for days, h for hours, m for minutes,s for seconds in string like "15d" means 15 days


