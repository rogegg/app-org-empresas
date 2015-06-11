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
    
    for(var i=0 ; i<total ; i++){
        //Nueva pregunta
        if(String(json.feed.entry[i].gsx$pregunta.$t).length > 0){
            nombre_pregunta_tmp = json.feed.entry[i].gsx$pregunta.$t;
            //Generamos las opciones de cada pregunta
            v_opciones = generaOpciones(json,i,total);
           
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






function generaOpciones(json,indice,total){
    var i = indice;
    var nombre = new Array();
    var id = new Array();
    var codigo = new Array();
    var vector = new Array();
    var v_codigo = new Array();
    
    //Creamos vector nombre y código para procesarlos.
    for(var j=i,k=0 ; (j==i || json.feed.entry[j].gsx$pregunta.$t == "") && j<(total-1); j++, k++){ //revisar, error en la última posición de j (última celda del documento).      
        nombre.push(json.feed.entry[j].gsx$opciones.$t);
        id.push(j);
        //Array "multidimensional" para los códigos
        v_codigo.push(json.feed.entry[j].gsx$codificación.$t);
        codigo[k] = v_codigo;
        v_codigo=[];
    }
    
    
    //Eliminamos nombres repetidos y combinamos su código.    
    for(var j=0 ; j<nombre.length ; j++){
        for(var k=j ; k<nombre.length ; k++){
            if(k!=j && nombre[k]==nombre[j]){
                nombre.splice(k,1);
                codigo[j].push(codigo[k].pop());
                codigo.splice(k,1);
            }
        }
    }
    
    //Almacenamos cada nombre con sus códigos.
    for(var j=0; j<nombre.length ;j++){
        vector.push({
            nombre: nombre[j],
            codigo: codigo[j]
        })
    }
    
    
    return vector;
}

