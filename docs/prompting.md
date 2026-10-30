# Registro de prompts: parqueadero EAFIT en hora pico

Los prompts escritos, tal cual y en orden, están en [`prompting.raw.md`](prompting.raw.md). Esta página explica los que definieron el trabajo, las correcciones después de un fallo visto y cómo se comprobó cada una. Solo hay fallos que ocurrieron.

## 1. El prompt del reto

Es el prompt 7 de `prompting.raw.md`. Lo esencial, tal como se escribió:

```text
the problem: at rush hour drivers come in through two entrances, Las Vegas and Regional, both feed the same lot but nobody coordinates them, so cells get handed out twice or unfairly and ppl sit in line not knowing how long theyll wait, students end up late to class. the app has to show each driver their wait, split the cells fairly between both entrances, and let a student hand the car to a valet and walk to class.
```

## 2. El prompt de construcción

> **Problema:** a hora pico los carros entran por Las Vegas y por Regional a un mismo lote sin coordinación; las celdas se entregan dos veces o de forma injusta, la gente espera sin saber cuánto y los estudiantes llegan tarde a clase.
> **Usuario:** el estudiante que llega en carro; también la portería de cada entrada, los valets y la oficina.
> **Objetivo:** que el conductor sepa su espera, reserve en el mapa la celda que le toca o reserve un valet y camine a clase, sin que nadie reciba una celda ya entregada.
> **Requisitos obligatorios:** (1) mostrar a cada conductor su espera; (2) repartir las celdas con justicia entre las dos entradas; (3) entregar el carro a un valet e ir a clase; (4) un solo módulo dueño de todo cambio de estado; (5) celdas libre, reservada, ocupada y valets disponible, reservado, en servicio, solo con transiciones válidas; (6) semilla en JSON local: Las Vegas 4 y Regional 6, ambas llenas, 8 valets cada una, 12 celdas de ejemplo; (7) capacidades, mapas y eventos leídos de los datos; (8) comandos y lecturas pequeños para las cuatro vistas.
> **Restricciones:** todo local, sin base de datos, sin nube, sin despliegue; cámaras, placas, llegadas, salidas y pagos simulados; las 12 celdas son un ejemplo; interfaz en español.
> **Decisiones:** un motor que trabaja sobre una copia y rechaza con motivo, para que un error nunca deje el estado a medias; la siguiente celda va al carro que llegó primero sin importar la entrada, porque es justo para cada conductor y se explica en una frase; el escenario se valida al cargar, para que el mapa de los organizadores falle con un mensaje claro y no en plena demo; el mapa se dibuja solo con las celdas del escenario, limitado al lote de EAFIT.
> **Verificación:** `npm run check`, `npm run build`, `npm run foto` dos veces con la misma salida, y cada flujo ejecutado contra el motor.

## 3. Correcciones

### Corrección 1: la referencia visual la eligió la ejecución, no el equipo

