exports.getDate = function(deslocamentoAno){
    const data = new Date;
    let dataEspecifica  = (data.getFullYear()-deslocamentoAno) +"-";
    if (data.getMonth() < 9)
        dataEspecifica +="0";
    dataEspecifica += (data.getMonth()+1)+"-"; 
    if (data.getDate() < 10)
        dataEspecifica +="0";
    else if (data.getMonth()== 1 && data.getDate()==29)
        dataEspecifica += "28";
    else
        dataEspecifica += data.getDate();
    return dataEspecifica;
};