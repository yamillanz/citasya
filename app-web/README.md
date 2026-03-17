# AppWeb

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.4.

## Flujo de Trabajo - OpenSpec

Este proyecto usa **OpenSpec** para gestionar el desarrollo por fases.

### Comandos OpenSpec

| Comando | Descripción |
|---------|-------------|
| `/opsx:propose <nombre-fase>` | Crear nueva propuesta y artefactos |
| `/opsx:apply` | Implementar tareas del change activo |
| `/opsx:verify` | Verificar implementación contra specs |
| `/opsx:archive` | Archivar change completado |

### Progreso del Proyecto

| Fase | Estado |
|------|--------|
| Phase 1: Foundation | ✅ Completada |
| Phase 2: Public Booking | ✅ Completada |
| Phase 3: Back Office Manager | ⏳ Pendiente |

Ver `PROGRESS.md` para detalles completos.

---

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

Este proyecto usa **Jest** + **Testing Library** para testing.

```bash
npm test              # Ejecutar tests
npm run test:watch   # Modo watch
npm run test:coverage # Con coverage
```

Ver `docs/TESTING.md` para estrategia de testing.

---

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
