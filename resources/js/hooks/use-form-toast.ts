import { useCallback } from 'react';
import { toast } from 'sonner';

type ErrorBag = Record<string, unknown>;

type UseFormToastOptions = {
    successMessage: string;
    errorMessage: string;
    successDescription?: string;
    errorDescription?: string;
};

const extractFirstErrorMessage = (value: unknown): string | null => {
    if (typeof value === 'string') {
        const trimmedValue = value.trim();

        return trimmedValue === '' ? null : trimmedValue;
    }

    if (Array.isArray(value)) {
        for (const entry of value) {
            const message = extractFirstErrorMessage(entry);

            if (message !== null) {
                return message;
            }
        }

        return null;
    }

    if (typeof value === 'object' && value !== null) {
        for (const entry of Object.values(value)) {
            const message = extractFirstErrorMessage(entry);

            if (message !== null) {
                return message;
            }
        }
    }

    return null;
};

export function useFormToast({
    successMessage,
    errorMessage,
    successDescription,
    errorDescription,
}: UseFormToastOptions) {
    const notifySuccess = useCallback((): void => {
        toast.success(successMessage, {
            description: successDescription,
        });
    }, [successDescription, successMessage]);

    const notifyError = useCallback(
        (errors?: ErrorBag): void => {
            toast.error(errorMessage, {
                description:
                    extractFirstErrorMessage(errors) ?? errorDescription,
            });
        },
        [errorDescription, errorMessage],
    );

    return {
        notifySuccess,
        notifyError,
    };
}
