var QuestionsModel = require('../models/questions');
var WebhookModel = require('../models/webhook');
var ReportModel = require('../models/report');
var config = require('../config');
var request = require('request');


function webhookGet(req,res){
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === config.TOKEN_FACEBOOK) {
          console.log('WEBHOOK_VERIFIED');
          res.status(200).send(challenge);
        } else {
          res.sendStatus(403);      
        }
    }
}

function webhookPost(req,res){
    let body = req.body;
    if (body.object === 'page') {
        saveWebhook(body);
        body.entry.forEach(function(entry) {
            let webhook_event = entry.messaging;
            // console.log(webhook_event);
            webhook_event.forEach((mess)=>{
                // console.log(mess);
                var inforeipinet = receiveMessage(mess);
            })
            res.status(200).send("llego");
        });
    } else {
        res.sendStatus(404);
    }
}

async function receiveMessage(event){
    var textoBox= "";
    if(typeof event.message != "undefined"){
        textoBox = event.message.text;
    }else if(typeof event.postback != "undefined"){
        textoBox = event.postback.title;
    }
    var data = await captureTextUser(textoBox,event.sender.id);
    sendMessage(event.sender.id,data);
}

function sendMessage(id,arrayInfo){
    var responseUser=[];

    if(!arrayInfo.error){
        arrayInfo.data.forEach(elemento=>{
            var textUser = {};
            if(!validarURL(elemento.description)){
                textUser.type="postback";
                textUser.title=elemento.description
                textUser.payload="DEVELOPER_DEFINED_PAYLOAD";
            }else{
                arrayInfo.msgbox.title = config.MEG_BYE;
                arrayInfo.msgbox.subtitle = config.SUB_MEG_BYE;  
                textUser.type="web_url";
                textUser.url=elemento.description;
                textUser.title="Más Información";
            }
            responseUser.push(textUser);
        })
    }
    callSendApi({
        recipient: {
            id: id
        },
        message: {
            attachment:{
                type:"template",
                payload:{
                  template_type:"generic",
                  elements:[
                     {
                      title:arrayInfo.msgbox.title,
                      subtitle: arrayInfo.msgbox.subtitle ,
                      buttons:responseUser
                    }
                  ]
                }
            }
        }
    });
}

async function callSendApi(message){
    request({
        uri:config.URI_FACEBOOK,
        qs:{ access_token : config.TOKEN_FACEBOOK},
        method:"POST",
        json:message
    },function(error,response,data){
        console.log(data.error);
        if(data.error){
            console.log("Error al enviar datos.");
        }else{
            console.log("Envia datos");
        }
    }
    )
}

async function captureTextUser(texto,id){
    var questionDescription = await obtainQuestionDescription(texto);
    
    var valueRelation = [];
    var ids = "Uid_Inicio";
    var description = texto;
    if (!questionDescription.error) {
        description = questionDescription.data.description;
        ids = questionDescription.data.id;
        var dataRelation = await obtainRelation(ids);
        valueRelation = (!dataRelation.error)?dataRelation.data:[];
    }
    await saveReport(id,ids,description);
    var infoEnd = await obtainQuestion(valueRelation);
    if(infoEnd.error){
        infoEnd = await obtainQuestion([]);
    }
    infoEnd.msgbox = {};
    infoEnd.msgbox.title = config.MEG_SELECCION;
    infoEnd.msgbox.subtitle = config.SUB_MEG;
    if(valueRelation.length==0){
        infoEnd.msgbox.title = config.MEG_WELCOME;
    }
    console.log(infoEnd);
    return infoEnd;
}

async function adminQuestion(req,res){
    var data = await obtainQuestion([]);
    if(!data.error){
        data = data.data;
        console.log("Consulta Sub Questions");
        // var subData= await createArrayQuestion(data);
    }
    res.render('adminQuestions',{info:data});
}

function obtainQuestionLikeRelation(id){
    return new Promise((resutl) => {QuestionsModel.find({relation:{ $regex: '.*' + id + '.*' }},function(error,data){
        var msg = {
            error:false,
            data:data
        }
        if(error || data.length === 0){
            msg.error = true;
            msg.data = "No existe Registro para el id enviado";
            // console.log(msg);
        }
        resutl(msg);
    })});
}

function obtainQuestionDescription(texto){
    texto = texto.match(/[A-Za-z0-9 ]/g);
    texto = texto.join("");
    console.log("Texto final: "+texto);
    return new Promise((resutl) => {QuestionsModel.findOne({description:{$regex:`.*${texto}.*`}},function(error,data){
        var msg = {
            error:false,
            data:data
        }
        if(error || !data){
            console.log(error);
            msg.error = true;
            msg.data = "No existe Registro para el id enviado";
        }
        resutl(msg);
    })});
}

function obtainQuestion(valueRelation){
    return new Promise((resutl) => {QuestionsModel.find({relation:valueRelation},function(error,data){
        var msg = {
            error:false,
            data:data
        }
        if(error || data.length === 0){
            console.log(error);
            msg.error = true;
            msg.data = "No existe Registro para el id enviado";
        }
        resutl(msg);
    })});
}

