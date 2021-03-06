// JavaScript General App

var userWS = 'BOC';
var pdwWS  = '5al3sOp3ration';
var vFlagTracking = false;
var vTimerGPS = 30000;
//var ws_url = 'http://localhost/ws_so/service_so.php'; 
var ws_url = 'https://190.4.63.207/ws_so/service_so.php';

var vDatosUsuario ={"user":"", "login":""};
var vTitle ="Tracking Service Comercial Support";
var map;


var vIntersept = true;
var vIntervalGeo;
var vInteDash;
var bgGeo;
//var webSvrListener =  setInterval(function(){ consultSVR()}, 59000);

var app = {
    
    //alert(getParams('user'));
    
    initialize: function() {        
        document.addEventListener("deviceready", this.onDeviceReady, false);
        
 
    },
    
    onDeviceReady: function() {
        //shownot('Hello World');
        //window.plugins.toast.show('Back Bloq..', 1000, 'bottom');
        // Initialize the map view  
 
        cordova.plugins.backgroundMode.setEnabled(true);  
        cordova.plugins.backgroundMode.overrideBackButton(); 
        cordova.plugins.backgroundMode.setDefaults({title:'SO - Horus', text: 'Tracking..', resume:false, hidden:true}); 
       
        cordova.plugins.backgroundMode.on('activate',function(){
            if(vFlagTracking == true){
                cordova.plugins.backgroundMode.disableWebViewOptimizations();
        //        console.log('..'); 
                //vInteDash = setInterval(function(){navigator.vibrate(25);}, vTimerGPS); 
            }         
        });


        document.addEventListener('resume', function(e){
            //window.plugins.toast.show('Resume', 1000, 'bottom');
        });

        document.addEventListener('pause', function(e){
            //tracking();
            //clearInterval(vIntervalGeo);
            //vInteDash = setInterval(function(){ getMapLocation(); }, vTimerGPS); 
        });

        document.addEventListener('backbutton', function(e){
            console.log('..');
       //     //window.plugins.toast.show('Back Bloq..', 1000, 'bottom');          
        });
        
        getMap(14.618086,-86.959082);
    }

}

$(document).ready(function(e){


    $("#pag2").hide();
    $("#page").show();
    $("#dvHead").hide();

	$("#dvMain").hide();
	$("#dvtitle").html(vTitle);  


    //map = plugin.google.maps.Map.getMap($("#dvMain")); 

    function validaLogin(){
        var tempLogin = getParams();
        vLogin = tempLogin.login;

        vDatosUsuario.user = tempLogin.user;
        vDatosUsuario.login = vLogin;

        if(parseInt(vLogin) != 1){ 
            db.transaction(function(cmd){   
                cmd.executeSql("SELECT * FROM users where login = '1'", [], function (cmd, results) {
                    var len = results.rows.length, i;                    
                    i = 0;
                    
                    if(len>0){
                        $.ajax( {type:'POST',
                                url: ws_url,
                                dataType:'json',
                                data: {m:100, ui:results.rows.item(i).id, pw:results.rows.item(i).pwd},
                                success: function(data){ 
                                    if(data[0].flag == 'false'){
                                        console.log('Log OK');
                                        vQuery = 'DELETE FROM users WHERE id = \'' + results.rows.item(i).id + '\'';
                                        ejecutaSQL(vQuery, 0);
                                        setTimeout(function(){window.location.replace('login.html');}, 800);
                                    }else{
                                        
                                        vDatosUsuario.user = results.rows.item(i).id;
                                        vDatosUsuario.login = 1;
                                        logInOut(vDatosUsuario.user, '1');      
                                        
                                        $("#page").show();
                                        $("#dvHead").show();
                                        $("#dvMain").show();
                                        $("#bg_login").hide();
                                    }
                                },
                                error: function(data){
                                    //alert('Error consultando el servidor..');
                                    setTimeout(function(){window.location.replace('login.html');}, 800);
                                }
                        });                        	                                           
                    }else{   
                        window.location.replace('login.html');                         
                    }
                    //leeSMSs(); 
                });
            });
        }else{ 
            
            $("#page").show();
            $("#dvHead").show();
        	$("#dvMain").show(); 
        	$("#bg_login").hide(); 
            logInOut(tempLogin.user, '1'); 	
            //sleep(400);
        }
    }
    setTimeout( function(){ validaLogin();}, 100); 

});



function switchMenu(vIdFrom, vIdTo){
    switch(vIdTo)
    {
        case 0:
            $("#pag2").hide();
            $("#pag1").show();
        break;
        case 1:
            $("#pag2").show();
            $("#pag1").hide();
            reloadkpi();
        break;
    }
    $("#dvMenu").panel('close');
}

