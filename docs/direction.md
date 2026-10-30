# Dirección: Parqueadero EAFIT

## 1. Propósito

Reservar celdas de parqueadero y valets en el lote de EAFIT, sobre el mapa del lote. El conductor reserva como quien se inscribe a un evento: una acción clara de "Reservar" y una confirmación que se lee como un tiquete. La portería y el valet trabajan con listas tipo lista de invitados.

Frase: **mapa sereno, una acción por pantalla, estado siempre escrito.**

## 2. Fuentes

| Fuente | Qué se toma | Dónde |
|---|---|---|
| Chargetrip (principal) | El aspecto: fondo crema, superficies claras, tinta casi negra, serif en títulos, botón de tinta, tarjetas de 16 px, panel flotante sobre el mapa | `references/refero/chargetrip/`, tokens en `src/ui/tokens.css` |
| Chargetrip GO y SeatGeek | Ejemplos de distribución de app: lista a la izquierda, mapa del lote a la derecha; en teléfono, una columna | `references/refero/chargetrip/`, `references/refero/inspiration/office.jpg` |
| Luma | Flujos de portería: lista de invitados con búsqueda y una pestaña por entrada, aviso de registro, hoja de "no encontrado" con "Intentar de nuevo" | `references/refero/inspiration/README.md`, `staff.jpg` |
| Referencias de conductor | Espera como pronóstico, mapa de celdas, estado del valet por pasos, ficho como tiquete | `references/refero/inspiration/README.md`, `driver.jpg` |
| Estado de pedido (Instagram) | Pantalla del valet: pasos hechos con su hora y el siguiente como único botón | `staff.jpg` |

## 3. Tokens

Todos viven en `src/ui/tokens.css` y ninguna vista define colores propios: `--canvas`, `--surface`, `--ink`, `--accent`, los tonos de estado (`--libre`, `--reservada`, `--ocupada`, `--peligro`) con su versión suave, radios (`--radius-control` 8 px, `--radius-card` 16 px, `--radius-pill`), sombras, espaciado de 4 a 28 px y `--control-height` de 44 px.

## 4. Qué no se copia

Ni el logo, ni el nombre, ni los textos, ni las imágenes o ilustraciones de Chargetrip, Luma, SeatGeek o las demás referencias. Solo estructura, flujo y estilo visual.

## 5. Mapa

Solo el lote de EAFIT, dibujado desde los datos del escenario (`src/ui/MapaLote.tsx`). Sin mapa de calles, sin teselas, sin red.
