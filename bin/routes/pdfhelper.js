var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');  
var fileUpload = require('express-fileupload');
var pdf = require('html-pdf');
const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');
var fs = require('fs');
var pug = require ('pug');
var BaseUrl = "http://mysalveo.com";
var app = express();
app.use('/api/', express.static(path.join(__dirname, 'routes')));

exports.pdfgenerator = async function (doctordata,patientdata,meditationdata,Prescription_data,doctor_commeents) {
   try{
    //console.log(Prescription_data);
    console.log("image path");
       var source = fs.readFileSync(path.resolve(__dirname, "./views/doctor.pug"),'utf-8');
     var Specilization = "";
     for(var i=0; i< doctordata.Specilization.length; i++){
            
            if(i == 0){
                Specilization = doctordata.Specilization[i];
            }
            else{
                  Specilization = Specilization + "," + doctordata.Specilization[i];
            }
     }
     console.log(Specilization)
     let template = pug.compile(source);
     let data = {
      doctorname : doctordata.Name,
      doctorsepecilization: Specilization,
      doctorsignature: doctordata.signature,
      patientname : patientdata.Name,
      patientage: patientdata.Age,
      dotorsignature: doctordata.signature,
      KMSnumber : doctordata.KMS_registration,
      patientage:patientdata.age,
      patientgender:patientdata.Gender,
      patientheight: patientdata.Height,
      patientweight:patientdata.Weight,
      Problem_info:meditationdata.Problem_info,
      passed_Medications:meditationdata.passed_Medications,
      Prescription_data:Prescription_data,
      doctor_commeents:doctor_commeents
     }
     let html = template(data);
     //console.log(html)
     console.log("What is the path" , __dirname)
        var options = { format: 'Letter', height: "20.5in",
  width: "18in"};
        var filepath = __dirname + '/public/prescriptions/' + uuidv4() + '.pdf' ;
        var filepart = filepath.slice(54,94);
        console.log("filepart",filepath)
        var Finalpath = BaseUrl +'/api/public/prescriptions/' + filepart;
        console.log("Finalpath",Finalpath)
         return new Promise(async function (resolve, reject) {
                 await pdf.create(html, options).toFile(filepath, function(err, response) {
                    if (err){
                        console.log(err)
                        reject( false);
                    }
                    resolve(Finalpath);
                });
            });
         return Finalpath;
        //var html = pug.compileFile(layout, { pretty: true })(locals);
      }
      catch(e){
        console.log(e)
       return false;
      }
}
