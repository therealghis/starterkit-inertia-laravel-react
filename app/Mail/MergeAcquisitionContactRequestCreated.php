<?php

namespace App\Mail;

use App\Models\MergeAcquisition;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\SerializesModels;

class MergeAcquisitionContactRequestCreated extends Mailable implements ShouldQueue {
    use Queueable;
    use SerializesModels;

    public function __construct(
        public MergeAcquisition $mergeAcquisition,
        public string $requesterName,
        public string $requesterSurname,
        public string $requesterEmail,
        public string $requesterPhone,
    ) {
    }

    public function envelope(): Envelope {
        return new Envelope(
            subject: "Nuova richiesta di contatto per {$this->mergeAcquisition->identification_code}",
        );
    }

    public function content(): Content {
        return new Content(
            view: 'emails.merge-acquisition-contact-request-created',
        );
    }
}
