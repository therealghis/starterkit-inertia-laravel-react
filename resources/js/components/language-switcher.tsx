import { router } from '@inertiajs/react';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';

export function LanguageSwitcher() {
    const { locale, locales, t } = useTranslations();

    return (
        <div className="flex items-center gap-2">
            <Languages className="size-4 text-muted-foreground" />
            <span className="sr-only">{t('Language')}</span>
            {Object.entries(locales).map(([code, label]) => {
                return (
                    <Button
                        key={code}
                        type="button"
                        variant={locale === code ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() =>
                            router.put(
                                `/locale/${code}`,
                                {},
                                {
                                    preserveScroll: true,
                                    preserveState: true,
                                },
                            )
                        }
                    >
                        {t(label)}
                    </Button>
                );
            })}
        </div>
    );
}
