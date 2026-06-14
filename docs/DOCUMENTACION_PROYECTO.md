# Documentacion Tecnica - Quiz Master

## 1. Resumen del proyecto

`pp-quizz-app` es una aplicacion web de cuestionarios construida con `Next.js` (App Router), `React`, `TypeScript`, `Tailwind CSS` y `Supabase`.

Objetivos principales:
- Autenticacion de usuarios.
- Creacion y edicion de cuestionarios propios.
- Ejecucion de cuestionarios con registro de respuestas.
- Visualizacion de resultados e historial de intentos.
- Carga inicial de banco de preguntas desde `data/questions.json`.

## 2. Stack tecnico

- Framework: `next` `16.2.4`
- UI: `react` `19`, `tailwindcss` `4`, componentes de `Radix UI` + utilidades de `shadcn/ui`
- Backend BaaS: `@supabase/supabase-js` + `@supabase/ssr`
- Lenguaje: `TypeScript`
- Analitica: `@vercel/analytics` (solo en produccion)

## 3. Estructura relevante del repositorio

Se revisaron unicamente carpetas de codigo y documentacion del proyecto, excluyendo `node_modules` y `.next`.

```
app/
  api/
    create-test-user/route.ts
    load-questions/route.ts
  admin/
    create-user/page.tsx
    load-data/page.tsx
  auth/
    callback/route.ts
    login/page.tsx
    sign-up/page.tsx  # deshabilitado (redirige a login)
  dashboard/
    layout.tsx
    page.tsx
  quiz/
    layout.tsx
    create/page.tsx
    [id]/edit/page.tsx
    [id]/take/page.tsx
    [id]/results/[attemptId]/page.tsx
  setup/page.tsx      # deshabilitado (redirige a login)
  layout.tsx
  page.tsx
  proxy.ts

features/
  quiz/
    actions.ts
    schemas.ts
  attempts/
    actions.ts
    schemas.ts
    services/
      scoring.ts

lib/
  actions.ts
  types.ts
  supabase/
    admin.ts
    client.ts
    proxy.ts
    server.ts

components/
  loader.tsx
  navbar.tsx
  page-transition.tsx
  ui/*

data/
  questions.json

scripts/
  load-questions.ts
```

## 4. Arquitectura funcional

### 4.1 Capa de presentacion

- Rutas en `app/` con App Router.
- Pagina de autenticacion activa: `/auth/login`.
- Dashboard para gestion y seguimiento (`/dashboard`).
- Flujo de quiz completo (`/quiz/create`, `/quiz/[id]/edit`, `/quiz/[id]/take`, `/quiz/[id]/results/[attemptId]`).
- Paginas auxiliares de carga de datos (`/admin/load-data`).
- Rutas `/setup` y `/admin/create-user` deshabilitadas (redirigen a login).

### 4.2 Capa de datos y logica

La logica principal esta modularizada por dominio:
- `features/quiz/actions.ts` + `features/quiz/schemas.ts`.
- `features/attempts/actions.ts` + `features/attempts/schemas.ts`.
- `features/attempts/services/scoring.ts` para calculo de puntaje.
- `lib/actions.ts` se mantiene como capa puente para compatibilidad gradual.

### 4.3 Persistencia

Supabase se usa como:
- Autenticacion de usuarios.
- Base de datos relacional (tablas: quizzes, questions, quiz_questions, quiz_attempts, responses, categories, profiles).

## 5. Flujo principal de negocio

1. Usuario inicia sesion.
2. En dashboard crea un quiz.
3. En edicion agrega preguntas desde el banco (`questions`).
4. Al iniciar el quiz se crea un `quiz_attempt`.
5. Al enviar, se guarda una `response` por pregunta.
6. Se calcula porcentaje y se completa el intento.
7. La vista de resultados muestra aciertos, errores y respuestas correctas.

## 6. Rutas y endpoints

### 6.1 Rutas de pagina

