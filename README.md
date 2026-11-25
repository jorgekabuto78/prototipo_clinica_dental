# DentaCare Pro — Prototipo Interactivo PWA para Clínica Dental (Fase 1)

Prototipo funcional navegable con datos mock y persistencia en `localStorage`, desarrollado con **HTML5**, **Tailwind CSS** y **JavaScript Vanilla**, diseñado bajo arquitectura **Progressive Web App (PWA)** para cubrir la **Primera Fase (MVP Operativo, Clínico y Portal del Paciente)**.

## Estructura del Proyecto

- `index.html`: Shell principal de la aplicación con diseño responsivo (Sidebar en escritorio y barra de navegación inferior en dispositivos móviles).
- `manifest.json`: Web App Manifest configurado para instalación como PWA (`standalone`).
- `sw.js`: Service Worker con caché de activos estáticos para operación Offline-First.
- `css/styles.css`: Estilos personalizados para el odontograma vectorial interactivo de 5 caras, animaciones y hoja de impresión.
- `js/mock-data.js`: Base de datos mock con pacientes, alertas médicas, historias clínicas (HCE), odontogramas FDI, agenda multiconsultorio, catálogo de aranceles y presupuestos.
- `js/app.js`: Motor SPA, lógica del odontograma SVG, gestión de estados de citas, HCE, presupuestos/caja, portal móvil del paciente y simulador de cola de sincronización Offline.
- `assets/icon.svg`: Icono vectorial de la aplicación.

## Requerimientos de Fase 1 Cubiertos

1. **RF-01 — Arquitectura PWA & Offline-First**: `manifest.json`, `sw.js`, persistencia local y conmutador de simulación **Online / Offline** con cola de sincronización diferida.
2. **RF-02 — Dashboard & Agenda Multiconsultorio**: KPIs diarios, flujo en vivo de sala de espera y sillones (`Pendiente` → `Confirmada` → `En Sala` → `En Sillón` → `Atendida`), vista cronológica y por consultorio, creación de citas y recordatorios WhatsApp.
3. **RF-03 — Directorio de Pacientes e Historia Clínica Electrónica (HCE)**: Filiación completa, banda de alertas médicas críticas (alergias, hipertensión, medicación), anamnesis editable, registro de evoluciones firmadas en formato **SOAP** y visor radiográfico digital.
4. **RF-04 — Odontograma Digital Interactivo (Estándar FDI)**: Mapa dental adulto (32 piezas) y pediátrico (20 piezas) con selección anatómica de **5 caras** (`V`, `L/P`, `M`, `D`, `O`) y pieza completa (*Caries, Restauración, Endodoncia, Corona, Implante, Ausente, Sano*), conectado directamente al presupuesto del paciente.
5. **RF-05 — Presupuestos, Planes de Tratamiento y Caja**: Seguimiento de avance clínico por procedimiento, cálculo automático de descuentos/saldos, barra de progreso financiero, registro de abonos/pagos e impresión de estado de cuenta.
6. **RF-06 — Portal del Paciente (Autogestión Móvil PWA)**: Simulador móvil integrado con reserva de citas en 3 pasos, pase digital con código QR de llegada (Check-In) e indicaciones post-operatorias disponibles sin conexión.

## Ejecución Rápida

Puedes abrir `index.html` directamente en cualquier navegador moderno o servir la carpeta con un servidor local para activar el Service Worker:

```bash
npx serve .
# o con Python:
python -m http.server 8080
```
