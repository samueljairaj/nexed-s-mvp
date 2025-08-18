Signup tests use React Testing Library with Vitest-style APIs.
- If your project uses Jest, replace the Vitest imports with Jest globals and remove the 'vi.' prefixes.
- Mocks: AuthContext (useAuth), React Router DOM (useNavigate), Sonner (toast), and Supabase client (signInWithOAuth).
- Scenarios covered: validation, password strength, success flow, error flows, OAuth behaviors, UI toggles, and error clearing.

If you already have a custom test setup (e.g., setupTests.ts) or a custom render helper that wraps providers, update the import and the render() helper accordingly.