---
toc: false
---


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

const d = new Date();
let current_year = d.getFullYear();

const dataConAnios = data.filter(d => {

  const acred_unica = d["Criterio de carga"] === "Carrera - Acred. única";
  const acred_multi = d["Criterio de carga"] === "Carrera - Acred. múltiple estructurado";
  const acred_multi_flex = d["Criterio de carga"] === "Carrera - Acred. múltiple estructurado flexible";

  return acred_unica || acred_multi || acred_multi_flex;

}).map(d => {
  // Convertir la fecha de "Inicio de la propuesta" a un objeto Date
  const fecha = d["Inicio de la propuesta"]
    ? new Date(d["Inicio de la propuesta"].split("/").reverse().join("-"))
    : null;

  const fecha_fin = d["Fin de la propuesta"]
    ? new Date(d["Fin de la propuesta"].split("/").reverse().join("-"))
    : null;

  const options = { month: "long" };

  // Retornar una nueva fila con una columna adicional "año"
  return {
    ...d, // Mantener las columnas existentes
    anio_inicio: fecha ? fecha.getFullYear() : null, // Agregar el año como una nueva clave
    anio_fin: fecha_fin ? fecha_fin.getFullYear() : null,
    mes: new Intl.DateTimeFormat("es-Es", options).format(fecha),
    mes_idx: fecha ? fecha.getMonth() : null,
    Date: fecha,
    fecha_fin: fecha_fin,
    finaliza_este_anio: fecha_fin === null ? "fecha fin sin definir!" :  fecha_fin.getFullYear() === current_year,
    inicio_prop: new Date(d["Inicio de la propuesta"].split("/").reverse().join("-")),
    fin_prop: new Date(d["Fin de la propuesta"].split("/").reverse().join("-"))
  };
});



```

<div style="text-align: center;">
  <img src="./encabezado-fechas-clave.png" alt="Banner Alt Text" style="width: 100%; height: auto; border-radius: 10px;">
</div>

<div class="hero">
  <h1>Fechas clave</h1>
  <h2>Próximamente en esta sección inicial irá un mini instructivo o similar!!</h2>
  <a href="https://observablehq.com/framework/getting-started">Get started<span style="display: inline-block; margin-left: 0.25rem;">↗︎</span></a>
</div>



```js

const d = new Date();
const current_year = d.getFullYear();

const propuestasActivas = dataConAnios.filter(d => {
  return d["anio_inicio"] <= current_year && d["anio_fin"] >= current_year;
})

const numPropuestasActivas = d3.count(propuestasActivas, (d) => d["id"]);

let subtitle = "De " + numPropuestasActivas + " propuestas activas en el año:";



const survey = [
  {question: "carreras de acreditación única", yes: d3.count(propuestasActivas.filter(d => d["Criterio de carga"] === "Carrera - Acred. única"), (d) => d["id"])},
  {question: "carreras de acreditación múltiple estructurado", yes: d3.count(propuestasActivas.filter(d => d["Criterio de carga"] === "Carrera - Acred. múltiple estructurado"), (d) => d["id"])},
  {question: "carreras de acreditación múltiple estructurado flexible", yes: d3.count(propuestasActivas.filter(d => d["Criterio de carga"] === "Carrera - Acred. múltiple estructurado flexible"), (d) => d["id"])}
]

  // Define el orden personalizado de las categorías
  const customOrder = [
    "carreras de acreditación única",
    "carreras de acreditación múltiple estructurado", 
    "carreras de acreditación múltiple estructurado flexible"
  ];

function viz1(data, {width} = {}){
  return Plot.plot({
      axis: null,
      label: null,
      width,
      height: 260,
      marginTop: 20,
      marginBottom: 90,
      title: htl.html`Resumen de propuestas <b>activas</b> en el año en curso`,
      subtitle: subtitle,
      // Solo define el orden, sin mostrar etiquetas del eje
      fx: {
        domain: customOrder,
        axis: null // Oculta las etiquetas del eje fx
      },
      marks: [
        Plot.axisFx({lineWidth: 20, anchor: "bottom", dy: 30, 
            fontSize: 16}),
        Plot.waffleY({length: 1}, {y: numPropuestasActivas, fillOpacity: 0.4, rx: "100%"}),
        Plot.waffleY(data, {fx: "question", y: "yes", rx: "100%", fill: "orange"}),
        Plot.text(data, {fx: "question", text: (d) => (d.yes).toLocaleString("es-ES"), frameAnchor: "bottom", lineAnchor: "top", dy: 6, fill: "orange", fontSize: 24, fontWeight: "bold"})
      ]
    })
}

