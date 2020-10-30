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
    
    let tam;
    //Determina o tamanho do menor vetor
    if (valuesA.length > valuesB.length)
        tam = valuesB.length;
    else
        tam = valuesA.length;

    let avgA = avg3(valuesA, tam);
    let avgB = avg3(valuesB, tam);
    let covar = 0;
    for (let i = 0; i < tam; i++)
        covar += (valuesA[i] - avgA) * (valuesB[i] - avgB);
    return covar / (tam);
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

//Calculo da media para ser usado no calculo da covariancia
function avg3(data, tam) {
    let avg = 0;
    for (let i = 0; i < tam; i++) {
        avg += data[i];
    }
    return avg / tam;
}

module.exports.avgr = avgr;