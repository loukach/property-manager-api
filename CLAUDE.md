# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Run (dev): `npm run dev` - Starts development server with hot reload
- Run (prod): `npm start` - Runs JavaScript directly 
- Tests: `npm test` - Runs all tests
- Single test: `npx jest tests/filename.test.js` - Run specific test file

## Code Style Guidelines
- JavaScript with CommonJS modules
- Use camelCase for variables, functions, and properties
- Use PascalCase for classes
- Prefer async/await over raw Promises/callbacks
- Consistent error handling with try/catch in controllers
- Use express-validator for input validation
- Organize routes with controller pattern
- Express middleware for auth and cross-cutting concerns
- Controllers return structured responses with status codes
- Use Supabase client for database operations