<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MergeAcquisitionEconomicActivitySeeder extends Seeder {
    public function run(): void {
        $economicActivities = [
            'Agricoltura, silvicoltura e pesca',
            'Attività estrattive',
            'Attività manifatturiere',
            'Fornitura di energia elettrica, gas, vapore e aria condizionata',
            'Fornitura di acqua; gestione di reti fognarie, attività di trattamento dei rifiuti e risanamento',
            'Costruzioni',
            "Commercio all'ingrosso e al dettaglio",
            'Trasporto e magazzinaggio',
            'Attività dei servizi di alloggio e di ristorazione',
            'Attività editoriali, trasmissioni radiofoniche e produzione e distribuzione di contenuti',
            "Telecomunicazioni, programmazione e consulenza informatica, infrastrutture informatiche e altre attività dei servizi d'informazione",
            'Attività finanziarie e assicurative',
            'Attività immobiliari',
            'Attività professionali, scientifiche e tecniche',
            'Attività amministrative e di servizi di supporto',
            'Amministrazione pubblica e difesa; assicurazione sociale obbligatoria',
            'Istruzione e formazione',
            'Attività per la salute umana e di assistenza sociale',
            'Attività artistiche, sportive e di divertimento',
            'Altre attività di servizi',
        ];

        foreach ($economicActivities as $activityName) {
            DB::table('merge_acquisition_economic_activity')->updateOrInsert(
                ['activity_name' => $activityName],
                [
                    'active' => true,
                    'date_updated' => null,
                    'person_id_updated' => null,
                    'date_created' => now(),
                    'person_id_created' => null,
                ],
            );
        }
    }
}
