# ESLint Auto-Fix on Save Configuration

This document explains the ESLint and Prettier configuration for automatic code formatting and linting when saving files in VS Code.

## What's Configured

### 1. VS Code Settings (`.vscode/settings.json`)

- **Auto-fix on save**: ESLint will automatically fix issues when you save files
- **Format on save**: Prettier will format your code on save
- **Multi-directory support**: Works for both `frontend` and `backend` directories
- **File type validation**: Supports JavaScript, TypeScript, JSX, and TSX files

### 2. ESLint Configurations

- **Frontend**: Next.js ESLint config with Prettier integration
- **Backend**: NestJS ESLint config with TypeScript and Prettier

### 3. Prettier Configurations

- Consistent formatting rules across the entire project
- Single quotes, trailing commas, 2-space indentation

## Required VS Code Extensions

The following extensions will be automatically recommended when you open the project:

1. **ESLint** (`dbaeumer.vscode-eslint`) - Provides ESLint integration
2. **Prettier** (`esbenp.prettier-vscode`) - Code formatter
3. **TypeScript** (`ms-vscode.vscode-typescript-next`) - Enhanced TypeScript support

## How It Works

### Automatic Actions on Save:

1. **ESLint** runs and fixes auto-fixable issues
2. **Prettier** formats the code according to the style rules
3. **TypeScript** checks for type errors (shown in problems panel)

### Manual Commands Available:

#### Frontend:

```bash
cd frontend
npm run lint          # Check for linting issues
npm run lint:fix       # Fix auto-fixable linting issues
npm run format         # Format all files with Prettier
npm run format:check   # Check if files are properly formatted
```

#### Backend:

```bash
cd backend
npm run lint          # Check and fix linting issues
npm run format        # Format all files with Prettier
```

## File Types Supported

The configuration works with:

- `.js` - JavaScript files
- `.jsx` - React JavaScript files
- `.ts` - TypeScript files
- `.tsx` - React TypeScript files
- `.json` - JSON files
- `.css` - CSS files
- `.md` - Markdown files

## Configuration Files

### ESLint Configs:

- `frontend/eslint.config.mjs` - Next.js + Prettier rules
- `backend/eslint.config.mjs` - NestJS + TypeScript + Prettier rules

### Prettier Configs:

- `.prettierrc` - Root configuration
- `frontend/.prettierrc` - Frontend-specific rules
- `backend/.prettierrc` - Backend-specific rules

### VS Code Configs:

- `.vscode/settings.json` - Workspace settings
- `.vscode/extensions.json` - Recommended extensions

## Troubleshooting

### If auto-fix doesn't work:

1. Make sure the ESLint extension is installed and enabled
2. Check the VS Code output panel for ESLint errors
3. Restart VS Code
4. Run `npm install` in both frontend and backend directories

### If formatting doesn't work:

1. Make sure the Prettier extension is installed
2. Check if there are syntax errors in your code
3. Verify the file type is supported

### If you see conflicts between ESLint and Prettier:

The configuration is set up to avoid conflicts, but if you encounter any:

1. Check that `eslint-config-prettier` is installed
2. Verify the ESLint config extends Prettier rules

## Customization

### To modify formatting rules:

Edit the `.prettierrc` files in the root, frontend, or backend directories.

### To modify linting rules:

Edit the `eslint.config.mjs` files in the frontend or backend directories.

### To change VS Code behavior:

Edit `.vscode/settings.json` to modify auto-save behavior or add more file types.

## Testing the Setup

1. Open any `.ts`, `.tsx`, `.js`, or `.jsx` file
2. Add some formatting issues (extra spaces, missing semicolons, etc.)
3. Save the file (Ctrl+S)
4. The file should automatically be formatted and linted

The setup is now complete and ready to use!
