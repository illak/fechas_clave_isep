---
theme: [dashboard, light]
title: Cursado por período
toc: false
---

<div style="text-align: center;">
  <img src="./encabezado-fechas-clave.png" alt="Banner Alt Text" style="width: 100%; height: auto; border-radius: 10px;">
</div>

<div class="hero">
  <h1>Cursado por período</h1>
  Conocé qué unidades curriculares o propuestas de acreditación única se cursan por períodos utilizando los filtros temporales. 
</div>

<!-- Load and transform the data -->

```js
//const data1 = FileAttachment("data/data.tsv").tsv({typed: true});

async function getTsv(url) {
  let names =[];
  const spreadsheet = await d3.tsv(url).then(data => data.forEach(d => names.push(d))); // d3.tsv returns a Promise
  return names;
}

const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRyV5lbkXamFX_ORebRftxAEBQ0Hf2ugn9Em9i2YA4iirsUD006yQaAEdpJOC02haDAG0iNyD_U-Wkp/pub?gid=1045081279&single=true&output=tsv"

const data = await getTsv(url);
```

```js
function formatDate(dateString) {
    let date = new Date(dateString);
    if (isNaN(date)) return dateString; // Si no es una fecha válida, devolver el original

    let day = String(date.getUTCDate()).padStart(2, '0');
    let month = String(date.getUTCMonth() + 1).padStart(2, '0');
    let year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
}


// Fecha actual
const hoy = new Date();                 
// Normalizar la fecha actual al formato "YYYY-MM-DD" (ignorando horas)
const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

const status_l = ["Pendiente", "Cursando", "Finalizado"];
const criterios_uc1 = ["Carrera - Acred. única", "Carrera - Acred. múltiple estructurado flexible"];
const criterios_uc2 = ["Unidad curricular", "Carrera - Acred. múltiple estructurado flexible"];

const dataConAnios = data.filter(d => {

  const acred_unica = (d["Criterio de carga"] === "Carrera - Acred. única" && d["Inicio de la propuesta"] !== "");
  //const uc = (d["Criterio de carga"] === "Unidad curricular" && d["Inicio de cursado"] !== "");
  const uc = (criterios_uc2.includes(d["Criterio de carga"]) && d["Inicio de cursado"] !== "");

  return acred_unica || uc;

}).map(d => {
  // Convertir la fecha de "Inicio de cursado" a un objeto Date

  const inicio_col = d["Criterio de carga"] === "Carrera - Acred. única" ?  "Inicio de la propuesta" : "Inicio de cursado";
  const fin_col = d["Criterio de carga"] === "Carrera - Acred. única" ?  "Fin de la propuesta" : "Cierre de cursado";

  const fecha = d[inicio_col]
    ? new Date(d[inicio_col].split("/").reverse().join("-"))
    : null;

  const fecha_f = d[fin_col]
    ? new Date(d[fin_col].split("/").reverse().join("-"))
    : null;

  const options = { month: "long" };

  const status = (() => {
    if (hoySinHora <= fecha_f && hoySinHora >= fecha) {
      return "Cursando";
    } else if (hoySinHora < fecha) {
      return "Pendiente";
    } else if (hoySinHora > fecha_f) {
      return "Finalizado";
    }
  })();

  const tipo_ed = (() => {
    if(d["Momento en el que se ofrece"] === "Cursado" && d["¿Se ofrece para recursadas?"]==="TRUE"){
      return "Cursado con instancias de recursado";
    }
    return d["Momento en el que se ofrece"];
  })();

   const ifdas = {
    "Simón Bolívar": parseInt(d["Simón Bolívar"]),
    "Carbó": parseInt(d["Carbó"]),
    "Leguizamón": parseInt(d["Leguizamón"]),
    "Agulla": parseInt(d["Agulla"]),
    "ISEP": parseInt(d["ISEP"]),
    "ISPT": parseInt(d["ISPT"]),
    "Trettel": parseInt(d["Trettel"]),
    "Zípoli": parseInt(d["Zípoli"]),
    "Carena": parseInt(d["Carena"]),
    "Urquiza": parseInt(d["Urquiza"]),
    "Iescer": parseInt(d["Iescer"]),
    "Houssay": parseInt(d["Houssay"]),
    "San Martín": parseInt(d["San Martín"]),
    "Lefebvre": parseInt(d["Lefebvre"]),
    "Castro": parseInt(d["Castro"]),
    "Menéndez Pidal": parseInt(d["Menéndez Pidal"])
  }
  
  // Retornar una nueva fila con una columna adicional "año"
  return {
    ...d, // Mantener las columnas existentes
    anio: fecha ? fecha.getFullYear() : null, // Agregar el año como una nueva clave
    mes: new Intl.DateTimeFormat("es-Es", options).format(fecha),
    mes_idx: fecha.getMonth(),
    semestre: fecha.getMonth() < 6? "Primer semestre" : "Segundo semestre",
    estado: status,
    tipo_ed: tipo_ed,
    fecha_inicio: new Date(d[inicio_col].split("/").reverse().join("-")),
    fecha_fin: new Date(d[fin_col].split("/").reverse().join("-")),
    //inicio: formatDate(fecha),
    //fin: formatDate(fecha_f),
    inicio: fecha,
    fin: fecha_f,
    //label: d["Criterio de carga"] === "Carrera - Acred. única" ? d["Propuesta"] : d["Nombre del módulo"]
    label: criterios_uc1.includes(d["Criterio de carga"]) ? d["Propuesta"] : d["Nombre del módulo"],
    ifdas: ifdas
  };
});

```


