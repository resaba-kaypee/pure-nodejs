/**
 * Lib that demonstrates something throwing when it's init() is called
 */

// container for the module
const example = {};

example.init = () => {
  const foo = bar;
  console.log(foo);
};

module.exports = example;
