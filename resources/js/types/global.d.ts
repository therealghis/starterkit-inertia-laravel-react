import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            locale: string;
            locales: Record<string, string>;
            translations: Record<string, string>;
            flash: {
                error?: string;
            };
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