function saveGPS(vFecha, vLat, vLng, vUser){

    //navigator.vibrate(25); 
    $.ajax({
        type: 'POST',
        data: {m:201, f:vFecha, lat:vLat, lng:vLng, ui:vUser},        
        dataType:'text',
        url: ws_url,
        success: function(data){
            //alert(data);
            console.log('Sucess Save on Server');
        },
        error: function(data){
            console.log(data);
            //alert(data);
        }
    });
}

function getMapLocation() { 
    navigator.geolocation.getCurrentPosition(onSuccess, onErrorF, { enableHighAccuracy: true });
}

function onSuccess(position){
    d = new Date();
    h = '00';
    m = '00';
    sc = '00';

    if(d.getHours() < 10){
        h = '0' + d.getHours();
    }else{
        h = d.getHours();
    }

    if(d.getMinutes() < 10){
        m = '0' + d.getMinutes();
    }else{
        m = d.getMinutes();
    }

    if(d.getSeconds() < 10){
        sc = '0' + d.getSeconds();
    }else{
        sc = d.getSeconds();
    }

    console.log(h +'+'+m);
    getMap(position.coords.latitude, position.coords.longitude);

    vQre = 'INSERT INTO records (fecha, lat, lng, user) VALUES(\'' + getYMD(0) + h + m + sc + '\',';
    vQre += position.coords.latitude + ',' + position.coords.longitude + ',\''+ vDatosUsuario.user + '\')';
    //ejecutaSQL(vQre, 0);
    saveGPS(getYMD(0) + h + m + sc, position.coords.latitude, position.coords.longitude, vDatosUsuario.user);    
    
    
    //$("#test").append(d.getHours() +':'+ d.getMinutes() + '<br />' + position.coords.latitude + '/' + position.coords.longitude + '<br />');
    //navigator.vibrate(100);
}
function onErrorF(error){
    window.plugins.toast.show(error, 1000, 'bottom'); 
    console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
}


function reloadkpi(){
    vUser = vDatosUsuario.user;

    var vHtml = '';
    var json_result = [];
    var pros_mbl = 0;
    var pros_mbl_meta = 0;
    var pros_mbl_prom = 0;
    var pros_home = 0;
    var pros_home_meta = 0;
    var pros_home_prom = 0;
    var vendedor = vUser;


    $.ajax({
        type: 'POST',
        data: {m:102, ui:vUser},        
        dataType:'json',
        url: ws_url,
        beforeSend: function(){
            $.mobile.loading( 'show', {
                text: 'Cargando...',
                textVisible: true,
                theme: 'a',
                html: ""
            });
        },
        success: function(data){
            //alert(data);
            console.log(data);
            json_result = data;
            for(i=0; i<json_result.length; i++){
                vendedor = json_result[i].vendedor;
                if(json_result[i].id_kpi == 101){
                    pros_mbl = parseInt(json_result[i].prospecciones);
                    pros_mbl_meta = parseInt(json_result[i].meta);
                    pros_mbl_prom = pros_mbl/pros_mbl_meta;

                }else if(json_result[i].id_kpi == 102){
                    pros_home = parseInt(json_result[i].prospecciones);
                    pros_home_meta = parseInt(json_result[i].meta);
                    pros_home_prom = pros_mbl/pros_mbl_meta;
                }
            }

        },
        error: function(data){
            console.log(data);
            //alert(data);
        },
        complete: function(){
            //console.log(pros_mbl);
            vHtml += '<table border="0" width="100%">'                                    
            vHtml += ' <tr><td width="50%">Prop. MBL</td>'
            vHtml += ' <td width="16%" align="center">' + pros_mbl + '</td>'
            vHtml += ' <td width="16%" align="center">'+ pros_mbl_meta +'</td>'
            vHtml += ' <td align="right">'+ pros_mbl_prom.toFixed(2) +'%</td>'
            vHtml += ' </tr><tr>'
            vHtml += ' <td>Prop. Home</td>'
            vHtml += ' <td width="16%" align="center">' + pros_home + '</td>'
            vHtml += ' <td width="16%" align="center">'+ pros_home_meta +'</td>'
            vHtml += ' <td align="right">'+ pros_home_prom.toFixed(2) +'%</td>'
            vHtml += ' </tr></table>'

            $("#lbl_p_home").html(pros_home);
            $("#lbl_p_mbl").html(pros_mbl);   
            $("#vdr_name").html(vendedor); // vDatosUsuario.user) ;
            $("#tbl_content").html(vHtml);

            setTimeout(function(){
                $.mobile.loading('hide');
            }, 400);
        }
    });
}



function showdata(){

    $.ajax({
        type: 'POST',
        dataType:'text',
        data: {op:1},
        url: 'http://iteshn.hol.es/server_app/svrConsultasSO.php',
        success: function(data){
            alert(data);
            console.log('Sucess Save on Server');
        },
        error: function(data){
            console.log(data);
            alert('Error de conexion con el servidor');
        }
    });
}

