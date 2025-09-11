
let json = {
  int: (value) => parseInt(value),
  flo: (value) => parseFloat(value),
  //   str: (value) => JSON.parse(value),
  str: (value) => JSON.stringify(value), // to json string
  parse: (value) => JSON.parse(json.str(value)),
};

export default json;

// console.log(json.flo("1.2"));
