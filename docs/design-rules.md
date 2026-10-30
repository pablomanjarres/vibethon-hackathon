# Reglas de diseño: Parqueadero EAFIT

Referencia: Chargetrip (`references/refero/chargetrip/`). Flujos: Luma y las referencias de conductor (ver `docs/direction.md`).

## 1. Tokens

Solo los de `src/ui/tokens.css`. Mapa en `--map-*`, panel `--panel`, tarjeta interna `--panel-inner`, controles `--tile`, texto `--ink` y `--ink-muted` (al menos 4.5:1 sobre su fondo), acción principal `--surface-light` con texto `--ink-inverse`.

## 2. Distribución

| Pieza | Regla |
|---|---|
| Marco | `Shell`: el mapa llena la ventana (sin scroll de página), el panel flota a la izquierda a 10 px de los bordes y solo él hace scroll; en teléfono es una hoja inferior |
| Panel | `PanelCabecera`, `FilaAcciones` (la primera es la principal), `Chips`, `TarjetaDatos` con contador verde, `Acordeon` por sección |
| Vistas | Arriba a la derecha, un botón redondo por vista y el reloj |

## 3. Tipografía y estados

Inter en todo. Título del panel 17 px 600, sección 14–15 px, metadato 13 px `--ink-muted`. Toda placa, hora, ficho y cifra usa `.num`. Cada estado muestra texto, icono (o el punto de disponibilidad) y tono juntos (`src/ui/estados.ts`); nunca solo color. Controles y puestos del mapa de al menos 40 px; foco visible con `--focus-color`.

## 4. Comportamiento

| Componente | Regla |
|---|---|
| Acción deshabilitada | El motivo se lee debajo de las acciones (`aria-describedby`), como "Asignar celda" con el turno |
| Resultado de un comando | Éxito como aviso verde (`AvisoResultado` o el aviso de registro); se anuncia a lectores de pantalla |
| Rechazo de registro | Hoja (`src/ui/Hoja.tsx`) con el motivo del motor y "Intentar de nuevo"; Escape la cierra y el foco vuelve a la placa |
| Lista vacía | Una frase que dice por qué está vacía y qué hacer |
| Pasos del valet | Hechos con su hora, el actual marcado "Ahora", el siguiente como único botón |

## 5. Movimiento

Solo la hoja sube 180 ms al abrirse y el chevron gira al abrir una sección; con movimiento reducido no hay animación.
