const _ = require("lodash");

exports.separate = function (texto) {
    let novo = _.replace(texto, ",", " ");
    novo = _.replace(novo, ";", " ");
    while (novo.includes("  "))
        novo = _.replace(novo, "  ", " ");
    novo = novo.trim()
    novo = novo.toUpperCase();
    novo = novo.split(" ");
    return novo;
}
