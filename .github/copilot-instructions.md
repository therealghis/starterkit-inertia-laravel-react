# GitHub Copilot Instructions

This repository is a Laravel 12 + Inertia React + TypeScript starter kit.

## Core Stack
- PHP `^8.4`
- Laravel `12`
- Inertia.js React `v2`
- Laravel Fortify
- Laravel Wayfinder
- Laravel Sail / Docker
- Tailwind CSS
- `shadcn/ui`

## UI Rules
- Use `shadcn/ui` as the base UI library for frontend work.
- Reusable `shadcn/ui` primitives live in `resources/js/components/ui`.
- Application-level composed components live in `resources/js/components`.
- Reuse existing components before creating new ones.
- Do not introduce another component library if an existing `shadcn/ui` primitive or project component can be reused.

## Inertia Form Rules
- For Inertia forms, use `<Form>` from `@inertiajs/react` or `useForm` from `@inertiajs/react`.
- Do not use React Hook Form or another generic React `useForm` pattern for forms that submit through Inertia.
- If a form uses Inertia validation errors, redirects, reset behavior, or server-side submission, it must be wired with Inertia form helpers.

## Wayfinder Rules
- Use generated routes/actions from `@/routes` and `@/actions`.
- Prefer named imports.
- Regenerate Wayfinder types after route changes:
```bash
php artisan wayfinder:generate --with-form --no-interaction
```

## Localization
- Use Laravel's standard translation system.
- Backend translations should use Laravel translation files in `lang/`.
- Frontend translations are exposed through Inertia shared props.
- Use `useTranslations()` from `resources/js/hooks/use-translations.ts` for frontend strings.

## Error Handling
- Kraken is the global Laravel exception handler.
- Do not replace or bypass the existing exception handling setup.
- UI error pages are rendered through Inertia.

## Verification
- If PHP files change, run:
```bash
vendor/bin/pint --dirty --format agent
```
- For frontend changes, verify with:
```bash
npm run types:check
npm run build
```
