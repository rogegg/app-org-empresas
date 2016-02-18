"use strict";

var total = 0;
var filtro_asignatura="Ambas";
var context = new Object();
var tema_seleccionado = null;
var json_preguntas = null;
context.name = "iOrg"; //nombre de la aplicacion


var context_menu = new Object();
var context_conceptos = new Object();
var context_preguntas = new Object();
var context_preguntas_filtrado = new Object();
var context_preguntas_vf = new Object();
var context_relaciones = new Object();
var context_preguntas_por_tema = new Object();

var context_examen = new Object();



//Muestra sólo los ejercicios y conceptos de la asignatura (Organización de Empresas)
function showOe(){
    //console.log("         Dentro de showOe()");
    $('.OE').show();
    $('.OT').hide();
}

//Muestra sólo los ejercicios y conceptos de la asignatura (Organización del trabajo)
function showOt(){
    //console.log("         Dentro de showOt()");
    $('.OT').show();
    $('.OE').hide();
}


//Aplicamos filtro por asignatura
function filtroAsignatura(codigo_asignatura){
    //console.log("La asignatura seleccionada es: " + codigo_asignatura);
  if( String(codigo_asignatura) === "OE"){
    //console.log("IF: showOe();");
    showOe();
    filtro_asignatura="OE";
    //console.log("DESDE EL FILTRO: ");
    //console.log(context_preguntas);
      
  }else if( String(codigo_asignatura) === "OT"){
    //console.log("ELSE IF: showOt();");
    showOt();
    filtro_asignatura="OT";
  }else{
    //console.log("No hay filtrado");
  }
}



function leerAsignaturas(json) {
  var asig = new Array();
  var cod = new Array();
  context.asignatura = new Array();
  var total = json.feed.entry.length;
  for(var i=0; i<total; i++){
    asig[i] = json.feed.entry[i].gsx$asignatura.$t;
    cod[i] = json.feed.entry[i].gsx$codigoasignatura.$t;
    context.asignatura[i] = {nombre: asig[i], codigo: cod[i]};
  }
}


function leerMenu(json) {
  var menu = new Array();
  var asignatura;
  var id;
  context_menu.menu = new Array();
  var total = json.feed.entry.length;
  for(var i=0; i<total; i++){
    menu[i] = json.feed.entry[i].gsx$menu.$t;  
    asignatura = json.feed.entry[i].gsx$asignatura.$t;  
    id = json.feed.entry[i].gsx$id.$t;
            //console.log("Menu--> "+menu[i]+" con asignatura ->"+asignatura);
    context_menu.menu[i] = {
        nombre_menu: menu[i],
        asig: asignatura,
        id: id
    }
  }
}



/*    //Estructura estática de ejemplo
      context_conceptos.variable[j] = {
        nombre_variable: json.feed.entry[i].gsx$variable.$t,
        subvariables:[]
         [
          {nombre_subvariable:"subvariable",
           conceptos:[
              {nombre_concepto:"concepto"},
              {nombre_concepto:"concepto2"},
              {nombre_concepto:"concepto3"}
           ]
          },
          {nombre_subvariable:"subvariable2",
           conceptos:[
              {nombre_concepto:"concepto"},
              {nombre_concepto:"concepto2"},
              {nombre_concepto:"concepto3"}
           ]
          }
         ]
      };
*/


