# My Resume AI

**My Resume AI** es una extensión de navegador diseñada para potenciar tu búsqueda de empleo. Utiliza la inteligencia artificial de **Google Gemini** para analizar ofertas de trabajo y optimizar tu CV en formato **LaTeX** automáticamente, asegurando que destaques en los sistemas de seguimiento de candidatos (ATS).

## 🚀 Características Principales

### 1. Integración con IA (Gemini)
- Conecta directamente con la API de Gemini.
- Envía tu CV (LaTeX) y la descripción del trabajo en un solo prompt.
- Recibe un CV optimizado con palabras clave relevantes y un resumen de los cambios realizados.

### 2. Generación de PDF
- Convierte automáticamente el código LaTeX optimizado por la IA en un documento PDF listo para descargar y enviar.

### 3. Captura de Ofertas de Trabajo
Captura la información de las vacantes de tres formas sencillas:
- **Menú Contextual:** Selecciona el texto de la oferta, haz clic derecho y elige la opción de la extensión.
- **Detección Automática:** Identifica texto relevante subrayado en la página.
- **Entrada Manual:** Pega la descripción del trabajo directamente en la extensión.

### 4. Gestión de CVs
- Guarda múltiples versiones de tu CV (nombre y código LaTeX) en el almacenamiento local.
- Selecciona fácilmente qué versión utilizar para cada aplicación desde un menú desplegable.

### 5. Configuración y Privacidad
- **Tu llave, tus datos:** Configura tu propia API Key de Gemini.
- **Almacenamiento Local:** Tus CVs y configuraciones se guardan en `localStorage`, manteniendo tus datos en tu dispositivo.
- **Historial:** (En desarrollo) Mantén un registro de las ofertas a las que has aplicado.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React + Vite
- **IA:** Google Gemini API
- **Formatos:** LaTeX (para documentos de alta calidad)
- **Plataforma:** Web Extension (Manifest V3)

## 📦 Instalación y Uso

1. Clona el repositorio.
2. Instala las dependencias: `npm install`.
3. Construye la extensión: `npm run build`.
4. Carga la carpeta `dist` en tu navegador como extensión descomprimida (Developer Mode).
