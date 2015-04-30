//"use strict";

var total = 0;
var filtro_asignatura="S";
var context = new Object();
var tema_seleccionado = null;
context.name = "Organización Empresas";


var context_menu = new Object();
var context_conceptos = new Object();
var context_preguntas = new Object();
var context_pregunta = new Object();



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
  asig = new Array();
  cod = new Array();
  context.asignatura = new Array();
  total = json.feed.entry.length;
  for(i=0; i<total; i++){
    asig[i] = json.feed.entry[i].gsx$asignatura.$t;
    cod[i] = json.feed.entry[i].gsx$codigoasignatura.$t;
    context.asignatura[i] = {nombre: asig[i], codigo: cod[i]};
  }
}


function leerMenu(json) {
  menu = new Array();
  context_menu.menu = new Array();
  total = json.feed.entry.length;
  for(i=0; i<total; i++){
    menu[i] = json.feed.entry[i].gsx$menu.$t;
    context_menu.menu[i] = { nombre_menu: menu[i]}
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

//Función para extraer la información de la hoja conceptos.
//Y presentarlos como la extructura anterior de ejemplo.
function leerConceptos(json) {
  context_conceptos.variable = new Array();

  total = json.feed.entry.length;

  variable = new Array();
  subvariable = new Array();
  v_concepto = new Array();

  variable_tmp = "";

  for(i=0, j=0;i<total;i++){
    //No incluimos variables repetidas en el vector variable.
    if(variable_tmp != json.feed.entry[i].gsx$variable.$t){
      variable_tmp = json.feed.entry[i].gsx$variable.$t;

      //Estructura de cada variable
      context_conceptos.variable[j] = {
        nombre_variable: json.feed.entry[i].gsx$variable.$t,
        subvariables:[]
      };

      /************************* SUBVARIABLES ******************************/
      subvariable_tmp = "";
      for(k=i ; k<total && json.feed.entry[i].gsx$variable.$t == json.feed.entry[k].gsx$variable.$t; k++){
        //Si la subvariable no es vacía...
        if(json.feed.entry[k].gsx$subvariable.$t != ""){
          //Si la subvariable no es igual a la anterior...
          if(subvariable_tmp != json.feed.entry[k].gsx$subvariable.$t){

            /*************************** CONCEPTOS ********************************/
            for(l=k ; l<total && json.feed.entry[k].gsx$subvariable.$t == json.feed.entry[l].gsx$subvariable.$t ; l++){
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
    console.log(context_conceptos);
}



//Recibe datos de la hoja de cálculo en la variable json
//Devuelve una estructura json más sencilla para mostrar con el sistema de plantillas.
function leerPreguntas(json) {
    context_preguntas.tema = new Array();
    var tema_tmp = "";
    total = json.feed.entry.length;
    var v_preguntas = new Array();
    var n_enunciados_por_tema;
    
    for(i=0, j=0;i<total;i++){
        //No incluimos variables repetidas en el vector tema.
        if(tema_tmp != json.feed.entry[i].gsx$tema.$t){
            tema_tmp = json.feed.entry[i].gsx$tema.$t;
            //Si no es vacía
            if(tema_tmp != ""){
                //Estructura de cada variable
                context_preguntas.tema[j] = {
                    nombre_tema: json.feed.entry[i].gsx$tema.$t,
                    id_tema: "id_tema"+i,
                    preguntas:[],
                };
                /************ Preguntas dentro de un tema *******************/
                var k=0;
                for(k=i; json.feed.entry[k].gsx$tema.$t == json.feed.entry[i].gsx$tema.$t && k<total ;k++){
                    console.log("*************************Dentro for");
                    v_preguntas.push({enunciado: json.feed.entry[k].gsx$enunciado.$t,
                                      opciones: json.feed.entry[k].gsx$opciones.$t,
                                      respuesta: json.feed.entry[k].gsx$respuesta.$t
                    })
                }
                //K es el número enunciados por tema.
                var x = randomInt(0,k);
                //Pasamos la pregunta aleatoria a la plantilla.
                context_preguntas.tema[j].preguntas = v_preguntas[x];
                v_preguntas=[];
                
                
                j++;
                console.log(context_preguntas);
            }
        }        
    }
    
    //console.log("Context preguntas");
    //console.log(context_preguntas);
}





/*
//Función que genera una pregunta aleatoria a partir de un tema
function generaPregunta(){
    //Buscamos entre qué indices están las preguntas de nuestro tema

    $('.pregunta').append('<p>Prueba nombre_pregunta del tema _'+tema+'_</p>');
    $('.opciones').append('<p>opcion1;opcion2;opcion3</p>');

    //context_pregunta.nombre_pregunta = "Prueba nombre_pregunta";
    //context_pregunta.opciones = "opcion1;opcion2;opcion3";
    console.log(tema);

}*/



function randomInt(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

/***************************************************/