```

<div class="card">
  ${resize((width) => viz1(survey, {width}))}
</div>


```js

function calendar({
  date = Plot.identity,
  inset = 0.5,
  ...options
} = {}) {
  let D;
  return {
    fy: {transform: (data) => (D = Plot.valueof(data, date, Array)).map((d) => d.getUTCFullYear())},
    x: {transform: () => D.map((d) => d3.utcWeek.count(d3.utcYear(d), d))},
    y: {transform: () => D.map((d) => d.getUTCDay())},
    inset,
    ...options
  };
}

function viz2(dji, {width} = {}){

  const datosNormalizados = dji.map(d => ({
    ...d,
    Date: new Date(d.Date.getFullYear(), d.Date.getMonth(), d.Date.getDate())
  }));

  const start = d3.utcDay.offset(d3.min(dji, (d) => d.Date), 0); // exclusive

  const end = d3.utcDay.offset(d3.max(dji, (d) => d.Date),); // exclusive
  const minTotal = d3.min(dji, (d) => d.total);
  const maxTotal = d3.max(dji, (d) => d.total);

  console.log(d3.utcDays(start, end))

  return Plot.plot({
    width: 1152,
    height: d3.utcYear.count(start, end) * 230,
    axis: null,
    padding: 0,
    x: {
      domain: d3.range(53) // or 54, if showing weekends
    },
    y: {
      axis: "left",
      domain: [-1, 1, 2, 3, 4, 5], // hide 0 and 6 (weekends); use -1 for labels
      ticks: [1, 2, 3, 4, 5], // don’t draw a tick for -1
      tickSize: 0,
      tickFormat: (d) => {
          const dias = ["", "lun", "mar", "mié", "jue", "vie"];
          return dias[d] || "";
        }
    },
    fy: {
      padding: 0.1,
      reverse: true
    },
    color: {
      range: ["#27ae60", "#e74c3c"],   // Verde suave → Rojo suave
      domain: [0, maxTotal],
      legend: true,
      label: "Total de registros"
    },
    marks: [
      // Draw year labels, rounding down to draw a year even if the data doesn’t
      // start on January 1. Use y = -1 (i.e., above Sunday) to align the year
      // labels vertically with the month labels, and shift them left to align
      // them horizontally with the weekday labels.
      Plot.text(
        d3.utcYears(d3.utcYear(start), end),
        calendar({text: d3.utcFormat("%Y"), frameAnchor: "right", x: 0, y: -1, dx: -20})
      ),

      // Draw month labels at the start of each month, rounding down to draw a
      // month even if the data doesn’t start on the first of the month. As
      // above, use y = -1 to place the month labels above the cells. (If you
      // want to show weekends, round up to Sunday instead of Monday.)
      Plot.text(
        d3.utcMonths(d3.utcMonth(start), end).map(d3.utcMonday.ceil),
        calendar({
          text: (d) => {
            const meses = ["ene", "feb", "mar", "abr", "may", "jun", 
                          "jul", "ago", "sep", "oct", "nov", "dic"];
            return meses[d.getUTCMonth()];
          }, 
          frameAnchor: "left", 
          y: -1
        })
      ),

      // Draw a cell for each day in our dataset. The color of the cell encodes
      // the relative daily change. (The first value is not defined because by
      // definition we don’t have the previous day’s close.)
      Plot.cell(
        dji,
        calendar({date: "Date", fill: "total"})
      ),

      // Draw a line delineating adjacent months. Since the y-domain above is
      // set to hide weekends (day number 0 = Sunday and 6 = Saturday), if the
      // first day of the month is a weekend, round up to the first monday.
      new MonthLine(
        d3.utcMonths(d3.utcMonth(start), end)
          .map((d) => d3.utcDay.offset(d, d.getUTCDay() === 0 ? 1
             : d.getUTCDay() === 6 ? 2
             : 0, 0)),
        calendar({stroke: "white", strokeWidth: 3}) 
      ),

      // Lastly, draw the date for all days spanning the dataset, including
      // days for which there is no data.
      Plot.text(
        d3.utcDays(d3.utcDay.offset(start,-1), end),
        calendar({text: d3.utcFormat("%-d")})
      )
    ]
  });

}


