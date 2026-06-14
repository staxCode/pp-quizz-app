# Quiz Master - Interactive Quiz Application

Una aplicación web completa para crear, gestionar y tomar cuestionarios interactivos con Supabase y Next.js.

## Documentación

| Documento | Descripción |
|-----------|-------------|
| [`docs/QUICK_START.md`](docs/QUICK_START.md) | Guía rápida para empezar a usar la aplicación |
| [`docs/DOCUMENTACION_PROYECTO.md`](docs/DOCUMENTACION_PROYECTO.md) | Documentación técnica detallada del proyecto |
| [`docs/ARQUITECTURA_SIMPLE_PARA_PROYECTOS_NEXT_SUPABASE.md`](docs/ARQUITECTURA_SIMPLE_PARA_PROYECTOS_NEXT_SUPABASE.md) | Guía de arquitectura para proyectos Next.js + Supabase |

## Características Principales

✅ **Autenticación de Usuarios**
- Inicio de sesión con Supabase Auth (registro deshabilitado)
- Gestión segura de sesiones con cookies HTTP-only
- Protección de rutas con layouts y middleware

✅ **Gestión de Cuestionarios**
- Crear nuevos cuestionarios
- Editar cuestionarios existentes
- Agregar y eliminar preguntas
- Búsqueda de preguntas por nombre o ID

✅ **Sistema de Preguntas**
- Múltiples tipos de preguntas (opción múltiple, verdadero/falso, etc.)
- Preguntas importadas desde archivo JSON
- Opciones de respuesta almacenadas en formato JSONB
- Información adicional: ubicación, código, nivel de dificultad

✅ **Experiencia de Cuestionario**
- Interfaz intuitiva para tomar cuestionarios
- Progreso visual durante el cuestionario
- Navegación entre preguntas
- Indicador de preguntas respondidas

✅ **Resultados y Estadísticas**
- Puntuación inmediata después de completar
- Revisión detallada de respuestas
- Historial de intentos
- Estadísticas de progreso en el dashboard

## Estructura de la Base de Datos

### Tablas Principales

1. **profiles** - Información del usuario
2. **categories** - Categorías de preguntas
3. **quizzes** - Cuestionarios creados por usuarios
4. **questions** - Banco de preguntas
5. **quiz_questions** - Relación entre cuestionarios y preguntas
6. **quiz_attempts** - Intentos de resolver cuestionarios
7. **responses** - Respuestas individuales del usuario

## Estructura del Proyecto

```
app/
├── api/
│   ├── create-test-user/route.ts      # deshabilitado (403)
│   └── load-questions/route.ts
├── admin/
│   ├── create-user/page.tsx            # deshabilitado (redirige a login)
│   └── load-data/page.tsx
├── auth/
│   ├── callback/route.ts
│   ├── login/page.tsx
│   └── sign-up/page.tsx               # deshabilitado (redirige a login)
├── dashboard/
│   ├── layout.tsx
│   └── page.tsx
├── quiz/
│   ├── layout.tsx
│   ├── create/page.tsx
│   ├── [id]/
│   │   ├── edit/page.tsx
│   │   ├── take/page.tsx
│   │   └── results/[attemptId]/page.tsx
├── setup/page.tsx                     # deshabilitado (redirige a login)
├── layout.tsx
├── page.tsx
└── proxy.ts

features/
├── auth/
│   ├── actions.ts
│   ├── schemas.ts
│   └── types.ts
├── quiz/
│   ├── actions.ts
│   ├── schemas.ts
│   ├── types.ts
│   └── services/
└── attempts/
    ├── actions.ts
    ├── schemas.ts
    ├── types.ts
    └── services/
        └── scoring.ts

lib/
├── supabase/
│   ├── admin.ts
│   ├── client.ts
│   ├── proxy.ts
│   └── server.ts
├── shared/
│   ├── constants.ts
│   ├── errors.ts
│   └── result.ts
├── actions.ts
├── types.ts
└── utils.ts

components/
├── layout/
│   └── navbar.tsx
├── ui/
├── loader.tsx                     # Loader reutilizable (full-screen e inline)
├── navbar.tsx (re-export bridge)
├── page-transition.tsx            # Animacion suave entre paginas
└── theme-provider.tsx

hooks/
├── use-mobile.ts
└── use-toast.ts

data/
└── questions.json

scripts/
└── load-questions.ts

styles/
└── globals.css

docs/
├── ARQUITECTURA_SIMPLE_PARA_PROYECTOS_NEXT_SUPABASE.md
├── DOCUMENTACION_PROYECTO.md
├── MEJORES_PRACTICAS_FRONTEND_BACKEND.md
└── QUICK_START.md
```

## Cómo Empezar

### 1. Requisitos Previos
- Node.js 18+
- Cuenta de Supabase
- npm (o pnpm/yarn)

