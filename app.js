const express = require("express");
const bodyParser = require("body-parser");
const si = require("stock-info");
const yahooFinance = require('yahoo-finance');
const mathjs = require("mathjs");

//funções
const date = require(__dirname + '/library/date.js');
const trataStrings = require(__dirname + '/library/trataStrings.js');
const statistcs = require(__dirname + '/library/statistics.js');

const PORT = 3000;
let carteira = [];
let results = [];

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// si.getSingleStockInfo('AAPL').then(console.log);

//Gera todos os subconjuntos de um vetor
const getAllSubsets =
    theArray => theArray.reduce(
        (subsets, value) => subsets.concat(
            subsets.map(set => [value, ...set])
        ),
        [[]]
    );

function trataDados(res) {

    //calcula variancia e desvio padrão de cada ativo sozinho
    results.push([]);
    carteira.forEach(acao => {
        results[0].push({ name: acao.name, retorno: (statistcs.avgr(acao.retornos)*100).toFixed(2), risco: (statistcs.std(acao.retornos)*100).toFixed(2) });
    });
    //console.log(results[0]);

    //define todas as combinações possiveis
    const aux = []
    for (let i = 0; i < results[0].length; i++)
        aux.push(i);
    combinacoes = getAllSubsets(aux);

    let matriz = [];

    //determina o tamanha da combinação
    for (let tamCombinacao = 2; tamCombinacao <= results[0].length; tamCombinacao++) {

        results.push([]);
        //Pega cada subconjunto
        combinacoes.forEach(comb => {

            //confere tamanho do sub conjunto
            if (comb.length === tamCombinacao) {

                //gera matriz zerada
                matriz = [];
                for (let i = 0; i < tamCombinacao; i++) {
                    matriz.push([]);
                    for (let j = 0; j < tamCombinacao; j++)
                        matriz[i].push(0);
                }
                //gera matriz de vovariancias
                for (let i = 0; i < tamCombinacao; i++) {
                    matriz[i][i] = statistcs.cvr(carteira[comb[i]].retornos, carteira[comb[i]].retornos);
                    for (let j = i + 1; j < tamCombinacao; j++) {
                        matriz[i][j] = statistcs.cvr(carteira[comb[i]].retornos, carteira[comb[j]].retornos);
                        matriz[j][i] = matriz[i][j];
                    }
                }
                //console.log(matriz);
                matriz = mathjs.inv(matriz);
                console.log(matriz);

                const produto = [];
                for (let i = 0; i < tamCombinacao; i++)
                    produto.push(mathjs.sum(matriz[i]))
                //console.log(produto);

                const pesos = [];
                for (let i = 0; i < tamCombinacao; i++) {
                    pesos.push(produto[i] / mathjs.sum(produto));
                }
                //console.log(pesos);
                //console.log(comb);

                let retornoConj = [];
                for (let i = 0; i < carteira[0].retornos.length; i++) {
                    retornoConj.push(0);
                    let j = 0;
                    comb.forEach(acao => {
                        retornoConj[i] += carteira[acao].retornos[i] * pesos[j];
                        j++;
                    });
                }
                switch (tamCombinacao) {
                    case 2:
                        results[1].push({
                            name: [carteira[comb[0]].name, carteira[comb[1]].name],
                            pesos: [(pesos[0]*100).toFixed(2), (pesos[1]*100).toFixed(2)],
                            retorno: (statistcs.avgr(retornoConj)*100).toFixed(2),
                            risco: (statistcs.std(retornoConj)*100).toFixed(2)
                        });
                        break;
                    case 3:
                        results[2].push({
                            name: [carteira[comb[0]].name, carteira[comb[1]].name, carteira[comb[2]].name],
                            pesos: [(pesos[0]*100).toFixed(2), (pesos[1]*100).toFixed(2), (pesos[2]*100).toFixed(2)],
                            retorno: (statistcs.avgr(retornoConj)*100).toFixed(2),
                            risco: (statistcs.std(retornoConj)*100).toFixed(2)
                        });
                        break;
                    case 4:
                        results[3].push({
                            name: [carteira[comb[0]].name, carteira[comb[1]].name, carteira[comb[2]].name, carteira[comb[3]].name],
                            pesos: [(pesos[0]*100).toFixed(2), (pesos[1]*100).toFixed(2), (pesos[2]*100).toFixed(2), (pesos[3]*100).toFixed(2)],
                            retorno: (statistcs.avgr(retornoConj)*100).toFixed(2),
                            risco: (statistcs.std(retornoConj)*100).toFixed(2)
                        });
                        break;
                    case 5:
                        results[4].push({
                            name: [carteira[comb[0]].name, carteira[comb[1]].name, carteira[comb[2]].name, carteira[comb[3]].name, carteira[comb[4]].name],
                            pesos: [(pesos[0]*100).toFixed(2), (pesos[1]*100).toFixed(2), (pesos[2]*100).toFixed(2), (pesos[3]*100).toFixed(2), (pesos[4]*100).toFixed(2)],
                            retorno: (statistcs.avgr(retornoConj)*100).toFixed(2),
                            risco: (statistcs.std(retornoConj)*100).toFixed(2)
                        });
                        break;
                    default:
                        break;
                }


                // console.log(carteira);
                // console.log(retornoConj);
                

            }
        });

    }
    console.log(results);
    console.log("---------------");
    results.forEach(element => {
        console.log("PARTE");
        console.log(element);
    });
    res.redirect('/results');
}

//Busca o histórico das ações e calcula o rendimento mensal
function buscaHisRetorno(acoes, res) {
    acoes.forEach(element => {
        yahooFinance.historical({
            symbol: element,
            from: date.getDate(5),
            to: date.getDate(0),
            period: 'm'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
        }, (err, quotes) => {
            if (!err) {
                const hist = [];
                //calcula o rendimento mensal de cada ação 
                for (let i = 0; i < quotes.length - 1; i++)
                    hist.push(quotes[i].close / quotes[i + 1].close - 1);
                carteira.push({ name: element, retornos: hist });
            }
            
            //chama tratamento de dados
            if (carteira.length == acoes.length)
                trataDados(res);
        });
    });
}

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/results', (req, res) => {
    res.render('results', {results: results});
});

// res.redirect('/');

app.post("/", (req, res) => {
    results = [];
    carteira = [];
    const acoes = trataStrings.separate(req.body.company);
    buscaHisRetorno(acoes, res);
});

app.listen(PORT, () => {
    console.log('Server started on port ' + PORT);
});