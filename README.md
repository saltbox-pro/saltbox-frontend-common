# Salt.Box Frontend Common

Shared components, utilities, and UI elements for the Salt.Box microfrontend architecture.

## Overview

This package provides common functionality used across Salt.Box microfrontends:
- `saltbox-frontend-core` (Core application functionality)
- `saltbox-frontend-base` (Base components and utilities)
- `saltbox-frontend-gateway` (API gateway and routing)

## Development Setup

### Local Development with Linking

When you need to test changes in consuming applications **before publishing**, use the linking system:

1. **Start watch mode in this repository**:
   ```bash
   yarn build:watch
   ```
   
   This continuously rebuilds the package as you make changes, ensuring consuming applications always have the latest version.

2. **Configure linking in consuming packages**:
   ```bash
   # In saltbox-frontend-core/, saltbox-frontend-base/, or saltbox-frontend-gateway/
   cp example.env .env
   # Edit .env and set: COMMON_REPO_PATH=../saltbox-frontend-common
   yarn start
   ```

3. **Development workflow**:
   - Make changes in this repository
   - `yarn build:watch` automatically rebuilds
   - Consuming applications' webpack dev servers automatically reload
   - Test your changes immediately

## Build Commands

### `yarn build`
- **Purpose**: Creates a production build for publishing or final deployment
- **Output**: `dist/saltbox-frontend-common.es.js` and TypeScript definitions
- **When to use**: 
  - Before publishing a new version to npm
  - For final testing before release
  - When you don't need continuous rebuilding

### `yarn build:watch`
- **Purpose**: Continuously rebuilds the package when source files change
- **Output**: Same as `yarn build`, but automatically regenerated
- **When to use**:
  - During active development with linked consuming packages
  - When testing changes across multiple microfrontends
  - For real-time development workflow

**Important**: Keep `yarn build:watch` running in a separate terminal while developing. Consuming applications depend on the built files in `dist/`, not the source files.

## Linking System Architecture

The Salt.Box linking system uses **webpack aliases** instead of traditional `yarn link`:

```
saltbox-frontend-common/
├── src/ (source files)
├── dist/ (built files) ←── Consuming packages import from here
└── package.json

saltbox-frontend-core/
├── webpack.dev.config.js ←── Configures alias to ../saltbox-frontend-common
├── .env ←── COMMON_REPO_PATH=../saltbox-frontend-common
└── node_modules/
    └── react/ ←── Forced singleton to prevent conflicts
```

### How It Works

1. **Environment Variable**: `COMMON_REPO_PATH` tells webpack where to find the local common package
2. **Webpack Alias**: Redirects `@saltbox/saltbox-frontend-common` imports to your local `dist/` folder
3. **React Singleton**: Forces all packages to use the same React instance (prevents hooks errors)
4. **CSS Processing**: Handles stylesheets from the linked package
5. **Automatic Fallback**: Uses npm package when linking is not configured

### Benefits Over `yarn link`

- ✅ **No React conflicts**: Enforced singleton prevents hooks violations
- ✅ **Selective linking**: Only affects packages that need it
- ✅ **Clean unlinking**: Just remove environment variable
- ✅ **Hot reload**: Works seamlessly with webpack dev server
- ✅ **CSS support**: Handles stylesheets from linked packages

## Troubleshooting

### Changes Not Reflecting in Consuming Apps
- Ensure `yarn build:watch` is running in this repository
- Check that `COMMON_REPO_PATH` is set correctly in the consuming package's `.env`
- Restart the consuming package's development server

### React Hooks Errors When Linking
The webpack configuration automatically handles React singletons. If you see hooks errors, verify that:
- You're using the linking system (not `yarn link`)
- The consuming package has the React aliases configured in `webpack.dev.config.js`