### 2. Instalación
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno (ver .env.example)
```

### 3. Configuración de la Base de Datos
Las tablas se crean automáticamente a través de la migración SQL ejecutada en Supabase.

### 4. Cargar Preguntas de Ejemplo

**Opción A: A través de la interfaz web**
1. Ir a `http://localhost:3000/admin/load-data`
2. Hacer clic en "Load Questions from JSON"
3. Las preguntas se cargarán en la base de datos

**Opción B: Usando TypeScript**
```bash
npx tsx scripts/load-questions.ts
```

### 5. Iniciar la Aplicación
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

> Para una guía paso a paso más detallada, consulta [`docs/QUICK_START.md`](docs/QUICK_START.md).

## Flujo de Usuario

### 1. Registro/Login
- Los usuarios se registran con email y contraseña
- Se crea automáticamente un perfil

### 2. Dashboard
- Ver cuestionarios creados
- Ver estadísticas de intentos
- Crear nuevo cuestionario

### 3. Crear/Editar Cuestionario
- Definir título y descripción
- Buscar y agregar preguntas del banco
- Ordenar preguntas

### 4. Tomar Cuestionario
- Responder cada pregunta
- Navegar entre preguntas
- Ver progreso

### 5. Ver Resultados
- Puntuación total y porcentaje
- Revisión de cada respuesta
- Comparar con la respuesta correcta
- Opción de repetir el cuestionario

## Estructura de Datos JSON

El archivo de preguntas debe tener este formato:

```json
[
  {
    "id": 1,
    "question": "¿Cuál es la pregunta?",
    "options": [
      "Opción 1",
      "Opción 2",
      "Opción 3",
      "Opción 4",
      "Opción 5"
    ],
    "correct_answer": "Opción correcta",
    "location": "Referencia adicional",
    "code_question": "Código único"
  }
]
```

## Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Las consultas SQL son parametrizadas
- Las sesiones se manejan con cookies HTTP-only
- Los usuarios solo pueden ver sus propios cuestionarios e intentos

## Variables de Entorno

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (solo para scripts)
```

## Arquitectura

El proyecto sigue una arquitectura por capas con separación de dominios:

### Capas

| Capa | Ubicación | Responsabilidad |
|------|-----------|----------------|
| Presentación | `app/` + `components/` | Renderizar UI, manejar estado de pantalla |
| Aplicación | `features/*/actions` | Coordinar casos de uso, validar entrada |
| Dominio/Servicios | `features/*/services` | Reglas de negocio puras, cálculos |
| Infraestructura | `lib/supabase/*` | Clientes de base de datos, middleware |

### Estructura por dominio (`features/`)

- **`auth/`** - Autenticación (login, logout, sesión)
- **`quiz/`** - Gestión de cuestionarios (CRUD, preguntas)
- **`attempts/`** - Intentos de cuestionarios (iniciar, completar, puntuar)

### Utilidades compartidas (`lib/shared/`)

- **`errors.ts`** - Clases de error estandarizadas (`AppError`, `UnauthorizedError`, `ValidationError`, `NotFoundError`, `ForbiddenError`)
- **`result.ts`** - Tipo `Result<T, E>` para retornos tipados (success/failure)
- **`constants.ts`** - Constantes de la aplicación (rutas, paginación)

### Convenciones de naming

- Acciones: `verbNounAction` (`createQuizAction`, `startQuizAttemptAction`)
- Servicios: `verbNoun` (`calculateScore`, `buildScoredResponses`)
- Schemas: `nounSchema` (`createQuizInputSchema`, `loginSchema`)

Consulta [`docs/ARQUITECTURA_SIMPLE_PARA_PROYECTOS_NEXT_SUPABASE.md`](docs/ARQUITECTURA_SIMPLE_PARA_PROYECTOS_NEXT_SUPABASE.md) para más detalles.

## API Routes

### `POST /api/load-questions`
Carga preguntas desde el archivo JSON a la base de datos.
- Solo disponible en entorno `development`
- Requiere que el archivo `data/questions.json` exista
- Reporta resultado detallado (loaded/skipped/failed)

### `POST /api/create-test-user`
- **Deshabilitado** - retorna `403 Forbidden`

## Próximas Mejoras

- [ ] Compartir cuestionarios con otros usuarios
- [ ] Análisis de desempeño avanzado
- [ ] Sistema de badges/recompensas
- [ ] Modo timed quizzes
- [ ] Exportar resultados a PDF
- [ ] Panel de administración para moderadores
- [ ] Tests de integración para flujos críticos
- [ ] Validación con Zod en backend y formularios

## Mejoras Recientes

- ✅ **Transiciones entre páginas** — Animaciones suaves (fade-in + slide-up) al navegar entre módulos usando `PageTransition` y `tw-animate-css`.
- ✅ **Loader unificado** — Componente `Loader` reutilizable con spinner animado y mensaje contextual para todas las pantallas que cargan datos del backend.

## Licencia

MIT
