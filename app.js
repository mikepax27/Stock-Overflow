const express = require("express");
const bodyParser = require("body-parser");
const yahooFinance = require('yahoo-finance');
const mathjs = require("mathjs");

//funções
const date = require(__dirname + '/library/date.js');
const trataStrings = require(__dirname + '/library/trataStrings.js');
const statistcs = require(__dirname + '/library/statistics.js');

const PORT = 3000;
let carteira = [];
let results = [];
let msgErro = "";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

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
                matriz = mathjs.inv(matriz);

                const produto = [];
                for (let i = 0; i < tamCombinacao; i++)
                    produto.push(mathjs.sum(matriz[i]))

                const pesos = [];
                for (let i = 0; i < tamCombinacao; i++) {
                    pesos.push(produto[i] / mathjs.sum(produto));
                }

                let retornoConj = [];
                let tam = 1000;
                comb.forEach(element => {
                    if (carteira[element].retornos.length < tam)
                        tam = carteira[element].retornos.length;
                });

                for (let i = 0; i < tam; i++) {
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
            }
        });

    }
    res.redirect('/results');
}

//Busca o histórico das ações e calcula o rendimento mensal
let ok;
function buscaHisRetorno(acoes, res) {
    ok = true;
    acoes.forEach(element => {
        yahooFinance.historical({
            symbol: element,
            from: date.getDate(5),
            to: date.getDate(0),
            period: 'm'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
        }, (err, quotes) => {
            if (!err) {
                if (quotes.length==0) {
                    msgErro = element + " não encontrado, por favor verifique se o nome está correto.";
                    ok = false; 
                }
                const hist = [];
                //calcula o rendimento mensal de cada ação 
                for (let i = 0; i < quotes.length - 1; i++)
                    hist.push(quotes[i].close / quotes[i + 1].close - 1);
                carteira.push({ name: element, retornos: hist });
            }

            //chama tratamento de dados
            if (carteira.length == acoes.length && ok)
                trataDados(res);
            else if (carteira.length == acoes.length && !ok)
                res.redirect('/erro');
        });  
    });
}

app.get('/', (req, res) => {
    res.render('home', {page: 'home'});
});

app.get('/results', (req, res) => {
    res.render('results', {results: results, page: 'results'});
});

app.get('/erro', (req, res) => {
    res.render('erro', {erro: msgErro, page: 'home'});
});

app.get('/sobre', (req, res) => {
    res.render('sobre', {page: 'sobre'});
});

// res.redirect('/');

app.post("/", (req, res) => {
    console.log("Nova pesquisa: "+ req.body.company);
    results = [];
    carteira = [];
    const acoes = trataStrings.separate(req.body.company);
    if (acoes.length > 5) {
        msgErro = "Muitos ativos, por favor faça uma busca com no máximo 5.";
        res.redirect('/erro');
    }else{
        buscaHisRetorno(acoes, res);
    }
});

app.listen(PORT, () => {
    console.log('Server started on port ' + PORT);
});