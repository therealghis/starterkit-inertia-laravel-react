import { usePage } from '@inertiajs/react';

type Replacements = Record<string, string | number>;

export function useTranslations() {
    const { locale, locales, translations } = usePage().props as {
        locale: string;
        locales: Record<string, string>;
        translations: Record<string, string>;
    };

    const t = (key: string, replacements: Replacements = {}): string => {
        let translation = translations[key] ?? key;

        Object.entries(replacements).forEach(([replacementKey, value]) => {
            translation = translation.replaceAll(`:${replacementKey}`, String(value));
        });

        return translation;
    };

    return {
        locale,
        locales,
        t,
    };
}