//Función que recibe datos de la hoja de cálculo de google drive en la variable json
//Devuelve una estructura json más sencilla para mostrar con el sistema de plantillas HandlebarsJs.
//Esta hoja contiene conceptos, agrupados en subvariables, que a su vez están agrupadas en variables.
function leerConceptos(json) {
  context_conceptos.variable = new Array();

  var total = json.feed.entry.length;

  var variable = new Array();
  var subvariable = new Array();
  var v_concepto = new Array();

  var variable_tmp = "";

  //Recorre todas las filas usadas en la hoja de cálculo
  for(var i=0, j=0;i<total;i++){
    //No incluimos variables repetidas en el vector variable.
    if(variable_tmp != json.feed.entry[i].gsx$variable.$t){
      variable_tmp = json.feed.entry[i].gsx$variable.$t;

      //Estructura de cada variable
      context_conceptos.variable[j] = {
        filtrovariable:   json.feed.entry[i].gsx$filtrovariable.$t,  
        asig: json.feed.entry[i].gsx$filtroconcepto.$t,  
        nombre_variable: json.feed.entry[i].gsx$variable.$t,
        subvariables:[]
      };

      /************************* SUBVARIABLES ******************************/
      var subvariable_tmp = "";
      for(var k=i ; k<total && json.feed.entry[i].gsx$variable.$t == json.feed.entry[k].gsx$variable.$t; k++){
        //Si la subvariable no es vacía...
        if(json.feed.entry[k].gsx$subvariable.$t != ""){
          //Si la subvariable no es igual a la anterior...
          if(subvariable_tmp != json.feed.entry[k].gsx$subvariable.$t){

            /*************************** CONCEPTOS ********************************/
            for(var l=k ; l<total && json.feed.entry[k].gsx$subvariable.$t == json.feed.entry[l].gsx$subvariable.$t ; l++){
              v_concepto.push({
                              asig: json.feed.entry[l].gsx$filtroconcepto.$t, 
                              id:l,
                              nombre_concepto: json.feed.entry[l].gsx$concepto.$t,
                              definicion: String(json.feed.entry[l].gsx$definicion.$t),
                              ejemplo: String(json.feed.entry[l].gsx$ejemplo.$t),
                              img: String(json.feed.entry[l].gsx$imagen.$t)
              })
            }

            //Añadimos las subvariables y conceptos a las variables.
            context_conceptos.variable[j].subvariables.push({
                nombre_subvariable: json.feed.entry[k].gsx$subvariable.$t,
                filtrosubvariable: json.feed.entry[k].gsx$filtrosubvariable.$t,
                conceptos: v_concepto
              });
          }

          subvariable_tmp = json.feed.entry[k].gsx$subvariable.$t;

          v_concepto=[];
          /************************** FIN CONCEPTOS *****************************/
        }
      }
          /***********************FIN_SUBVARIABLES*********************************/
      j++;

    }
  
  }
    //console.log("CONTEXT_CONCEPTOS");
    //console.log(context_conceptos);
    //console.log(json);
}



//Función que recibe datos de la hoja de cálculo de google drive en la variable json
//Devuelve una estructura json más sencilla para mostrar con el sistema de plantillas HandlebarsJs.
//
//Esta hoja contiene preguntas cortas, agrupadas por Tema.
function leerPreguntas(json){
    json_preguntas = json;
    context_preguntas.tema = new Array();
    var tema_tmp = "";
    var total = json.feed.entry.length;
    var v_preguntas = new Array();
    var v_opciones = new Array();
    var n_preguntas = 0;
    
    //Recorremos las filas de la hoja de cálculo hasta el final.
    for(var i=0, j=0;i<total;i++){
        //Si el tema es diferente al anterior, creamos una nueva estructura TEMA.
        if(tema_tmp != json.feed.entry[i].gsx$tema.$t){
            tema_tmp = json.feed.entry[i].gsx$tema.$t;
            //Si no es vacía
            if(tema_tmp != ""){
                //********************************************
                //Contamos las preguntas por tema
                n_preguntas = 0;
                for(var l=i;json.feed.entry[l].gsx$tema.$t == json.feed.entry[i].gsx$tema.$t && l<(total-1);l++){
                    n_preguntas ++;
                }
                
                
                                
                //Estructura JSON de cada tema
                context_preguntas.tema[j] = {
                    filtro_examen: json.feed.entry[i].gsx$filtroexamen.$t,
                    filtrotema: json.feed.entry[i].gsx$filtrotema.$t,
                    nombre_tema: json.feed.entry[i].gsx$tema.$t,
                    indice: j,
                    id_tema: "id_tema"+i,
                    id2_tema: i, //Se utiliza para conocer el índice del id.
                    numero_preguntas: n_preguntas,
                    preguntas:[],
                };
                
                
                /************ Preguntas dentro de un tema *******************/            
                var k;
                for(k=i; json.feed.entry[k].gsx$tema.$t == json.feed.entry[i].gsx$tema.$t && k<(total-1) ;k++){
                    
                    //K es el número enunciados por tema.
                    //var x = randomInt(i,k-1);
                    
                    v_opciones = generaOpciones(json.feed.entry[k].gsx$opciones.$t,k); 
                    //console.log("V_OPCIONES: ");
                    //console.log(v_opciones);
                    v_preguntas.push({  
                                      id_pregunta:k,
                                      asig: json.feed.entry[k].gsx$filtropregunta.$t,
                                      enunciado: json.feed.entry[k].gsx$enunciado.$t,
                                      opciones: v_opciones,
                                      respuesta: json.feed.entry[k].gsx$respuesta.$t,
                                      explicacion: json.feed.entry[k].gsx$explicacion.$t
                    })
                    v_opciones = [];
                }
                           
                //Aún falta el último valor K para añadir.
                v_opciones = generaOpciones(json.feed.entry[k].gsx$opciones.$t); 
                    v_preguntas.push({  
                                      id_pregunta:k,
                                      asig: json.feed.entry[k].gsx$filtropregunta.$t,
                                      enunciado: json.feed.entry[k].gsx$enunciado.$t,
                                      opciones: v_opciones,
                                      respuesta: json.feed.entry[k].gsx$respuesta.$t,
                                      explicacion: json.feed.entry[k].gsx$explicacion.$t
                    })
                    v_opciones = [];
                
                
                
                //Guardamos la pregunta aleatoria en el tema.
                context_preguntas.tema[j].preguntas = v_preguntas;
                v_preguntas=[];
                j++;
                
                
                
            }
        }        
    }
    
    //Generamos una página por tema con todas las preguntas.
    //generaTema();
    
    
    
    //console.log(context_preguntas);
    
    //console.log("Context preguntas");
    //console.log(context_preguntas);
}






