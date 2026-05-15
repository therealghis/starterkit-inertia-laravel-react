import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const appCardVariants = cva(
    '@container/card border-border/70 bg-linear-to-br shadow-sm',
    {
        variants: {
            tone: {
                default: 'from-card to-muted/20',
                primary: 'from-card to-[color:var(--chart-1)]/8',
                support: 'from-card to-[color:var(--chart-3)]/8',
                accent: 'from-card to-[color:var(--chart-4)]/10',
                caution: 'from-card to-[color:var(--chart-5)]/10',
            },
        },
        defaultVariants: {
            tone: 'default',
        },
    },
);

function AppCard({
    className,
    tone,
    ...props
}: React.ComponentProps<'div'> & VariantProps<typeof appCardVariants>) {
    return (
        <div
            data-slot="app-card"
            className={cn(
                'flex flex-col gap-6 rounded-[1.6rem] border py-4',
                appCardVariants({ tone }),
                className,
            )}
            {...props}
        />
    );
}

function AppCardHeader({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="app-card-header"
            className={cn(
                'grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6',
                className,
            )}
            {...props}
        />
    );
}

function AppCardTitle({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="app-card-title"
            className={cn('leading-none font-semibold', className)}
            {...props}
        />
    );
}

function AppCardDescription({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="app-card-description"
            className={cn('text-sm text-muted-foreground', className)}
            {...props}
        />
    );
}

function AppCardContent({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="app-card-content"
            className={cn('px-6', className)}
            {...props}
        />
    );
}

function AppCardFooter({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="app-card-footer"
            className={cn('flex items-center px-6', className)}
            {...props}
        />
    );
}

function AppCardIcon({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="app-card-icon"
            className={cn(
                'flex size-10 items-center justify-center rounded-2xl border border-border/60 bg-background/75 shadow-xs',
                className,
            )}
            {...props}
        />
    );
}

export {
    AppCard,
    AppCardContent,
    AppCardDescription,
    AppCardFooter,
    AppCardHeader,
    AppCardIcon,
    AppCardTitle,
};
