import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentOrParentUrl, isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const itemHref = item.href;
                        const itemIsActive = itemHref
                            ? isCurrentOrParentUrl(itemHref)
                            : item.items?.some((childItem) => childItem.href && isCurrentUrl(childItem.href)) ?? false;

                        return (
                            <SidebarMenuItem key={item.title}>
                                {itemHref && !item.disabled ? (
                                    <SidebarMenuButton
                                        asChild
                                        isActive={itemIsActive}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={itemHref} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                ) : (
                                    <SidebarMenuButton
                                        isActive={itemIsActive}
                                        tooltip={{ children: item.title }}
                                        className="cursor-default opacity-70 hover:bg-transparent hover:text-inherit"
                                    >
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                )}

                                {item.items?.length ? (
                                    <SidebarMenuSub>
                                        {item.items.map((childItem) => (
                                            <SidebarMenuSubItem key={`${item.title}-${childItem.title}`}>
                                                {childItem.href && !childItem.disabled ? (
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={isCurrentUrl(childItem.href)}
                                                    >
                                                        <Link href={childItem.href} prefetch>
                                                            <span>{childItem.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                ) : (
                                                    <SidebarMenuSubButton
                                                        asChild={false}
                                                        isActive={false}
                                                        className="cursor-default opacity-50 hover:bg-transparent hover:text-inherit"
                                                    >
                                                        <span>{childItem.title}</span>
                                                    </SidebarMenuSubButton>
                                                )}
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                ) : null}
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