//Genera las distintas páginas por temas de preguntas cortas.
function generaTema(indice){
   
    var ini=0, fin=0, x=0, nombre="";
    ini = 0;
    fin = parseInt(context_preguntas.tema[indice].numero_preguntas) - 1 ;
    x = randomInt(ini,fin);
    
    var respuesta = context_preguntas.tema[indice].preguntas[x].respuesta;
    var explicacion = context_preguntas.tema[indice].preguntas[x].explicacion;
    var enunciado = context_preguntas.tema[indice].preguntas[x].enunciado;
    $('#enunciado-pregunta').empty();
    $('#enunciado-pregunta').append(enunciado);
    
    $('#opciones-respuesta').empty();
    for(var i=0 ; i<context_preguntas.tema[indice].preguntas[x].opciones.length; i++){
        nombre = context_preguntas.tema[indice].preguntas[x].opciones[i].nombre;
        $('#opciones-respuesta').append(
            '<a href="#respuesta_preguntas_cortas" data-role="button" role="button" class="ui-link ui-btn ui-shadow ui-corner-all" onclick="generaRespuesta(\''+enunciado+'\',\''+nombre+'\',\''+respuesta+'\',\''+explicacion+'\',\''+indice+'\')">'+nombre+'</a>'
        );
    }
    
    
    $('#boton-siguiente-pregunta').attr({
        'href':'#',
        'data-role':'button',
        'onclick':'generaTema('+indice+')'
    });
    
}

//Función que recibe una cadena de palabras separadas por ; 
////y devuelve un vector en la que cada posición es una de esas palabras.
function generaOpciones(cadena,indice){
    var x = -1; //primera posicion a almacenar
    var vector = new Array();
    indice = parseInt(indice);
    for(var i=0; i<cadena.length ; i++) {
        //Si encuentro un punto y coma almaceno la palabra.
        if(cadena[i]==";"){
            //vector[j] = cadena.substring(x+1,i);
            vector.push({nombre: cadena.substring(x+1,i)});
            x=i+1;
        }
    }
    vector.push({nombre:cadena.substring(x+1,cadena.length)})
    return vector;
}


