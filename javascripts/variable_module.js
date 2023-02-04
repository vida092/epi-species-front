var _PARENT_FIELD = "";
var _LABEL_VALUE = "";
var _AGENT_SELECTED = "";


/**
 * Módulo variable, utilizado para crear y gestionar los selectores de grupos de variables en nicho ecológico y comunidad ecológica.
 *
 * @namespace variable_module
 */
var variable_module = (function (verbose, url_zacatuche) {

    var _url_zacatuche = url_zacatuche;
    var _VERBOSE = verbose;
    var _selectors_created = [];
    _module_toast = toast_module(_VERBOSE);
    _module_toast.startToast();
    
    

    var _id;

    var _TYPE_BIO = 0, //snib
        _TYPE_ABIO = 1, // worldclim
        _TYPE_TERRESTRE = 2; //inegi2020

    var _TYPE_TAXON = 0,
        _TYPE_CLIMA = 0,
        _TYPE_TOPO = 1,
        _TYPE_ELEVACION = 2,
        _TYPE_PENDIENTE = 3,
        _TYPE_TOPO_RASTER = 5;

    var _BORRADO = 0,
            _AGREGADO = 1;

    var _language_module;
    var _iTrans;
    var _map_module;
    var _taxones = [];

    var _toastr = toastr;
    var _tipo_modulo;
    var _MODULO_COMUNIDAD = 1;

    var _available_variables = [];

    var _REGION_SELECTED = 1
    var _GRID_RES = "state";
   // var _AGENT_SELECTED = "hospedero";
   // var _PARENT_FIELD = "";
   // var _LABEL_VALUE = "";



    // var map_taxon = new Map()
    // map_taxon.set("reino", "kingdom");
    // map_taxon.set("kingdom", "kingdom");
    // map_taxon.set("phylum", "phylum");
    // map_taxon.set("clase", "class");
    // map_taxon.set("class", "class");
    // map_taxon.set("orden", "order");
    // map_taxon.set("order", "order");
    // map_taxon.set("familia", "family");
    // map_taxon.set("family", "family");
    // map_taxon.set("genero", "genus");
    // map_taxon.set("género", "genus");
    // map_taxon.set("genus", "genus");
    // map_taxon.set("especie", "species");
    // map_taxon.set("species", "species");



    /**
     * Método getter de los grupos de variables seleccionados
     *
     * @function getVarSelArray
     * @public
     * @memberof! table_module
     *
     */
    function getVarSelArray() {
        return _var_sel_array;
        
    }

    /**
     * Método getter de los grupos de variables seleccionados
     *
     * @function getSelectorVaribles
     * @public
     * @memberof! table_module
     *
     */
    function getSelectorVaribles() {
        return _selectors_created;
    }



    /**
     * Éste método realiza la creación del selector de variables. Actualmente genera un selector de grupos taxonómicos, variables climáticas y variables topográficas.
     *
     * @function VariableSelector
     * @public
     * @memberof! table_module
     *
     * @param {String} parent - Id del contenedor del selector de variables
     * @param {String} id - Id del selector de variables
     * @param {String} title - Título del selector de variables desplegado en la parte superior
     */
    function VariableSelector(parent, id, title, abio_tab, reduced_height, btn_visualize, start_level) {

        // se comentan variables topograficas por expansión de terreno

        var tags = abio_tab ? ['a_taxon', 'a_raster',  'a_socio'] : ['a_taxon'];
        //var tags = ['a_taxon', 'a_raster', 'a_socio'];


        var sp_items = [ 'a_item_clase', 'a_item_orden', 'a_item_familia', 'a_item_genero','a_item_especie'];

        var sp_parent_field = [ 'clase', 'orden', 'familia', 'genero','epitetoespecifico','epitetoinfraespecifico'];
        var sp_data_field = ['clase', 'orden', 'familia', 'genero','epitetoespecifico','epitetoinfraespecifico']; //'especievalidabusqueda'
        var NUM_ABIO = 20;
        var NIVEL_REINO = 2
        var NIVEL_PHYLUM = 3
        var abio_time = ['a_actual', 'a_f50'];
        var topo_items = ['topidx', 'elevacion', 'pendiente'];


        var self = this;
        self.id = id;
        self.varfilter_selected;
        self.level_vartree;
        self.value_vartree;
        self.field_vartree;
        self.parent_field_vartree;
        self.type_time = 0;
        // self.taxones = [];

        self.arrayVarSelected;
        self.groupvar_dataset = [];
        self.var_sel_array = [];
        //self.arrayBioclimSelected2 = [];
        self.arraySocioSelected2 = [];

        self.last_event;
        self.arrayBioclimSelected = [];
        self.groupbioclimvar_dataset = [];
        //en covariables se hará un push con inegi y worldclim siempre que tengan elementos
        self.covariables=[];
        
        

        self.groupDatasetTotal = [];

        self.arrayOtherSelected = [];
        self.groupothervar_dataset = [];


        // self.getTaxones =function() {
        //     return self.taxones;
        // }
        
        

        self.getTreeTarget = function(){

            _VERBOSE ? console.log("self.getTreeTarget") : _VERBOSE;

            $("#agent_selected").change(function() {
                let var_obj = $(this).val();                
                let diseases = document.getElementById("disease_selected");


                switch (var_obj){
                    case "Hospederos":
                        fetch("https://covid19.c3.unam.mx/gateway/api/nodes/",{
                            method: "POST",
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ query: 'query { get_diseases_hospederos {name}}'}),
                        })
                            .then(res => res.json())
                            .then((function(resp){
                                console.log(resp);
                                let data = resp ["data"]
                                let disease = data["get_diseases_hospederos"]
                                var select = document.getElementById("disease_selected")
                                $('select option[value="dis_default"]').attr("selected",true);
                                try {
                                    let actual_modifiers =
                                        $(".disease_opt").remove();
                                } catch (error) {
                                    console.log("no diseases")
                                }

                                for (let index = 0; index < disease.length; index++){
                                    console.log(disease[index]["name"])
                                    var opt = document.createElement('option');
                                    opt.setAttribute("class", "disease_opt")
                                    opt.value = disease[index]["name"];
                                    opt.innerHTML = disease[index]["name"];
                                    select.append(opt);
                                }
                               
                                
                            }));
                        break;
                    case "Vectores":
                        fetch("https://covid19.c3.unam.mx/gateway/api/nodes/",{
                            method: "POST",
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ query: 'query { get_diseases_vectores {name}}'}),
                        })
                            .then(res => res.json())
                            .then((function(resp){
                                console.log(resp);
                                let data = resp ["data"]
                                let disease = data["get_diseases_vectores"]
                                var select = document.getElementById("disease_selected")
                                $('select option[value="dis_default"]').attr("selected",true);
                                try {
                                    let actual_modifiers =
                                        $(".disease_opt").remove();
                                } catch (error) {
                                    console.log("no diseases")
                                }

                                for (let index = 0; index < disease.length; index++){
                                    console.log(disease[index]["name"])
                                    var opt = document.createElement('option');
                                    opt.setAttribute("class", "disease_opt")
                                    opt.value = disease[index]["name"];
                                    opt.innerHTML = disease[index]["name"];
                                    select.append(opt);
                                }
                            }));

                        break;
                    case "Patogenos":
                        fetch("https://covid19.c3.unam.mx/gateway/api/nodes/",{
                            method: "POST",
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ query: 'query { get_diseases_patogenos {name}}'}),
                        })
                            .then(res => res.json())
                            .then((function(resp){
                                console.log(resp);
                                let data = resp ["data"]
                                let disease = data["get_diseases_patogenos"]
                                var select = document.getElementById("disease_selected")
                                $('select option[value="dis_default"]').attr("selected",true);
                                try {
                                    let actual_modifiers =
                                        $(".disease_opt").remove();
                                } catch (error) {
                                    console.log("no diseases")
                                }

                                for (let index = 0; index < disease.length; index++){
                                    console.log(disease[index]["name"])
                                    var opt = document.createElement('option');
                                    opt.setAttribute("class", "disease_opt")
                                    opt.value = disease[index]["name"];
                                    opt.innerHTML = disease[index]["name"];
                                    select.append(opt);
                                }
                            }));
                        break;

                    default:
                        break;
                }
                

            });

            $('#disease_selected').change(function(e){
                _module_toast.showToast_CenterCenter("El árbol taxonómico se está cargando, espere unos segundos...","info")
                var agent_selected = $('#agent_selected').val()
                var disease_text_selected = $("#disease_selected option:selected").text();

                var _url = "https://covid19.c3.unam.mx/gateway/api/nodes/"

                let nodo = agent_selected.toLowerCase()

                var query = "query{occurrences_by_taxon_"+ nodo + "(query: \"nombreenfermedad='"+ disease_text_selected +"'\"){reino phylum clase orden familia genero nombrecientifico}}"

                $.ajax({
                    url: _url,
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify({query: query}),
                    success: function(resp){
                        
                        if (agent_selected == 'Hospederos'){
                            var species = resp.data.occurrences_by_taxon_hospederos;                                            
                        }
                        else if (agent_selected == 'Patogenos'){
                            var species = resp.data.occurrences_by_taxon_patogenos;
                        }else{
                            var species = resp.data.occurrences_by_taxon_vectores;
                        }
                        
                        //data = [{ "id" : "animalia", "parent" : "#", "text" : "Animalia", 'state': {'opened': true, 'disabled' : true },
                        //"icon": "plugins/jstree/images/dna.png"}]

                        data = []
                        
                        var species_non_repeat = [];
                        var species_names = [];
                        
                        species.forEach(specie=>{
                            if(!species_names.includes(specie.nombrecientifico)){
                                species_names.push(specie.nombrecientifico);
                                species_non_repeat.push(specie);
                            }
                        })

                        var arbol = {}
                        var phylums = []
                        species.forEach(specie=>{
                            if(!phylums.includes(specie.phylum)){
                                phylums.push(specie.phylum);
                                data.push({ "id" : specie.phylum, "parent" : "#", "text" : specie.phylum, 'state': {'opened': true,  'selected': false},"icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 3, "type": 0}})                                                
                            }
                        })

                        
                        console.log(phylums)                       
                            

                        var phylums_obj = {}
                        phylums.forEach(phylum=>{                                            
                            var clases=[]
                            species.forEach(specie=>{
                                if(!clases.includes(specie.clase) && specie.phylum ===phylum){
                                    clases.push(specie.clase);
                                    data.push({ "id" : specie.clase , "parent" : specie.phylum  , "text" : specie.clase, 'state': {'opened': false},
                                    "icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 4, "type": 0}})
                                }
                            })
                            var clases_obj = {}
                            clases.forEach(clase=>{
                                var ordenes = []
                                species.forEach(specie=>{
                                    if(!ordenes.includes(specie.orden) && specie.clase === clase){
                                        ordenes.push(specie.orden);
                                        data.push({ "id" : specie.orden , "parent" : specie.clase  , "text" : specie.orden,'state': {'opened': false},
                                        "icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 5, "type": 0}})
                                    }
                                })
                                var ordenes_obj={}
                                ordenes.forEach(orden=>{
                                    var familias = []
                                    species.forEach(specie=>{
                                        if(!familias.includes(specie.familia) && specie.orden === orden){
                                            familias.push(specie.familia);
                                            data.push({ "id" : specie.familia , "parent" : specie.orden  , "text" : specie.familia, 'state': {'opened': false},
                                            "icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 6, "type": 0}})
                                        }
                                    })
                                    var familias_obj={}
                                    familias.forEach(familia=>{
                                        var generos = []
                                        species.forEach(specie=>{
                                            if(!generos.includes(specie.genero) && specie.familia === familia){
                                                generos.push(specie.genero);
                                                data.push({ "id" : specie.genero , "parent" : specie.familia  , "text" : specie.genero, 'state': {'opened': false},
                                                "icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 7, "type": 0}})
                                            }
                                        }) 
                                        var generos_obj ={}
                                        generos.forEach(genero=>{
                                            var nombrescientificos=[]
                                            species.forEach(specie=>{
                                                if(!nombrescientificos.includes(specie.nombrecientifico) && specie.genero === genero){
                                                    nombrescientificos.push(specie.nombrecientifico);
                                                    data.push({ "id" : specie.nombrecientifico , "parent" : specie.genero , "text" : specie.nombrecientifico, 'state': {'opened': false},
                                                    "icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 8, "type": 0}})
                                                }
                                            })
                                            generos_obj[genero] = nombrescientificos
                                        })

                                        familias_obj[familia]=generos_obj                                                     
                                        
                                    })
                                    ordenes_obj[orden] = familias_obj

                                })                                                
                                clases_obj[clase] = ordenes_obj
                            })
                            phylums_obj[phylum] = clases_obj
                            arbol['Animalia']=phylums_obj
                            

                        })
                        //$(function () { $('#jstree_variables_species_target').jstree(); });
                        //$('#jstree_variables_species_target').jstree("destroy").empty();
                        $('#jstree_variables_species_target').on('open_node.jstree', self.getTreeVar);
                        $("#jstree_variables_species_target").on('changed.jstree', self.getChangeTreeVarTarget);
                        $("#jstree_variables_species_target").on('loaded.jstree', self.loadNodes);


                        var icon = "plugins/jstree/images/dna.png"                                         
                        
                        
                        $('#jstree_variables_species_target').jstree({
                            'plugins': ["wholerow", "checkbox"],                            
                            'core': {
                                'data': data,
                                'themes': {
                                    'name': 'proton',
                                    'responsive': true
                                },
                                'check_callback': true
                            }
                        });
                        _module_toast.showToast_CenterCenter("El árbol taxonómico se cargó adecuadamente","success")
                        
                    }
                })
                
                
                
            })
        }

        self.getTreeTarget()

        // Evento generado cuando se selecciona un grupo de variables climáticas, realiza la carga del árbol de selección del grupo seleccionado.
        self.loadTreeVarRaster = function () {

            //evita la petición cuando no se requieren las variables climáticas
            if(!abio_tab) return;

            _VERBOSE ? console.log("self.loadTreeVarRaster") : _VERBOSE;

            var text_raster = _iTrans.prop('lb_raster');
            var var_selected = "root_bioclim";
            var level_root = 0;
            var level_vartree = 1;

           console.log("val: " + $("#footprint_region_select").val());
           console.log("_REGION_SELECTED: " + _REGION_SELECTED);


            _REGION_SELECTED = ($("#footprint_region_select").val() !== null && $("#footprint_region_select").val() !== undefined) ? parseInt($("#footprint_region_select").val()) : _REGION_SELECTED;
            _GRID_RES = $("#grid_resolution").val();

            console.log("REGION_SELECTED: " + _REGION_SELECTED);
            console.log("_GRID_RES: " + _GRID_RES);
            

        }


        self.getTreeSocio = function (){
            var query = "query{all_censo_inegi_2020_covariables(limit: 2400, filter:\"\"){id name interval bin code}}"
            $.ajax({
                url:"https://covid19.c3.unam.mx/gateway/api/nodes/",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({query: query}),
                success: function(resp){
                    var sei=resp.data.all_censo_inegi_2020_covariables
                    data = [{"id": "inegi", "parent": "#", "text": "CENSO INEGI 2020", "state":{"opened":true}, "icon": "plugins/jstree/images/rep.png", "attr":{"nivel":6, "type":0}}]
                    var intervals = []
                    sei.forEach(element =>{
                        if(!intervals.includes(element.interval)){
                            intervals.push(element.interval)
                        }
                    })
                    var names=[]

                    sei.forEach(element=>{
                        if(!names.includes(element.name)){
                            names.push(element.name)
                        }
                    })
                    

                    var codes={}
                    sei.forEach(element=>{
                        codes[element.name]=element.code
                    })
                    
                    
                    names.forEach(element=>{
                        data.push({"id":element, "parent":"inegi","text":element,"state":{"opened":false}, "icon":"plugins/jstree/images/group.png","attr":{"nivel":7, "type":2,"code":codes[element]}})
                    })

                    sei.forEach(element=>{
                        names.forEach(name=>{
                            if(intervals.includes(element.interval) && element.name === name){
                                data.push({"id":element.interval, "parent": element.name, "text":element.interval, "state":{"opened":false}, "icon":"plugins/jstree/images/percent.png", "attr":{"nivel":8, "type":2, "bin":element.bin, "code":element.code}})
                            }
                        })
                    })
                    $("#jstree_variables_socio_fuente").jstree({
                       "plugins":["wholerow", "checkbox"],
                       "core":{
                            "data": data,
                            "themes":{
                                "name":"proton",
                                "responsive":true
                            },
                        "check_callback":true
                       }
                    })
                    $(function () { $('#jstree_variables_socio_fuente').jstree(); });
                    $("#jstree_variables_socio_fuente").on("changed.jstree", self.getChangeTreeVarSocio)
                    

                    
                }
            })
            
        }

        

        self.getTreeVarRaster = function () {
            var query = "query{all_worldclim_covariables(limit: 550, filter: \"\"){id label interval layer icat}}"
                        $.ajax({
                            url: "https://covid19.c3.unam.mx/gateway/api/nodes/",
                            method: "POST",
                            contentType: "application/json",
                            data: JSON.stringify({query: query}),
                            success: function(data){
                                var awc = data.data.all_worldclim_covariables
                                //console.log(awc)
                                data = [{ "id" : "WorlClim", "parent" : "#", "text" : "WorldClim","icon": "plugins/jstree/images/world.png", 'state': {'opened': true},'attr': {'nivel': 6, "type": 1} }]
                                var intervals=[]
                                awc.forEach(element => {
                                  if(!intervals.includes(element.interval)){
                                    intervals.push(element.interval)
                                  }        
                                });
                                
                                var labels=[]
                                var layers={}
                                awc.forEach(element=>{
                                  if(!labels.includes(element.label)){
                                    labels.push(element.label)            
                                  }
                                })
                                awc.forEach(element=>{
                                    layers[element.label]=element.layer
                                })

                                
                                labels.forEach(element=>{
                                  data.push({"id": element, "parent":"WorlClim", "text":element,'state': {'opened': false}, "icon": "plugins/jstree/images/clima.png",
                                                                 'attr': {'nivel': 7, "type": 1, "layer":layers[element] }})
                                })
            
                                awc.forEach(element=>{
                                  labels.forEach(label=>{
                                    if(intervals.includes(element.interval) && element.label===label){
                                      data.push({"id":element.interval, "parent":element.label, "text":element.interval, 'state': {'opened': false}, "icon": "plugins/jstree/images/termometro.png",
                                                                 'attr': {'nivel': 8, "type": 1, "id": element.id}})
                                    }
                                  })
                                })
                                //console.log(data)
                                $('#jtreeVariableBioclim_' + id).jstree("destroy").empty();
                                $('#treeVariableBioclim_fuente').jstree({
                                    'plugins': ["wholerow", "checkbox"],
                                    'core': {
                                        'data': data,
                                        'themes': {
                                            'name': 'proton',
                                            'responsive': true
                                        },
                                        'check_callback': true
                                    }
                                  });

                                
                                $(function () { $('#treeVariableBioclim_' + id).jstree(); });
                                $("#treeVariableBioclim_" + id).on('changed.jstree', self.getChangeTreeVarRaster);
                                //$('#treeVariableBioclim_' + id).on('open_node.jstree', self.getTreeVarRaster);
            
                            }
            
                        })
                        
        }
        self.getTreeVarRaster()
        self.getTreeSocio() 
        

        /****************************************************************************************** GENERACION DE PANEL */

        // $("#" + parent)
        // 	.addClass('tab_total');

        // titulo del selector de varibles, se agrega solo cuando el parametro es enviado
        if(title !== ""){
            var header_panel = $('<h3/>')
                .attr('id', title)
                .addClass('label_componenete sidebar-header')
                .text(_iTrans.prop(title))
                .appendTo($("#" + parent));
        }


        // div contenedor del cuerpo de la sección grupo de variables, puede ser del 80% de la altura de la página o de 300px en su tamaño reducido
        var container_height = reduced_height ? "container_60p" : "container_80p"
        var var_container = $('<div/>')
                .addClass('col-md-12 col-sm-12 col-xs-12 ' + container_height)
                .appendTo($("#" + parent));

        // div contenedor de los selectores bioticos y abioticos
        var nav_selection = $('<div/>')
                .addClass('col-md-8 col-sm-12 col-xs-12 nav_selection')
                .appendTo(var_container);

        // div lateral izquierdo que almacena los grupos seleccionados de cada tab
        var tree_selection = $('<div/>')
                .attr('id', "treeAddedPanel_" + id)
                .addClass('col-md-4 col-sm-12 col-xs-12 myBlockVariableAdded')
                .appendTo(var_container);


        // contenedor de header tabs
        var nav_items = $('<ul/>')
                .attr("id", "tuto_nav_tabs_" + id)
                .addClass('nav nav-tabs nav-variables')
                .appendTo(nav_selection);

        // sea agregan los tabs disponibles
        $.each(tags, function (i) {
            
            var name_class = 'nav-variables';
            if(id=="fuente"){

            if (i == 0) {
                name_class = 'active nav-variables';
            }
            
            var li = $('<li/>')
                    .addClass(name_class)
                    .appendTo(nav_items)
                    .click(function (e) {
                        $('.nav-tabs a[href="' + e.target.getAttribute('href') + '"]').tab('show');
                        e.preventDefault();
                    });

            var aaa = $('<a/>')
                    .attr('id', tags[i] + "_" + id)
                    .attr('href', '#tab' + i + "_" + id)
                    .attr('data-toggle', 'tab' + i + "_" + id)
                    .text(_iTrans.prop(tags[i]))
                    .appendTo(li);
                }
        });
        



        // div que alamcena el cuerpo de los tabs

        var tab_content = $('<div/>')
                .attr('id', "tab_content_" + id )
                .addClass('tab-content')
                .appendTo(nav_selection);
        

        // agregando contenido de cada tab
        $.each(tags, function (i) {            
            if (i === 0) {
                // generando tab panel para variables taxonomicas
                //_VERBOSE ? console.log(tags[i]) : _VERBOSE;
                //div del tab[i]_id               
                var tab_pane = $('<div/>')
                        .attr('id', 'tab' + i + "_" + id)
                        .addClass('tab-pane active')
                        .appendTo(tab_content);
                //div id="tab_content_fuente" & class="tab-content"

                // div que contiene el dropdown-button de tipos taxonomicos y textfiled para insertar valores
                if (id === "fuente"){
                var drop_item = $('<div/>')
                        .attr('id', 'tuto_taxon_sp_' + id)
                        .addClass('input-group dropdown_group')
                        .appendTo(tab_pane);
                    }

                var btn_div = $('<div/>')
                        .addClass('input-group-btn')
                        .appendTo(drop_item);

                var btn_sp = $('<button/>')
                        .attr('id', 'btn_variable' + "_" + id)
                        .attr('type', 'button')
                        .attr('data-toggle', 'dropdown')
                        .attr('aria-haspopup', 'true')
                        .attr('aria-expanded', 'false')
                        .text(_iTrans.prop('btn_variable') + " ")
                        .addClass('btn btn-primary dropdown-toggle')
                        .appendTo(btn_div);

                $('<span/>')
                        .addClass('caret')
                        .appendTo(btn_sp);

                var btn_items = $('<div/>')
                        .addClass('dropdown-menu')
                        .appendTo(btn_div);

                $.each(sp_items, function (i) {

                    console.log(sp_items[i])
                    console.log(_iTrans.prop(sp_items[i]))
                    
                    

                    // establece el nivel taxonomico inicial del buscador. Donde 0 es reino.
                    // if(start_level > i)
                    //     return true;


                    var li = $('<li/>')
                            .click(function (e) {
                                // evento que guarda selección taxonomica.
                                _VERBOSE ? console.log("biotico") : _VERBOSE;
                                self.varfilter_selected = [e.target.getAttribute("data-field"), e.target.getAttribute("parent-field"), e.target.getAttribute("level-field")];
                                varfield = e.target.text;

                               _VERBOSE ? console.log(varfield) : _VERBOSE;
                               

                                $("#btn_variable" + "_" + id).text(varfield + " ");
                                $("#btn_variable" + "_" + id).append('<span class="caret"></span>');
                                $("#text_variable" + "_" + id).prop("disabled", false);
                                $("#text_variable" + "_" + id).val("");
                                e.preventDefault();
                            })
                            .appendTo(btn_items);

                    var aaa = $('<a/>')
                            .attr('id', sp_items[i] + "_" + id)
                            .attr('parent-field', sp_parent_field[i])
                            .attr('data-field', sp_data_field[i])
                            .attr('level-field', (i + 2)) // inicia en 2
                            .addClass('biotica')
                            .text(_iTrans.prop(sp_items[i]))
                            .appendTo(li);

                });




                var input_sp = $('<input/>')
                        .attr('id', 'text_variable' + "_" + id)
                        .attr('type', 'text')
                        .attr('aria-label', '...')
                        .prop("disabled", true)
                        .addClass('form-control')
                        .autocomplete({
                            source: function (request, response) {
                                console.log(varfield + "seleccionado")

                                switch(varfield){    
                                case "Clase":
                                    console.log("clase valida");
                                    var query = "query{all_snib_covariables(limit: 1, filter: \" clasevalida LIKE '"  + request.term.charAt(0).toUpperCase()+ request.term.slice(1) + "%'\"){clasevalida}} "                                
                                                                
                                    break;
                                case "Orden":
                                    console.log("orden valido");
                                    var query = "query{all_snib_covariables(limit: 1, filter: \" ordenvalido LIKE '"  + request.term.charAt(0).toUpperCase()+ request.term.slice(1) + "%'\"){ordenvalido}} "
                                    
                                    break;
                                case "Familia":
                                    console.log("familia valida");
                                    var query = "query{all_snib_covariables(limit: 1, filter: \" familiavalida LIKE '"  + request.term.charAt(0).toUpperCase()+ request.term.slice(1) + "%'\"){familiavalida}} "
                                    
                                    break;
                                case "Género":
                                    console.log("genero valido");
                                    var query = "query{all_snib_covariables(limit: 1, filter: \" generovalido LIKE '"  + request.term.charAt(0).toUpperCase()+ request.term.slice(1) + "%'\"){generovalido}} "
                                    
                                    break;
                                default:
                                    console.log("Especie ")
                                    var query = "query{all_snib_covariables(limit: 1, filter: \" especievalida LIKE '"  + request.term.charAt(0).toUpperCase()+ request.term.slice(1) + "%'\"){especievalida}} "
                                    
                                    break; 
                                }           

                               _VERBOSE ? console.log($("#footprint_region_select").val()) : _VERBOSE;

                                _REGION_SELECTED = ($("#footprint_region_select").val() !== null && $("#footprint_region_select").val() !== undefined) ? parseInt($("#footprint_region_select").val()) : _REGION_SELECTED;
                                _GRID_RES = $("#grid_resolution").val();                                
                                var _url = "https://covid19.c3.unam.mx/gateway/api/nodes/"
                                let lst = []
                                console.log(query)                                
                                
                                $.ajax({
                                    method: "POST",
                                    url: _url,
                                    contentType: "application/json",
                                    data: JSON.stringify({query: query}),
                                    success: function (resp) {
                                        let au = resp.data.all_snib_covariables                                        
                                        // console.log(au[0])                                        
                                        response($.map(resp.data.all_snib_covariables, function (item) {                                            
                                            var arrayObj = Object.keys(au[0]).map(function(key){
                                                return au[0][key];
                                            });
                                            
                                            // console.log(arrayObj)


                                            for (let i = 0; i < arrayObj.length; i++) {
                                                var opt = arrayObj[i]


                                                _VERBOSE ? console.log(opt) : _VERBOSE;
                                                console.log(self.varfilter_selected[1]);
                                                
                                                return {
                                                    label: opt,
                                                    id: opt
                                                };
                                            }

                                        }));
                                    }

                                })



                            },
                            minLength: 2,
                            change: function (event, ui) {
                                if (!ui.item) {
                                    
                                    $("#text_variable" + "_" + id).val("");

                                }
                            },
                            select: function (event, ui) {

                                console.log(ui.item.id + " seleccionado");
                                console.log(self.varfilter_selected[1])
                                let lst = ["clasevalida ", "ordenvalido ", "familiavalida ", "generovalido ", "especievalida " ]
                                if(self.varfilter_selected[1] === "clase"){
                                    var button_val = lst[0]
                                    var query = "query{all_snib_covariables(limit:2000, filter:\""+ button_val +" ='"+ ui.item.id +"'\"){clasevalida ordenvalido familiavalida generovalido especievalida}}"
                                    $.ajax({
                                        url: "https://covid19.c3.unam.mx/gateway/api/nodes/",
                                        method: "POST",
                                        contentType: "application/json",
                                        data: JSON.stringify({query: query}),
                                        success: function(resp){                
                                            var sel = resp.data.all_snib_covariables
                                            //console.log(sel)
                                            var data_cov=[]
                                            var species_names = [];
                                            sel.forEach(specie=>{
                                                if(!species_names.includes(specie.especievalida)){
                                                    species_names.push(specie.especievalida)                                                                                                      
                                                }
                                            })

                                            var arbol = {}
                                            var clases = []
                                            sel.forEach(specie=>{
                                                var ordenes=[]
                                                if(!clases.includes(specie.clasevalida)){
                                                    clases.push(specie.clasevalida)
                                                    data_cov.push({ "id" : specie.clasevalida, "parent" : "#", "text" : specie.clasevalida, 'state': {'opened': true,  'selected': false},"icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 4, "type": 0}})                                                  
                                                }                                                
                                            })
                                            

                                            var clases_obj = {}
                                            clases.forEach(clase=>{
                                                var ordenes = []
                                                sel.forEach(specie=>{
                                                    if(!ordenes.includes(specie.ordenvalido) && specie.clasevalida === clase){
                                                        ordenes.push(specie.ordenvalido)
                                                        data_cov.push({ "id" : specie.ordenvalido , "parent" : specie.clasevalida  , "text" : specie.ordenvalido,'state': {'opened': false}, "icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 5, "type": 0}})
                                                    }
                                                })
                                                
                                                var ordenes_obj = {}
                                                ordenes.forEach(orden=>{
                                                    var familias=[]
                                                    sel.forEach(specie=>{
                                                        if(!familias.includes(specie.familiavalida) && specie.ordenvalido === orden){
                                                            familias.push(specie.familiavalida)
                                                            data_cov.push({ "id" : specie.familiavalida , "parent" : specie.ordenvalido  , "text" : specie.familiavalida, 'state': {'opened': false}, "icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 6, "type": 0}})
                                                        }
                                                    })

                                                    var familias_obj={}
                                                    familias.forEach(familia=>{
                                                        var generos = []
                                                        sel.forEach(specie=>{
                                                            if(!generos.includes(specie.generovalido)&& specie.familiavalida === familia){
                                                                generos.push(specie.generovalido)
                                                                data_cov.push({ "id" : specie.generovalido , "parent" : specie.familiavalida  , "text" : specie.generovalido, 'state': {'opened': false}, "icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 7, "type": 0}})
                                                            }
                                                        })
                                                        var generos_obj = {}
                                                        generos.forEach(genero=>{
                                                            var especievalida = []
                                                            sel.forEach(specie=>{
                                                                if(!especievalida.includes(specie.especievalida) && specie.generovalido === genero){
                                                                    especievalida.push(specie.especievalida);
                                                                    data_cov.push({ "id" : specie.especievalida , "parent" : specie.generovalido , "text" : specie.especievalida, 'state': {'opened': false}, "icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 8, "type": 0}})
                                                                }
                                                            })
                                                            generos_obj[genero] = especievalida
                                                        })
                                                        familias_obj[familia]=generos_obj
                                                    })
                                                    ordenes_obj[orden] = familias_obj
                                                })
                                                clases_obj[clase]=ordenes_obj
                                                //console.log(clases_obj)
                                            })
                                            //console.log(data_cov)
                                            console.log("jstree_variables_species_fuente")
                                            $('#jstree_variables_species_' + id).jstree("destroy").empty();
                                            $('#jstree_variables_species_' + id).on('open_node.jstree', self.getTreeVar);
                                            $("#jstree_variables_species_" + id).on('changed.jstree', self.getChangeTreeVarFuente);
                                            $("#jstree_variables_species_" + id).on('loaded.jstree', self.loadNodes);

                                            self.value_vartree = ui.item.id;
                                            self.field_vartree = self.varfilter_selected[0];
                                            self.parent_field_vartree = self.varfilter_selected[1];
                                            self.level_vartree = self.varfilter_selected[2];

                                           _VERBOSE ? console.log("nivel") : _VERBOSE;
                                           _VERBOSE ? console.log(self.level_vartree) : _VERBOSE;

                                           var icon = parseInt(self.level_vartree) === 8 ? "plugins/jstree/images/dna.png" : "./plugins/jstree/images/dna.png"

                                           _VERBOSE ? console.log(self.level_vartree) : _VERBOSE;
                                            $('#jstree_variables_species_' + id).jstree({
                                                'plugins': ["wholerow", "checkbox"],
                                                'core': {
                                                    'data': data_cov,
                                                    'themes': {
                                                        'name': 'proton',
                                                        'responsive': true
                                                    },
                                                    'check_callback': true
                                                }
                                            });   
                                        }
                                    })
                                }else if(self.varfilter_selected[1] === "orden"){
                                    var button_val = lst[1]
                                    var query = "query{all_snib_covariables(limit:2000, filter:\""+ button_val +" ='"+ ui.item.id +"'\"){ordenvalido familiavalida generovalido especievalida}}"
                                    $.ajax({
                                        url: "https://covid19.c3.unam.mx/gateway/api/nodes/",
                                        method: "POST",
                                        contentType: "application/json",
                                        data: JSON.stringify({query: query}),
                                        success: function(resp){                
                                            var sel = resp.data.all_snib_covariables
                                            console.log(sel)
                                            var data_cov=[]
                                            var species_names = [];
                                            sel.forEach(specie=>{
                                                if(!species_names.includes(specie.especievalida)){
                                                    species_names.push(specie.especievalida)                                                                                                      
                                                }
                                            })
                                            // console.log(species_names)
                                            var ordenes = []
                                            sel.forEach(specie=>{
                                                if(!ordenes.includes(specie.ordenvalido)){
                                                    ordenes.push(specie.ordenvalido)
                                                    data_cov.push({ "id" : specie.ordenvalido, "parent" : "#", "text" : specie.ordenvalido, 'state': {'opened': true,  'selected': false},"icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 5, "type": 0}})
                                                }
                                            })
                                            
                                            console.log(ordenes)

                                            var ordenes_obj = {}
                                            ordenes.forEach(orden=>{
                                                var familias = []
                                                sel.forEach(specie=>{
                                                    if(!familias.includes(specie.familiavalida) && specie.ordenvalido === orden){
                                                        familias.push(specie.familiavalida)
                                                        data_cov.push({ "id" : specie.familiavalida , "parent" : specie.ordenvalido  , "text" : specie.familiavalida, 'state': {'opened': false}, "icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 6, "type": 0}})
                                                    }
                                                })
                                                var familias_obj = {}
                                                familias.forEach(familia=>{
                                                    var generos = []
                                                    sel.forEach(specie=>{
                                                        if(!generos.includes(specie.generovalido) && specie.familiavalida === familia){
                                                            generos.push(specie.generovalido);
                                                            data_cov.push({ "id" : specie.generovalido , "parent" : specie.familiavalida  , "text" : specie.generovalido, 'state': {'opened': false}, "icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 7, "type": 0}})
                                                        }
                                                   })
                                                    var generos_obj = {}
                                                    generos.forEach(genero=>{
                                                        var especievalida=[]
                                                        sel.forEach(specie=>{
                                                            if(!especievalida.includes(specie.especievalida) && specie.generovalido === genero){
                                                                especievalida.push(specie.especievalida)
                                                                data_cov.push({ "id" : specie.especievalida , "parent" : specie.generovalido , "text" : specie.especievalida, 'state': {'opened': false}, "icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 8, "type": 0}})
                                                            }
                                                        })
                                                        generos_obj[genero] = especievalida 
                                                    })
                                                    familias_obj[familia] = generos_obj
                                                    
                                                })
                                                ordenes_obj[orden]=familias_obj                                                           
                                            })
                                            console.log(ordenes_obj)
                                            console.log(data_cov)
                                            console.log("jstree_variables_species_fuente")
                                            $('#jstree_variables_species_' + id).jstree("destroy").empty();
                                            $('#jstree_variables_species_' + id).on('open_node.jstree', self.getTreeVar);
                                            $("#jstree_variables_species_" + id).on('changed.jstree', self.getChangeTreeVarFuente);
                                            $("#jstree_variables_species_" + id).on('loaded.jstree', self.loadNodes);

                                            self.value_vartree = ui.item.id;
                                            self.field_vartree = self.varfilter_selected[0];
                                            self.parent_field_vartree = self.varfilter_selected[1];
                                            self.level_vartree = self.varfilter_selected[2];

                                           _VERBOSE ? console.log("nivel") : _VERBOSE;
                                           _VERBOSE ? console.log(self.level_vartree) : _VERBOSE;

                                           var icon = parseInt(self.level_vartree) === 8 ? "plugins/jstree/images/dna.png" : "plugins/jstree/images/dna.png"

                                           _VERBOSE ? console.log(self.level_vartree) : _VERBOSE;
                                            $('#jstree_variables_species_' + id).jstree({
                                                'plugins': ["wholerow", "checkbox"],
                                                'core': {
                                                    'data': data_cov,
                                                    'themes': {
                                                        'name': 'proton',
                                                        'responsive': true
                                                    },
                                                    'check_callback': true
                                                }
                                            }); 
                                            
                                        } 
                                })
                                    
                                }else if(self.varfilter_selected[1] === "familia"){
                                    var button_val = lst[2]
                                    var query = "query{all_snib_covariables(limit:2500, filter:\""+ button_val +" ='"+ ui.item.id +"'\"){familiavalida generovalido especievalida}}"
                                    $.ajax({
                                        url: "https://covid19.c3.unam.mx/gateway/api/nodes/",
                                        method: "POST",
                                        contentType: "application/json",
                                        data: JSON.stringify({query: query}),
                                        success: function(resp){                
                                            var sel = resp.data.all_snib_covariables
                                            console.log(sel)
                                            var data_cov=[]
                                            var species_names = [];
                                            sel.forEach(specie=>{
                                                if(!species_names.includes(specie.especievalida)){
                                                    species_names.push(specie.especievalida)                                                                                                      
                                                }
                                            })
                                            var familias=[];
                                            sel.forEach(specie=>{
                                                if(!familias.includes(specie.familiavalida)){
                                                    familias.push(specie.familiavalida)
                                                    data_cov.push({ "id" : specie.familiavalida , "parent" : "#"  , "text" : specie.familiavalida, 'state': {'opened': false}, "icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 6, "type": 0}})

                                                }
                                            })
                                            
                                            var familias_obj = {}
                                            familias.forEach(familia=>{
                                                var generos = []
                                                sel.forEach(specie=>{
                                                    if(!generos.includes(specie.generovalido) && specie.familiavalida === familia){
                                                        generos.push(specie.generovalido)
                                                        data_cov.push({ "id" : specie.generovalido , "parent" : specie.familiavalida  , "text" : specie.generovalido, 'state': {'opened': false}, "icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 7, "type": 0}})
                                                    }
                                                })
                                                var generos_obj = {}
                                                generos.forEach(genero=>{
                                                    var especievalida=[]
                                                    sel.forEach(specie=>{
                                                        if(!especievalida.includes(specie.especievalida) && specie.generovalido === genero){
                                                            especievalida.push(specie.especievalida)
                                                            data_cov.push({ "id" : specie.especievalida , "parent" : specie.generovalido , "text" : specie.especievalida, 'state': {'opened': false}, "icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 8, "type": 0}})
                                                        }
                                                    })
                                                    generos_obj[genero] = especievalida
                                                })
                                                familias_obj[familia]=generos_obj                                                
                                            })
                                            
                                            console.log(familias_obj)
                                            console.log(data_cov)
                                            console.log("jstree_variables_species_fuente")
                                            $('#jstree_variables_species_' + id).jstree("destroy").empty();
                                            $('#jstree_variables_species_' + id).on('open_node.jstree', self.getTreeVar);
                                            $("#jstree_variables_species_" + id).on('changed.jstree', self.getChangeTreeVarFuente);
                                            $("#jstree_variables_species_" + id).on('loaded.jstree', self.loadNodes);

                                            self.value_vartree = ui.item.id;
                                            self.field_vartree = self.varfilter_selected[0];
                                            self.parent_field_vartree = self.varfilter_selected[1];
                                            self.level_vartree = self.varfilter_selected[2];

                                           _VERBOSE ? console.log("nivel") : _VERBOSE;
                                           _VERBOSE ? console.log(self.level_vartree) : _VERBOSE;

                                           var icon = parseInt(self.level_vartree) === 8 ? "plugins/jstree/images/dna.png" : "plugins/jstree/images/dna.png"

                                           _VERBOSE ? console.log(self.level_vartree) : _VERBOSE;
                                            $('#jstree_variables_species_' + id).jstree({
                                                'plugins': ["wholerow", "checkbox"],
                                                'core': {
                                                    'data': data_cov,
                                                    'themes': {
                                                        'name': 'proton',
                                                        'responsive': true
                                                    },
                                                    'check_callback': true
                                                }
                                            }); 
                                        }
                                })

                                }else if(self.varfilter_selected[1] === "genero"){
                                    var button_val = lst[3]
                                    var query = "query{all_snib_covariables(limit:2000, filter:\""+ button_val +" ='"+ ui.item.id +"'\"){generovalido especievalida}}"
                                    $.ajax({
                                        url: "https://covid19.c3.unam.mx/gateway/api/nodes/",
                                        method: "POST",
                                        contentType: "application/json",
                                        data: JSON.stringify({query: query}),
                                        success: function(resp){                
                                            var sel = resp.data.all_snib_covariables
                                            console.log(sel)
                                            var data_cov=[]
                                            var species_names = [];
                                            sel.forEach(specie=>{
                                                if(!species_names.includes(specie.especievalida)){
                                                    species_names.push(specie.especievalida)                                                                                                      
                                                }
                                            })
                                            var generos = []
                                            sel.forEach(specie=>{
                                                if(!generos.includes(specie.generovalido)){
                                                    generos.push(specie.generovalido)
                                                    data_cov.push({ "id" : specie.generovalido , "parent" : "#"  , "text" : specie.generovalido, 'state': {'opened': false},  "icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 7, "type": 0}})
                                                }
                                            })
                                            
                                            // console.log(generos)
                                            var generos_obj = {}
                                            generos.forEach(genero=>{
                                                var especievalida = []
                                                sel.forEach(specie=>{
                                                    if(!especievalida.includes(specie.especievalida) && specie.generovalido){
                                                        especievalida.push(specie.especievalida)
                                                        data_cov.push({ "id" : specie.especievalida , "parent" : specie.generovalido , "text" : specie.especievalida, 'state': {'opened': false}, "icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 8, "type": 0}})
                                                    }
                                                })
                                                generos_obj[genero]= especievalida
                                            })

                                            console.log(data_cov)
                                            console.log("**********arbol**********")
                                            console.log("jstree_variables_species_fuente")
                                            $('#jstree_variables_species_' + id).jstree("destroy").empty();
                                            $('#jstree_variables_species_' + id).on('open_node.jstree', self.getTreeVar);
                                            $("#jstree_variables_species_" + id).on('changed.jstree', self.getChangeTreeVarFuente);
                                            $("#jstree_variables_species_" + id).on('loaded.jstree', self.loadNodes);

                                            self.value_vartree = ui.item.id;
                                            self.field_vartree = self.varfilter_selected[0];
                                            self.parent_field_vartree = self.varfilter_selected[1];
                                            self.level_vartree = self.varfilter_selected[2];

                                           _VERBOSE ? console.log("nivel") : _VERBOSE;
                                           _VERBOSE ? console.log(self.level_vartree) : _VERBOSE;

                                           var icon = parseInt(self.level_vartree) === 8 ? "plugins/jstree/images/dna.png" : "plugins/jstree/images/dna.png"

                                           _VERBOSE ? console.log(self.level_vartree) : _VERBOSE;
                                            $('#jstree_variables_species_' + id).jstree({
                                                'plugins': ["wholerow", "checkbox"],
                                                'core': {
                                                    'data': data_cov,
                                                    'themes': {
                                                        'name': 'proton',
                                                        'responsive': true
                                                    },
                                                    'check_callback': true
                                                }
                                            }); 


                                        }
                                })
                                }else{
                                    var button_val = lst[4]
                                    var query = "query{all_snib_covariables(limit:2000, filter:\""+ button_val +" ='"+ ui.item.id +"'\"){especievalida}}"
                                    $.ajax({
                                        url: "https://covid19.c3.unam.mx/gateway/api/nodes/",
                                        method: "POST",
                                        contentType: "application/json",
                                        data: JSON.stringify({query: query}),
                                        success: function(resp){                
                                            var sel = resp.data.all_snib_covariables
                                            console.log(sel)
                                            var data_cov = [{ "id" : "raiz" , "parent" :"#", "text" : "raiz", 'state': {'opened': false},  "icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 7, "type": 0}}]
                                            var species_names = [];
                                            sel.forEach(specie=>{
                                                if(!species_names.includes(specie.especievalida)){
                                                    species_names.push(specie.especievalida)
                                                    data_cov.push(data_cov.push({ "id" : specie.especievalida , "parent" :"raiz", "text" : specie.especievalida, 'state': {'opened': false},  "icon": "plugins/jstree/images/dna.png", 'attr': {'nivel': 8, "type": 0}}))                                                                                                   
                                                }
                                            })
                                            // console.log(data_cov)
                                            // console.log("jstree_variables_species_fuente")
                                            $('#jstree_variables_species_' + id).jstree("destroy").empty();
                                            $('#jstree_variables_species_' + id).on('open_node.jstree', self.getTreeVar);
                                            $("#jstree_variables_species_" + id).on('changed.jstree', self.getChangeTreeVarFuente);
                                            $("#jstree_variables_species_" + id).on('loaded.jstree', self.loadNodes);

                                            self.value_vartree = ui.item.id;
                                            self.field_vartree = self.varfilter_selected[0];
                                            self.parent_field_vartree = self.varfilter_selected[1];
                                            self.level_vartree = self.varfilter_selected[2];

                                           _VERBOSE ? console.log("nivel") : _VERBOSE;
                                           _VERBOSE ? console.log(self.level_vartree) : _VERBOSE;

                                           var icon = parseInt(self.level_vartree) === 8 ? "plugins/jstree/images/loagind.gif" : "plugins/jstree/images/loading.gif"

                                           _VERBOSE ? console.log(self.level_vartree) : _VERBOSE;
                                            $('#jstree_variables_species_' + id).jstree({
                                                'plugins': ["wholerow", "checkbox"],
                                                'core': {
                                                    'data': data_cov,
                                                    'themes': {
                                                        'name': 'proton',
                                                        'responsive': true
                                                    },
                                                    'check_callback': true
                                                }
                                            }); 


                                        }
                                })

                                }
                                

                            //     $('#jstree_variables_species_' + id).jstree("destroy").empty();
                            //     $('#jstree_variables_species_' + id).on('open_node.jstree', self.getTreeVar);
                            //     $("#jstree_variables_species_" + id).on('changed.jstree', self.getChangeTreeVar);
                            //     $("#jstree_variables_species_" + id).on('loaded.jstree', self.loadNodes);

                            //     self.value_vartree = ui.item.id;
                            //     self.field_vartree = self.varfilter_selected[0];
                            //     self.parent_field_vartree = self.varfilter_selected[1];
                            //     self.level_vartree = self.varfilter_selected[2];

                            //    _VERBOSE ? console.log("nivel") : _VERBOSE;
                            //    _VERBOSE ? console.log(self.level_vartree) : _VERBOSE;

                            //    var icon = parseInt(self.level_vartree) === 8 ? "plugins/jstree/images/dna.png" : "plugins/jstree/dist/themes/default/throbber.gif"

                            //    _VERBOSE ? console.log(self.level_vartree) : _VERBOSE;

                            //     var tree_reinos = [{
                            //             "text": self.value_vartree,
                            //             "id": "root",
                            //             "attr": {"nivel": self.level_vartree, "type": _TYPE_TAXON},
                            //             'state': {'opened': true},
                            //             "icon": icon
                            //         }];

                            //     $('#jstree_variables_species_' + id).jstree({
                            //         'plugins': ["wholerow", "checkbox"],
                            //         'core': {
                            //             'data': tree_reinos,
                            //             'themes': {
                            //                 'name': 'proton',
                            //                 'responsive': true
                            //             },
                            //             'check_callback': true
                            //         }
                            //     });

                            }

                        })
                        .appendTo(drop_item);

                // contendor de arbol y panel de seleccion
                var class_nav_species = reduced_height ? "reduced_nav_species_container" : "nav_species_container"
                var tree_nav_container = $('<div/>')
                        .addClass('row ' + class_nav_species)
                        .appendTo(tab_pane);

                var div_tree = $('<div/>')
                        .attr('id', "treeVariable_" + id)
                        .addClass('myScrollableBlockVar')
                        .appendTo(tree_nav_container);

                var tree = $('<div/>')
                        .attr('id', "jstree_variables_species_" + id)
                        .appendTo(div_tree);

                // var tree_selection = $('<div/>')
                //   		.attr('id', "treeAddedPanel_" + id)
                //   		.addClass('myScrollableBlockVariableAdded')
                // 	.appendTo(tree_nav_container);


                var btn_add = $('<button/>')
                        .attr('id', 'add_group' + "_" + id)
                        .attr('type', 'button')
                        .addClass('btn btn-primary glyphicon glyphicon-plus pull-left no-mg-top')
                        .click(function (e) { 
                            switch(id){
                                case "fuente":
                                    self.formQuery('jstree_variables_species_'+ id, self.arrayVarSelectedFuente2)
                                    self.addOtherGroup('jstree_variables_species_' + id, self.arrayVarSelectedFuente,  'Bio', 'treeAddedPanel_' + id, _TYPE_BIO);
                                    break;
                                case "target":
                                    self.formQuery('jstree_variables_species_'+ id, self.arrayVarSelectedTarget2)
                                    self.addOtherGroup('jstree_variables_species_' + id, self.arrayVarSelectedTarget,  'Bio', 'treeAddedPanel_' + id, _TYPE_BIO);
                                    break;
                            } 
                            $('#jstree_variables_species_' + id).jstree("destroy").empty();
                            $('#jstree_variables_species_' + id).off('open_node.jstree', self.getTreeVar);
                            $("#jstree_variables_species_" + id).off('changed.jstree', self.getChangeTreeVar);
                            $("#jstree_variables_species_" + id).off('ready.jstree', self.loadNodes);
                            $("#text_variable" + "_" + id).val("");

                            e.preventDefault();
                        })
                        .appendTo(tab_pane);

                var btn_add = $('<button/>')
                        .attr('id', 'clean_var' + "_" + id)
                        .attr('type', 'button')
                        .addClass('btn btn-primary glyphicon glyphicon-trash pull-left no-mg-top')
                        .click(function (e) {

                            $("#text_variable" + "_" + id).val("");
                            $('#jstree_variables_species_' + id).off('open_node.jstree', self.getTreeVar);
                            $("#jstree_variables_species_" + id).off('changed.jstree', self.getChangeTreeVar);
                            $("#jstree_variables_species_" + id).off('ready.jstree', self.loadNodes);

                            self.arrayVarSelected = [];
                            // self.groupvar_dataset = [];
                            self.cleanVariables('jstree_variables_species_' + id, 'treeAddedPanel_' + id, _TYPE_BIO);

                            e.preventDefault();
                        })
                        .appendTo(tab_pane);


                if(btn_visualize){

                   // boto de visualización se migra fuera del componente

                    // var btn_add = $('<button/>')
                    //     .attr('id', 'visualize_var' + "_" + id)
                    //     .attr('type', 'button')
                    //     .addClass('btn btn-primary glyphicon glyphicon-eye-open pull-left no-mg-top')
                    //     .click(function (e) {

                    //         console.log(self.groupDatasetTotal);
                    //         // console.log(self.getVarSelArray());

                    //         if(self.groupDatasetTotal.length == 0){
                    //             console.log("No species selected");
                    //             return;
                    //         }

                    //         self.taxones = [];

                    //         console.log(self.groupDatasetTotal);
                    //         console.log(self.var_sel_array);


                    //         $.each(self.groupDatasetTotal, function(index_i, grupo){

                    //             console.log(grupo);

                    //             $.each(grupo.elements, function(index_j, sp_grupo){


                    //                 var array_sp = sp_grupo.label.split(">>");

                    //                 var temp_item = {};

                    //                 temp_item["taxon"] = map_taxon.get(array_sp[0].trim().toLowerCase());
                    //                 temp_item["value"] = array_sp[1].trim();
                    //                 temp_item["title"] = grupo.title;
                    //                 temp_item["nivel"] = parseInt(sp_grupo.level); //0:root, 1:reino, etc...
                    //                 self.taxones.push(temp_item);
                    //             })

                    //         })

                    //         console.log(self.taxones);

                    //         _map_module.busca_especie_grupo(self.taxones);

                    //         $("#text_variable" + "_" + id).val("");
                    //         $('#jstree_variables_species_' + id).off('open_node.jstree', self.getTreeVar);
                    //         $("#jstree_variables_species_" + id).off('changed.jstree', self.getChangeTreeVar);
                    //         $("#jstree_variables_species_" + id).off('ready.jstree', self.loadNodes);

                    //         e.preventDefault();
                    //     })
                    //     .appendTo(tab_pane);
                }




            }
            // tab de variables raster
            else if (i === 1) {

                // generando tab panel para variables climaticas
                

                var tab_pane = $('<div/>')
                        .attr('id', 'tab' + i + "_" + id)
                        .addClass('tab-pane')
                        .appendTo(tab_content)
                        



                // contendor de arbol y panel de seleccion
                var tree_nav_container = $('<div/>')
                        .addClass('row nav_species_container')
                        .appendTo(tab_pane);

                var div_tree = $('<div/>')
                        .attr('id', "treeVariableBioclim_" + id)
                        .addClass('myScrollableBlockVar')
                        .appendTo(tree_nav_container);

                var tree = $('<div/>')
                        .attr('id', "jstree_variables_bioclim_" + id)
                        .appendTo(div_tree);                
                        



                var btn_add = $('<button/>')
                        .attr('id', 'add_group_bioclim' + "_" + id)
                        .attr('type', 'button')
                        .addClass('btn btn-primary glyphicon glyphicon-plus pull-left')
                        .click(function (e) {
                            
                            self.formQuery('jstree_variables_bioclim_' + id, self.arrayBioclimSelected2)
                            self.addOtherGroup('jstree_variables_bioclim_' + id, self.arrayBioclimSelected,  'Raster', 'treeAddedPanel_' + id, _TYPE_ABIO);
                            e.preventDefault();

                        })
                        .appendTo(tab_pane);

                var btn_add = $('<button/>')
                        .attr('id', 'clean_var_bioclim' + "_" + id)
                        .attr('type', 'button')
                        .addClass('btn btn-primary glyphicon glyphicon-trash pull-left')
                        .click(function (e) {

                            self.arrayBioclimSelected = [];
                            // self.groupbioclimvar_dataset = [];
                            self.cleanVariables('jstree_variables_bioclim_' + id, 'treeAddedPanel_' + id, _TYPE_TERRESTRE);
                            e.preventDefault();

                        })
                        .appendTo(tab_pane);


                // carga árbol de variables raster
                //self.loadTreeVarRaster();

            }

            else if (i===2){
                var tab_pane = $('<div/>')
                        .attr('id', 'tab' + i + "_" + id)
                        .addClass('tab-pane')
                        .appendTo(tab_content)
                        
                var tree_nav_container = $('<div/>')
                        .addClass('row nav_species_container')
                        .appendTo(tab_pane)
                        
                

                var div_tree = $('<div/>')
                        .attr('id', "treeVariableSocio" + id)
                        .addClass('myScrollableBlockVar')
                        .appendTo(tree_nav_container);

                var tree = $('<div/>')                        
                        .attr('id', "jstree_variables_socio_" + id)
                        .appendTo(div_tree);
                
                        
                        var btn_add = $('<button/>')
                        .attr('id', 'add_group_bioclim' + "_" + id)
                        .attr('type', 'button')
                        .addClass('btn btn-primary glyphicon glyphicon-plus pull-left')
                        .click(function (e) {
                            
                            self.formQuery("jstree_variables_socio_" + id, self.arraySocioSelected2)
                            self.addOtherGroup("jstree_variables_socio_" + id, self.arraySocioSelected,  'Socio', 'treeAddedPanel_' + id, _TYPE_ABIO);
                            e.preventDefault();                            
                            
                        })
                        .appendTo(tab_pane);

                var btn_add = $('<button/>')
                        .attr('id', 'clean_var_bioclim' + "_" + id)
                        .attr('type', 'button')
                        .addClass('btn btn-primary glyphicon glyphicon-trash pull-left')
                        .click(function (e) {
                            // self.groupbioclimvar_dataset = [];
                            self.cleanVariables("jstree_variables_socio_" + id, 'treeAddedPanel_' + id, _TYPE_ABIO);
                            e.preventDefault();
                        })
                        .appendTo(tab_pane);

            }
            
        });

        // Evento generado cuando se realiza la acción de abrir una rama del árbol de selección, realiza la carga de los elementos que componen la rama a la cual se desea tener acceso.
        self.getTreeVar = function (e, d) {

            _VERBOSE ? console.log("self.getTreeVar") : _VERBOSE;

            _VERBOSE ? console.log(d.node.original.attr.nivel) : _VERBOSE;
            _VERBOSE ? console.log(d.node.children) : _VERBOSE;
            console.log("esto es d "+ d)

            if (d.node.children.length > 1){
                console.log("No se encontraron datos debajo de este nivel")
                return;
            }

            var next_field = "";
            var next_nivel = 0;
            var parent_field = "";

            $("#jstree_variables_species_" + id).jstree(true).set_icon(d.node.id, "plugins/jstree/images/dna.png");

            if (d.node.original.attr.nivel == 2) {
                parent_field = "reino"
                next_field = "phylum";
                next_nivel = 3;
            } else if (d.node.original.attr.nivel == 3) {
                parent_field = "phylum"
                next_field = "clase";
                next_nivel = 4;
            } else if (d.node.original.attr.nivel == 4) {
                parent_field = "clase"
                next_field = "orden";
                next_nivel = 5;
            } else if (d.node.original.attr.nivel == 5) {
                parent_field = "orden"
                next_field = "familia";
                next_nivel = 6;
            } else if (d.node.original.attr.nivel == 6) {
                parent_field = "familia"
                next_field = "genero";
                next_nivel = 7;
            } else if (d.node.original.attr.nivel == 7) {
                parent_field = "genero"
                next_field = "epitetoespecifico";
                next_nivel = 8;
            } else {
                $('#jstree_variables_species_' + id).tooltip('hide');
                $("#jstree_variables_species_" + id).jstree(true).delete_node(d.node.children[0]);
                $("#jstree_variables_species_" + id).jstree(true).set_icon(d.node.id, "./plugins/jstree/images/dna.png");
                return;
            }

            _VERBOSE ? console.log(d.node.id) : _VERBOSE
            _VERBOSE ? console.log(d.node.text) : _VERBOSE

            var text_val = d.node.text
            var regex = / \(spp: \d*\)/gi;

            // elimina el (spp: N) del valir para realizar la busqueda de manera correcta
            var label_value = text_val.replace(regex, '');
            _VERBOSE ? console.log(label_value) : _VERBOSE

            _REGION_SELECTED = ($("#footprint_region_select").val() !== null && $("#footprint_region_select").val() !== undefined) ? parseInt($("#footprint_region_select").val()) : _REGION_SELECTED;
            _GRID_RES = $("#grid_resolution").val();

            console.log("REGION_SELECTED: " + _REGION_SELECTED);
            console.log("_GRID_RES: " + _GRID_RES);

            
            var _url="https://covid19.c3.unam.mx/gateway/api/nodes/"

            let nodo = _AGENT_SELECTED.toLowerCase()
            let _DISEASE_SELECTED = $("#disease_selected option:selected").text();


            let query = 'query{occurrences_by_taxon_' + nodo + '(query: "nombreenfermedad = \''+ _DISEASE_SELECTED + '\' AND '+ parent_field.toLowerCase() +' = \'' + label_value +'\' "){'+ next_field +'}}'
            console.log(query)


            $.ajax({
                method: "POST",
                url: _url,
                contentType: "application/json",
                data: JSON.stringify({query: query}),
                success: function (resp) {
                    console.log(resp)

                    let data2 = resp.data["occurrences_by_taxon_" + nodo]
                    console.log(data2)
                    console.log(data2[0])


                    let uniqueObjArray = []


                    for (let i = 0; i < data2.length; i++) {
                        let val = data2[i];
                        //console.log(val)
                        if(uniqueObjArray.indexOf(val) === -1) {
                           uniqueObjArray.push(val);
                        }


                    }

                    let uniqueObjArray1 = [
                    ...new Map( uniqueObjArray.map((item) => [item[next_field], item])).values(),
                    ];


                    console.log(uniqueObjArray1)
                    let data = uniqueObjArray1

                    $('ul').tooltip('hide');
                    $('li').tooltip('hide');
                    $('li').removeAttr("title");
                    $('li').removeAttr("data-original-title");
                    $('#jstree_variables_species_' + id).removeAttr("data-original-title");
                    $('#jstree_variables_species_' + id).removeAttr("title");

                    for (i = 0; i < data.length; i++) {

                        var idNode = "";
                        var camp = data[i]
                        var name_variable = camp[next_field]

                        console.log("name_variable: " + name_variable)

                        if ($("#" + data[i].id).length > 0) {
                            // _VERBOSE ? console.log("id_existente") : _VERBOSE;

                            idNode = data[i].id.replace(" ","") + "_" + Math.floor((Math.random() * 1000) + 1)
                        } else {
                            // ._VERBOSE ? console.log("nuevo_id") : _VERBOSE;

                            idNode = camp[next_field];
                        }

                        var default_son = next_nivel < 8 ? [{text: "cargando..."}] : [];
                        var label_taxon = next_nivel < 8 ? camp[next_field] : camp[next_field];  //" (spp: " + data[i].spp + ")"

                        var newNode = {
                            id: idNode,
                            text: label_taxon,
                            icon: "plugins/jstree/images/dna.png",
                            attr: {"nivel": next_nivel, "type": _TYPE_TAXON},
                            state: {'opened': false},
                            "children": default_son
                        };

                        if(data[i].description+'' !== 'undefined'){
                            newNode['li_attr'] = {"title": data[i].description + ' ' + data[i].name.split(' ')[1]};
                        }

                        $('#jstree_variables_species_' + id).jstree("create_node", d.node, newNode, 'last', false, false);

                    }

                    $("#jstree_variables_species_" + id).jstree(true).delete_node(d.node.children[0]);
                    $("#jstree_variables_species_" + id).jstree(true).set_icon(d.node.id, "./plugins/jstree/images/dna.png");
                    $("#jstree_variables_species_" + id).prop('title', data[0].description);
                    $("#jstree_variables_species_" + id).tooltip();

                    $('li').tooltip();
                    $('ul').tooltip();

                }
            });

        };


        // Evento generado cuando cambia el estado de selección del árbol, almacena los elementos que fueron seleccionados del grupo de variables taxonómicas.

        self.getChangeTreeVarTarget = function (e, data) {
            console.log("cambiaste el arbol")
            _VERBOSE ? console.log("self.getChangeTreeVar") : _VERBOSE;

            self.arrayVarSelectedTarget = []; //para el front
            self.arrayVarSelectedTarget2 = []; //para el query

            if ($('#jstree_variables_species_target').jstree(true).get_top_selected().length > 0) {

                // _VERBOSE ? console.log("acceder node header del dom") : _VERBOSE;
                var headers_selected = $('#jstree_variables_species_target').jstree(true).get_top_selected().length;

                for (i = 0; i < headers_selected; i++) {

                    var node_temp = $('#jstree_variables_species_target').jstree(true).get_node($('#jstree_variables_species_target').jstree(true).get_top_selected()[i]).original;
                    var level = "";

                    if (node_temp.attr.nivel == 2)
                        //level = _iTrans.prop('a_item_reino');
                        level = "kingdom"
                    else if (node_temp.attr.nivel == 3)
                        //level = _iTrans.prop('a_item_phylum');
                        level = "phylum"
                    else if (node_temp.attr.nivel == 4)
                        //level = _iTrans.prop('a_item_clase');
                        level = "class"
                    else if (node_temp.attr.nivel == 5)
                        //level = _iTrans.prop('a_item_orden');
                        level = "order"
                    else if (node_temp.attr.nivel == 6)
                        //level = _iTrans.prop('a_item_familia');
                        level = "family"
                    else if (node_temp.attr.nivel == 7)
                        //level = _iTrans.prop('a_item_genero');
                        level = "genus"
                    else if (node_temp.attr.nivel == 8)
                        //level = _iTrans.prop('a_item_especie');
                        level = "species"


                    _VERBOSE ? console.log("level: " + level) : _VERBOSE;

                    var parent_node = $('#jstree_variables_species_target').jstree(true).get_node($('#jstree_variables_species_target').jstree(true).get_parent($('#jstree_variables_species_' + id).jstree(true).get_top_selected()[i])).original;

                    _VERBOSE ? console.log(parent_node) : _VERBOSE;
                    _VERBOSE ? console.log(node_temp) : _VERBOSE;

                    if (parent_node ) {

                        self.arrayVarSelectedTarget.push({label: node_temp.text, level: level, numlevel: node_temp.attr.nivel, type: node_temp.attr.type, parent: parent_node.text});
                        self.arrayVarSelectedTarget2.push({taxon: level, value:node_temp.text })

                    //    if (node_temp.attr.nivel == 8) {

                    //        self.arrayVarSelected.push({label: node_temp.text, level: level, numlevel: node_temp.attr.nivel, type: node_temp.attr.type, parent: parent_node.text});

                    //    }
                    //    else {

                    //        self.arrayVarSelected.push({label: node_temp.text, level: level, numlevel: node_temp.attr.nivel, type: node_temp.attr.type, parent: parent_node.text});
                    //    }

                    } else {

                        self.arrayVarSelectedTarget.push({label: node_temp.text, level: level, numlevel: node_temp.attr.nivel, type: node_temp.attr.type});
                        self.arrayVarSelectedTarget2.push({taxon: level, value: node_temp.text })

                    }

                }

            }

            _VERBOSE ? console.log(self.arrayVarSelectedTarget) : _VERBOSE;
            _VERBOSE ? console.log(self.arrayVarSelectedTarget2) : _VERBOSE;

        };

        self.getChangeTreeVarFuente = function (e, data) {
            console.log("cambiaste el arbol")
            _VERBOSE ? console.log("self.getChangeTreeVarFuente") : _VERBOSE;

            self.arrayVarSelectedFuente = []; //para el front
            self.arrayVarSelectedFuente2 = []; //para el query
            
            console.log($('#jstree_variables_species_fuente').jstree(true).get_top_selected().length)

            if ($('#jstree_variables_species_fuente').jstree(true).get_top_selected().length > 0) {

                // _VERBOSE ? console.log("acceder node header del dom") : _VERBOSE;
                var headers_selected = $('#jstree_variables_species_fuente').jstree(true).get_top_selected().length;

                for (i = 0; i < headers_selected; i++) {

                    var node_temp = $('#jstree_variables_species_fuente').jstree(true).get_node($('#jstree_variables_species_fuente').jstree(true).get_top_selected()[i]).original;
                    var level = "";

                    if (node_temp.attr.nivel == 2)
                        //level = _iTrans.prop('a_item_reino');
                        level = "kingdom"
                    else if (node_temp.attr.nivel == 3)
                        //level = _iTrans.prop('a_item_phylum');
                        level = "phylum"                       
                    else if (node_temp.attr.nivel == 4)
                        //level = _iTrans.prop('a_item_clase');
                        level = "class"
                    else if (node_temp.attr.nivel == 5)
                        //level = _iTrans.prop('a_item_orden');
                        level = "order"
                    else if (node_temp.attr.nivel == 6)
                        //level = _iTrans.prop('a_item_familia');
                        level = "family"
                    else if (node_temp.attr.nivel == 7)
                        //level = _iTrans.prop('a_item_genero');
                        level = "genus"
                    else if (node_temp.attr.nivel == 8)
                        //level = _iTrans.prop('a_item_especie');
                        level = "species" 


                    _VERBOSE ? console.log("level: " + level) : _VERBOSE;

                    var parent_node = $('#jstree_variables_species_fuente').jstree(true).get_node($('#jstree_variables_species_fuente').jstree(true).get_parent($('#jstree_variables_species_' + id).jstree(true).get_top_selected()[i])).original;

                    _VERBOSE ? console.log(parent_node) : _VERBOSE;
                    _VERBOSE ? console.log(node_temp) : _VERBOSE;
                    if (parent_node ) {

                        self.arrayVarSelectedFuente.push({label: node_temp.text, level: level, numlevel: node_temp.attr.nivel, type: node_temp.attr.type, parent: parent_node.text});
                        self.arrayVarSelectedFuente2.push({taxon: level, value:node_temp.text })

                    //    if (node_temp.attr.nivel == 8) {

                    //        self.arrayVarSelected.push({label: node_temp.text, level: level, numlevel: node_temp.attr.nivel, type: node_temp.attr.type, parent: parent_node.text});

                    //    }
                    //    else {

                    //        self.arrayVarSelected.push({label: node_temp.text, level: level, numlevel: node_temp.attr.nivel, type: node_temp.attr.type, parent: parent_node.text});
                    //    }

                    } else {

                        self.arrayVarSelectedFuente.push({label: node_temp.text, level: level, numlevel: node_temp.attr.nivel, type: node_temp.attr.type});
                        self.arrayVarSelectedFuente2.push({taxon: level, value: node_temp.text })

                    }

                }

            }

            _VERBOSE ? console.log(self.arrayVarSelectedFuente) : _VERBOSE;
            _VERBOSE ? console.log(self.arrayVarSelectedFuente2) : _VERBOSE;

        };
        // Evento generado cuando cambia el estado de selección del árbol, almacena los elementos que fueron seleccionados del grupo de variables climáticas.
        self.getChangeTreeVarRaster = function (e, data) {

            _VERBOSE ? console.log("self.getChangeTreeVarRaster") : _VERBOSE;
            self.arrayBioclimSelected= [];
            self.arrayBioclimSelected2 = [];
            console.log($("#treeVariableBioclim_fuente").jstree(true).get_top_selected())

            if($("#treeVariableBioclim_fuente").jstree(true).get_top_selected()[0] === 'WorlClim' && $("#treeVariableBioclim_fuente").jstree(true).get_top_selected().length > 0){
                
                // _module_toast = toast_module(_VERBOSE);
                // _module_toast.startToast();
                _module_toast.showToast_CenterCenter("Cargando todos los layers de Worldclim", "info")
                self.arrayBioclimSelected.push({label: "WordlClim", id: " ", parent: "Raster ", level: "5", type: " "})
                $.ajax({
                    method: "POST",
                    url: "https://covid19.c3.unam.mx/gateway/api/nodes/",
                    contentType: "application/json",
                    data: JSON.stringify({query: "query{ all_worldclim_covariables(limit: 1000, filter: \"\"){ layer}}"}),
                    success: function(resp){
                        _module_toast.showToast_CenterCenter("Se han cargado todos los layers", "success")
                        var layers=[]
                        resp.data.all_worldclim_covariables.forEach(json=>{
                            if(!layers.includes(json.layer)){
                                layers.push(json.layer)                                    
                            }                                
                        })                        
                        layers.forEach(layer=>{
                            self.arrayBioclimSelected2.push({taxon:"layer", value:layer})
                        })
                        
                        
                    }
                })             
            }else if ($("#treeVariableBioclim_fuente").jstree(true).get_top_selected().length > 0) {
                console.log("elegiste algúnos nodos")
                var headers_selected = $("#treeVariableBioclim_fuente").jstree(true).get_top_selected().length;

                for (i = 0; i < headers_selected; i++) {
                    var node_temp = $("#treeVariableBioclim_fuente").jstree(true).get_node($("#treeVariableBioclim_fuente").jstree(true).get_top_selected()[i]).original;
                    
                    _VERBOSE ? console.log(node_temp) : _VERBOSE;
                    if(node_temp.attr.nivel===7){      

                        self.arrayBioclimSelected.push({label: node_temp.text, id: node_temp.attr.layer, parent: node_temp.parent, level: node_temp.attr.level, type: node_temp.attr.type});
                        self.arrayBioclimSelected2.push({taxon:"layer" , value: node_temp.attr.layer})

                    }else if(node_temp.attr.nivel ===8){

                        self.arrayBioclimSelected.push({label: node_temp.text, id: node_temp.attr.layer, parent: node_temp.parent, level: node_temp.attr.level, type: node_temp.attr.type});
                        self.arrayBioclimSelected2.push({taxon:"id" , value: node_temp.attr.id})

                    }
                }                

            }

            
            _VERBOSE ? console.log(self.arrayBioclimSelected) : _VERBOSE;
            
            _VERBOSE ? console.log(self.arrayBioclimSelected2) : _VERBOSE;           

        };

        
        self.getChangeTreeVarSocio =  function(e, data){
            _VERBOSE ? console.log("self.getChangeTreeVarSocio") : _VERBOSE;
            self.arraySocioSelected=[];
            self.arraySocioSelected2=[]; 
            console.log("socioselected2 es ")
            console.log(self.arraySocioSelected2)
            console.log($("#jstree_variables_socio_fuente").jstree(true).get_top_selected())
            
            if($("#jstree_variables_socio_fuente").jstree(true).get_top_selected()[0]==="inegi" && $("#jstree_variables_socio_fuente").jstree(true).get_top_selected().length > 0){
                
                _module_toast.showToast_CenterCenter("Cargando todos los layers de INEGI", "info")
                self.arraySocioSelected.push({label: "INEGI 2020", id: " ", parent: "Socio ", level: "5", type: " "})
                console.log("elegiste INEGI2020")
                $.ajax({
                    method: "POST",
                    url: "https://covid19.c3.unam.mx/gateway/api/nodes/",
                    contentType: "application/json",
                    data: JSON.stringify({query: "query{all_censo_inegi_2020_covariables(limit: 2000, filter:\"\"){code}}"}),
                    success:function(resp){                                                
                        var codes=[]
                        resp.data.all_censo_inegi_2020_covariables.forEach(json=>{
                            if(!codes.includes(json.code)){
                                codes.push(json.code)
                            }
                        })
                        console.log(self.arraySocioSelected2)
                        
                        codes.forEach(code=>{
                            self.arraySocioSelected2.push({taxon: "code", value: code})
                        })
                        _module_toast.showToast_CenterCenter("Se han cargado todos los layers", "success")

                        
                                               
                    }
                })

            }else if ($("#jstree_variables_socio_fuente").jstree(true).get_top_selected().length > 0) {
                console.log("elegiste alguno de los nodos")
                var headers_selected = $("#jstree_variables_socio_fuente").jstree(true).get_top_selected().length;

                for (i = 0; i < headers_selected; i++) {
                    var node_temp = $("#jstree_variables_socio_fuente").jstree(true).get_node($("#jstree_variables_socio_fuente").jstree(true).get_top_selected()[i]).original;

                    _VERBOSE ? console.log(node_temp) : _VERBOSE;
                    if (node_temp.attr.nivel === 7){                        
                        
                        self.arraySocioSelected.push({label: node_temp.text, id: node_temp.attr, parent: node_temp.parent, level: node_temp.attr.level, type: node_temp.attr.type});
                        self.arraySocioSelected2.push({taxon: "code", value: node_temp.attr.code}) 

                    }else if(node_temp.attr.nivel === 8){
                        self.arraySocioSelected.push({label: node_temp.text, id: node_temp.attr, parent: node_temp.attr.parent, level: node_temp.attr.level, type: node_temp.attr.type});
                        self.arraySocioSelected2.push({taxon: "id", value:node_temp.attr.id  }) 
                    }
                }

            }
            console.log("Array para el front")
            _VERBOSE ? console.log(self.arraySocioSelected) : _VERBOSE;
            console.log("Array para el body")
            _VERBOSE ? console.log(self.arraySocioSelected2) : _VERBOSE;            

        }



        self.isKingdomLevel = function (arraySelected) {

            _VERBOSE ? console.log("self.isKingdomLevel") : _VERBOSE;
            var isKingdomLevel = false;

            arraySelected.forEach(function (item, index) {
                _VERBOSE ? console.log("numlevel: " + item.numlevel) : _VERBOSE;

                if (parseInt(item.numlevel) <= NIVEL_PHYLUM) {

                    _VERBOSE ? console.log("NIVEL_PHYLUM O REINO") : _VERBOSE;
                    isKingdomLevel = true
                    return true;

                }

            });

            return isKingdomLevel;
        }

        // Realiza la verificación si un grupo ya ha sido añadido previamente para eliminar duplicidad.
        // El cambio de idioma no es identificado para las variables que nos son bioticas.
        // TODO: Hacer reemplazo de label por value cuando son abioticas (type != 4)
        self.existsGroup = function (arraySelected) {

            _VERBOSE ? console.log("self.existsGroup") : _VERBOSE;

            var arg_labels = arraySelected.map(function (d) {
                _VERBOSE ? console.log(d) : _VERBOSE;
                return d.label.split(" ")[0];
            });
            // _VERBOSE ? console.log(arg_labels) : _VERBOSE;

            var new_element = true;

            $.each(self.var_sel_array, function (index, item_sel) {

                if (item_sel.value.length == arg_labels.length) {

                    var value_labels = item_sel.value.map(function (val) {
                        return val.label.split(" >> ")[1];
                    });
                    // _VERBOSE ? console.log(value_labels) : _VERBOSE;

                    if (self.isSubset(arg_labels, value_labels)) {

                        new_element = false;
                        return false;

                    }

                }

            });

            return new_element;

        }



        self.addUIItem = function (groupDatasetTotal) {

            _VERBOSE ? console.log("self.addUIItem") : _VERBOSE;
            _VERBOSE ? console.log(self.id) : _VERBOSE;
            console.log(groupDatasetTotal);

            self.groupDatasetTotal = groupDatasetTotal;

            // these lines are because when one new elements is added, the previuos elements were duplicated. So the collection is clean and reloaded again
            $("#treeAddedPanel_" + self.id).empty();
            $.each(self.groupDatasetTotal, function (i, item) {
                item.close = true;
                item.elements = item.value;
            });


            _VERBOSE ? console.log(self.groupDatasetTotal) : _VERBOSE;



            var div_item = d3.select("#treeAddedPanel_" + self.id).selectAll("div")
                    .data(self.groupDatasetTotal)
                    .enter()
                    .append("div")
                    .attr("class", "row_var_item")
                    .attr("items", function (d) {
                        // _VERBOSE ? console.log(d) : _VERBOSE
                        return d.elements;

                    })
                    .text(function (d) {
                        return d.title
                    })
                    .on('click', function (d) {

                        if (d.close) {

                            d.close = false;
                            d3.select(this).selectAll("div")
                                    .data(d.elements)
                                    .enter()
                                    .append("div")
                                    .attr("class", "cell_item")
                                    .text(function (t) {
                                        return t.label;
                                    })
                                    .style("text-align", "left");


                        } else {

                            d.close = true;
                            d3.selectAll(this).remove();
                            $(this).text(d.title);
                            $(this).css("text-align", "left");

                            d3.select(this).append("button")
                                    .attr("width", "10px")
                                    .attr("height", "10px")
                                    .attr("class", "btn btn-danger glyphicon glyphicon-remove pull-right btn_item_var")
                                    .on("click", function () {
                                        // _VERBOSE ? console.log("remove item") : _VERBOSE;
                                        d3.select(this.parentNode).remove();
                                        var gpo_deleted;
                                        a

                                        $.each(self.groupDatasetTotal, function (index, obj) {
                                            if (obj.groupid == d.groupid) {
                                                // _VERBOSE ? console.log(d) : _VERBOSE;
                                                gpo_deleted = self.groupDatasetTotal.splice(index, 1);
                                                return false;
                                            }
                                        })
                                        _VERBOSE ? console.log(gpo_deleted) : _VERBOSE;

                                        self.updateVarSelArray(gpo_deleted, _BORRADO);
                                        

                                    });

                        }
                    })
                    .append("button")
                    .attr("width", "10px")
                    .attr("height", "10px")
                    .attr("class", "btn btn-danger glyphicon glyphicon-remove pull-right btn_item_var")
                    .on("click", function (d) {
                        // _VERBOSE ? console.log("remove item") : _VERBOSE;
                        d3.select(this.parentNode).remove();
                        var gpo_deleted;

                        $.each(self.groupDatasetTotal, function (index, obj) {
                            if (obj.groupid == d.groupid) {
                                // _VERBOSE ? console.log(d) : _VERBOSE;
                                gpo_deleted = self.groupDatasetTotal.splice(index, 1);
                                return false;
                            }
                        })
                        _VERBOSE ? console.log(gpo_deleted) : _VERBOSE;

                        self.updateVarSelArray(gpo_deleted, _BORRADO);

                    });

        }
        inegi = [];
        worldclim = [];
        snib = [];
        target_species = []
        //Evento que guarda la selección de (co)variables para el elemento covariable_filter
        self.formQuery = function (idTree, arraySelected2){
            _VERBOSE ? console.log("self.formQuery") : _VERBOSE;
            console.log(idTree)
            console.log(arraySelected2)
                      
            switch (idTree) {
                case 'jstree_variables_socio_fuente':
                    inegi=[...arraySelected2]
                    console.log("se agregó información de inegi2020")
                    console.log(inegi)
                    break;
                case 'jstree_variables_bioclim_fuente':
                    worldclim=[...arraySelected2]
                    console.log("se agregó información de worldclim")
                    console.log(worldclim)   
                    break;
                case "jstree_variables_species_fuente" :
                    snib=[...arraySelected2]
                    console.log("se agrego información a snib")
                    console.log(snib)
                    break;
                case "jstree_variables_species_target":
                    target_species=[...arraySelected2]
                    console.log("se agrego información a target")
                    console.log(target_species)
                    break;
                default:
                    console.log("nada que hacer");
                    break;
            }
            
                          
        }

        // Evento que es generado cuando se desea agregar un grupo seleccionado previamente, realiza la adición del grupo seleccionado al conjunto de variables con las cuales se realizan los cálculos de épsilon y score en ambos sistemas
        self.addOtherGroup = function (idTree, arraySelected,  gpoName, idDivContainer, typeVar) {

            _VERBOSE ? console.log("self.addOtherGroup") : _VERBOSE;

           console.log("***** addOtherGroup variables *****")
           console.log(idTree)
           console.log(arraySelected)
            const iterator = arraySelected.values();

            for (const value of iterator) {
                var variable = value
                console.log(variable)
                _PARENT_FIELD = variable["level"]
                _LABEL_VALUE = variable["label"]
                console.log(_PARENT_FIELD)
                console.log(_LABEL_VALUE)

            }


            if (arraySelected.length === 0)
                return;

            // var nivel_reino = self.isKingdomLevel(arraySelected);
            // if (nivel_reino) {
            //     _toastr.warning(_iTrans.prop('lb_nivel_reino'));
            //     return;
            // }

            var new_element = self.existsGroup(arraySelected);
            // _VERBOSE ? console.log(new_element) : _VERBOSE;

            if (!new_element) {
                // _VERBOSE ? console.log(self.var_sel_array) : _VERBOSE;
                _toastr.warning(_iTrans.prop('lb_existente'));
                return;
            }

            var maxGroup = 0;

            if (self.groupDatasetTotal.length > 0)
                maxGroup = d3.max(self.groupDatasetTotal.map(function (d) {
                    return d.groupid;
                }));

            var subgroup = [];
            species_target_array =[]
            


            _VERBOSE ? console.log(arraySelected) : _VERBOSE;
            

            for (i = 0; i < arraySelected.length; i++) {

                // se elimita el spp del label cuando es tipo BIO
                if (typeVar == _TYPE_BIO) {
                    var label_taxon = arraySelected[i].numlevel == 8 ? arraySelected[i].label : arraySelected[i].label.split(" ")[0]
                    subgroup.push({label: arraySelected[i].level + " >> " + label_taxon, level: arraySelected[i].numlevel, type: arraySelected[i].type});
                    
                    species_target_array.push({ taxon:arraySelected[i].level, value:label_taxon  })
                } else {
                    
                    subgroup.push({value: arraySelected[i].id, label: arraySelected[i].parent + " >> " + arraySelected[i].label, level: arraySelected[i].level, type: arraySelected[i].type});
                    //species_target_array.push({ taxon:arraySelected[i].level, value:label_taxon  })
                }

            }

            var groupid = parseInt(maxGroup) + 1;
            console.log("maxGroup: " + maxGroup);
            console.log("groupid: " + groupid);

            var temp_grupo = {title: "Gpo " + gpoName + " " + groupid, elements: subgroup, groupid: groupid, close: true, type: typeVar};
            self.groupDatasetTotal.push(temp_grupo);


            // these lines are because when one new elements is added, the previuos elements were duplicated. So the collection is clean and reloaded again
            $("#" + idDivContainer).empty();
            $.each(self.groupDatasetTotal, function (i, item) {
                item.close = true;
            });

            // _VERBOSE ? console.log(self.groupDatasetTotal) : _VERBOSE;

            var div_item = d3.select("#" + idDivContainer).selectAll("div")
                    .data(self.groupDatasetTotal)
                    .enter()
                    .append("div")
                    .attr("class", "row_var_item")
                    .attr("items", function (d) {
                        // _VERBOSE ? console.log(d) : _VERBOSE
                        return d.elements;
                    })
                    .text(function (d) {
                        return d.title
                    })
                    .on('click', function (d) {

                        if (d.close) {

                            d.close = false;
                            d3.select(this).selectAll("div")
                                    .data(d.elements)
                                    .enter()
                                    .append("div")
                                    .attr("class", "cell_item")
                                    .text(function (t) {
                                        return t.label;
                                    })
                                    .style("text-align", "left");


                        } else {

                            d.close = true;
                            d3.selectAll(this).remove();
                            $(this).text(d.title);
                            $(this).css("text-align", "left");

                            d3.select(this).append("button")
                                    .attr("width", "10px")
                                    .attr("height", "10px")
                                    .attr("class", "btn btn-danger glyphicon glyphicon-remove pull-right btn_item_var")
                                    .on("click", function () {
                                        // _VERBOSE ? console.log("remove item") : _VERBOSE;
                                        d3.select(this.parentNode).remove();
                                        var gpo_deleted;

                                        $.each(self.groupDatasetTotal, function (index, obj) {
                                            if (obj.groupid == d.groupid) {
                                                // _VERBOSE ? console.log(d) : _VERBOSE;
                                                gpo_deleted = self.groupDatasetTotal.splice(index, 1);
                                                return false;
                                            }
                                        })
                                        _VERBOSE ? console.log(gpo_deleted) : _VERBOSE;

                                        self.updateVarSelArray(gpo_deleted, _BORRADO);

                                    });

                        }
                    })
                    .append("button")
                    .attr("width", "10px")
                    .attr("height", "10px")
                    .attr("class", "btn btn-danger glyphicon glyphicon-remove pull-right btn_item_var")
                    .on("click", function (d) {
                        // _VERBOSE ? console.log("remove item") : _VERBOSE;
                        d3.select(this.parentNode).remove();
                        var gpo_deleted;
                        

                        $.each(self.groupDatasetTotal, function (index, obj) {
                            if (obj.groupid == d.groupid) {
                                // _VERBOSE ? console.log(d) : _VERBOSE;
                                gpo_deleted = self.groupDatasetTotal.splice(index, 1);
                                return false;
                            }
                        })
                        _VERBOSE ? console.log(gpo_deleted) : _VERBOSE;

                        self.updateVarSelArray(gpo_deleted, _BORRADO);

                    });


            // if (typeVar == _TYPE_TERRESTRE || typeVar == _TYPE_ABIO) {
            //     $('#' + idTree + _id).jstree(true).deselect_all();
            // } else {
            //     $('#' + idTree + _id).jstree("destroy").empty();
            // }

            // se envia solo el elemento agregado
            self.updateVarSelArray(temp_grupo, _AGREGADO);

        }

        // Verifica que un grupo previamente seleccionado no sea subgrupo de otro grupo por añadir y viceversa.
        self.isSubset = function (set1, set2) {
            return set1.every(function (val) {
                return set2.indexOf(val) >= 0;
            });
        }

        // Realiza la actualización del grupo final con el cual se realizan los cálculos de épsilon y score.
        self.updateVarSelArray = function (item, operacion) {
            // item - llega en forma de array, por tanto para obtener su valor se accede al primer valor   
            console.log("updateVarSelArray")         
            console.log(self.var_sel_array)
            
            if (operacion == _BORRADO) {

                _VERBOSE ? console.log("elemento borrado") : _VERBOSE;
                

                $.each(self.var_sel_array, function (index, gpo_var) {

                    if (item[0].groupid == gpo_var.groupid && item[0].type == gpo_var.type) {
                        _VERBOSE ? console.log("borrado") : _VERBOSE;
                        self.var_sel_array.splice(index, 1);
                        return false;
                    }

                });

            } else if (operacion == _AGREGADO) {

                _VERBOSE ? console.log("elemento añadido") : _VERBOSE;
                self.var_sel_array.push({"value": item.elements, "type": item.type, "groupid": item.groupid, "title": item.title});                


            }


            _VERBOSE ? console.log(self.var_sel_array) : _VERBOSE;
            
            //species_target_array guarda los datos target para el body

        }

        // Elimina las variables previamente agregadas al grupo final con el cual se realizan los cálculos de épsilon y score.
        self.cleanVariables = function (idTree, idDivContainer, typeVar) {


            _VERBOSE ? console.log("self.cleanVariables") : _VERBOSE;
            

            $('#' + idDivContainer).empty();
            
            //agregar caso socioeconomico

            if (typeVar == _TYPE_TERRESTRE || typeVar == _TYPE_ABIO) {                              
                $('#treeVariableBioclim_fuente').jstree("deselect_all")
            } else {
                $('#' + idTree + _id).jstree("destroy").empty();
                $('#disease_selected').val("dis_default")
            }

            self.var_sel_array = [];
            self.groupDatasetTotal = [];

            switch (idTree) {
                case 'jstree_variables_socio_fuente':
                    inegi=[]
                    console.log("se eliminó información inegi2020")
                    break;
                case 'jstree_variables_bioclim_fuente':
                    worldclim=[]
                    console.log("se eliminó información de worldclim") 
                    break; 
                case "jstree_variables_species_fuente" :                    
                    snib=[]
                    console.log("se eliminó información taxonomica fuente")
                    break;  
                case "jstree_variables_species_target":
                    target_species=[]
                    console.log("se eliminó información taxonomica target")
                    break;        
                default:
                    console.log(`nada que hacer`);
                    break;
            }

            

            // for(i = 0; i < self.var_sel_array.length; i++){
            //     if (self.var_sel_array[i].type == typeVar){
            //       	self.var_sel_array.splice(i, 1);
            //       	i = i-1;
            //     }
            // }

        }

        //  Retorna el grupo final con el cual se realizan los cálculos de épsilon y score.
        self.getVarSelArray = function () {

            _VERBOSE ? console.log("self.getVarSelArray") : _VERBOSE;
            

            return self.var_sel_array;
        }

        //  Asigna el grupo final con el cual se realizan los cálculos de épsilon y score.
        self.setVarSelArray = function (var_sel_array) {

            _VERBOSE ? console.log("self.setVarSelArray") : _VERBOSE;
            
            self.var_sel_array = var_sel_array;
        }

        self.getGroupDatasetTotal = function(){

            _VERBOSE ? console.log("self.getGroupDatasetTotal") : _VERBOSE;
            
            return self.groupDatasetTotal;

        }

        self.getTimeBioclim = function () {

            _VERBOSE ? console.log("self.getTimeBioclim") : _VERBOSE;
            console.log(self.type_time)
            return self.type_time;
            
        }
        self.getBodyElements = function(){
            //se cargan los elementos necesarios para formar el body
            covobj= {"inegi2020": inegi, "snib": snib, "worldclim":worldclim}
            return snib, covobj, inegi, worldclim, target_species
        }

    }
    

    function loadAvailableLayers() {

        _VERBOSE ? console.log("loadAvailableLayers") : _VERBOSE;

        $.ajax({
            url: _url_zacatuche + "/niche/especie/getAvailableVariables",
            dataType: "json",
            type: "post",
            data: {},
            success: function (resp) {

                if (resp.ok === true) {

                    console.log(data);
                    var data = resp.data;
                    _available_variables = data;

                } else {

                }

            }

        });


    } 

    


    /**
     * Éste método llama a la creación del selector de variables.
     *
     * @function createSelectorComponent
     * @public
     * @memberof! table_module
     *
     * @param {String} parent - Id del contenedor del selector de variables
     * @param {String} id - Id del selector de variables
     * @param {String} title - Título del selector de variables desplegado en la parte superior
     */
    function createSelectorComponent(parent, id, title, abio_tab = true, reduced_height = false, btn_visualize = false, start_level = 0) {

        _VERBOSE ? console.log("createSelectorComponent") : _VERBOSE;

        var variable_selector = new VariableSelector(parent, id, title, abio_tab, reduced_height, btn_visualize, start_level);

        _selectors_created.push(variable_selector);
        return variable_selector;

//        loadAvailableLayers(parent, id, title);

    }


    /**
     * Éste método incializa el módulo de internacionalización que esta relacionado con el selector de variables.
     *
     * @function _initializeVarComponents
     * @private
     * @memberof! table_module
     *
     * @param {object} language_module - Módulo de internacionalización
     * @param {integer} tipo_modulo - Tipo de módulo donde serán asignados los selectores de variables, nicho o comunidad ecológica
     */
    function _initializeVarComponents(language_module, tipo_modulo, map_module) {

        _VERBOSE ? console.log("_initializeVarComponents variables") : _VERBOSE;

        _selectors_created = [];

        _toastr.options = {
            "debug": false,
            "onclick": null,
            "fadeIn": 300,
            "fadeOut": 1000,
            "timeOut": 2000,
            "extendedTimeOut": 2000,
            "positionClass": "toast-center-center",
            "preventDuplicates": true,
            "progressBar": true
        };

        _language_module = language_module;
        _map_module = map_module;
        _iTrans = _language_module.getI18();
        _tipo_modulo = tipo_modulo;

        //loadAvailableLayers();

    }
    



    /**
     * Éste método realiza el llamado a la función que inicializa las variables necesarias para la creación del selector de variables.
     *
     * @function startVar
     * @public
     * @memberof! table_module
     *
     * @param {String} id - Id del selector de variables
     * @param {object} language_module - Módulo de internacionalización
     * @param {integer} tipo_modulo - Tipo de módulo donde serán asignados los selectores de variables, nicho o comunidad ecológica
     */
    function startVar(id, language_module, tipo_modulo, map_module) {
        _VERBOSE ? console.log("startVar") : _VERBOSE;

        _id = "" + id;
        if (id === 0)
            _id = "";
        _VERBOSE ? console.log("_id: " + _id) : _VERBOSE;

        _initializeVarComponents(language_module, tipo_modulo, map_module);
    }
    return{
        startVar: startVar,
        getVarSelArray: getVarSelArray,
        createSelectorComponent: createSelectorComponent,
        getSelectorVaribles: getSelectorVaribles

    }

});
