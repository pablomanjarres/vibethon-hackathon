# Guion de la demo: parqueadero EAFIT en hora pico

Todo sale de la semilla (`src/parqueadero/escenarios/demo.json`). Antes de empezar, `npm run dev` y abrir `http://127.0.0.1:5199/`. Usar **una sola pestaña**: el estado se comparte entre las vistas de la misma pestaña, no entre pestañas ni dispositivos.

Estado de partida (`npm run foto`):

- Lote de ejemplo: 12 celdas, A04 es la única libre; A03 y B06 reservadas; el resto ocupadas.
- Las Vegas: pasaje 4/4 (FRS112, HUO845, KPA391, ZTE627). Regional: pasaje 6/6 (CXM540 … SVK088). 8 valets disponibles en cada entrada.
- Turno de Regional: CXM540 llegó a las 06:28, antes que cualquier carro de Las Vegas.
- SVK088, último de Regional: "Hay 9 carros antes que tú. Espera estimada: 27 min."

Si la pestaña ya se usó, empezar en `#/oficina` y pulsar **Reiniciar**.

## 1. Recorrido de 90 segundos (jurado en la mesa)

| Tiempo | Clic o URL | Qué se ve | Qué decir |
|---|---|---|---|
| 0:00 | Abrir `#/conductor` | "Reserva tu celda o tu valet en EAFIT." y la lista "Carros en los pasajes ahora" | "Dos porterías llenan el mismo lote sin coordinarse: celdas entregadas dos veces o de forma injusta, gente esperando sin saber cuánto y estudiantes que llegan tarde a clase." |
| 0:10 | Abrir `#/conductor?placa=CXM540` (o tocar CXM540 en la lista) | "Es tu turno: elige tu celda." y el mapa del lote | "CXM540 llegó primero de los diez carros en fila, sin importar por qué entrada. Por eso le toca." |
| 0:15 | Tocar A04 en el mapa y pulsar **Reservar celda A04** | Aviso "CXM540 reservó la celda A04." y "Ve a la celda A04." | "Una sola celda libre, una sola reserva. Nadie más puede tomar A04." |
| 0:25 | Abrir `#/conductor?placa=HUO845` (Las Vegas) | "Aún no es tu turno de reservar." y bajo el mapa: "Hay 2 carros antes que tú. Espera estimada: 9 min."; el mapa no deja elegir | "Un conductor de Las Vegas intenta reservar y la app le dice por qué no: hay carros que llegaron antes. No hay botón para saltarse la fila." |
| 0:35 | Abrir `#/conductor?placa=SVK088` | Tarjeta "Tu espera": 27 min, "8 carros antes que tú, contando ambas entradas." | "SVK088 sabe que le faltan 27 minutos. En vez de esperar dentro del carro…" |
| 0:40 | Pulsar **Reservar valet** | Aviso "RG-V1 va hacia SVK088. Ficho F-001." y el ficho F-001 con placa y valet | "…reserva un valet y recibe su ficho." |
| 0:45 | Pulsar **Ya entregué las llaves** | Aviso "SVK088 quedó con RG-V1. Guarda el ficho F-001 y ve a clase." y el progreso del valet | "Entrega las llaves y camina a clase. El carro conserva su turno en la fila." |
| 0:55 | Abrir `#/porteria?entrada=regional` | Pasaje 5/6, "Turno de Las Vegas: su primer carro llegó antes.", SVK088 marcado "Con valet"; el botón **Asignar celda** está desactivado | "La portería ve el mismo estado: CXM540 ya salió del pasaje y ahora el turno es de Las Vegas." |
| 1:00 | Pestaña **Las Vegas** (`#/porteria?entrada=las-vegas`) | "Es tu turno, pero no hay celdas libres." | "Es su turno, pero no hay celda, así que nadie asigna nada." |
| 1:05 | Abrir `#/oficina`, dejar 30 en "Simular eventos hasta el minuto" y pulsar **Simular** | Ningún evento rechazado; en la bitácora: "MAT471 quedó registrado en la fila de espera de Las Vegas (puesto 1); entra al pasaje apenas haya cupo."; se liberan A01, A05 y B03 | "Estos son los eventos del escenario. Si un carro llega con el pasaje lleno no se pierde: queda en la fila de espera, en orden, y entra solo cuando hay cupo." |
| 1:20 | Pulsar **Reiniciar** | "Simulación reiniciada al minuto 0." y el lote vuelve a la semilla | "Y en cualquier momento volvemos al punto de partida." |
| 1:30 | Fin | | "Eso es lo que funciona hoy. Todo es simulado y local." |

