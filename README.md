# Parqueadero EAFIT en hora pico

Registro de prompts: [`docs/prompting.md`](docs/prompting.md) (especificación, correcciones y comprobaciones) y [`docs/prompting.raw.md`](docs/prompting.raw.md) (cada prompt escrito, tal cual).

A hora pico los carros entran por dos porterías, Las Vegas y Regional, a un mismo lote, y nadie las coordina: las celdas se entregan dos veces o de forma injusta, la gente espera en fila sin saber cuánto y los estudiantes llegan tarde a clase. Esta app le muestra a cada conductor su espera, reparte las celdas con justicia entre las dos entradas y deja que un estudiante entregue el carro a un valet y camine a clase.

## Cómo correrlo

```bash
npm install
npm run dev     # http://127.0.0.1:5199/
npm run check   # revisión de tipos
npm run build   # revisión de tipos + build estático en dist/
npm run foto    # foto inicial del escenario: lote, pasajes, turnos y valets
```

## Qué funciona

- Un solo módulo, `src/parqueadero/`, es dueño de todo cambio de estado: carros, los dos pasajes, celdas, valets, servicios, pagos, fichos y llaves. Las vistas del conductor, la portería, el valet y la oficina leen el mismo estado, así que no pueden contradecirse.
- Celdas `libre → reservada → ocupada → libre` (y `reservada → libre`); valets `disponible → reservado → en servicio → disponible` (y `reservado → disponible`). Cualquier otro cambio se rechaza con un motivo en español y el estado queda igual.
- Regla de equidad: la siguiente celda libre es para el carro que llegó primero, sin importar la entrada. Si empatan, va a la entrada que ha recibido menos celdas. Solo la portería de turno puede asignar.
- Reserva en el mapa: cuando es tu turno eliges la celda libre que quieras y la reservas; si no es tu turno, la app dice cuántos carros hay antes que tú.
- Espera estimada: carros adelante en ese orden, menos las celdas libres, por los minutos entre liberaciones que define el escenario.
- Valet: el conductor pide valet desde la fila, recibe un ficho, entrega las llaves y camina a clase; el carro conserva su turno. Las llaves quedan en el tablero y el carro se devuelve contra el ficho, después del pago.
- La app arranca siempre de la misma semilla (`src/parqueadero/escenarios/demo.json`).

## Limitaciones

- Todo es simulado: cámaras, registro de placas, llegadas, salidas y pagos. No hay base de datos, nube ni despliegue; el estado vive en memoria y vuelve a la semilla al recargar.
- Las 12 celdas son un ejemplo, no la capacidad real. Los minutos entre liberaciones y las tarifas son supuestos del escenario.
- El estado se comparte entre las vistas de una misma pestaña del navegador, no entre dispositivos.
- No hay pruebas automáticas.

## Cambiar el escenario

Los mapas, capacidades, condiciones iniciales y eventos salen solo de un archivo JSON. Para usar los de los organizadores: agrega su archivo en `src/parqueadero/escenarios/`, regístralo en `escenarios/index.ts` y apunta `ESCENARIO_INICIAL` a él. `escenario.ts` lo valida al cargar y dice qué está mal si algo no cuadra.

## Dónde está cada cosa

| Ruta | Es dueño de |
|---|---|
| `src/parqueadero/motor.ts` | `ejecutar(estado, comando)`: la única entrada para cambiar el estado; trabaja sobre una copia y rechaza con motivo |
| `src/parqueadero/comandos/` | Filas y celdas, valet, pago y salida |
| `src/parqueadero/transiciones.ts` | Los cambios permitidos de celdas y valets |
| `src/parqueadero/equidad.ts`, `espera.ts` | A quién le toca la siguiente celda y cuánto espera cada carro |
| `src/parqueadero/escenario.ts`, `escenarios/` | Validación del JSON y estado inicial |
| `src/parqueadero/lecturas/` | Lo que lee cada vista: conductor, portería, valet y oficina |
| `src/parqueadero/tienda.ts` | Una tienda en memoria que comparten las cuatro vistas (`useSyncExternalStore(tienda.suscribir, tienda.leer)`) |
| `src/parqueadero/simulacion.ts` | Llegadas y salidas simuladas del escenario |
| `src/shared/` | Kit base: rutas por hash, anunciador para lectores de pantalla, diálogos, controles de demo |
| `scripts/foto.ts` | La foto inicial que imprime `npm run foto` |
| `scripts/shot.mjs`, `scripts/sweep.mjs` | Capturas a 1440 y 390 px y barrido de errores, contraste y desbordes (con el servidor de desarrollo corriendo) |
| `docs/` | Brief, dirección visual, reglas de diseño, matriz de QA, guion de la demo y registro de prompts |
