"use strict";

var context_examen = new Object();
var context_examen_vf = new Object();


/************************************************** EXAMEN PREGUNTAS OPCIÓN MÚLTIPLE ***************************************************************/

//función que utiliza el objeto "context_preguntas" con las preguntas cortas para generar un objeto para los exámenes.
//Se filtran asignaturas y temas que no sirven en el examen. Se selecciona una pregunta aleatorias entre los temas.
function generaExamen(){

    var x=0; var y=0; //Vamos a almacenar el número aleatorio de la pregunta elegida en cada tema.
    var v_preguntas = new Array();
    var n_preguntas=0; //Número de preguntas del examen.
    var v_respuestas = new Array(); //Vector para almacenar las respuestas correctas.
    var j=0;//Contador para la id de cada pregunta.
    
    for(var i=0; i<context_preguntas.tema.length; i++){
        //Si es seleccionable para el examen
        if(context_preguntas.tema[i].filtro_examen != ""){
            //Si coincide con el filtro de asignatura
            if(context_preguntas.tema[i].filtrotema == filtro_asignatura || context_preguntas.tema[i].filtrotema == ""){
                n_preguntas ++;
                
                //Calculamos el índice de 2 preguntas aleatoriamente.
                x= randomInt(0, context_preguntas.tema[i].numero_preguntas);
                do{
                  y= randomInt(0, context_preguntas.tema[i].numero_preguntas);  
                }while( y == x);
                
                v_preguntas.push(context_preguntas.tema[i].preguntas[x]);
                v_preguntas[j].id_examen = j;
                v_preguntas[j].id_n_pregunta = j+1;
                j++;
                
                v_preguntas.push(context_preguntas.tema[i].preguntas[y]);
                v_preguntas[j].id_examen = j;
                v_preguntas[j].id_n_pregunta = j+1;
                j++;
                
                
                v_respuestas.push(context_preguntas.tema[i].preguntas[x].respuesta);
                v_respuestas.push(context_preguntas.tema[i].preguntas[y].respuesta);
                
                context_examen = {preguntas:[],
                                 respuestas:[]
                                 };            
            }
        }
    }
    context_examen.preguntas = v_preguntas;
    context_examen.respuestas = v_respuestas;
    
     
    //Cargamos nuevos datos en plantilla HAndlebars
    var source   = $("#plantilla-examen").html();
    var template = Handlebars.compile(source);
    var html     = template(context_examen);
    $('#contenedor-examen').html(html);

}





//Función que utiliza generaExamen() y además llama a la función trigger de JQM para recargar los estilos.
function generaOtroExamen(){
    generaExamen();
    //Actualizamos estilos JqueryMobile
    $('#examen-autoev').trigger('create');
}






//Extrae los valores del formulario del examen y da una corrección al mismo.
function corrigeExamen(){
    //Variables para leer el select del formulario
    var texto;    var index;    var valor;
    
    var calificacion = 0; //Calificación.
    var acierto = 0.5; //Incremento en la calificación de las respuestas correctas.
    var error= -0.25 ; //Penalización en la calificación de las respuestas incorrectas.
    
    //Accedemos a los valores del formulario.
    for(var i=0;i<context_examen.preguntas.length;i++){
        //Leemos los valores seleccionados en el formulario.
        index = eval("document.formularioExamen.selExamen"+i+".selectedIndex");
        valor = eval("document.formularioExamen.selExamen"+i+".options[index].value");
        texto = eval("document.formularioExamen.selExamen"+i+".options[index].text"); 
        
        //Comprobamos si la respuesta es correcta o no.
        if(index == 0){
            //Si no se responde, no se suma nada a la nota.

        }else if(texto == context_examen.preguntas[i].respuesta){
            //Respuesta correcta.
            calificacion = calificacion + acierto;
            $('#pregunta-examen-'+i).css("background-color","#B2DFB9");
            $('#caja-pregunta-examen-'+i).css("border","1px solid green");
            $('#resultado-examen-'+i).empty();
            $('#resultado-examen-'+i).append('<a data-role="button" data-theme="g" class="ui-right-g ui-link ui-btn ui-btn-g ui-icon-check ui-btn-icon-left ui-shadow ui-corner-all" data-icon="check">Correcto</a>');

        }else{
            //respuesta incorrecta.
            calificacion = calificacion + error;
            $('#pregunta-examen-'+i).css("background-color","#DFB2B2");
            $('#caja-pregunta-examen-'+i).css("border","1px solid red");
            
            $('#resultado-examen-'+i).empty();
            $('#resultado-examen-'+i).append('<a data-role="button" data-theme="g" class="ui-wrong-g ui-link ui-btn ui-btn-g ui-icon-delete ui-btn-icon-left ui-shadow ui-corner-all" data-icon="delete">Incorrecto</a>');
            
            //Añadimos explicación
            $('#explicacion-examen-'+i).empty();
            $('#explicacion-examen-'+i).append('<center style="background:linear-gradient(#FFF, #F1F1F1);"><h3>Explicación</h3><p>'+context_examen.preguntas[i].explicacion+'</p></center>');

        }        
    }
    
    
    var nota = (calificacion * 10.0) / (context_examen.preguntas.length * acierto);
    nota = parseFloat(nota).toPrecision(3);
    $('.calificacion-examen').empty();
    $('.calificacion-examen').append('<h3>Tu calificación es: '+nota+' sobre 10</h3>');


}









/************************************************** EXAMEN PREGUNTAS VERDADERO/FALSO ***************************************************************/