Nota: partiendo de la semilla sin el recorrido anterior, OLP350 también queda en la fila de espera de Regional (puesto 1) en el minuto 7.

## 2. Preguntas de los jurados

**Johany Carreño: ¿Qué decisiones tomó el equipo y cómo comprobaron que la solución cumple el reto?**
Decidimos que un solo módulo (`src/parqueadero/`) haga todo cambio de estado y que la celda sea para el carro que llegó primero, sin importar la entrada; eso es lo que acaban de ver con CXM540 y HUO845. Lo comprobamos ejecutando cada comando contra el motor y con `npm run foto`, que da la misma foto inicial en cada corrida (sección 4 de `docs/prompting.md`).

**David Pulgarín: ¿Para quién diseñaron esto y qué evidencia tienen de que se entiende?**
Para el estudiante que llega en carro a hora pico: SVK088 vio su espera de 27 min y pudo irse a clase con el ficho F-001. Cada pantalla dice el siguiente paso en una frase; la prueba con personas fuera del equipo todavía no está hecha y lo decimos así.

**Johnatan García (JOGA): ¿Qué puede salir mal, cómo lo probaron y qué hace el sistema cuando ocurre?**
Que alguien se salte la fila, que una celda se entregue dos veces o que entre un carro a un pasaje lleno. Lo vieron: HUO845 no puede reservar y la app dice cuántos carros tiene antes; la portería sin celdas libres no puede asignar; el carro que llegó en el minuto 4 con el pasaje lleno quedó en la fila de espera, en orden, sin saltarse a nadie. Un comando rechazado deja el estado igual y explica el motivo.

## 3. Versión de 7 minutos (final)

| Minutos | Bloque | Contenido |
|---|---|---|
| 0:00–1:00 | Propósito | Dos entradas, Las Vegas y Regional, a un mismo lote sin coordinarse. La app le muestra a cada conductor su espera, reparte las celdas con justicia entre las dos entradas y deja que un estudiante entregue el carro a un valet y camine a clase. |
| 1:00–3:30 | Demo en vivo | El recorrido de la sección 1, con más calma: el mapa del conductor, el rechazo de HUO845, el ficho F-001 de SVK088, las dos porterías, la simulación en la oficina y **Reiniciar**. |
| 3:30–5:00 | Cómo se construyó | El registro de prompts en `docs/prompting.md` (y cada prompt tal cual en `docs/prompting.raw.md`). Primero el estado compartido, sin pantallas; después las cuatro vistas. Tres correcciones, cada una con fallo, causa, prompt corregido y comprobación: (1) la referencia visual se eligió sin el equipo y se corrigió a Chargetrip con el mapa limitado al lote; (2) un solo prompt para toda la interfaz se quedó sin turnos y se partió en tres prompts por área; (3) el conductor no podía reservar y se agregó `reservarCelda`, que solo acepta al carro de turno y una celda libre. |
| 5:00–6:00 | Qué funciona | Un módulo dueño de todo cambio de estado; transiciones válidas de celdas y valets, con motivo en español cuando se rechaza otra; regla de equidad; reserva en el mapa; espera estimada; valet con ficho y llaves; semilla única y repetible; escenario cargado desde JSON. |
| 6:00–7:00 | Limitaciones | Todo es simulado: cámaras, registro de placas, llegadas, salidas y pagos. Sin base de datos ni nube. Las 12 celdas son un ejemplo; los 3 min entre liberaciones y las tarifas son supuestos del escenario. El estado se comparte en una pestaña, no entre dispositivos. No hay pruebas automáticas. |

## 4. Si algo falla

- **Recargar la página** mantiene el estado: se guarda en este navegador.
- **Oficina → Reiniciar** (`#/oficina`) vuelve a la semilla, minuto 0.
- Si una vista no muestra lo esperado, revisar que todo se haga en la misma pestaña.
- Si un botón no aparece, abrir la URL del paso directamente (por ejemplo `#/conductor?placa=SVK088`).
