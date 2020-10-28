const express = require("express");
const bodyParser = require("body-parser");
const si = require("stock-info");
const yahooFinance = require('yahoo-finance');
const PORT = 3000;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
const data = new Date;

// si.getSingleStockInfo('AAPL').then(console.log);

// yahooFinance.historical({
//     symbol: 'AAPL',
//     from: '2010-01-01',
//     to: '2020-10-26',
//     //fields: ['s', 'n', 'd1', 'l1', 'y', 'r'],
//     period: 'v'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
// }, function (err, quotes) {
//     if (!err)
//         console.log(quotes);
// });

app.get('/', (req, res) => {
    //define a data de hj e de 5 anos atrás, faltou tratar ano bissexto
    let today = data.getFullYear()+"-";
    let past  = (data.getFullYear()-5)+"-";
    if (data.getMonth() < 9){
        today +="0";
        past +="0";
    }
    today += (data.getMonth()+1)+"-";
    past += (data.getMonth()+1)+"-"; 
    if (data.getDate() < 10){
        today +="0";
        past +="0";
    }
    today += data.getDate();
    past += data.getDate(); 

    console.log(today + "  " + past);

    res.render('home', { today: today, past: past });
});

app.post ("/", (req, res) => {
    console.log(req.body)

});

app.listen(PORT, () => {
    console.log('Server started on port 3000');
});