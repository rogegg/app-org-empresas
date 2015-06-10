"use strict";

var context_hexagono = new Object();

function leerHexagono(json){
    context_hexagono.pregunta = new Array();
    var v_pregunta = new Array();
    var v_opciones = new Array();
    var opciones = new Array();    
    var respuesta = new Array();
    var total = json.feed.entry.length;
    var nombre_pregunta_tmp;
    
       /*
    opciones.push("Supervisión directa");
    opciones.push("Normalización de los procesos de trabajo");
    opciones.push("Normalización de habilidades");
    opciones.push("Normalización de resultados");
    opciones.push("Adaptación mutua");
    opciones.push("Normalización de valores");
    opciones.push("No lo sé");
    
    respuesta.push("Estructura simple");        //Codigo 0
    respuesta.push("Burocracia maquinal");      //Codigo 1
    respuesta.push("Burocracia profesional");   //Codigo 2
    respuesta.push("Forma divisional");         //Codigo 3
    respuesta.push("Adhocracia");               //Codigo 4
    respuesta.push("Organización misional");    //Codigo 5
    respuesta.push("No lo sé");                 //Codigo 6
    */
    
    console.log("Total: "+total);
    for(var i=0 ; i<total ; i++){
        //Nueva pregunta
        if(String(json.feed.entry[i].gsx$pregunta.$t).length > 0){
            nombre_pregunta_tmp = json.feed.entry[i].gsx$pregunta.$t;
            //recorremos las 7 opciones (de la 0 a la 6)            
            for(var j=i ; j==i || json.feed.entry[j].gsx$pregunta.$t == "" ; j++){ //revisar, error en la última posición de j.
                //console.log("J++   ->  "+(j+1);
                v_opciones.push({
                   nombre_opcion: json.feed.entry[j].gsx$opciones.$t
                });            
                //console.log(j+"->"+String(json.feed.entry[j].gsx$pregunta.$t).length);
            }
            //console.log(v_opciones);
            v_pregunta.push({
                nombre_pregunta: nombre_pregunta_tmp,
                opcion: v_opciones
            });
            v_opciones=[];
        } 
    }
    context_hexagono.pregunta = v_pregunta;
    
    console.log(context_hexagono);
}