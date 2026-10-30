# Brief: parqueadero EAFIT en hora pico

| Campo | Contenido |
|---|---|
| Familia | Espacio operativo (portería y oficina) con un flujo guiado en el celular (conductor y valet) |
| Usuario | Estudiante que llega en carro a hora pico por la entrada Las Vegas o la Regional. También la portería de cada entrada, los valets y la oficina |
| Tarea principal | El conductor reserva en el mapa del lote la celda libre que le toca, o reserva un valet, le entrega las llaves a cambio de un ficho y camina a clase; mientras espera, ve cuánto le falta |
| Dirección | Una app para reservar celdas y valets sobre el mapa, con flujos como los de Luma (reservar, confirmación como un tiquete, listas de invitados en la portería) y el aspecto de Chargetrip |
| Objetivo | Que ninguna celda se entregue dos veces, que las celdas se repartan con justicia entre las dos entradas y que nadie espere sin saber cuánto |
| Evidencia | Del reto: las dos entradas alimentan el mismo lote sin coordinarse, las celdas se entregan dos veces o de forma injusta, la gente espera sin saber cuánto y los estudiantes llegan tarde. Supuesto (no medido): 3 min entre una celda que se libera y la siguiente, y las tarifas; ambos están en el JSON del escenario |
| Primera fase | El estado compartido (`src/parqueadero/`), sin pantallas. Después, las cuatro vistas sobre ese estado |
| Restricciones | Todo local: memoria o archivos locales (JSON, txt, logs). Sin base de datos, sin nube, sin despliegue. Cámaras, registro de placas, llegadas, salidas y pagos simulados. Las 12 celdas son un ejemplo, no la capacidad real |
| Aceptación | La app arranca de una sola semilla repetible; `npm run check` pasa; `npm run foto` muestra la foto inicial y da lo mismo en cada corrida |
| Exclusiones | Pruebas automáticas (decisión del equipo), cámaras y pagos reales, inicio de sesión, cualquier servicio en la nube |
| Ejemplo de beneficio | En la semilla, SVK088 es el último de Regional: "Hay 9 carros antes que tú. Espera estimada: 27 min." Con valet entrega las llaves, recibe el ficho F-001 y camina a clase; el carro conserva su turno. Los minutos salen de la regla del escenario, no de una medición |
| Prueba con personas | Sin hacer todavía. Antes de la demo, una o dos personas fuera del equipo hacen la tarea principal sin ayuda: tiempo, dónde dudaron, qué cambiamos |
| Condiciones del reto | Dos entradas (Las Vegas y Regional) a un mismo lote; mapas, condiciones iniciales y eventos de simulación que entregan los organizadores y se cargan como JSON; interfaz en español |

## Documentos del reto

| Documento | Qué cambia |
|---|---|
| Enunciado del reto (prompt 7 en `docs/prompting.raw.md`) | Requisitos, estados, semilla y restricciones de esta página |
| Investigación de jurados (PDF) | Cada jurado pregunta por decisiones, usuarios y fallas; la tabla de jurados de abajo |
| Rúbrica publicada en universonext.com/vibethon | 5 criterios de 20 puntos, 5 puntos por ítem. Reemplaza los pesos del PDF, que eran anteriores |

## Rúbrica → función

