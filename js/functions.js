"use strict";

var total = 0;
var filtro_asignatura="S";
var context = new Object();
var tema_seleccionado = null;
context.name = "iOrg"; //nombre de la aplicacion


var context_menu = new Object();
var context_conceptos = new Object();
var context_preguntas = new Object();
var context_preguntas_vf = new Object();



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
  }else if( String(codigo_asignatura) === "OT"){
    //console.log("ELSE IF: showOt();");
    showOt();
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
  context_menu.menu = new Array();
  var total = json.feed.entry.length;
  for(var i=0; i<total; i++){
    menu[i] = json.feed.entry[i].gsx$menu.$t;  
    asignatura = json.feed.entry[i].gsx$asignatura.$t;  
            //console.log("Menu--> "+menu[i]+" con asignatura ->"+asignatura);
    context_menu.menu[i] = {
        nombre_menu: menu[i],
        asig: asignatura
    }
  }
}



/*      //Estructura estática de ejemplo
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
        asig: json.feed.entry[i].gsx$asignatura.$t,  
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
              v_concepto.push({asig: json.feed.entry[l].gsx$asignatura.$t, 
                              id:l,
                              nombre_concepto: json.feed.entry[l].gsx$concepto.$t,
                              definicion: String(json.feed.entry[l].gsx$definicion.$t),
                              ejemplo: String(json.feed.entry[l].gsx$ejemplo.$t),
                              img: String(json.feed.entry[l].gsx$imagen.$t)
              })
            }

            //Añadimos las subvariables y conceptos a las variables.
            context_conceptos.variable[j].subvariables.push(
              {nombre_subvariable: json.feed.entry[k].gsx$subvariable.$t,
                conceptos: v_concepto
              }

            );
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
    //console.log(context_conceptos);
}



//Función que recibe datos de la hoja de cálculo de google drive en la variable json
//Devuelve una estructura json más sencilla para mostrar con el sistema de plantillas HandlebarsJs.
//Esta hoja contiene preguntas cortas, agrupadas por Tema.
function leerPreguntas(json) {
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
                for(var l=i;json.feed.entry[l].gsx$tema.$t == json.feed.entry[i].gsx$tema.$t && l<total;l++){
                    n_preguntas ++;
                }
                                
                //Estructura JSON de cada tema
                context_preguntas.tema[j] = {
                    nombre_tema: json.feed.entry[i].gsx$tema.$t,
                    id_tema: "id_tema"+i,
                    id2_tema: i, //Se utiliza para conocer el índice del id.
                    numero_preguntas: n_preguntas,
                    preguntas:[],
                };
                /************ Preguntas dentro de un tema *******************/
                
                //Actualmente se envía sólo una pregunta a la plantilla. 
                
                
                var k;
                for(k=i; json.feed.entry[k].gsx$tema.$t == json.feed.entry[i].gsx$tema.$t && k<total ;k++){
                    
                    //K es el número enunciados por tema.
                    //var x = randomInt(i,k-1);
                
                    v_opciones = generaOpciones(json.feed.entry[k].gsx$opciones.$t); 
                    //console.log("V_OPCIONES: ");
                    //console.log(v_opciones);
                    v_preguntas.push({  
                                      id_pregunta:k,
                                      enunciado: json.feed.entry[k].gsx$enunciado.$t,
                                      opciones: v_opciones,
                                      respuesta: json.feed.entry[k].gsx$respuesta.$t,
                                      explicacion: json.feed.entry[k].gsx$explicacion.$t
                    })
                    v_opciones = [];
                }
                           
                
                //Guardamos la pregunta aleatoria en el tema.
                context_preguntas.tema[j].preguntas = v_preguntas;
                v_preguntas=[];
                j++;
                
                
                //console.log(context_preguntas);
            }
        }        
    }
    
    //console.log("Context preguntas");
    //console.log(context_preguntas);
}





//Función que recibe una cadena de palabras separadas por ; 
////y devuelve un vector en la que cada posición es una de esas palabras.
function generaOpciones(cadena){
    var x = -1; //primera posicion a almacenar
    var vector = new Array();
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
function generaRespuesta(enunciado,respuesta_seleccionada,respuesta_correcta,explicacion){
        $('#pregunta').empty();
        $('#pregunta').append("<p>"+enunciado+"</p>");
    
        $('#respuesta').empty();
        $('#respuesta').append(respuesta_seleccionada);    
    
//////////////////////////////////////REVISAR NO CARGA ESTILOS LA SEGUNDA VEZ QUE APARECE////////////////////////////////
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
}






//Devuelve un número aleatorio entre min y max.
function randomInt(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}


//Función que filtra las preguntas cortas para mostrar sólo una aleatoria.
//ID -> ID del tema
//n -> número de preguntas del tema
//x -> número aleatorio entre ID y ID+n
function filtroAleatorioPreguntas(id,n){
    //Pasamos a enteros para evitar problemas con cadenas.
    id = parseInt(id); 
    n = parseInt(n);
    
    //Ocultamos las preguntas para después mostrar una aleatoria.
    $('.pregunta').hide();
    $('.opciones').hide();
    
    var x = randomInt(id,id+n-1);
    //Mostramos la pregunta seleccionada aleatoriamente.
    $('.pregunta'+x).show();
    
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
                for(var l=i;json.feed.entry[l].gsx$tema.$t == json.feed.entry[i].gsx$tema.$t && l<total;l++){
                    n_preguntas ++;
                }
                                
                //Estructura JSON de cada tema
                context_preguntas_vf.tema[j] = {
                    nombre_tema: json.feed.entry[i].gsx$tema.$t,
                    id_tema: "id_tema_vf"+i,
                    id2_tema: i, //Se utiliza para conocer el índice del id.
                    numero_preguntas: n_preguntas,
                    preguntas:[],
                };
                
                /************ Preguntas dentro de un tema *******************/          
                var k;
                for(k=i; json.feed.entry[k].gsx$tema.$t == json.feed.entry[i].gsx$tema.$t && k<total ;k++){            
                    v_preguntas.push({  
                                      id_pregunta:k,
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
