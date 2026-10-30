# Dirección: Parqueadero EAFIT

## 1. Propósito

Reservar celdas de parqueadero y valets en el lote de EAFIT, sobre el mapa del lote. El conductor reserva como quien se inscribe a un evento: una acción clara de "Reservar" y una confirmación que se lee como un tiquete. La portería y el valet trabajan con listas tipo lista de invitados.

Frase: **mapa sereno, una acción por pantalla, estado siempre escrito.**

## 2. Fuentes

| Fuente | Qué se toma | Dónde |
|---|---|---|
| Chargetrip GO, pantalla de estación (principal) | El aspecto y la distribución: mapa oscuro a pantalla completa, panel flotante a la izquierda (cabecera con icono y X, tres acciones, chips, tarjeta interna con contador verde, secciones plegables), botones redondos arriba a la derecha y zoom abajo | `references/refero/chargetrip/stations-panel.jpg`, tokens en `src/ui/tokens.css` |
| Mapa tipo silletería (maquetas) | El dibujo del lote: calles con nombre, contorno redondeado, pasillo central, un puesto por celda agrupado por zona, globo sobre el puesto elegido | `src/vistas/mockups/`, `src/ui/MapaLote.tsx` |
| Luma | Flujos de portería: lista de invitados con búsqueda y una pestaña por entrada, aviso de registro, hoja de "no encontrado" con "Intentar de nuevo" | `references/refero/inspiration/README.md`, `staff.jpg` |
| Referencias de conductor | Espera como pronóstico, mapa de celdas, estado del valet por pasos, ficho como tiquete | `references/refero/inspiration/README.md`, `driver.jpg` |
| Estado de pedido (Instagram) | Pantalla del valet: pasos hechos con su hora y el siguiente como único botón | `staff.jpg` |

## 3. Tokens

Todos viven en `src/ui/tokens.css` y ninguna vista define colores propios: mapa (`--map-ground`, `--map-lot`, `--map-line`, `--map-label`), panel (`--panel`, `--panel-inner`, `--tile`, `--ink`, `--ink-muted`, `--surface-light` para la acción principal), los tonos de estado (`--libre`, `--reservada`, `--ocupada`, `--peligro`) con su versión suave, radios (`--radius-control` 8 px, `--radius-card` 12 px, `--radius-panel` 16 px, `--radius-pill`), espaciado de 4 a 28 px y `--control-height` de 44 px.

## 4. Qué no se copia

Ni el logo, ni el nombre, ni los textos, ni las imágenes o ilustraciones de Chargetrip, Luma, SeatGeek o las demás referencias. Solo estructura, flujo y estilo visual.

## 5. Mapa

Solo el lote de EAFIT y sus cuatro calles, dibujado desde el estado (`src/ui/MapaLote.tsx`, `src/ui/distribuirLote.ts`): las celdas, sus zonas y posiciones, las entradas y sus filas salen de `src/parqueadero`. Sin teselas ni red. El mapa llena la ventana detrás del panel y se ajusta al espacio libre; el zoom solo agranda el lote dentro de su marco.