| Criterio | Ítem | Evidencia | Hecho |
|---|---|---|---|
| Funcionalidad | Cumple los requisitos obligatorios del reto | Tabla de requisitos de abajo | [ ] |
| Funcionalidad | Permite completar el flujo principal | Conductor: espera → valet → ficho → clase; portería asigna; oficina ve el lote | [ ] |
| Funcionalidad | Los controles realizan las acciones que anuncian | Cada botón manda un `Comando` a `motor.ts` y muestra su resultado | [ ] |
| Funcionalidad | La demostración termina sin errores que bloqueen su uso | Un comando rechazado no cambia nada; `tienda.reiniciar()` vuelve a la semilla | [ ] |
| Diseño UI/UX | Se identifica fácilmente cómo iniciar y continuar | Cada lectura trae el siguiente paso: `mensaje`, `turno`, `siguientePaso` | [ ] |
| Diseño UI/UX | Los textos son legibles y tienen contraste suficiente | Tokens de Chargetrip con contraste AA (`docs/direction.md`) | [ ] |
| Diseño UI/UX | La navegación y los controles son consistentes | Un solo archivo de tokens y componentes compartidos | [ ] |
| Diseño UI/UX | Informa el resultado de las acciones y los errores | `evento.detalle` cuando se acepta, `motivo` cuando se rechaza | [ ] |
| Calidad del prompting | El prompt define el problema y el objetivo | Prompt 7 de `docs/prompting.raw.md` y sección 2 de `docs/prompting.md` | [ ] |
| Calidad del prompting | Incluye requisitos y restricciones del reto | El mismo prompt; esta página | [ ] |
| Calidad del prompting | Presentan una corrección del prompt a partir de un fallo observado | Sección 3 de `docs/prompting.md` | [ ] |
| Calidad del prompting | Muestran cómo comprobaron el resultado después del ajuste | La comprobación de cada corrección | [ ] |
| Impacto y pertinencia | Identifica al usuario beneficiado | El estudiante que llega en carro a hora pico | [ ] |
| Impacto y pertinencia | Atiende una necesidad del escenario propuesto | Saber la espera y no llegar tarde a clase | [ ] |
| Impacto y pertinencia | Demuestra un beneficio concreto mediante un ejemplo | El caso de SVK088 de arriba, mostrado en vivo | [ ] |
| Impacto y pertinencia | La solución es coherente con las condiciones del reto | Dos entradas, datos de los organizadores en JSON, todo local y simulado | [ ] |
| Presentación | Explican claramente el propósito del prototipo | README | [ ] |
| Presentación | Demuestran su funcionamiento con un caso concreto | `docs/demo-script.md` con la semilla | [ ] |
| Presentación | La interfaz contiene textos comprensibles y cuidados | Mensajes en español escritos en las lecturas | [ ] |
| Presentación | Explican qué funciona y cuáles son sus limitaciones | README, sección de limitaciones | [ ] |

## Jurados

| Jurado | Qué busca | Su pregunta | Dónde responde la demo |
|---|---|---|---|
| Johany Carreño | Cómo piensa el equipo | ¿Qué decisiones tomó el equipo y cómo comprobaron que la solución cumple el reto? | Regla de equidad en `equidad.ts`, tabla de requisitos, `npm run foto` |
| David Pulgarín | Por qué una persona lo usaría | ¿Para quién diseñaron esto y qué evidencia tienen de que se entiende? | Vista del conductor con su espera; prueba con personas |
| Johnatan García (JOGA) | Por qué confiar en el resultado | ¿Qué puede salir mal, cómo lo probaron y qué hace el sistema cuando ocurre? | Fila de espera cuando el pasaje está lleno; rechazos con motivo: celda ya entregada, turno de la otra entrada, salida sin pago |

## Requisitos (del enunciado, tal como se escribió)

| # | Requisito | Dónde se ve | Hecho |
|---|---|---|---|
| 1 | show each driver their wait | `lecturas/conductor.ts` (`espera`, `mensaje`); vista del conductor | [ ] |
| 2 | split the cells fairly between both entrances | `equidad.ts`; `asignarCelda` solo para la entrada de turno; `vistaPorteria().turno` | [ ] |
| 3 | let a student hand the car to a valet and walk to class | `pedirValet` y `entregarLlaves` en `comandos/valet.ts`; el carro conserva su turno | [ ] |
| 4 | one module that owns every state change for cars, both lines, cells, valets, services, payments, fichos and keys | `motor.ts` y `comandos/` | [ ] |
| 5 | cell states libre, reservada, ocupada and valet states disponible, reservado, en servicio, only valid transitions allowed | `transiciones.ts` | [ ] |
| 6 | seed data in local json (Las Vegas 4 y Regional 6, llenos, 8 valets cada una; 12 celdas A01 a B06; A03 y B06 reservada, A04 libre, el resto ocupada) | `escenarios/demo.json`; `npm run foto` | [ ] |
| 7 | capacities, maps and events read from that data, never hardcoded in the ui | `escenario.ts` valida el JSON al cargar; las vistas leen de `lecturas/` | [ ] |
| 8 | small commands and read models the four views will use later | `Comando` en `motor.ts`; `lecturas/` | [ ] |
| 9 | tests for the transitions | Retirado por decisión del equipo: sin pruebas automáticas | — |
| 10 | everything stays local; cameras, plate registration, arrivals, exits and payments are all simulated | `tienda.ts` en memoria; `simulacion.ts`; `pagar` simulado | [ ] |

Se marca "Hecho" solo después de verlo en la demo funcionando.