```


```js

function normalizeDates(data) {
  return data.map(d => ({
    ...d,
    Date: new Date(d.Date.getUTCFullYear(), d.Date.getUTCMonth(), d.Date.getUTCDate())
  }));
}

const datosNormalizados = normalizeDates(propuestasActivas);
const groupedByDate = d3.rollup(datosNormalizados, v => v.length, d => d.Date.toDateString());
const grouped = Array.from(groupedByDate, ([dateStr, total]) => ({Date: new Date(dateStr), total}));
```

<div class="card">
  ${resize((width) => viz2(grouped, {width}))}
</div>



```js
class MonthLine extends Plot.Mark {
  static defaults = {stroke: "currentColor", strokeWidth: 1};
  constructor(data, options = {}) {
    const {x, y} = options;
    super(data, {x: {value: x, scale: "x"}, y: {value: y, scale: "y"}}, options, MonthLine.defaults);
  }
  render(index, {x, y}, {x: X, y: Y}, dimensions) {
    const {marginTop, marginBottom, height} = dimensions;
    const dx = x.bandwidth(), dy = y.bandwidth();
    return htl.svg`<path fill=none stroke=${this.stroke} stroke-width=${this.strokeWidth} d=${
      Array.from(index, (i) => `${Y[i] > marginTop + dy * 1.5 // is the first day a Monday?
          ? `M${X[i] + dx},${marginTop}V${Y[i]}h${-dx}` 
          : `M${X[i]},${marginTop}`}V${height - marginBottom}`)
        .join("")
    }>`;
  }
}
```

<div class="grid grid-cols-2" style="grid-auto-rows: 504px;">
  <div class="card">${
    resize((width) => Plot.plot({
      title: "Your awesomeness over time 🚀",
      subtitle: "Up and to the right!",
      width,
      y: {grid: true, label: "Awesomeness"},
      marks: [
        Plot.ruleY([0]),
        Plot.lineY(aapl, {x: "Date", y: "Close", tip: true})
      ]
    }))
  }</div>
  <div class="card">${
    resize((width) => Plot.plot({
      title: "How big are penguins, anyway? 🐧",
      width,
      grid: true,
      x: {label: "Body mass (g)"},
      y: {label: "Flipper length (mm)"},
      color: {legend: true},
      marks: [
        Plot.linearRegressionY(penguins, {x: "body_mass_g", y: "flipper_length_mm", stroke: "species"}),
        Plot.dot(penguins, {x: "body_mass_g", y: "flipper_length_mm", stroke: "species", tip: true})
      ]
    }))
  }</div>
</div>

---

## Next steps

Here are some ideas of things you could try…

<div class="grid grid-cols-4">
  <div class="card">
    Chart your own data using <a href="https://observablehq.com/framework/lib/plot"><code>Plot</code></a> and <a href="https://observablehq.com/framework/files"><code>FileAttachment</code></a>. Make it responsive using <a href="https://observablehq.com/framework/javascript#resize(render)"><code>resize</code></a>.
  </div>
  <div class="card">
    Create a <a href="https://observablehq.com/framework/project-structure">new page</a> by adding a Markdown file (<code>whatever.md</code>) to the <code>src</code> folder.
  </div>
  <div class="card">
    Add a drop-down menu using <a href="https://observablehq.com/framework/inputs/select"><code>Inputs.select</code></a> and use it to filter the data shown in a chart.
  </div>
  <div class="card">
    Write a <a href="https://observablehq.com/framework/loaders">data loader</a> that queries a local database or API, generating a data snapshot on build.
  </div>
  <div class="card">
    Import a <a href="https://observablehq.com/framework/imports">recommended library</a> from npm, such as <a href="https://observablehq.com/framework/lib/leaflet">Leaflet</a>, <a href="https://observablehq.com/framework/lib/dot">GraphViz</a>, <a href="https://observablehq.com/framework/lib/tex">TeX</a>, or <a href="https://observablehq.com/framework/lib/duckdb">DuckDB</a>.
  </div>
  <div class="card">
    Ask for help, or share your work or ideas, on our <a href="https://github.com/observablehq/framework/discussions">GitHub discussions</a>.
  </div>
  <div class="card">
    Visit <a href="https://github.com/observablehq/framework">Framework on GitHub</a> and give us a star. Or file an issue if you’ve found a bug!
  </div>
</div>





<style>

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 4rem 0 8rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

</style>