- `/` -> redireccion inteligente (`/dashboard` si hay sesion, si no `/auth/login`).
- `/auth/login` -> inicio de sesion.
- `/auth/sign-up` -> deshabilitada (redirige a login).
- `/dashboard` -> panel principal del usuario autenticado.
- `/quiz/create` -> creacion de cuestionario.
- `/quiz/[id]/edit` -> configuracion de quiz y asignacion de preguntas.
- `/quiz/[id]/take` -> ejecucion del quiz.
- `/quiz/[id]/results/[attemptId]` -> resultados detallados.
- `/setup` -> deshabilitada (redirige a login).
- `/admin/load-data` -> carga de preguntas desde JSON.
- `/admin/create-user` -> deshabilitada (redirige a login).

### 6.2 API Routes

- `POST /api/load-questions`
  - Disponible solo en `development`.
  - Lee `data/questions.json`.
  - Hace `upsert` de categoria base.
  - Inserta preguntas no existentes y reporta `loaded/skipped/failed`.

- `POST /api/create-test-user`
  - Deshabilitado (retorna `403`).

## 7. Seguridad y autenticacion

- Cliente browser Supabase en `lib/supabase/client.ts`.
- Cliente server Supabase en `lib/supabase/server.ts` con manejo de cookies.
- Middleware en `app/proxy.ts` usando `lib/supabase/proxy.ts` para refresco de sesion.
- Guardas de autenticacion en layouts:
  - `app/dashboard/layout.tsx`
  - `app/quiz/layout.tsx`
  Si no hay usuario autenticado, redirecciona a `/auth/login`.

## 8. Variables de entorno requeridas

Definir en `.env`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # necesaria para rutas/scripts admin
```

## 9. Scripts y comandos

Segun `package.json`:
- `npm run dev` -> desarrollo.
- `npm run build` -> build produccion.
- `npm run start` -> ejecutar build.
- `npm run lint` -> lint del proyecto.

Script adicional:
- `scripts/load-questions.ts`
  - Carga preguntas desde JSON usando `SUPABASE_SERVICE_ROLE_KEY`.

## 10. Observaciones tecnicas

- Hay mezcla de textos en ingles/espanol en UI y docs; conviene estandarizar idioma de producto.
- Se deshabilitaron rutas de creacion/generacion de usuarios para mantener solo login.
- `createQuiz` acepta `categoryId?: bigint`; en frontend actual no se expone seleccion de categoria.
- Flujo de respuesta guarda `selected_answer` vacia cuando usuario no responde una pregunta; es valido, pero podria marcarse explicitamente como `null` si se desea diferenciar "sin respuesta" de cadena vacia.

## 11. Recomendaciones de mejora

- Agregar tests de integracion para `lib/actions.ts` y API routes.
- Añadir validacion de esquema para `data/questions.json` antes de insertar.
- Proteger paginas/admin endpoints con rol o bandera de entorno adicional.
- Incorporar paginacion/filtros en seleccion de preguntas si crece el banco.
- Crear diagrama entidad-relacion en `docs/` para onboarding tecnico.

## 12. Animaciones y experiencia de usuario

Se agregaron dos componentes para mejorar la experiencia de navegacion y carga:

- **`components/page-transition.tsx`**: Envuelve el contenido del layout raiz y aplica una animacion CSS (fade-in + slide-up) en cada cambio de ruta usando `usePathname()` + `key` de React, aprovechando `tw-animate-css`.

- **`components/loader.tsx`**: Componente reutilizable que reemplaza los spinners inline en todas las paginas. Ofrece dos variantes:
  - `Loader` — version full-screen con spinner de doble anillo y texto opcional.
  - `InlineLoader` — version compacta para cargas parciales dentro de contenedores.

Las paginas que ahora usan `Loader`: Dashboard, Take Quiz, Edit Quiz, Quiz Results.

## 13. Estado general

El proyecto tiene una base funcional clara para un sistema de quizzes con autenticacion y persistencia. La separacion por rutas, acciones y cliente Supabase es consistente y permite evolucionar la aplicacion de forma incremental.
