# My First Project Bootcamp

Proyecto de práctica para aprender desarrollo y despliegue de personalizaciones en **Oracle NetSuite** utilizando **SuiteScript 2.x/2.1** y el **SuiteCloud Development Framework (SDF)**.

El repositorio reúne ejercicios progresivos de un bootcamp: scripts de cliente, eventos de usuario, búsquedas, formularios Suitelet y ejemplos de automatización. El contenido continuará creciendo conforme se agreguen nuevas prácticas.

## 🚀 Características Principales

- Ejemplos de **Client Scripts** para reaccionar a la carga de páginas y a cambios en campos.
- Alertas en la interfaz de NetSuite usando `N/ui/dialog`.
- Consulta del usuario actual mediante `N/runtime`.
- Ejemplo de **User Event Script** con los eventos `beforeLoad`, `beforeSubmit` y `afterSubmit`.
- Automatización de campos de clientes según la categoría seleccionada.
- Ejercicios de integración y aprendizaje con módulos como `N/crypto`, `N/record` y `N/search`.
- Ejemplos de **Suitelet**, **Restlet**, **Map/Reduce** y **Scheduled Script** dentro del material de onboarding.
- Generación de un `deploy.xml` a partir de los archivos modificados en el último commit.

## 🛠 Tecnologías Utilizadas

- **Plataforma:** Oracle NetSuite.
- **Lenguaje:** JavaScript.
- **API:** SuiteScript 2.x y 2.1.
- **Framework de proyecto:** SuiteCloud Development Framework (SDF).
- **Herramientas:** SuiteCloud CLI for Node.js, Node.js y Git.
- **Módulos de NetSuite utilizados:** `N/ui/dialog`, `N/runtime`, `N/log`, `N/record`, `N/search`, `N/crypto` y `N/ui/serverWidget`.

## 📋 Prerrequisitos

Para trabajar con este proyecto se necesita:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) y `npm`.
- [SuiteCloud CLI for Node.js](https://www.npmjs.com/package/@oracle/suitecloud-cli).
- Una cuenta de desarrollo o sandbox de NetSuite con permisos para utilizar SDF y desplegar scripts.
- Una autenticación configurada en SuiteCloud CLI. El proyecto raíz utiliza el perfil `tstdrv2753608` como `defaultAuthId`.
- Bash para ejecutar `generate_deploy_xml.sh` (por ejemplo, Git Bash o WSL en Windows).

## 🔧 Instalación y Configuración

1. Clona el repositorio:

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd my-first-project-bootcamp
   ```

2. Instala SuiteCloud CLI for Node.js siguiendo la [documentación oficial](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4344924195.html).

3. Configura la autenticación para tu cuenta NetSuite. No incluyas credenciales, tokens ni certificados en el repositorio.

4. Verifica que el proyecto raíz use `src` como carpeta de proyecto. Esta configuración se encuentra en `suitecloud.config.js`.

### Estructura del proyecto

```text
my-first-project-bootcamp/
├── project.json
├── suitecloud.config.js
├── src/
│   ├── deploy.xml
│   ├── manifest.xml
│   └── FileCabinet/SuiteScripts/
│       ├── drt_firstscript_cs.js
│       ├── drt_jdnewclientscript_cs.js
│       ├── drt_showinitialmessage_ue.js
│       └── practica_JJ/client-scripts/
│           └── drt_salesOrderCategory_cs.js
└── onboarding-bootcamp-main/
    ├── generate_deploy_xml.sh
    ├── suitecloud.config.js
    └── src/FileCabinet/SuiteScripts/
        ├── drt_bootcamp_2026_cm.js
        ├── drt_bootcamp_2026_cs.js
        ├── drt_bootcamp_2026_mr.js
        ├── drt_bootcamp_2026_rl.js
        ├── drt_bootcamp_2026_sch.js
        ├── drt_bootcamp_2026_sl.js
        ├── drt_bootcamp_2026_ue.js
        └── otros ejercicios de SuiteScript
```

El repositorio contiene dos proyectos SDF independientes:

- **Proyecto raíz:** ejercicios iniciales de `my-first-project-bootcamp`, con manifiesto `ACCOUNTCUSTOMIZATION`.
- **`onboarding-bootcamp-main`:** ejercicios adicionales de onboarding. También usa `src` como carpeta SDF y tiene su propio `manifest.xml`.

## ▶️ Uso y despliegue

Los comandos deben ejecutarse desde la carpeta del proyecto SDF que se desea validar o desplegar.

```bash
# Proyecto raíz
suitecloud project:validate
suitecloud project:deploy
```

Para trabajar con el proyecto de onboarding:

```bash
cd onboarding-bootcamp-main
suitecloud project:validate
suitecloud project:deploy
```

Antes de desplegar, revisa que el `deploy.xml` incluya únicamente los archivos que deseas enviar a NetSuite. El script `generate_deploy_xml.sh` toma los archivos modificados entre `HEAD~1` y `HEAD` y agrega al despliegue los scripts y objetos XML correspondientes.

## 📚 Ejercicios actuales

- **Client Script inicial:** muestra una alerta con el nombre y correo del usuario actual y registra eventos de cambios de campos.
- **User Event:** contiene la estructura base de los eventos de ciclo de vida de un registro.
- **Categoría de cliente:** cuando `custentity_lead_category` tiene el valor `1`, completa `custentity_drt_descripcion_credito_ct` y muestra una alerta de revisión de crédito.
- **Onboarding:** incluye plantillas y ejercicios para los principales tipos de script de NetSuite, además de ejemplos con búsquedas, formularios y procesamiento programado.

## ⚠️ Estado del proyecto

Este es un proyecto de aprendizaje en desarrollo. Algunos scripts son plantillas o ejercicios incompletos y deben probarse en una cuenta de sandbox antes de utilizarse en producción. Las rutas, identificadores de campos y lógica pueden cambiar a medida que se incorporen nuevas prácticas.

## 📝 Próximos pasos

- Documentar cada script con su propósito, registro y eventos asociados.
- Agregar pruebas y casos de validación para cada ejercicio.
- Incorporar nuevos módulos de SuiteScript y personalizaciones de NetSuite.
- Mantener actualizado el `deploy.xml` y esta documentación con cada nueva práctica.
