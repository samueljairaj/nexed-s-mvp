/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_SUPABASE_URL: string;
	readonly VITE_SUPABASE_ANON_KEY: string;
	readonly VITE_ENVIRONMENT?: 'development' | 'test' | 'staging' | 'production';
	readonly VITE_CHECKLIST_SOURCE?: 'code' | 'db';
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