//Comprueba si la respuesta es correcta o no, y genera la página de respuesta correcta o incorrecta
function generaRespuesta(enunciado,respuesta_seleccionada,respuesta_correcta,explicacion,indice){
    
    
        $('#pregunta').empty();
        $('#pregunta').append("<p>"+enunciado+"</p>");
    
        $('#respuesta').empty();
        $('#respuesta').append(respuesta_seleccionada);    
    
        if(respuesta_correcta == respuesta_seleccionada){
            $('#respuesta').empty();
            $('#respuesta').append('<a data-role="button" data-theme="g" class="ui-right-g ui-link ui-btn ui-btn-g ui-icon-check ui-btn-icon-left ui-shadow ui-corner-all" data-icon="check">'+respuesta_seleccionada+'</a>');
        }else{
            $('#respuesta').empty();
            //class="ui-wrong-g ui-link ui-btn ui-btn-g ui-icon-delete ui-btn-icon-left ui-shadow ui-corner-all"
            //$('#respuesta').append('<a data-role="button" data-theme="g" class="ui-wrong-g" data-icon="delete">'+respuesta_seleccionada+'</a>');
            $('#respuesta').append('<a data-role="button" data-theme="g" class="strike ui-wrong-g ui-link ui-btn ui-btn-g ui-icon-delete ui-btn-icon-left ui-shadow ui-corner-all" data-icon="delete">'+respuesta_seleccionada+'</a>');
            $('#respuesta').append('<h3>Respuesta correcta: '+respuesta_correcta+'</h2>');
        }
    
        $('#explicacion').empty();
        $('#explicacion').append(explicacion);
    
        
        $('#genera-siguiente').attr('onclick','generaTema('+indice+')');
}






//Devuelve un número aleatorio entre min y max. (min y max incluidos)
function randomInt(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}




//VERSION 1 - No filtra las asignaturas
//Función que filtra las preguntas cortas para mostrar sólo una aleatoria.
//ID -> ID del tema
//n -> número de preguntas del tema
function filtroAleatorioPreguntasVF(id,n){
    //Pasamos a enteros para evitar problemas con cadenas.
    id = parseInt(id); 
    n = parseInt(n);
    var x; //x -> número aleatorio entre ID y ID+n
    
    //Ocultamos las preguntas para después mostrar una aleatoria.
    $('.pregunta').hide();
    $('.opciones').hide();
    x = randomInt(id,id+n-1);    
    
    
    
    //Mostramos la pregunta seleccionada aleatoriamente.
    $('.pregunta'+x).show();
    
    //console.log("CONTEXT_PREGUNTAS: ");
    //console.log("id: "+id+"____ n: "+n+"____ x:"+x);
    //console.log(context_preguntas);
    //console.log(filtro_asignatura);
    //console.log(json_preguntas.feed.entry[x].gsx$enunciado.$t);
    //console.log(json_preguntas.feed.entry[x].gsx$asignatura.$t);
}



//VERSION 2 - filtra las asignaturas.
//Función que filtra las preguntas cortas para mostrar sólo una aleatoria.
//ID -> ID del tema
//n -> número de preguntas del tema
function filtroAleatorioPreguntas(indice,id,n){
    //console.log("############# FILTRO ALEATORIO PREGUNTAS ####################");
    //Pasamos a enteros para evitar problemas con cadenas.
    id = parseInt(id); 
    n = parseInt(n);
    indice = parseInt(indice);
    var v_coincidencias = new Array(); //Almacenamos las coincidencias con el filtro.
    var x; //x -> número aleatorio entre ID y ID+n
    
    //Ocultamos las preguntas para después mostrar una aleatoria.
    $('.pregunta').hide();
    $('.opciones').hide();

    
    //Recorrer la estructura con todas las preguntas del tema. Desde id hasta id+n
    //console.log(context_preguntas);    
    //console.log("EL ID -> "+id);
    for(var i=0; i<n; i++){        
        //Almacenar las preguntas que corresponden al filtrado
        if(context_preguntas.tema[indice].preguntas[i].asig=="Ambas" || 
           context_preguntas.tema[indice].preguntas[i].asig==filtro_asignatura){
           //console.log("coincidencia encontrada");
            v_coincidencias.push(i);
        }
        //console.log(context_preguntas.tema[indice])
    }
    
    
    //Elegimos una aleatoria
    //x = randomInt(id,id+n-1);    
    
    x = randomInt(0,eval(v_coincidencias.length-1));
    
    
    //Mostramos la pregunta seleccionada aleatoriamente.
    //$('.pregunta'+x).show();
    $('.pregunta'+eval(v_coincidencias[x]+id)).show();
    
    //console.log("V_COINCIDENCIAS: ");
    //console.log(v_coincidencias);
    //console.log("id: "+id+" id+n: "+eval(id+n-1));
    
    
    //console.log("id: "+id+"____ n: "+n+"____ x:"+x);
    //console.log(context_preguntas);
    //console.log("Filtro asignatura: "+filtro_asignatura);
    
    //console.log(json_preguntas.feed.entry[x].gsx$enunciado.$t);
    //console.log(json_preguntas.feed.entry[x].gsx$asignatura.$t);
}



