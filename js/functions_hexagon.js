"use strict";

var context_hexagono = new Object();

function leerHexagono(json){
    context_hexagono.pregunta = new Array();
    var v_pregunta = new Array();
    var v_opciones = new Array();
    var v_opciones2 = new Array();
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
//creando la función generaOpciones para esta sección
            //recorremos las opciones
            v_opciones2 = generaOpciones(json,i);
            for(var j=i ; (j==i || json.feed.entry[j].gsx$pregunta.$t == "") && j<(total-1) ; j++){ //revisar, error en la última posición de j.
                //console.log("J++   ->  "+(j+1);
                v_opciones.push({
                    nombre_opcion: json.feed.entry[j].gsx$opciones.$t,
                    id_opcion: j,
                    codigo: json.feed.entry[j].gsx$codificación.$t
                });            
                console.log(j+"->"+json.feed.entry[j].gsx$pregunta.$t);
                console.log(total);
            }
            //console.log(v_opciones);
            v_pregunta.push({
                nombre_pregunta: nombre_pregunta_tmp,
                id_pregunta: i,
                opcion: v_opciones
            });
            v_opciones=[];
        } 
    }
    context_hexagono.pregunta = v_pregunta;
    
    console.log(context_hexagono);
}


//Genera las opciones de cada pregunta.
//La estructura de las opciones es la siguiente
//
//   Opcion:
//      - nombre_opción (string)
//      - id_opción     (string)
//      - código        (array)
//
// El nombre_opción no puede estar repetido dentro de una misma opción.
// Una misma opción puede tener varios códigos.
// Recibe:
//   - json: estructura json de toda la página spreadseet de drive.
//   - indice: indice por el que empezar a recorrer el json.
function generaOpciones(json,indice){
    var i = indice;
    var total = json.feed.entry.length; 
    var nombre = new Array();
    var id = new Array();
    var codigo = new Array();
    
    for(var j=i ; (j==i || json.feed.entry[j].gsx$pregunta.$t == "") && j<(total-1) ; j++){ //revisar, error en la última posición de j.
        nombre.push(json.feed.entry[j].gsx$opciones.$t);
        id.push(j);
        codigo.push(json.feed.entry[j].gsx$codificación.$t);
        
        v_opciones.push({
            nombre_opcion: json.feed.entry[j].gsx$opciones.$t,
            id_opcion: j,
            codigo: json.feed.entry[j].gsx$codificación.$t
        });            
    }
    
    
}