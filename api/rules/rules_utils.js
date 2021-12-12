module.exports = {
  arrToObj: (arr) => {
    var obj = {};
    arr.forEach((a) => {
      obj[a[0]] = a[1];
    });
    return obj;
  },
};
