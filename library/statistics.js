//Desvio padrão amostral
exports.std = function (values) {
    var avg = avgr(values);

    var squareDiffs = values.map(function (value) {
        var diff = value - avg;
        var sqrDiff = diff * diff;
        return sqrDiff;
    });

    var avgSquareDiff = avg2(squareDiffs);

    var stdDev = Math.sqrt(avgSquareDiff);
    return stdDev;
}

//Covariancia amostral
exports.cvr = function (valuesA, valuesB) {
    let avgA = avgr(valuesA);
    let avgB = avgr(valuesB);
    let covar = 0;
    for (let i = 0; i < valuesA.length; i++)
        covar += (valuesA[i] - avgA) * (valuesB[i] - avgB);
    return covar / (valuesA.length - 1);
}

//media
function avgr(data) {
    var sum = data.reduce(function (sum, value) {
        return sum + value;
    }, 0);

    var avg = sum / (data.length);
    return avg;
}

//media auxiliar para desvio padrão
function avg2(data) {
    var sum = data.reduce(function (sum, value) {
        return sum + value;
    }, 0);

    var avg = sum / (data.length - 1);
    return avg;
}

module.exports.avgr = avgr;