# IPC Tareas — Instrucciones de instalación

## Requisitos
- Node.js 18 o superior

## Instalación (primera vez)

```bash
# 1. Instalar dependencias del backend
npm install

# 2. Instalar dependencias y compilar el frontend
cd client && npm install && npm run build && cd ..
```

## Iniciar la aplicación

```bash
node server.js
```

La app queda disponible en: **http://localhost:3001**

## Acceso desde el celular

1. Asegurate de que tu celular esté conectado a la **misma red WiFi** que tu computadora.
2. Buscá la IP local de tu computadora:
   - **Mac/Linux**: `ip addr` o `ifconfig` → buscá algo como `192.168.x.x`
   - **Windows**: `ipconfig` → buscá "Dirección IPv4"
3. En el navegador del celular ingresá: `http://192.168.x.x:3001`

> El servidor escucha en `0.0.0.0`, por lo que acepta conexiones desde cualquier dispositivo en la red local.

## Secciones disponibles
- **Personal** — tareas personales
- **Consultoría** — proyectos de consultoría
- **Dashboard** — tareas de dashboard
- **Fhc** — tareas de Fhc

## Funcionalidades
- Crear, editar y eliminar tareas
- Marcar tareas como completadas
- Mover tareas entre secciones
- Prioridad (alta / media / baja)
- Fecha límite con alerta de vencimiento
- Contador de pendientes por sección

## Datos
Los datos se guardan en `data/tasks.db` (SQLite). Hacé backup de ese archivo para no perder información.