function obtainOneQuestion(id){
    return new Promise((resutl) => {QuestionsModel.findOne({_id: id}, function(error, question) {
        var msg= {
            error:false,
        };
        if(error || !question){
            msg.error = true;
            msg.data="No existe registro";
        }else{
            msg.data=question;
        }
        resutl(msg);
    })});
}

async function obtainRelationQuestion(req,res){
    var ids = req.params.ids;
    res.send(await obtainInfoByRelation(ids));
}

async function saveQuestion(req,res){
    console.log('Ingresa Save');
    var returnInfo={
        error:false,
        data:"Datos registrado"
    };
    var data = req.body;
    var valueDescription = data.inputDescripcion;
    var valueRelation = [];

    if(typeof data.checkQuestions !== "undefined" && data.checkQuestions){
        var infoValid= await obtainInfoByRelation(data.checkQuestions);
        if(!infoValid.error){
            if(validarURL(valueDescription)){
                returnInfo.error = true;
                returnInfo.data = config.ERROR.URL_NO_PERTENECE;
                return res.send(returnInfo);
            }
            var validarInfo=await validQuestionNotURL(infoValid);
            if(validarInfo){
                returnInfo.error = true;
                returnInfo.data = config.ERROR.URL_EXISTE;
                return res.send(returnInfo);
            }
        }
        console.log(data.checkQuestions);
        var dataRelation =await obtainRelation(data.checkQuestions);
        if(!dataRelation.error){
            console.log("DataRelation: "+dataRelation);
            valueRelation = (!dataRelation.error)?dataRelation.data:[];
            console.log(valueRelation);
        }else{
            returnInfo.error = true;
            returnInfo.data = "No existe la Pregunta asociada";
            return res.send(returnInfo);
        }
    }
    if(!valueDescription){
        returnInfo.error = true;
        returnInfo.data = "Se requiere una Descripcion";
        return res.send(returnInfo);
    }
    if(valueRelation.length==0){
        if(validarURL(valueDescription)){
            returnInfo.error = true;
            returnInfo.data = config.ERROR.URL_NO_PERTENECE;
            return res.send(returnInfo);
        }
    }
    var questionsQuery= new QuestionsModel({description:valueDescription,relation:valueRelation});
    await questionsQuery.save();
    return res.send(returnInfo);
}

async function saveWebhook(info){
    var webhookQuery= new WebhookModel({event:info,date:new Date});
    await webhookQuery.save();
}

async function saveReport(id,uid,description){
    var reportQuery= new ReportModel({id_user:id,uid_question:uid,description_question:description,date:new Date});
    await reportQuery.save();
}

async function updateQuestion(req,res){
    console.log('Ingresa Update');
    var returnInfo={
        error:false,
        data:"Registro Actualizado"
    };
    try {
        var data = req.body;
        var uid =data.uid;
        var valueDescription = data.inputDescripcion;
        var responseQuery = await QuestionsModel.updateOne({_id:uid},{description:valueDescription});
        if(responseQuery.nModified===0){
            returnInfo.error=true;
            returnInfo.data="No existe el id enviado";
        }
        return res.send(returnInfo);
    } catch (error) {
        returnInfo.error=true;
        returnInfo.data="Error al realizar la actualizacion";
        return res.send(returnInfo);
    }
}

async function deleteQuestion(req,res){
    console.log('Ingresa Delete');
    var returnInfo={
        error:false,
        data:"Registro Eliminado"
    };
    try {
        var data = req.body;
        var uid =data.uid;
        var valueDescription = data.inputDescripcion;
        var responseQuery = await QuestionsModel.deleteOne({_id:uid});
        console.log(responseQuery);
        if(responseQuery.nModified===0){
            returnInfo.error=true;
            returnInfo.data="No existe el id enviado";
        }
        return res.send(returnInfo);
    } catch (error) {
        returnInfo.error=true;
        returnInfo.data="Error al eliminar registro";
        return res.send(returnInfo);
    }
}

async function obtainRelation(ids){
    var dataReturn ={error:true};
    var infoSearch = await obtainOneQuestion(ids);
    if(!infoSearch.error){
        console.log(infoSearch);
        var data = infoSearch.data;
        var idInfo = data.id;
        console.log("Id: "+idInfo);
        var relationInfo = data.relation;
        relationInfo.push(idInfo);
        dataReturn.error = false;
        dataReturn.data = relationInfo;
    }
    return dataReturn;
} 

async function obtainInfoByRelation(ids){
    var valueRelation = [];
    console.log(ids);
    if (typeof ids !== "undefined") {
        var dataRelation = await obtainRelation(ids);
        valueRelation = (!dataRelation.error)?dataRelation.data:[];
    }
    return await obtainQuestion(valueRelation);
}

async function validQuestionNotURL(info){
    var validTexto = false;
    if(!info.error){
        info.data.forEach(function(element) {
            if(validarURL(element.description)){
                validTexto = true;
            }
        })
    }
    return validTexto;
} 

function validarURL(str) {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(str);
}

module.exports={
    saveQuestion,
    obtainOneQuestion,
    obtainRelationQuestion,
    adminQuestion,
    updateQuestion,
    deleteQuestion,
    webhookGet,
    webhookPost
};
  