//VERSION 2 - filtra las asignaturas.
//Función que filtra las preguntas cortas para mostrar sólo una aleatoria.
//ID -> ID del tema
//n -> número de preguntas del tema
function filtroAleatorioPreguntasVF2(indice,id,n){
    //console.log("############# FILTRO ALEATORIO PREGUNTAS VF2 ####################");
    //Pasamos a enteros para evitar problemas con cadenas.
    id = parseInt(id); 
    n = parseInt(n);
    indice = parseInt(indice);
    var v_coincidencias_vf = new Array(); //Almacenamos las coincidencias con el filtro.
    var x; //x -> número aleatorio entre ID y ID+n
    
    //Ocultamos las preguntas para después mostrar una aleatoria.
    $('.pregunta').hide();
    $('.opciones').hide();

    
    //Recorrer la estructura con todas las preguntas del tema. Desde id hasta id+n
    //console.log(context_preguntas_vf);    
    //console.log("EL ID -> "+id);
    for(var i=0; i<n; i++){  
        //Almacenar las preguntas que corresponden al filtrado
        //console.log("Dentro for: "+context_preguntas_vf.tema[indice].preguntas[i].asig);
        if(context_preguntas_vf.tema[indice].preguntas[i].asig=="Ambas" || 
           context_preguntas_vf.tema[indice].preguntas[i].asig==filtro_asignatura){
           //console.log("coincidencia encontrada");
            v_coincidencias_vf.push(i);
        }
        //console.log(context_preguntas.tema[indice])
    }
    
    
    //Elegimos una aleatoria
    //x = randomInt(id,id+n-1);    
    
    x = randomInt(0,eval(v_coincidencias_vf.length-1));
    //console.log("Random(0, "+eval(v_coincidencias_vf.length-1)+") = "+x);
    
    
    //Mostramos la pregunta seleccionada aleatoriamente.
    //$('.pregunta'+x).show();
    $('.pregunta'+eval(v_coincidencias_vf[x]+id)).show();
    
    //console.log("V_COINCIDENCIAS: ");
    //console.log(v_coincidencias_vf);
    //console.log("id: "+id+" id+n: "+eval(id+n-1));
    
    
    //console.log("id: "+id+"____ n: "+n+"____ x:"+x);
    //console.log(context_preguntas);
    //console.log("Filtro asignatura: "+filtro_asignatura);
    
    //console.log(json_preguntas.feed.entry[x].gsx$enunciado.$t);
    //console.log(json_preguntas.feed.entry[x].gsx$asignatura.$t);
}