```js

const propuestas_a =Array.from(
  new Set(dataConAnios.map(d => d["Propuesta"]).filter(Boolean))).sort();

const anios_a = Array.from(
  new Set(dataConAnios.map(d => {
    // Convertir "Inicio de la propuesta" a tipo Date
    const fecha = d["Inicio de cursado"]
      ? new Date(d["Inicio de cursado"].split("/").reverse().join("-"))
      : null;
    // Extraer el año si la fecha es válida
    return fecha ? fecha.getFullYear() : null;
  }).filter(Boolean))).sort();

const meses = dataConAnios.map(d => ({mes: d["mes"], idx: d["mes_idx"]})).sort((a, b) => a.idx - b.idx).map(d => d["mes"]);
const mes_a = Array.from(new Set(meses)).filter(Boolean);

const semestres = dataConAnios.map(d => d["semestre"]);
const semestre_a = Array.from(new Set(semestres)).filter(Boolean);

```

```js
const hoy = new Date();
const primerDiaAnio = new Date(hoy.getFullYear(), 0, 1); // Enero es el mes 0
const ultimoDiaAnio = new Date(hoy.getFullYear(), 11, 31); // Diciembre es el mes 11

const start = view(Inputs.date({label: "Desde", value: primerDiaAnio}));
const end = view(Inputs.date({label: "Hasta",  value: ultimoDiaAnio}));

```


<div class="grid grid-cols-2" style="margin-top: -25px">
  <div>

  ```js
  let propuestas_b = Array.from(
    new Set(dataConAnios.map(d => d["Propuesta"]).filter(Boolean))).sort();

  let propuesta = view(Inputs.select([null].concat(propuestas_b), {label: "Propuesta", width:600}));
  ```

  </div>
  <div>

  ```js
  let filtered = propuesta ? dataConAnios.filter(d => {
      if(d["Propuesta"] === propuesta){
        return true
      }
        return false }).map(d => d["Cohorte"]) : dataConAnios.map(d => d["Cohorte"]);


  let cohortes_a = Array.from(new Set(filtered)).filter(Boolean);
  let cohorte = view(Inputs.select([null].concat(cohortes_a), {label: "Cohorte"}));
  ```

  </div>
</div>

<div  style="margin-top: -25px">

```js
const inicios_en_periodo = view(Inputs.toggle({label: "Sólo inicios de cursada en el periodo"}));
```
</div>