//función que utiliza el objeto "context_preguntas_vf" con las preguntas verdadero/falso para generar un objeto para los exámenes.
//Se filtran asignaturas y temas que no sirven en el examen. Se seleccionan dos preguntas aleatorias entre los temas.
function generaExamenVF(){
    
    var x=0; var y=0; //Vamos a almacenar el número aleatorio de la pregunta elegida en cada tema.
    var v_preguntas = new Array();
    var n_preguntas=0; //Número de preguntas del examen.
    var v_respuestas = new Array(); //Vector para almacenar las respuestas correctas.
    var j=0;//Contador para la id de cada pregunta.
    
    
    //Recorremos todas las preguntas verdadero falso.
    for(var i=0; i<context_preguntas_vf.tema.length; i++){
        
        //Si es seleccionable para el examen, la procesamos.
        if(context_preguntas_vf.tema[i].filtro_examen != ""){
            //Si coincide con el filtro de asignatura
            if(context_preguntas_vf.tema[i].filtrotema == filtro_asignatura || context_preguntas_vf.tema[i].filtrotema == ""){
                n_preguntas ++;                
                
                //Calculamos el índice de 2 preguntas aleatoriamente.
                x= randomInt(0, (context_preguntas_vf.tema[i].numero_preguntas-1) );
                do{
                  y= randomInt(0, (context_preguntas_vf.tema[i].numero_preguntas-1) );  
                }while( y == x);

      
                //Rellenamos el vector v_preguntas, con la pregunta "x" e "y" .
                v_preguntas.push(context_preguntas_vf.tema[i].preguntas[x]);
                v_preguntas[j].id_examen = j;
                v_preguntas[j].id_n_pregunta = j+1;
                j++;
           
                v_preguntas.push(context_preguntas_vf.tema[i].preguntas[y]);
                v_preguntas[j].id_examen = j;
                v_preguntas[j].id_n_pregunta = j+1;
                j++;
                
                
                v_respuestas.push(context_preguntas_vf.tema[i].preguntas[x].respuesta);
                v_respuestas.push(context_preguntas_vf.tema[i].preguntas[y].respuesta);
                
                context_examen_vf = {preguntas:[],
                                     respuestas:[]   };  
                        

            }
        }       
    }
    
    context_examen_vf.preguntas = v_preguntas;
    context_examen_vf.respuestas = v_respuestas;
    
         
    //Cargamos nuevos datos en plantilla HAndlebars
    var source   = $("#plantilla-examen-vf").html();
    var template = Handlebars.compile(source);
    var html     = template(context_examen_vf);
    $('#contenedor-examen-vf').html(html);
    


}





//Función que utiliza generaExamenVF() y además llama a la función trigger de JQMobile para recargar los estilos.
function generaOtroExamenVF(){
    generaExamenVF();
    //Actualizamos estilos JqueryMobile
    $('#examen-autoev-vf').trigger('create');
}





//Extrae los valores del formulario del examen Verdadero y Falso y da una corrección al mismo.
function corrigeExamenVF(){

    //Variables para leer el select del formulario
    var texto;    var index;    var valor;
    
    var calificacion = 0; //Calificación.
    var acierto = 0.5; //Incremento en la calificación de las respuestas correctas.
    var error= -0.25 ; //Penalización en la calificación de las respuestas incorrectas.
    
    var respuesta;
    
    //Accedemos a los valores del formulario.
    for(var i=0;i<context_examen_vf.preguntas.length;i++){


        
        //Leemos las respuestas seleccionadas
        if( $("#radio-examen-verdadero-"+i)[0].checked ) { respuesta = "V"; }
        else if( $("#radio-examen-falso-"+i)[0].checked ) { respuesta = "F"; }
        else { respuesta = "";}
         
        
        //Vamos a comprobar si la respuesta seleccionada es correcta.
        if(respuesta == ""){
            //SI no se responde, no se suma ni se resta nada a la nota.   
            
        }else if(respuesta == context_examen_vf.preguntas[i].respuesta){
            //Si la respuesta es CORRECTA
            calificacion = calificacion + acierto;
            $('#pregunta-examen-vf-'+i).css("background-color","#B2DFB9");
            $('#caja-pregunta-examen-vf-'+i).css("border","1px solid green");
            $('#resultado-examen-vf-'+i).empty();
            $('#resultado-examen-vf-'+i).append('<a data-role="button" data-theme="g" class="ui-right-g ui-link ui-btn ui-btn-g ui-icon-check ui-btn-icon-left ui-shadow ui-corner-all" data-icon="check">Correcto</a>');
            
        }else{
            //Si la respuesta es INCORRECTA        
            calificacion = calificacion + error;
            $('#pregunta-examen-vf-'+i).css("background-color","#DFB2B2");
            $('#caja-pregunta-examen-vf-'+i).css("border","1px solid red");
            
            $('#resultado-examen-vf-'+i).empty();
            $('#resultado-examen-vf-'+i).append('<a data-role="button" data-theme="g" class="ui-wrong-g ui-link ui-btn ui-btn-g ui-icon-delete ui-btn-icon-left ui-shadow ui-corner-all" data-icon="delete">Incorrecto</a>');
            
            //Añadimos explicación
            $('#explicacion-examen-vf-'+i).empty();
            $('#explicacion-examen-vf-'+i).append('<center style="background:linear-gradient(#FFF, #F1F1F1);"><h3>Explicación</h3><p>'+context_examen_vf.preguntas[i].explicacion+'</p></center>');
                 
        }
    
    }
    

    //Mostramos la nota final.
    var nota = (calificacion * 10.0) / (context_examen_vf.preguntas.length * acierto);
    nota = parseFloat(nota).toPrecision(3);
    $('.calificacion-examen-vf').empty();
    $('.calificacion-examen-vf').append('<h3>Tu calificación es: '+nota+' sobre 10</h3>');
    
    
}











