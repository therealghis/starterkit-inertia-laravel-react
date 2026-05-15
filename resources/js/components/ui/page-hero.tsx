import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const pageHeroVariants = cva(
    'relative overflow-hidden rounded-[2rem] border border-border/70 bg-linear-to-br shadow-lg',
    {
        variants: {
            tone: {
                primary:
                    'from-card via-[color:var(--chart-1)]/10 to-[color:var(--chart-2)]/12',
                support:
                    'from-card via-[color:var(--chart-3)]/8 to-[color:var(--chart-4)]/18',
                admin: 'from-card via-[color:var(--chart-2)]/8 to-[color:var(--chart-5)]/14',
                security:
                    'from-card via-[color:var(--chart-5)]/10 to-[color:var(--chart-1)]/10',
            },
        },
        defaultVariants: {
            tone: 'primary',
        },
    },
);

const pageHeroGlowVariants = cva(
    'pointer-events-none absolute inset-0 opacity-80',
    {
        variants: {
            tone: {
                primary:
                    'bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--color-chart-1)_18%,transparent),transparent_34%),radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--color-chart-2)_14%,transparent),transparent_28%)]',
                support:
                    'bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--color-chart-2)_14%,transparent),transparent_34%),radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--color-chart-4)_18%,transparent),transparent_30%)]',
                admin:
                    'bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--color-chart-2)_16%,transparent),transparent_34%),radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--color-chart-5)_14%,transparent),transparent_30%)]',
                security:
                    'bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--color-chart-5)_18%,transparent),transparent_32%),radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--color-chart-1)_14%,transparent),transparent_30%)]',
            },
        },
        defaultVariants: {
            tone: 'primary',
        },
    },
);

function PageHero({
    className,
    tone,
    children,
    ...props
}: React.ComponentProps<'section'> & VariantProps<typeof pageHeroVariants>) {
    return (
        <section
            data-slot="page-hero"
            className={cn(pageHeroVariants({ tone }), className)}
            {...props}
        >
            <div
                data-slot="page-hero-glow"
                className={pageHeroGlowVariants({ tone })}
            />
            {children}
        </section>
    );
}

function PageHeroBody({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="page-hero-body"
            className={cn(
                'relative grid gap-6 px-6 py-6 md:grid-cols-[minmax(0,1fr)_auto] md:px-8',
                className,
            )}
            {...props}
        />
    );
}

function PageHeroContent({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="page-hero-content"
            className={cn('relative z-10 space-y-4', className)}
            {...props}
        />
    );
}

function PageHeroEyebrow({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="page-hero-eyebrow"
            className={cn('flex flex-wrap items-center gap-2', className)}
            {...props}
        />
    );
}

function PageHeroTitle({
    className,
    ...props
}: React.ComponentProps<'h1'>) {
    return (
        <h1
            data-slot="page-hero-title"
            className={cn(
                'text-3xl font-semibold tracking-tight md:text-4xl',
                className,
            )}
            {...props}
        />
    );
}

function PageHeroDescription({
    className,
    ...props
}: React.ComponentProps<'p'>) {
    return (
        <p
            data-slot="page-hero-description"
            className={cn(
                'max-w-2xl text-sm leading-6 text-muted-foreground',
                className,
            )}
            {...props}
        />
    );
}

function PageHeroAside({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="page-hero-aside"
            className={cn('relative z-10 flex flex-col gap-3 md:items-end', className)}
            {...props}
        />
    );
}

function PageHeroStats({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="page-hero-stats"
            className={cn('flex flex-wrap gap-3', className)}
            {...props}
        />
    );
}

function PageHeroActions({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="page-hero-actions"
            className={cn('flex flex-wrap gap-3', className)}
            {...props}
        />
    );
}

function PageHeroStat({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="page-hero-stat"
            className={cn(
                'min-w-[148px] rounded-[1.35rem] border border-border/60 bg-background/72 px-4 py-3 shadow-xs backdrop-blur-md',
                className,
            )}
            {...props}
        />
    );
}

function PageHeroStatLabel({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="page-hero-stat-label"
            className={cn(
                'text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground',
                className,
            )}
            {...props}
        />
    );
}

function PageHeroStatValue({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="page-hero-stat-value"
            className={cn(
                'mt-2 text-2xl font-semibold tracking-tight text-foreground',
                className,
            )}
            {...props}
        />
    );
}

export {
    PageHero,
    PageHeroAside,
    PageHeroActions,
    PageHeroBody,
    PageHeroContent,
    PageHeroDescription,
    PageHeroEyebrow,
    PageHeroStat,
    PageHeroStatLabel,
    PageHeroStats,
    PageHeroStatValue,
    PageHeroTitle,
};