function tracking(){

    if(vFlagTracking ==  false){
        cordova.plugins.backgroundMode.setEnabled(true); 
        clearInterval(vIntervalGeo);
        console.log('starting..');
        $("#btn_tack").attr('src', 'img/tracking.png');
        $("#lbl_tracking").html('Detener Tracking');
        $("#msj").html('Recorido Iniciado');
        vFlagTracking = true;
        getMapLocation();
        vIntervalGeo = setInterval(function(){ getMapLocation(); }, vTimerGPS);

    }else{
        $("#btn_tack").attr('src', 'img/play.png');
        $("#lbl_tracking").html('Iniciar Tracking');
        $("#msj").html('Recorido Finalizado');
        clearInterval(vIntervalGeo);
        vFlagTracking = false;
        cordova.plugins.backgroundMode.setEnabled(false); 
    }
}

function logout(){
    console.log(vDatosUsuario.user);
    logInOut(vDatosUsuario.user, '0');
    setTimeout(function(){ window.location.replace('index.html?user=0&login=0'); }, 800);
}



function getDataDB2(vQry, vZn, vKpi, vTypeD){
    var dataDrill = [];

    db.transaction(function(cmd2){  
        //console.log(vQry);        
        cmd2.executeSql(vQry,[], function (cmd2, results2) {
            //console.log('Sub Cnl por Zona ' + results2.rows.length); 

            if(vTypeD==0){
                for(var j=0; j<results2.rows.length; j++){
                    dataDrill.push([results2.rows.item(j).sub_cnl, results2.rows.item(j).ejecutado]);
                } 
                dataDrill1.push({"name":"Zona " + vZn, "id": vKpi + " Zona "+vZn, "data":dataDrill});
            }else{
                for(var j=0; j<results2.rows.length; j++){
                    dataDrill.push(['Zona ' + results2.rows.item(j).zona, results2.rows.item(j).ejecutado]);
                } 
                dataDrill1.push({"name":vZn, "id": vKpi + '-' + vZn, "data":dataDrill});
            }
            

            //console.log(JSON.stringify(dataDrill1));
        });
    }, function(e){console.log(e);});
}


function consultSVR(){
    //alert('hello');
    var varJSNkpis;
    var vCountRegs = 0;
    var vQry1 = '';
    var vQry2 = '';
    var vYMD =  getYMD(-1);
    var vDataDecode = '';

    //console.log('consulting server');
    //$.post('http://localhost/proyects_amg/web/websvr/svrkpi/svrConsultas.php', {op:2, kpi:0, date:vYMD, user:userWS, pdw:pdwWS}, function(rData){    //'https://svrconsultas.appspot.com/test/', function(rData){
    $.post('http://localhost:8081/ws_so1/ws_consultas_boc/kpis/2017/09/1101', function(rData){
    //$.post('https://svrconsultas.appspot.com/test/', {user:userWS, pdw:pdwWS}, function(rData){
        //console.log(str2Hex(rData));
        alert(rData);
        //console.log(rData);
        //vDataDecode = hex2a(rData);
        vDataDecode = rData;

        varJSNkpis = JSON.parse(vDataDecode);
        vCountRegs = varJSNkpis.kpis.length;
        console.log(vCountRegs);

        vGcountRegs = vCountRegs*2;
        vGcountRegs_Flag = 0;

        for(var i=0; i<vCountRegs; i++){
            //Delete from Main Data KPI
            //vQry1 = "DELETE FROM kpi_data WHERE id="+ varJSNkpis.kpis[i].id;
            vQry1 = "DELETE FROM kpi_data WHERE id="+ varJSNkpis.kpis[i].id + " and zona=" + varJSNkpis.kpis[i].zona + " and cnl='" + varJSNkpis.kpis[i].cnl + "' and sub_cnl='" + varJSNkpis.kpis[i].sb_cnl
                    + "' and territorio=" + varJSNkpis.kpis[i].ter;
            ejecutaSQL(vQry1, 0);

            //Delete from Hist Data KPI
            vQry1 = "DELETE FROM kpi_data_hist WHERE id="+ varJSNkpis.kpis[i].id + " and zona=" + varJSNkpis.kpis[i].zona + " and cnl='" + varJSNkpis.kpis[i].cnl + "' and sub_cnl='" + varJSNkpis.kpis[i].sb_cnl
                    + "' and territorio=" + varJSNkpis.kpis[i].ter + " and fecha=" + varJSNkpis.kpis[i].fecha + '';
            ejecutaSQL(vQry1, 0);            
        }
        sleep(2000);

        for(var i=0; i<vCountRegs; i++){

            //Insert into Main Data KPI
            vQry2 = "INSERT INTO kpi_data VALUES(" + varJSNkpis.kpis[i].id + ",'" + varJSNkpis.kpis[i].kpi + "'," + varJSNkpis.kpis[i].ter + "," + varJSNkpis.kpis[i].year + "," + varJSNkpis.kpis[i].month
                    + "," + varJSNkpis.kpis[i].fecha + "," + varJSNkpis.kpis[i].zona + ",'" + varJSNkpis.kpis[i].cnl + "','" + varJSNkpis.kpis[i].sb_cnl 
                    + "'," + varJSNkpis.kpis[i].ejecutado + ',' + varJSNkpis.kpis[i].forecast +',' + varJSNkpis.kpis[i].budget + ",'" + varJSNkpis.kpis[i].unit
                     + "','" + varJSNkpis.kpis[i].bu + "')";
            //console.log(vQry2);
            ejecutaSQL(vQry2, 1);
            sleep(500);

            //Insert into Hist Data KPI
            vQry2 = "INSERT INTO kpi_data_hist VALUES(" + varJSNkpis.kpis[i].id + ",'" + varJSNkpis.kpis[i].kpi + "'," + varJSNkpis.kpis[i].ter + "," + varJSNkpis.kpis[i].year + "," + varJSNkpis.kpis[i].month
                    + "," + varJSNkpis.kpis[i].fecha + "," + varJSNkpis.kpis[i].zona + ",'" + varJSNkpis.kpis[i].cnl + "','" + varJSNkpis.kpis[i].sb_cnl 
                    + "'," + varJSNkpis.kpis[i].ejecutado + ',' + varJSNkpis.kpis[i].forecast +',' + varJSNkpis.kpis[i].budget + ",'" + varJSNkpis.kpis[i].unit
                     + "','" + varJSNkpis.kpis[i].bu + "')";
            //console.log(vQry2);
            ejecutaSQL(vQry2, 1);
        }
    });
}

