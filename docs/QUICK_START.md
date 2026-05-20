# Guía Rápida - Quiz Master

## Primer Paso: Verificar las Variables de Entorno

1. Asegúrate de que tu proyecto Supabase esté conectado en v0
2. Las variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` deben estar configuradas

## Segundo Paso: Cargar las Preguntas

1. La aplicación ya tiene tu archivo JSON de preguntas en `data/questions.json`
2. Para cargar las preguntas en la base de datos:
   - Abre tu navegador en `http://localhost:3000/admin/load-data`
   - Haz clic en "Load Questions from JSON"
   - Espera a que se complete la carga

## Tercer Paso: Crear tu Cuenta

1. Accede a `http://localhost:3000/auth/sign-up`
2. Registra tu email y contraseña
3. Se creará tu perfil automáticamente

## Cuarto Paso: Crear tu Primer Cuestionario

1. En el Dashboard, haz clic en "Create Quiz"
2. Ingresa el título y descripción
3. Haz clic en "Create Quiz"
4. Se abrirá la página de edición del cuestionario

## Quinto Paso: Agregar Preguntas al Cuestionario

1. En la página de edición, busca preguntas en el panel derecho
2. Usa el campo de búsqueda para encontrar preguntas por nombre o ID
3. Haz clic en el botón "+" para agregar una pregunta
4. Las preguntas aparecerán en el listado del cuestionario
5. Puedes remover preguntas con el botón "X"

## Sexto Paso: Tomar el Cuestionario

1. Desde el Dashboard, haz clic en "Take Quiz" en tu cuestionario
2. Responde cada pregunta seleccionando una opción
3. Usa "Next" y "Previous" para navegar
4. Los números de preguntas en la parte inferior muestran tu progreso
5. Cuando termines, haz clic en "Submit Quiz"

## Ver Resultados

1. Después de enviar, verás tu puntuación inmediatamente
2. Puedes revisar cada respuesta y ver la respuesta correcta
3. Desde los resultados, puedes volver al Dashboard o repetir el cuestionario

## Características Principales

### Dashboard
- **Total Quizzes**: Número de cuestionarios creados
- **Completed Attempts**: Cuestionarios completados
- **Average Score**: Promedio de tus puntuaciones
- **Recent Attempts**: Historial de tus últimos intentos

### Crear Cuestionario
- Define un título único
- Agrega una descripción opcional
- Selecciona las preguntas que desees

### Editar Cuestionario
- Modifica título y descripción
- Agrega más preguntas
- Elimina preguntas existentes
- Busca preguntas fácilmente

### Tomar Cuestionario
- Visualización clara de la pregunta actual
- Barra de progreso
- Indicador de preguntas respondidas
- Navegación fluida

## Consejos

1. **Búsqueda de Preguntas**: Puedes buscar por ID de pregunta o por palabras en el texto de la pregunta
2. **Progreso**: Los números de pregunta en azul indican preguntas ya respondidas
3. **Revisión**: Siempre puedes revisar tus respuestas después de completar
4. **Historial**: Tu historial de intentos está disponible en el panel derecho del Dashboard

## Estructura de tu Primer Cuestionario (Ejemplo)

1. Haz clic en "Create Quiz"
2. Nombre: "Evaluación Inicial"
3. Descripción: "Mi primer cuestionario de práctica"
4. Agrega 10-20 preguntas haciendo búsquedas
5. Haz clic en "Take Quiz" para comenzar

## Solución de Problemas

**P: Las preguntas no se cargan**
- Verifica que el archivo `data/questions.json` existe
- Intenta nuevamente en `/admin/load-data`

**P: No puedo crear un cuestionario**
- Asegúrate de estar autenticado
- Verifica que el titulo no esté vacío

**P: Las preguntas no aparecen cuando busco**
- Asegúrate de haber cargado las preguntas primero
- Intenta con IDs numéricos (ej: "1", "2", "3")

¡Disfruta aprendiendo con Quiz Master! 🎓
