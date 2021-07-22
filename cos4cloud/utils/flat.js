function flatten(array) {
  if(array.length == 0)
    return array;
  else if(Array.isArray(array[0]))
    return flatten(array[0]).concat(flatten(array.slice(1)));
  else
    return [array[0]].concat(flatten(array.slice(1)));
}

module.exports = flatten