//Sleep 
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function getParams(param) {
    var vars = {};
    window.location.href.replace( location.hash, '' ).replace( 
        /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
        function( m, key, value ) { // callback
            vars[key] = value !== undefined ? value : '';
        }
    );

    if ( param ) {
        return vars[param] ? vars[param] : null;    
    }
    return vars;
}

function getYearMoth(vM){
    var vResult = '';
    var year = 0;
    var mes = 0;
    year = parseInt(getYMD(0).substring(0,4));
    mes = parseInt(getYMD(0).substring(4,6));

    mes = mes + vM
    if(mes < 1){
        mes = 12 + mes;
        year = year - 1
    }
    if(mes <10){
        vResult = year + "0" + mes;
    }else{
        vResult = year + "" + mes;
    }

    return vResult;
}

function getYMD(vDays){
    var vToday = new Date();
    var time = vToday.getTime();
    var milsecs = parseInt(vDays*24*60*60*1000);
    vToday.setTime(time + milsecs);

    var strDate = '';
    strDate = vToday.getFullYear();

    if(parseInt(vToday.getMonth() + 1) < 10 ){
        strDate += '0' + (vToday.getMonth()+1);
    }else{
        strDate += '' + (vToday.getMonth()+1);
    }
    if(parseInt(vToday.getDate()) < 10 ){
        strDate += '0' + vToday.getDate();
    }else{
        strDate += '' + vToday.getDate();
    }
    return strDate;
}

function getMonthName(vMonth){
    var ArrNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul','Ago','Sep','Oct', 'Nov', 'Dic'];
    return ArrNames[parseInt(vMonth)-1];
}
  


//Decodificador de datos
function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}


//Codificador de datos
function str2Hex(strVar) {
    var hex = '';//force conversion
    var str = '';
    for (var i = 0; i < strVar.length; i ++)
        hex += '' + strVar.charCodeAt(i).toString(16); //  String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return hex;
}

//Decodificador Base64
function b64_to_str(vStr){
	return decodeURIComponent(escape(window.atob(vStr)));
}


function getMap(latitude, longitude) {

    var mapOptions = {
        center: new google.maps.LatLng(0, 0),
        zoom: 1,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map
    (document.getElementById("map_tracking"), mapOptions);


    var latLong = new google.maps.LatLng(latitude, longitude);

    var marker = new google.maps.Marker({
        position: latLong
    });

    marker.setMap(map);
    map.setZoom(12);
    map.setCenter(marker.getPosition());
}

function setMarkGPS(lat, lng){
    var latLong = new google.maps.LatLng(lat, lng);
    marker.setMap(null);

    marker = new google.maps.Marker({
        position: latLong
    });

    marker.setMap(map);
    map.setCenter(marker.getPosition());
}