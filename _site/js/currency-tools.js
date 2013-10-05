var CurrencyTools = {};

CurrencyTools.formatCents = function(amountInCents, precision) {
  if (precision === undefined) precision = 2;
  return (amountInCents < 0 ? '-' : '' ) + '$' + (Math.abs(amountInCents) / 100.0).toFixed(precision);
};

CurrencyTools.addCommas = function(number) {
  var beforeDecimal = number.toString().split('.')[0];
  var beforeDecimalParts = beforeDecimal.split('').reverse();
  var afterDecimal = "00";
  if (number.toString().split('.').length > 1) {
    afterDecimal = number.toString().split('.')[1];
  }
  var formattedBeforeDecimal = [];
  for (var i = beforeDecimalParts.length - 1; i >= 0; i--) {
    formattedBeforeDecimal.push(beforeDecimalParts[i]);
    if (i % 3 === 0 && i !== 0) {
      formattedBeforeDecimal.push(',');
    }
  }
  return formattedBeforeDecimal.join('');
};

CurrencyTools.wordize = function(number) {
  var billion = 1000000000;
  var million = 1000000;
  var thousand = 1000;

  if (number >= billion) {
    return parseFloat((number / billion).toFixed(2)) + " billion";
  } else if (number >= million) {
    return parseFloat((number / million).toFixed(2)) + " million";
  } else if (number >= thousand) {
    return parseFloat((number / thousand).toFixed(2)) + " thousand";
  } else {
    return parseFloat(number.toFixed(2)) + "";
  }

  return "";
};
