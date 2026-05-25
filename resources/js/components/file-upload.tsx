import { Upload, Trash2 } from 'lucide-react';
import type { DragEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FileUploadProps = {
    name: string;
    files: File[];
    onFilesChange: (files: File[]) => void;
    maxFiles?: number;
    accept?: string;
    disabled?: boolean;
    helperText?: string;
    className?: string;
};

const fileSignature = (file: File) =>
    `${file.name}-${file.size}-${file.lastModified}`;

const mergeFiles = (
    currentFiles: File[],
    incomingFiles: File[],
    maxFiles?: number,
): File[] => {
    const seen = new Set(currentFiles.map(fileSignature));
    const next = [...currentFiles];

    for (const file of incomingFiles) {
        const signature = fileSignature(file);
        if (!seen.has(signature)) {
            seen.add(signature);
            next.push(file);
        }
    }

    if (maxFiles && next.length > maxFiles) {
        return next.slice(0, maxFiles);
    }

    return next;
};

export default function FileUpload({
    name,
    files,
    onFilesChange,
    maxFiles,
    accept,
    disabled,
    helperText,
    className,
}: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const syncInputFiles = useCallback(
        (nextFiles: File[]) => {
            if (!inputRef.current) {
                return;
            }

            if (nextFiles.length === 0) {
                inputRef.current.value = '';
                return;
            }

            const dataTransfer = new DataTransfer();
            nextFiles.forEach((file) => dataTransfer.items.add(file));
            inputRef.current.files = dataTransfer.files;
        },
        [],
    );

    useEffect(() => {
        syncInputFiles(files);
    }, [files, syncInputFiles]);

    const handleFileSelect = useCallback(
        (fileList: FileList | null) => {
            if (!fileList) {
                return;
            }

            const incomingFiles = Array.from(fileList);
            const nextFiles = mergeFiles(files, incomingFiles, maxFiles);
            onFilesChange(nextFiles);
        },
        [files, maxFiles, onFilesChange],
    );

    const handleDrop = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            handleFileSelect(event.dataTransfer.files);
        },
        [handleFileSelect],
    );

    const handleRemove = useCallback(
        (signature: string) => {
            const nextFiles = files.filter(
                (file) => fileSignature(file) !== signature,
            );
            onFilesChange(nextFiles);
        },
        [files, onFilesChange],
    );

    const caption = useMemo(() => {
        if (!maxFiles) {
            return null;
        }

        return `Massimo ${maxFiles} file`;
    }, [maxFiles]);

    return (
        <div className={cn('space-y-3', className)}>
            <div
                className={cn(
                    'flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border p-6 text-center transition',
                    disabled && 'cursor-not-allowed opacity-60',
                )}
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                aria-disabled={disabled}
            >
                <div className="mb-2 rounded-full bg-muted p-3 text-muted-foreground">
                    <Upload className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-foreground">
                    Trascina qui i file
                </p>
                <p className="text-xs text-muted-foreground">
                    oppure clicca per caricare
                </p>
                {caption && (
                    <p className="mt-1 text-xs text-muted-foreground">
                        {caption}
                    </p>
                )}
                {helperText && (
                    <p className="mt-1 text-xs text-muted-foreground">
                        {helperText}
                    </p>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    name={name}
                    accept={accept}
                    multiple
                    disabled={disabled}
                    className="hidden"
                    onChange={(event) => handleFileSelect(event.target.files)}
                />
            </div>

            {files.length > 0 && (
                <ul className="space-y-2 text-sm text-muted-foreground">
                    {files.map((file) => {
                        const signature = fileSignature(file);

                        return (
                            <li
                                key={signature}
                                className="flex items-center justify-between gap-4 rounded-md border border-border/70 px-3 py-2"
                            >
                                <div className="min-w-0">
                                    <p className="break-all font-medium text-foreground">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemove(signature)}
                                >
                                    <Trash2 className="mr-1 h-4 w-4" />
                                    Rimuovi
                                </Button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