//Función que recibe datos de la hoja de cálculo de google drive en la variable json
//Devuelve una estructura json más sencilla para mostrar con el sistema de plantillas HandlebarsJs.
//Esta hoja contiene preguntas verdadero y falso, agrupadas por tema y subtema.
function leerPreguntasVF(json) {
    context_preguntas_vf.tema = new Array();
    var tema_tmp = "";
    var total = json.feed.entry.length;
    var v_preguntas = new Array();
    var n_preguntas = 0;
    
    //Recorremos las filas de la hoja de cálculo hasta el final.
    for(var i=0, j=0;i<total;i++){
        //Si el tema es diferente al anterior, creamos una nueva estructura TEMA.
        if(tema_tmp != json.feed.entry[i].gsx$tema.$t){
            tema_tmp = json.feed.entry[i].gsx$tema.$t;
            //Si no es vacía
            if(tema_tmp != ""){
                
                //********************************************
                //Contamos las preguntas por tema
                n_preguntas = 0;
                
                for(var l=i; json.feed.entry[l].gsx$tema.$t == json.feed.entry[i].gsx$tema.$t && l<eval(total-1);l++){
                    n_preguntas ++;
                }
                                                
                //Estructura JSON de cada tema
                context_preguntas_vf.tema[j] = {
                    indice: j,
                    filtrotema: json.feed.entry[i].gsx$filtrotema.$t,
                    nombre_tema: json.feed.entry[i].gsx$tema.$t,
                    id_tema: "id_tema_vf"+i,
                    id2_tema: i, //Se utiliza para conocer el índice del id.
                    numero_preguntas: n_preguntas,
                    preguntas:[],
                };
                
                /************ Preguntas dentro de un tema *******************/          
                var k;
                for(k=i; json.feed.entry[k].gsx$tema.$t == json.feed.entry[i].gsx$tema.$t && k<eval(total-1) ;k++){            
                    v_preguntas.push({  
                                      id_pregunta:k,
                                      asig: json.feed.entry[k].gsx$filtropregunta.$t,
                                      enunciado: json.feed.entry[k].gsx$pregunta.$t,
                                      respuesta: json.feed.entry[k].gsx$respuesta.$t,
                                      explicacion: json.feed.entry[k].gsx$explicacion.$t
                    })
                }
                           
                //Guardamos las preguntas en el tema correspondiente
                context_preguntas_vf.tema[j].preguntas = v_preguntas;
                v_preguntas=[];
                j++;
                
                
            }
        }        
    }
    
    //console.log("Context preguntas VF");
    //console.log(context_preguntas_vf);
}


//Comprueba si la respuesta es correcta o no, y genera la página de respuesta correcta o incorrecta
function generaRespuestaVF(enunciado,respuesta_seleccionada,respuesta_correcta,explicacion){
        var respuesta_seleccionada_tmp ="";
        var respuesta_correcta_tmp ="";
        $('#preguntaVF').empty();
        $('#preguntaVF').append("<p>"+enunciado+"</p>");
    
        //Traducimos V = Verdadero y F = Falso
        if(respuesta_seleccionada == "V"){
           respuesta_seleccionada_tmp = "Verdadero" ;
        }else{respuesta_seleccionada_tmp = "Falso" ;}
    
        if(respuesta_correcta == "V"){
           respuesta_correcta_tmp = "Verdadero" ;
        }else{respuesta_correcta_tmp = "Falso" ;}
    
        if(respuesta_correcta == respuesta_seleccionada){
            $('#respuestaVF').empty();
            $('#respuestaVF').append('<a data-role="button" data-theme="g" class="ui-right-g ui-link ui-btn ui-btn-g ui-icon-check ui-btn-icon-left ui-shadow ui-corner-all" data-icon="check">'+respuesta_seleccionada_tmp+'</a>');
        }else{
            $('#respuestaVF').empty();
            //class="ui-wrong-g ui-link ui-btn ui-btn-g ui-icon-delete ui-btn-icon-left ui-shadow ui-corner-all"
            //$('#respuesta').append('<a data-role="button" data-theme="g" class="ui-wrong-g" data-icon="delete">'+respuesta_seleccionada+'</a>');
            $('#respuestaVF').append('<a data-role="button" data-theme="g" class="strike ui-wrong-g ui-link ui-btn ui-btn-g ui-icon-delete ui-btn-icon-left ui-shadow ui-corner-all" data-icon="delete">'+respuesta_seleccionada_tmp+'</a>');
            $('#respuestaVF').append('<h3>Respuesta correcta: '+respuesta_correcta_tmp+'</h2>');
        }
    
        $('#explicacionVF').empty();
        $('#explicacionVF').append(explicacion);
    
}


/***************************************************/





function leerRelaciones(json){
    var total = json.feed.entry.length;
    var v_relaciones = new Array();
    context_relaciones.relaciones = new Array();
    
    //Recorremos las filas de la hoja de cálculo hasta el final.
    for(var i=0, j=0;i<total;i++){
            v_relaciones.push({
                id: i,
                asig: json.feed.entry[i].gsx$filtro.$t,
                variable: json.feed.entry[i].gsx$variable.$t,
                valor: json.feed.entry[i].gsx$valor.$t
            });
    }
    context_relaciones.relaciones = v_relaciones;
    
    //console.log("Leer relaciones");
    //console.log(context_relaciones);
}



