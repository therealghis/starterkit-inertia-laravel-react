import * as React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

function SegmentedTabsList({
    className,
    ...props
}: React.ComponentProps<typeof TabsList>) {
    return (
        <TabsList
            variant="line"
            className={cn(
                'w-fit overflow-hidden rounded-[1.5rem] border border-border/70 bg-background/78 p-1.5 shadow-sm backdrop-blur-sm',
                className,
            )}
            {...props}
        />
    );
}

function SegmentedTabsTrigger({
    className,
    ...props
}: React.ComponentProps<typeof TabsTrigger>) {
    return (
        <TabsTrigger
            className={cn(
                'min-h-11 rounded-[1rem] px-5 py-2.5 text-sm font-semibold text-foreground/72',
                'hover:bg-background/62 hover:text-foreground',
                'group-data-[variant=line]/tabs-list:border-transparent',
                'group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent',
                'group-data-[variant=line]/tabs-list:data-[state=active]:bg-accent/95',
                'group-data-[variant=line]/tabs-list:data-[state=active]:text-foreground',
                'group-data-[variant=line]/tabs-list:data-[state=active]:shadow-sm',
                'group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-0',
                className,
            )}
            {...props}
        />
    );
}

export { SegmentedTabsList, SegmentedTabsTrigger };
