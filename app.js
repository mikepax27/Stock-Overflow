const express = require("express");
const bodyParser = require("body-parser");
const si = require("stock-info");
const yahooFinance = require('yahoo-finance');

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


function trataDados(){
    console.log("teste");
    console.log(statistcs.standardDeviation([2, 4, 6, 8]));

}


//Busca o histórico das ações e calcula o rendimento mensal
function buscaHisRetorno(acoes){
    acoes.forEach(element => {
        yahooFinance.historical({
            symbol: element,
            from: date.getDate(5),
            to: date.getDate(0),
            period: 'm'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
        }, (err, quotes) => {
            if (!err){
                const hist = [];
                //calcula o rendimento mensal de cada ação 
                for (let i = 0; i < quotes.length-1; i++)
                    hist.push(quotes[i].close/quotes[i+1].close-1);
                carteira.push({name: element, retornos: hist});
            }
            if (carteira.length ==acoes.length)
                trataDados();
        });
    });
}

app.get('/', (req, res) => {
    res.render('home');
});

app.post ("/", (req, res) => {

    const acoes = trataStrings.separate(req.body.company);
    carteira = [];
    buscaHisRetorno(acoes);
});

app.listen(PORT, () => {
    console.log('Server started on port 3000');
});