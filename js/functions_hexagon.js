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
    var id_opc =0;// id para las opciones
    var id_pregunta=0;
        
    for(var i=0 ; i<total ; i++){
        //Nueva pregunta
        if(String(json.feed.entry[i].gsx$pregunta.$t).length > 0){
            nombre_pregunta_tmp = json.feed.entry[i].gsx$pregunta.$t;
            //Generamos las opciones de cada pregunta
            id_opc = i;
            //console.log(id_opc);
            v_opciones = generaOpciones(json,i,total,id_opc);
            v_pregunta.push({
                nombre_pregunta: nombre_pregunta_tmp,
                id_pregunta: id_pregunta,
                opcion: v_opciones
            });
            id_pregunta++;  
            
            v_opciones=[];
        } 
    }
    context_hexagono.n_preguntas = id_pregunta;
    
    context_hexagono.pregunta = v_pregunta;
    
    //console.log(context_hexagono);
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
//   - total: número total de celdas de la estructura a recorrer.
//   - id_opc: id única para cada opción.
//
function generaOpciones(json,indice,total,id_opc){
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
    //console.log("ID_OPC: "+id_opc);
    for(var j=0; j<nombre.length ;j++){        
        var x = j+id_opc+1; //Id para la opcion
        //console.log("ID_OPCION: "+x);
        vector.push({
            nombre: nombre[j],
            codigo: codigo[j],
            id_opcion: x 
        })
    }
    
    
    return vector;
}


//Función que procesa los datos del formulario del hexágono
function submitHexagono(n_preguntas){
    //Extraer los valores de la clase "select" y procesarlos para mostrar el hexágono.
    var texto;
    var index;
    var valor;
    var v_valores = new Array(); //Vector con los valores seleecionados
    var v_contador = new Array(7); //Vector para contar 
    var x=0, y=0, z=0; //Variables dominantes en el hexágono.
    var x_i=0, y_i=0, z_i=0; //Indice donde estaban las variables dominantes.
    var solucion = new Array(); 
    var solucion_string="";
    
    
    
    //Inicialización a 0 de v_contador.
    for(var i=0;i<v_contador.length;i++){
        v_contador[i] = 0;
    }
    
    $("#explicacionHexagono").empty();
    for(var i=0;i<n_preguntas;i++){
        index = eval("document.formularioHexagono.selHexagono"+i+".selectedIndex");
        valor = eval("document.formularioHexagono.selHexagono"+i+".options[index].value");
        texto = eval("document.formularioHexagono.selHexagono"+i+".options[index].text"); 
        v_valores = procesaValores(valor);
        $("#explicacionHexagono").append("<span>ID: "+index+" / Valor: "+valor+", Vector: "+v_valores+" / Texto: "+texto+"<br></span>");
        //Contabilizamos los valores para dar un resultado
        for(var j=0 ; j<v_valores.length ; j++){
            v_contador[parseInt(v_valores[j])] = v_contador[parseInt(v_valores[j])]+1;
            console.log(v_valores);
        }
    }
    
    $("#contador").empty();
    $("#contador").append("<span>Estructura simple= "+v_contador[0]+"</span><br>");
    $("#contador").append("<span>Burocracia Maquinal= "+v_contador[1]+"</span><br>");
    $("#contador").append("<span>Burocracia Profesional= "+v_contador[2]+"</span><br>");
    $("#contador").append("<span>Forma Divisional= "+v_contador[3]+"</span><br>");
    $("#contador").append("<span>Adhocracia= "+v_contador[4]+"</span><br>");
    $("#contador").append("<span>Organización misional= "+v_contador[5]+"</span><br>");
    $("#contador").append("<span>No lo se= "+v_contador[6]+"</span><br>");
    
    
    //Establecemos el valor mayor -> x
    //Establecemos el índice del valor mayor -> x_i
    for(var i=0 ; i<v_contador.length ; i++){
        //Si el nuevo valor es mayor que el que tenemos
        if(v_contador[i]>x){
            x = v_contador[i];
            x_i = i;
        }
    }
    
    //Establecemos el segundo valor -> y
    //Establecemos el índice del segundo valor -> y_i
    for(var i=0 ; i<v_contador.length ; i++){
        //Si el nuevo valor es mayor que el que tenemos
        //y no coincide con el índice de x_i
        if((v_contador[i]>y) && (i!=x_i)){
            y = v_contador[i];
            y_i = i;
        }
    }
    
    //Establecemos el tercer valor -> z
    //Establecemos el índice del tercer valor -> z_i
    for(var i=0 ; i<v_contador.length ; i++){
        //Si el nuevo valor es mayor que el que tenemos
        //y no coincide con el índice de x_i ni con y_i
        if((v_contador[i]>z) && (i!=x_i) && (i!=y_i)){
            z = v_contador[i];
            z_i = i;
        }
    }
    
    
                            //Mostramos los resultados para DEPURACIÓN
                            $("#contador").append("<span>Variable X= "+x+"; X_I= "+x_i+"</span><br>");
                            $("#contador").append("<span>Variable Y= "+y+"; Y_I= "+y_i+"</span><br>");
                            $("#contador").append("<span>Variable Z= "+z+"; Z_I= "+z_i+"</span><br>");
    context_hexagono.solucion[0] = { x:x, x_i:x_i };
    context_hexagono.solucion[1] = { y:y, y_i:y_i };
    context_hexagono.solucion[2] = { z:z, z_i:z_i };
    
    
    
    //Contemplar varias opciones:
    //--Si es puro.
    //--Si es un híbrido doble.
    //--Si es un híbrido triple.
    solucion_string = resuelveTipoHexagono(context_hexagono.solucion,n_preguntas);
        
    //Prueba para componer el resultado de los arrays a un string
    //solucion_string=String(context_hexagono.solucion[0].x_i)+","+String(context_hexagono.solucion[1].y_i);
    
    
    //recorremos context_hexagono.resultado
    for(var i in context_hexagono.resultado){
        $("#contador").append("<span>it= "+i+"; context_hexagono.resultado[i].condicion= "+context_hexagono.resultado[i].condicion+"</span><br>");
        //Si context_hexagono.resultado.condicion coincide con solucion_string.
        if(context_hexagono.resultado[i].condicion == solucion_string){
            $("#contador").append(
                "<h1> Solución: </h1><br> \
                 <img src="+context_hexagono.resultado[i].imagen+" width=\"200\" height=\"200\"></img><br> \
                <p>"+context_hexagono.resultado[i].nombre+"</p><br>"
            );
        }
    }
    
    
    
    
    
    
    console.log(v_contador);
    //context_resultado_hexagono.mostrar = mostrar;
    console.log("Solución String: ");
    console.log(solucion_string);
    
    
    console.log("Resultado hexagono:");
    console.log(context_hexagono);

    /*var prueba = "0,2,3,4";
    v_valores = procesaValores(prueba);
    console.log(v_valores);
    console.log(prueba);*/
}