```js
function wrapText(x, w) {
  return htl.html`<div style="
      text-align: center;
      color: black;
      word-wrap: break-word;
      overflow-wrap: break-word;
      white-space: normal;
      padding: 4px;
      width: ${w}px;">${x.toLocaleString("en-US")}</div>`
}

function wrapTextLink(x, w, href) {
  return htl.html`<a href=${href}
      target=_blank
      style=" display: block;
      text-align: center;
      word-wrap: break-word;
      overflow-wrap: break-word;
      white-space: normal;
      padding: 1px;
      width: ${w}px;">${x.toLocaleString("en-US")}</a>`
}
```

```js

  const dataFiltered = dataConAnios.filter(d => {



    if(inicios_en_periodo){
      const filtrarPorPropuesta = propuesta ? d["Propuesta"] === propuesta : true;
      const filtrarPorCohorte = cohorte ? d["Cohorte"] === cohorte : true;
      const filtroPeriodo = d["inicio"] >= start && d["inicio"] <= end && d["fecha_fin"] >= start;
      return filtroPeriodo && filtrarPorPropuesta && filtrarPorCohorte;
    }
    
    const filtroPeriodo = d["fecha_fin"] >= start && d["fecha_inicio"] <= end;

    // Retornar solo las filas que cumplen con los filtros activos
    //return filtrarPorAnio && filtrarPorMes && filtrarPorSemestre && filtrarPorPropuesta && filtrarPorEstado;

    const filtrarPorPropuesta = propuesta ? d["Propuesta"] === propuesta : true;
    const filtrarPorCohorte = cohorte ? d["Cohorte"] === cohorte : true;

    return filtroPeriodo && filtrarPorPropuesta && filtrarPorCohorte;
  
  })
```

```js
  function toggleCard() {
      const card = document.getElementById('infoCard');
      card.classList.toggle('hidden');

      const divTabla = document.getElementById('tabla');

      if (divTabla.classList.contains('grid-colspan-3')) {
        divTabla.classList.remove('grid-colspan-3');
        divTabla.classList.add('grid-colspan-4');
      } else {
        divTabla.classList.remove('grid-colspan-4');
        divTabla.classList.add('grid-colspan-3');
      }
  }

  const ocultar_panel_izq = view(Inputs.button("Ocultar/visualizar panel derecho", {value: null, reduce: () => toggleCard()}))

```



<div class="grid grid-cols-4" >
  <div class="card grid-colspan-3" id="tabla">

```js
  const ifdas = null;

  const selects = view(Inputs.table(dataFiltered, {
      columns: [
        "id",
        "Criterio de carga",
        "Propuesta",
        "Apertura de aula",
        "inicio",
        "Cierre de actividades",
        "fin",
        "tipo_ed",
        "Cantidad de encuentros sincrónicos",	
        "Asistencia mínima obligatoria",
        "A cargo del registro de asistencia",
        "Tipo de agrupamiento",
        "Detalle del agrupamiento personalizado"
      ],
      header: {
        "id": "Cursado de",
        "Criterio de carga": "Tipología",
        "Propuesta": "Propuesta formativa",
        "inicio": "Inicio de cursado",
        "fin": "Cierre de cursado",
        "tipo_ed": "Tipo de edición",
        "Cantidad de encuentros sincrónicos": "# encuentros"
      },
      format: {
        "Propuesta": (d) => wrapText(d, 220),
        "Criterio de carga" : (d) => wrapText(d, 150),
        "tipo_ed": (d) => wrapText(d, 150),
        //"id": (d) => wrapText(d,220),
        id: id => {
        const uc = dataConAnios.filter(d => d.id===id)[0]["label"];
          const criterio = dataConAnios.filter(d => d.id===id)[0]["Criterio de carga"];
          //display(propuesta)
          //return htl.html`<a href=http://127.0.0.1:3000/propuesta-info?id=${id} target=_blank>${propuesta}</a>`
          //return htl.html`<a href=https://illak-zapata-ws.observablehq.cloud/fechas-clave/cursada-info?id=${id} target=_blank>${uc}</a>`
          const pre_link = criterio === "Carrera - Acred. única" ? "https://illak-zapata-ws.observablehq.cloud/fechas-clave/propuesta-info?id=" : "https://illak-zapata-ws.observablehq.cloud/fechas-clave/cursada-info?id=";

          return wrapTextLink(uc, 250, pre_link + id)
        },
        inicio: inicio => inicio.toLocaleDateString("es-AR", { timeZone: "UTC" }),
        fin: fin => fin.toLocaleDateString("es-AR", { timeZone: "UTC" }),
        "Detalle del agrupamiento personalizado": (link) => link ? wrapTextLink("🔗Documento", 250, link) : ""
      },
      layout: "auto",
      rows: 30,
      height: 650,
      width: "auto",  
  }))
