# Arquitectura Simple para Proyectos Next.js + Supabase

## Objetivo

Definir una arquitectura sencilla, mantenible y facil de escalar para aplicaciones CRUD/autenticadas como este proyecto de quizzes.

Esta guia prioriza:
- claridad para equipos pequenos
- bajo costo de mantenimiento
- crecimiento incremental sin sobreingenieria

---

## 1. Principios base

1. **Separar UI, negocio y acceso a datos.**
2. **Mantener la logica de negocio en server.**
3. **Evitar que la UI conozca detalles de Supabase.**
4. **Organizar por dominio funcional, no solo por tipo de archivo.**
5. **Empezar simple y extraer modulos cuando aparezca duplicacion real.**

---

## 2. Estructura recomendada

```txt
app/
  (public)/
    auth/
  (private)/
    dashboard/
    quiz/
  api/
  layout.tsx
  page.tsx
  proxy.ts

features/
  auth/
    components/
    actions/
    schemas/
    types.ts
  quiz/
    components/
    actions/
    services/
    schemas/
    types.ts
  attempts/
    actions/
    services/
    types.ts

lib/
  supabase/
    client.ts
    server.ts
    admin.ts
    proxy.ts
  shared/
    errors.ts
    result.ts
    constants.ts

components/
  ui/
  layout/

docs/
```

### Nota
Si el proyecto aun es pequeno, `features/` puede introducirse gradualmente, empezando por mover solo `quiz`.

---

## 3. Capas y responsabilidades

## 3.1 Capa de presentacion (App Router + componentes)

Ubicacion: `app/` + `features/*/components`

Responsabilidades:
- renderizar UI
- manejar estado de pantalla (loading, error, empty, success)
- llamar acciones de dominio

No debe:
- ejecutar queries SQL directas
- contener reglas de negocio complejas

## 3.2 Capa de aplicacion (actions)

Ubicacion: `features/*/actions`

Responsabilidades:
- coordinar casos de uso (crear quiz, iniciar intento, completar intento)
- validar entrada
- invocar servicios/repositorios
- devolver resultados tipados

## 3.3 Capa de dominio/servicios

Ubicacion: `features/*/services`

Responsabilidades:
- reglas de negocio puras
- calculos reutilizables (porcentaje, scoring, estado de intento)
- transformacion/mapeo de datos

## 3.4 Capa de infraestructura (Supabase)

Ubicacion: `lib/supabase/*`

Responsabilidades:
- creacion de clientes (browser/server/admin)
- middleware de sesion
- acceso a base de datos desde acciones server

---

## 4. Flujo recomendado de una funcionalidad

Ejemplo: **Completar un quiz**

1. UI (`/quiz/[id]/take`) recolecta respuestas.
2. Llama `completeQuizAttemptAction(input)`.
3. Action valida input (`zod`).
4. Service calcula score y arma resultado.
5. Repo/infra guarda respuestas e intento en Supabase.
6. Action devuelve resultado tipado.
7. UI redirecciona a resultados.

---

## 5. Convenciones practicas

## 5.1 Naming

- Acciones: `verbNounAction` (`createQuizAction`, `getUserAttemptsAction`)
- Servicios: `verbNoun` (`calculateScore`, `buildAttemptSummary`)
- Schemas: `nounSchema` (`createQuizSchema`)
- Tipos: `NounDto` o `NounViewModel` cuando aplique

## 5.2 Validaciones

- Validar siempre en server aunque exista validacion cliente.
- Reutilizar schemas compartidos cuando sea posible.

## 5.3 Errores

- Estandarizar errores de negocio (`UnauthorizedError`, `ValidationError`, `NotFoundError`).
- No exponer detalles internos de infraestructura a la UI.

## 5.4 Seguridad

- `admin.ts` solo para procesos administrativos.
- Rutas admin protegidas por entorno y/o token interno.
- Mantener secretos unicamente en server.

---

## 6. Minimo estandar para nuevos modulos

Cada nuevo modulo deberia incluir, como minimo:

1. `types.ts`
2. `schemas.ts` (entrada/salida)
3. `actions/` con casos de uso principales
4. `services/` para reglas reutilizables
5. 1 pagina + 1 componente contenedor
6. pruebas basicas de flujo critico

---

## 7. Roadmap de adopcion (sin romper lo existente)

## Fase 1 - Orden rapido (1-2 sesiones)

- Crear carpeta `features/quiz`.
- Mover logica de quiz desde `lib/actions.ts` a `features/quiz/actions`.
- Mantener exports puente para no romper imports actuales.

## Fase 2 - Validacion y contratos

- Introducir `zod` para entradas de acciones.
- Definir tipos DTO/ViewModel por pantalla clave.

## Fase 3 - Escalado controlado

- Separar `attempts` en su propio feature.
- Estandarizar manejo de errores.
- Agregar tests de integracion para flujos criticos.

---

## 8. Checklist breve para decisiones futuras

Antes de agregar codigo nuevo, validar:

- Esta logica pertenece a UI o a negocio?
- Esta validada en server?
- Usa el cliente Supabase correcto (browser/server/admin)?
- Repite comportamiento ya existente en otro modulo?
- Queda facil de testear y mantener?

---

## 9. Resultado esperado al aplicar esta arquitectura

- Menor acoplamiento entre pantallas y datos.
- Menos regresiones al crecer funcionalidades.
- Mejor onboarding de nuevos desarrolladores.
- Evolucion gradual sin reescritura completa.
