<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class MergeAcquisitionContactRequestEmailSeeder extends Seeder {
    public function run(): void {
        if (! Schema::hasTable('email_type')) {
            return;
        }

        $body = <<<'BODY'
<p>Gentile operatore,</p>
<p>l'utente {{person_username}} {{person_link}} ha dichiarato interesse per un'opportunità nel modulo M&amp;A all'interno di VG digital.</p>
<p>Dati dell'opportunità:</p>
<p>{{merge_acquisition_list}}</p>
<p>Dati inseriti dal richiedente:</p>
<p>{{requester_info_list}}</p>
<p>Buon lavoro</p>
BODY;

        $bodyEn = <<<'BODY'
<p>Gentile operatore,</p>
<p>l'utente {{person_username}} {{person_link}} ha dichiarato interesse per un'opportunità nel modulo M&amp;A all'interno di VG digital.</p>
<p>Dati dell'opportunità:</p>
<p>{{merge_acquisition_list}}</p>
<p>Dati inseriti dal richiedente:</p>
<p>{{requester_info_list}}</p>
<p>Buon lavoro</p>
BODY;

        $this->command?->warn(
            'MergeAcquisitionContactRequestEmailSeeder generated from legacy import: map it to the local email_type schema before enabling inserts.',
        );
    }
}