```

  </div>
  <div class="collapsible-card" id="infoCard">
      <div class="grid grid-cols-4">
        <div class="card">${getTotalesCapítal(selects_l)}</div>
        <div class="card">${getTotalesInterior(selects_l)}</div>
        <div class="card">${getTotalesANA(selects_l)}</div>
        <div class="card">${getTotales(selects_l)}</div>
      </div>
      <h2>
      Cantidades de aulas por IFDA
      </h2>
      <div class="rectangulo">
        Capital
      </div>
      <div class="grid grid-cols-4 contenedor-tarjetas">
        ${getIFDAPanel("Simón Bolívar", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Carbó", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Leguizamón", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Agulla", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("ISEP", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("ISPT", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Trettel", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Zípoli", selects_l, ifdas, num_selected)}
      </div>
      <div class="rectangulo">
        Interior
      </div>
      <div class="grid grid-cols-4 contenedor-tarjetas">
        ${getIFDAPanel("Carena", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Urquiza", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Houssay", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("San Martín", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Iescer", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Lefebvre", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Castro", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Menéndez Pidal", selects_l, ifdas, num_selected)}
      </div>
    </div>
  </div>
</div>


```js
const ids = selects.map(d => d.id);
const selects_l = dataFiltered.filter(d => ids.includes(d.id));
const num_selected = ids.length;
```



```js
// FUNCIONES AUXILIARES
function getTotalesCapítal(ifds){
  let ifds_capital = [
      "Simón Bolívar",
      "Carbó",
      "Leguizamón",
      "Agulla",
      "ISEP",
      "ISPT",
      "Trettel",
      "Zípoli"
    ];

  let sumaTotal = 0;

  ifds.forEach(d => {
    ifds_capital.forEach(col => {
      // Verificar si el valor es numérico antes de sumar
      if (typeof d["ifdas"][col] === 'number' && !isNaN(d["ifdas"][col])) {
        sumaTotal += d["ifdas"][col];
      }
    });
  });


  return htl.html`<h1>${sumaTotal}</h1><h2>Capital</h2>`
}

function getTotalesInterior(ifds){
  let ifds_interior = [
      "Carena",
      "Urquiza",
      "Iescer",
      "Houssay",
      "San Martín",
      "Lefebvre",
      "Castro",
      "Menéndez Pidal"
    ];

  let sumaTotal = 0;

  ifds.forEach(d => {
    ifds_interior.forEach(col => {
      // Verificar si el valor es numérico antes de sumar
      if (typeof d["ifdas"][col] === 'number' && !isNaN(d["ifdas"][col])) {
        sumaTotal += d["ifdas"][col];
      }
    });
  });


  return htl.html`<h1>${sumaTotal}</h1><h2>Interior</h2>`
}


function getTotalesANA(ifds){
    return htl.html`<h1>${d3.sum(ifds, (d) => +d["TOTAL DE AULAS NO ASOCIADAS"])}</h1><h2>Total de aulas N/A</h2>`
}


function getTotales(ifds){
  return htl.html`<h1 style="font-size: 2.2em;">${d3.sum(ifds, (d) => +d["TOTAL DE AULAS"] + +d["TOTAL DE AULAS NO ASOCIADAS"])}</h1><h2>Total de aulas</h2>`
}