//Función que recibe una cadena de palabras separadas por "," 
////y devuelve un vector en la que cada posición es un valor 
function procesaValores(cadena){
    var x = 0;
    var vector = new Array();
    //Si contiene "," separamos los valores.
    if(cadena.indexOf(",") > -1){
        
        vector.push(parseInt(cadena.substring(x,x+1)));
        x=1;
        while((x<cadena.length) && (x>0)){
            x = cadena.indexOf(",",x);
            x++;
            vector.push(parseInt(cadena.substring(x,x+1)));
        }
        vector.pop();   //borra una inserción de más.
    }else{
        vector.push(parseInt(cadena));
    }
    return(vector);
}



//Función que compara los datos obtenidos en "submitHexagono()" con 
//la página de drive "Resultado Hexágono" para mostrar una imagen.
function resultadoHexagono(json){
    var total = json.feed.entry.length;
    var x = json.feed.entry[0].gsx$condiciones.$t;
    var codificacion;
    var resultado = new Array();
    var mostrar = new Array();
    var solucion_string="";
    context_hexagono.resultado = new Array();
    context_hexagono.solucion = new Array() //Solución para las estructuras con mayor selección.
    
    context_hexagono.x = x;
    
    for(var i=0;i<total;i++){
        resultado.push({
            condicion: json.feed.entry[i].gsx$condiciones.$t,
            imagen: json.feed.entry[i].gsx$imagen.$t,
            nombre: json.feed.entry[i].gsx$nombre.$t
        })
    }
    context_hexagono.resultado = resultado;
}



// -Función que identifica que tipo de hexágono tenemos que mostrar.
//Tenemos 3 tipos, puro, híbrido de 2 e híbrido de 3.
//
// -"context_hexagono.solucion" es un Array que contiene las 3 variables 
//que vamos a tener en cuenta. Están ordenadas de mayor a menor, siendo
//"context_hexagono.solucion[0].x" el valor mayor y "context_hexagono.solucion[0].x_i"
//el índice descriptivo de ésta. Este índice corresponde con los tipos de organización.
//
// -Devuelve un string separado por comas, que comparandolo con la 
//hoja de drive nos dará la imagen del hexágono.
function resuelveTipoHexagono(solucion, n_preguntas){
    console.log("SOLUCION Y ->"+solucion[1].y)        
    //Si el segundo valor es 0, el primero es el único en seleccionarse,
    //es un tipo puro.
    if(solucion[1].y == 0 ){
        //Devolvemos sólo el índice del único valor seleccionado.
        return String(solucion[0].x_i);
    }
    //Si el tercero es 0, tenemos un híbrido entre 2 tipos de organizaciones.
    else if(solucion[2].z == 0){
        //Devolvemos los índices de los dos tipos.
        return String(solucion[0].x_i+","+solucion[1].y_i);
    }
    //Híbrido entre 3 tipos de organizaciones.
    else{
        //Devolvemos los índices de los tres tipos.
        return String(solucion[0].x_i+","+solucion[1].y_i+","+solucion[2].z_i);
    }
}


