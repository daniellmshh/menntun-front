# Menntun Frontend

Dashboard web de Menntun construido con Next.js 16, TypeScript, Tailwind CSS, Zustand y React Query.

## Comandos

```bash
npm install
npm run dev
npm run build
npm run lint
```

La aplicación consume la API mediante `src/lib/api/axios.ts` y usa Supabase sólo para la sesión del navegador. Las variables públicas deben usar el prefijo `NEXT_PUBLIC_`; nunca expongas una clave de servicio.

## Estructura

- `src/app/`: rutas y composición del App Router.
- `src/modules/`: tipos, hooks y componentes de dominio.
- `src/components/shared/`: componentes reutilizados por más de un módulo.
- `src/lib/`: clientes, utilidades y traducciones.

Antes de modificar el proyecto, consulta [`../AGENTS.md`](../AGENTS.md) y el índice [`.context/README.md`](../.context/README.md). Las rutas del dashboard deben usar `ModuleGuard`, design tokens y el `Loader` compartido.