function getIFDAPanel(ifda, ifda_sel, ifdas,  num_selected){
  if(ifdas===ifda || d3.sum(ifda_sel, (d) => d[ifda]) > 0){
    return htl.html`<div class="card" style="background-color:#EDE4C5;">
          <h4>${ifda}</h4>  ${d3.sum(ifda_sel, (d) => d[ifda])}
        </div>`
  }
  return htl.html`<div class="card">
          <h2>${ifda}</h2>  ${d3.sum(ifda_sel, (d) => d[ifda])}
        </div>`
}
```



```js
const settings = {
      plotHeight: 1200,
      plotWidth: 900,
      barHeight: 12,
      textPosition: 0,
      fontSize: 11,
      barRoundness: 3,
      gridlines: "x",
      panelBorder: "hide"
    }

// Para que las fechas se muestren en español
const localeES = {
  dateTime: "%A, %e de %B de %Y, %X",
  date: "%d/%m/%Y",
  time: "%H:%M:%S",
  periods: ["AM", "PM"],
  days: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
  shortDays: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
  months: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  shortMonths: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
};

d3.timeFormatDefaultLocale(localeES);

```

```js
const parser = d3.timeParse("%d/%m/%Y");

const uc_gantt_data = dataFiltered.map(d => {

  //const prop = d["Criterio de carga"] ===  "Carrera - Acred. única" ? d["Propuesta"] : d["Nombre del módulo"];
  const prop = criterios_uc1.includes(d["Criterio de carga"]) ? d["Propuesta"] : d["Nombre del módulo"];
  const propuesta = d["Propuesta"];
  const cohorte = d["Cohorte"];
  const tipo = d["Criterio de carga"];
  //const startDate = parser(d["inicio"]);//parser(d["Inicio de cursado"]);//.split("/"));//.reverse().join("-"));
  //const endDate = parser(d["fin"]);//parser(d["Cierre de cursado"]);//.split("/"));//.reverse().join("-"));
  const startDate = d["inicio"];
  const endDate = d["fin"];
  const id = d["id"];
  const anio = d["anio"];
  const mes = d["mes"];

  return (
    {
      prop: prop,
      tipo: tipo,
      startDate: startDate,
      endDate: endDate,
      propuesta: propuesta,
      cohorte: cohorte,
      id: id,
      anio: anio,
      mes: mes
    }
  );
})


const domainByGroup = d3.groups(uc_gantt_data, d => d.tipo).sort((a, b) => d3.ascending(a.startDate, b.startDate)).map(d => d[0]);
const domainByDate = uc_gantt_data.sort((a, b) => d3.ascending(a.startDate, b.startDate)).map(d => d.id);

const myColors = [
            {tipo: "Carrera - Acred. única", color: "gold"},
            {tipo: "Carrera - Acred. múltiple", color: "#56B4e9"}
            ]

const colorMap = new Map(myColors.map((obj) => [obj.tipo, obj.color]));
const colors = domainByGroup.map(d => colorMap.get(d));

```


```js

function parseDate(date){
  return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
}