| Paso | Contenido |
|---|---|
| Fallo observado | La primera búsqueda de referencias en Refero eligió Zendesk por su cuenta y guardó `references/refero/zendesk/`. El equipo ya quería Chargetrip |
| Causa | El prompt pedía buscar y escoger un sitio, sin nombrar las referencias del equipo ni el límite del mapa |
| Prompt corregido | "Use chargetrip as the main source for the UI and the other 2 as good examples of how it would look the app UI and make sure the map gets limited to EAFIT parking spots" (prompt 8), con las tres páginas de Refero |
| Comprobación | Se borró la carpeta de Zendesk. `references/refero/chargetrip/` quedó guardada y `src/ui/MapaLote.tsx` dibuja solo las celdas y entradas del escenario (PR #4) |

### Corrección 2: un solo prompt para toda la interfaz no alcanzó

| Paso | Contenido |
|---|---|
| Fallo observado | La ejecución de la interfaz se detuvo por límite de turnos (`error_max_turns` tras 41 turnos). Dejó vistas sin guardar en git y una copia propia de `src/parqueadero/` |
| Causa | Un prompt pedía referencias, tokens, mapa y las cuatro vistas de una vez, sin presupuesto ni entregas parciales |
| Prompt corregido | Tres prompts pequeños, uno por área (oficina; conductor; portería y valet), cada uno con sus archivos y esta regla: "You have a hard limit of about 35 tool calls: land a working version in a merged PR by your ~20th call" |
| Comprobación | La copia de `src/parqueadero/` se comparó archivo por archivo con `main` (19 de 19 iguales) antes de borrarla; las vistas guardadas pasaron `npm run check` y `npm run build` y entraron en el PR #4 |

### Corrección 3: el conductor no podía reservar su celda

| Paso | Contenido |
|---|---|
| Fallo observado | Con el primer motor, solo la portería asignaba celdas; el conductor esperaba sin poder elegir ni reservar nada en el mapa |
| Causa | El prompt del reto pedía mostrar la espera y repartir con justicia, pero no decía que la app fuera para reservar |
| Prompt corregido | "make sure also to relay that the purpose is like making an app that you can reserve the parking spots and valets, like using the map and similar UI to luma" (prompt 12) |
| Comprobación | Nuevo comando `reservarCelda`: solo el carro al que le toca puede reservar, y solo una celda libre. Ejecución contra el motor (PR #5): |

```text
NO  reservarCelda FRS112: Todavía no es tu turno: hay 1 carro antes que tú.
NO  reservarCelda CXM540: La celda A01 está ocupada. Elige una libre.
ok  reservarCelda CXM540: CXM540 reservó la celda A04.
ok  estacionar CXM540: CXM540 se estacionó en A04.
```

### Corrección 4: el conductor no podía registrar su placa para guardar su puesto

| Paso | Contenido |
|---|---|
| Fallo observado | En la vista del conductor no había forma confiable de registrar la placa propia: con los dos pasajes llenos, como en la semilla, el registro se rechazaba con "El pasaje de Las Vegas está lleno (4 de 4). El carro espera afuera." y el carro no quedaba en ninguna fila |
| Causa | El registro solo existía para la cámara de la portería y trataba el pasaje lleno como un error, no como una espera |
| Prompt corregido | "In the conductor stage, there is no reliable way to register your own plate to save your spot in the parking lot also is not pretty clear doing that either, get that done fast" (prompt 25) |
| Comprobación | `registrarLlegada` ya no rechaza por pasaje lleno: el carro queda en la fila de espera y entra al pasaje en orden cuando sale un carro. Ejecución contra el motor: |

```text
ok  MAT471 quedó registrado en la fila de espera de Las Vegas (puesto 1); entra al pasaje apenas haya cupo.
    en espera | Quedaste en la fila de espera. Hay 10 carros antes que tú. Espera estimada: 30 min. Entras al pasaje apenas haya cupo.
NO  La placa MAT471 ya está en el parqueadero.
ok  FRS112 (Las Vegas) va a la celda A01.
    LV fila: HUO845,KPA391,ZTE627,MAT471 | MAT471: en fila
```

## 4. Cómo sabemos que cumple

| Requisito o ítem | Cómo se comprobó | Resultado |
|---|---|---|
| Semilla repetible | `npm run foto` dos veces y `cmp` de las salidas | Iguales: 1 libre, 2 reservadas, 9 ocupadas; Las Vegas 4/4, Regional 6/6; 8 valets disponibles por entrada |
| Reparto justo | Ejecución contra el motor | "Es el turno de Regional: su primer carro llegó antes." para Las Vegas; Regional entrega A04 a CXM540 |
| Ninguna celda dos veces | Ejecución contra el motor | Segunda asignación rechazada mientras no haya celdas libres |
| Valet y clase | Ejecución contra el motor | "SVK088 quedó con RG-V1. Guarda el ficho F-001 y ve a clase."; el carro conserva su turno |
| Salida con pago | Ejecución contra el motor | "Falta el pago de HKM214." antes de pagar |
| Eventos del escenario | `simularHasta(30)` | "MAT471 quedó registrado en la fila de espera de Las Vegas (puesto 1); entra al pasaje apenas haya cupo." |
| Tipos y build | `npm run check`, `npm run build` | Pasan |
