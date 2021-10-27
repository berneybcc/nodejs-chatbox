var ReportModel = require('../models/report');
var ChartsModel = require('../models/charts');
var moment = require('moment'); // require


async function reportData(req,res) {
    console.log('Informe');
    return res.send(await buildInfoReport());
}

async function infoCharts(req,res){
    // await buildInfoReport();
    var infoData = await obtainCharts();
    return res.send(infoData);
}

async function buildInfoReport(){
    var fecha = moment().add(-1,'months').format('YYYY-MM-DD');
    console.log(fecha);
    var datos = await obtainReport(fecha);
    var report_end = realizarInforme(datos);
    await deleteCharts();
    return await saveCharts(report_end);
}

function obtainReport(fecha){
    return new Promise((resutl) => {ReportModel.find({ //query today up to tonight
        date: {
            $gte: fecha
        }
    },function(error,data){
        var msg = {
            error:false,
            data:data
        }
        if(error || data.length === 0){
            msg.error = true;
            msg.data = "No existe Informacion";
            // console.log(msg);
        }
        resutl(msg);
    })});
}

function realizarInforme(info){
    info = info.data;
    var report_start = [];
    var report_end = [];
    if(info.length>0){
        var datos_element = []; 
        info.forEach((element)=>{
            var descrip= element.description_question;
            console.log(element);
            if(element.uid_question ==="Uid_Inicio"){
                descrip ="Saludo Inicial";
            }
            datos_element.push(descrip)
        })
        report_start =  datos_element.filter( (ele,pos)=>datos_element.indexOf(ele) == pos);
        report_start.forEach(i =>{
            var data_end={
                description:i,
                total:0
            };
            datos_element.forEach(a=>{
                if(a===i){
                    data_end.total += 1;
                }
            })
            report_end.push(data_end);
        })
        // console.log(report);
    }
    return report_end;
}

async function saveCharts(info){
    return new Promise ((response)=>{
        info.forEach((i)=>{
            var description = i.description;
            var total = i.total;
            var reportQuery= new ChartsModel({description_question:description,total:total});
            reportQuery.save();
        })
        response("Reporte Guardado");
    })
}

async function deleteCharts(){
    return await ChartsModel.deleteMany({});
}

function obtainCharts(){
    return new Promise((resutl) => {ChartsModel.find({},function(error,data){
        var msg = {
            error:false,
            data:data
        }
        if(error || data.length === 0){
            msg.error = true;
            msg.data = "No existe Informacion";
            // console.log(msg);
        }
        resutl(msg);
    })});
}
module.exports = {
    reportData,
    infoCharts
}
