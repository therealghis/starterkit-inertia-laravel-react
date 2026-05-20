import { Form, Head } from '@inertiajs/react';
import { ShieldBan, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFormToast } from '@/hooks/use-form-toast';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { disable, enable, show } from '@/routes/two-factor';
import type { BreadcrumbItem } from '@/types';

type Props = {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Two-factor authentication',
        href: show(),
    },
];

export default function TwoFactor({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: Props) {
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const enableTwoFactorToast = useFormToast({
        successMessage: 'Two-factor authentication started',
        successDescription: 'Complete the setup to secure your account.',
        errorMessage: 'Unable to enable two-factor authentication',
        errorDescription: 'Try again in a moment.',
    });
    const disableTwoFactorToast = useFormToast({
        successMessage: 'Two-factor authentication disabled',
        successDescription: 'Your account no longer requires a verification code.',
        errorMessage: 'Unable to disable two-factor authentication',
        errorDescription: 'Try again in a moment.',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Two-factor authentication" />

            <h1 className="sr-only">Two-factor authentication settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Two-factor authentication"
                        description="Manage your two-factor authentication settings"
                    />
                    {twoFactorEnabled ? (
                        <div className="flex flex-col items-start justify-start space-y-4">
                            <Badge variant="default">Enabled</Badge>
                            <p className="text-muted-foreground">
                                With two-factor authentication enabled, you will
                                be prompted for a secure, random pin during
                                login, which you can retrieve from the
                                TOTP-supported application on your phone.
                            </p>

                            <TwoFactorRecoveryCodes
                                recoveryCodesList={recoveryCodesList}
                                fetchRecoveryCodes={fetchRecoveryCodes}
                                errors={errors}
                            />

                            <div className="relative inline">
                                <Form
                                    {...disable.form()}
                                    onSuccess={disableTwoFactorToast.notifySuccess}
                                    onError={disableTwoFactorToast.notifyError}
                                >
                                    {({ processing }) => (
                                        <Button
                                            variant="destructive"
                                            type="submit"
                                            disabled={processing}
                                        >
                                            <ShieldBan /> Disable 2FA
                                        </Button>
                                    )}
                                </Form>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-start justify-start space-y-4">
                            <Badge variant="destructive">Disabled</Badge>
                            <p className="text-muted-foreground">
                                When you enable two-factor authentication, you
                                will be prompted for a secure pin during login.
                                This pin can be retrieved from a TOTP-supported
                                application on your phone.
                            </p>

                            <div>
                                {hasSetupData ? (
                                    <Button
                                        onClick={() => setShowSetupModal(true)}
                                    >
                                        <ShieldCheck />
                                        Continue setup
                                    </Button>
                                ) : (
                                    <Form
                                        {...enable.form()}
                                        onSuccess={() => {
                                            enableTwoFactorToast.notifySuccess();
                                            setShowSetupModal(true);
                                        }}
                                        onError={enableTwoFactorToast.notifyError}
                                    >
                                        {({ processing }) => (
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                <ShieldCheck />
                                                Enable 2FA
                                            </Button>
                                        )}
                                    </Form>
                                )}
                            </div>
                        </div>
                    )}

                    <TwoFactorSetupModal
                        isOpen={showSetupModal}
                        onClose={() => setShowSetupModal(false)}
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                        qrCodeSvg={qrCodeSvg}
                        manualSetupKey={manualSetupKey}
                        clearSetupData={clearSetupData}
                        fetchSetupData={fetchSetupData}
                        errors={errors}
                    />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
