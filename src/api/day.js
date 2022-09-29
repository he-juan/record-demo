
/***********************时间处理*************************/
let  beautyDate =  function (date) {
  var yyyy = date.getFullYear();
  var m = date.getMonth() + 1; // getMonth() is zero-based
  var d = date.getDate();
  var h = date.getHours();
  var mi = date.getMinutes();
  var sec = date.getSeconds();
  var msec = date.getMilliseconds();

  var mm  = m < 10 ? "0" + m : m;
  var dd  = d < 10 ? "0" + d : d;
  var hh  = h < 10 ? "0" + h : h;
  var min = mi < 10 ? "0" + mi : mi;
  var ss  = sec < 10 ? "0" + sec : sec;
  var mss = msec < 10 ? "00" + msec : ( msec < 100 ? "0" + msec : msec );

  return "".concat(yyyy).concat("-").concat(mm).concat("-").concat(dd).concat("@").concat(hh).concat(":").concat(min).concat(":").concat(ss).concat(".").concat(mss);
}
export default beautyDate