//Función que comprueba que todos los select seleccionen algún valor:
//- Si todos están seleccionados activa el botón siguiente.
//- Si alguno queda sin seleccionar no se activa el botón.
function compruebaSelectRelaciones(){
    var n_relaciones=2;
    var index;
    var valor;
    var texto;
    //console.log("DENTRO DE COMPRUEBASELECTrELACIONES");
    for(var i=0;i<n_relaciones;i++){
        index = eval("document.formularioRelaciones.relacion"+i+".selectedIndex");
        valor = eval("document.formularioRelaciones.relacion"+i+".options[index].value");
        texto = eval("document.formularioRelaciones.relacion"+i+".options[index].text"); 
        //Si algún select no está seleccionado
        if(valor < 0){
            //Mostrar botón rojo con comentario
            $('#boton-relaciones-rojo').show();
            $('#boton-relaciones-verde').hide();
            
            return;
        }   
    }
    //Mostrar botón verde.
    $('#boton-relaciones-verde').show();
    $('#boton-relaciones-rojo').hide();
    $('#boton-relaciones-verde').focus(); //Revisar,¿como hacer focus a <span>?
}

//Lee la plantilla resultados de relaciones de drive.
function leerResultadoRelaciones(json){
    var total = json.feed.entry.length;
    var resultado = new Array();
    
    for(var i=0;i<total;i++){
        resultado.push({
            condicion: json.feed.entry[i].gsx$relacion.$t,
            descripcion: json.feed.entry[i].gsx$descripcion.$t
        })
    }
    context_relaciones.resultado = resultado;
    //console.log(context_relaciones.resultado);
}


//Procesa el formulario de Relaciones entre variables.
function submitRelaciones(){
    var n_preguntas = 2;
    var texto;
    var index;
    var valor;
    var valores="";
    
    //Leemos los elementos seleccionados en el select
    $("#explicacionRelaciones").empty();    
    index = eval("document.formularioRelaciones.relacion0.selectedIndex");
    valor = eval("document.formularioRelaciones.relacion0.options[index].value");
    texto = eval("document.formularioRelaciones.relacion0.options[index].text"); 
    
    $("#explicacionRelaciones").append("<span>Variable que ejerce una influencia (causa):<br> <strong>"+texto+"</strong></span><br><br>");

    valores = valor;
    valores += ",";
    
    index = eval("document.formularioRelaciones.relacion1.selectedIndex");
    valor = eval("document.formularioRelaciones.relacion1.options[index].value");
    texto = eval("document.formularioRelaciones.relacion1.options[index].text"); 
    
    $("#explicacionRelaciones").append("<span>Variable sobre la que ejerce la influencia (efecto):<br> <strong>"+texto+"</strong></span><br>");
    
    valores += valor;
    
    //console.log(valores);
    //console.log(context_relaciones.resultado);
    
      for(var i in context_relaciones.resultado){
        if(valores == context_relaciones.resultado[i].condicion){
            //$("#explicacionRelaciones").append("<span>Condicion:"+context_relaciones.resultado[i].condicion+"</span><br>");
            $("#explicacionRelaciones").append(
                "<h3> Solución: </h3> \
                 <p>"+context_relaciones.resultado[i].descripcion+"</p><br>"
            );
            return 1;
        }
      }
      $("#explicacionRelaciones").append(
            "<h3> Solución: </h3> \
             <p>No existe relación teórica entre las variables seleccionadas.</p><br>"
        );
}


//Vuelve al valor por defecto el formulario.
function limpiaSeleccionRelaciones(){
    document.getElementById("formularioRelaciones").reset();
    //Desactiva botón verde
    compruebaSelectRelaciones();
}

function limpiaSeleccion(){
    limpiaSeleccionHexagono();
    limpiaSeleccionRelaciones();
}

//Función que contrae TODOS los desplegables abiertos.
function contraerDesplegables(){
    $( ".ui-collapsible" ).collapsible( "collapse" );
}


//Contraer todos los desplegables de nivel 2, estos son los desplegables 
//anidados dentro de otro desplegable.(Ver menú conceptos).
function contraerLvl2(){
    $( ".collapsible-lvl2" ).collapsible( "collapse" );
}