function drawGantt(data, {width} = {}) {
  return Plot.plot({
    marks: [
      Plot.frame({ stroke: settings.panelBorder == "show" ? "#ccc" : null }),
      Plot.barX(data, {
        y: "id",
        x1: (d) => d.startDate,
        x2: (d) => d.endDate,
        fill: "tipo",
        rx: settings.barRoundness,
        //insetTop: settings.barHeight,
        //insetBottom: settings.barHeight
      }),
      Plot.text(data, {
        y: "id",
        x: (d) => d.startDate,
        text: (d) => d.prop,
        textAnchor: "start",
        dy: settings.textPosition,
        fontSize: settings.fontSize,
        stroke: "white",
        fill: "dimgray",
        fontWeight: 500
      }),
      Plot.tip(data, Plot.pointerY({
        y: "id",
        x1: (d) => d.startDate,
        x2: (d) => d.endDate,
        title: (d) => {
          
          const inicio = parseDate(d.startDate);
          const fin = parseDate(d.endDate);
          return `Propuesta: ${d.propuesta}\n\nInicio: ${inicio}\nFin: ${fin}`
        },
        fontSize: 13,
        lineWidth: 40
      })),
      // Línea vertical para el día actual
      Plot.ruleX([new Date()], { stroke: "red", strokeWidth: 1.5, strokeDasharray: "4 2" }),
      // Texto con la fecha actual
      /*Plot.text([new Date()], {
        x: (d) => d, // La posición X es la fecha actual
        y: () => data[0]["id"], // Coloca el texto en la parte superior del eje Y
        text: (d) => d.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }),
        textAnchor: "center",
        fontSize: 12,
        fill: "red",
        //dx: 5, // Desplaza el texto ligeramente hacia la derecha
        //dy: -50 // Desplaza el texto hacia arriba
      })*/
    ],
    height: settings.plotHeight,
    width, //settings.plotWidth,
    x: { grid: (settings.gridlines == "x") | (settings.gridlines == "both") ? true : null },
    y: {
      domain: domainByDate,
      label: null,
      tickFormat: null,
      tickSize: null,
      grid: (settings.gridlines == "y") | (settings.gridlines == "both") ? true : null
    },
    color: { domain: domainByGroup, scheme: "Pastel2", legend: true }
  })
};

```


<div class="card">
  ${resize((width) => drawGantt(uc_gantt_data, {width}))}
</div>

<style>

  /* style.css */
  /* Aumentar tamaño de texto en todas las tablas */
  table {
    font-size: 1.1rem; /* Ajusta según necesites */
  }

  /* Específico para celdas de tabla */
  td, th {
    font-size: 1.1rem;
    line-height: 1.4; /* Mejora la legibilidad */
  }

  /* Solo para el contenido de las celdas */
  table td {
    font-size: 1.0rem;
  }

  /* Solo para los encabezados */
  table th {
    font-size: 1.1rem;
    font-weight: 600;
  }



  .hero {
    display: flex;
    flex-direction: column;
    align-items: left;
    font-family: var(--sans-serif);
    margin: 0rem 0 0rem;
    text-align: left;
  }

  .hero h1 {
    font-size: 2rem; /* Ajusta según sea necesario */
    line-height: 1.5;
    font-weight: bold;
    white-space: nowrap; /* Evita que el texto se divida en varias líneas */
    margin: 0;
  }


  .card1 {
  background-color: "#4287f5";
  }

  .card {
    margin: 1px;
  }

  .wrap-header{
      width: 150px; /* Ajusta el ancho según sea necesario */
      word-wrap: break-word; /* Permite que las palabras se partan */
      white-space: normal; /* Permite que el texto use varias líneas */
      text-align: center; /* Opcional, para centrar el texto */
  }

  .rectangulo {
      width: 100%; /* Extiende el rectángulo al ancho completo del contenedor */
      background-color: #333; /* Fondo gris oscuro */
      color: white; /* Texto blanco */
      text-align: center; /* Centra el texto horizontalmente */
      padding: 2px; /* Espaciado interno */
      box-sizing: border-box; /* Incluye el padding en el ancho total */
      font-size: 20px; /* Tamaño del texto */
      margin-bottom: 10px; /* Espaciado entre los rectángulos */
      border-radius: 10px; /* Esquinas redondeadas */
  }

  .contenedor-tarjetas {
      display: grid;
      gap: 5px; /* Reduce el espacio entre las tarjetas */
  }



  .toggle-btn {
    --position: fixed;
    right: 20px;
    top: 250px;
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    z-index: 1000;
    font-size: 14px;
  }

  /* Nueva clase collapsible-card */
  .collapsible-card {
      /*box-shadow: 0 2px 4px rgba(0,0,0,0.1);*/
      transition: all 0.3s ease;
      overflow: hidden;
  }

  .collapsible-card.hidden {
      display: none;
      width: 0;
      padding: 0;
      margin: 0;
      opacity: 0;
  }
</style>

