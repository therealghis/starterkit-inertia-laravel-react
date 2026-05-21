<?php

namespace Database\Seeders;

use App\Enums\MergeAcquisitionType;
use App\Models\MergeAcquisition;
use App\Models\MergeAcquisitionAttachment;
use App\Models\MergeAcquisitionAudit;
use App\Models\MergeAcquisitionContactRequest;
use App\Models\MergeAcquisitionEconomicActivity;
use App\Models\MergeAcquisitionFavoritePerson;
use App\Models\MergeAcquisitionFinancial;
use App\Models\User;
use Illuminate\Database\Seeder;

class MergeAcquisitionSeeder extends Seeder {
    public function run(): void {
        $users = User::query()
            ->whereIn('email', [
                config('starter.seed_user.email'),
                'admin1@local.test',
                'admin2@local.test',
                'admin3@local.test',
                'customer1@local.test',
                'customer2@local.test',
                'customer3@local.test',
            ])
            ->get()
            ->keyBy('email');

        $economicActivities = MergeAcquisitionEconomicActivity::query()
            ->whereIn('activity_name', [
                'Attività manifatturiere',
                "Telecomunicazioni, programmazione e consulenza informatica, infrastrutture informatiche e altre attività dei servizi d'informazione",
                'Attività finanziarie e assicurative',
                'Attività professionali, scientifiche e tecniche',
                'Attività per la salute umana e di assistenza sociale',
                "Commercio all'ingrosso e al dettaglio",
            ])
            ->get()
            ->keyBy('activity_name');

        $opportunities = [
            [
                'identification_code' => 'MA-2026-001',
                'user_email' => 'admin1@local.test',
                'economic_activity' => "Telecomunicazioni, programmazione e consulenza informatica, infrastrutture informatiche e altre attività dei servizi d'informazione",
                'intent_type' => MergeAcquisitionType::SELL_SIDE,
                'company_name' => 'NorthGrid Analytics',
                'company_description' => 'Società software B2B con focus su data integration, analytics e workflow automation per imprese mid-market.',
                'product' => 'Piattaforma SaaS per orchestrazione dati e reporting industriale.',
                'legal_entity' => 'Srl',
                'establishment_date' => '2018',
                'ateco_code' => '62.01',
                'nominal_capital' => 'EUR 250.000',
                'headquarters_legal_province' => 'Milano',
                'headquarters_legal_country' => 'Italia',
                'headquarters_operative_province' => 'Milano',
                'headquarters_operative_country' => 'Italia',
                'total_employees' => 34,
                'selling_type' => 'Quota di maggioranza',
                'selling_reason' => 'Ricerca partner industriale per accelerare espansione commerciale e rafforzamento prodotto.',
                'real_estate' => false,
                'active' => true,
                'favorites' => ['customer1@local.test', 'customer2@local.test'],
                'financials' => [
                    ['year' => 2023, 'sales' => '1850000', 'income' => '210000', 'pfn' => '120000', 'ebitda' => '320000', 'debt' => '90000'],
                    ['year' => 2024, 'sales' => '2430000', 'income' => '355000', 'pfn' => '180000', 'ebitda' => '470000', 'debt' => '60000'],
                ],
                'attachments' => [
                    ['mimetype' => 'application/pdf', 'file_path' => 'merge-acquisition/ma-2026-001/teaser.pdf', 'filename' => 'northgrid-teaser.pdf'],
                ],
                'audits' => [
                    ['action' => 'seeded', 'audit_description' => 'Opportunità demo sell-side caricata per ambiente locale.'],
                ],
                'contact_requests' => [
                    ['requester_name' => 'Luca', 'requester_surname' => 'Bianchi', 'requester_email' => 'luca.bianchi@example.test', 'requester_phone' => '+39 333 0000001'],
                ],
            ],
            [
                'identification_code' => 'MA-2026-002',
                'user_email' => 'admin2@local.test',
                'economic_activity' => 'Attività manifatturiere',
                'intent_type' => MergeAcquisitionType::BUY_SIDE,
                'company_name' => 'Project Forge',
                'company_description' => 'Mandato buy-side per acquisizione di PMI manifatturiera specializzata in componentistica di precisione per automazione.',
                'product' => 'Ricerca target con forte verticalità meccanica e base clienti internazionale.',
                'legal_entity' => 'Spa',
                'establishment_date' => '2026',
                'ateco_code' => '25.62',
                'nominal_capital' => 'N/D',
                'headquarters_legal_province' => 'Bergamo',
                'headquarters_legal_country' => 'Italia',
                'headquarters_operative_province' => 'Brescia',
                'headquarters_operative_country' => 'Italia',
                'total_employees' => 0,
                'selling_type' => null,
                'selling_reason' => null,
                'real_estate' => true,
                'active' => true,
                'favorites' => ['customer3@local.test'],
                'financials' => [
                    ['year' => 2024, 'sales' => '5000000', 'income' => '650000', 'pfn' => '0', 'ebitda' => '820000', 'debt' => '0'],
                ],
                'attachments' => [
                    ['mimetype' => 'application/pdf', 'file_path' => 'merge-acquisition/ma-2026-002/mandate.pdf', 'filename' => 'project-forge-mandate.pdf'],
                ],
                'audits' => [
                    ['action' => 'seeded', 'audit_description' => 'Mandato buy-side demo creato per test filtri e tabella.'],
                ],
                'contact_requests' => [],
            ],
            [
                'identification_code' => 'MA-2026-003',
                'user_email' => 'admin3@local.test',
                'economic_activity' => 'Attività per la salute umana e di assistenza sociale',
                'intent_type' => MergeAcquisitionType::SELL_SIDE,
                'company_name' => 'Clinica Aurora',
                'company_description' => 'Network di poliambulatori specialistici con focus su diagnostica, fisioterapia e medicina sportiva.',
                'product' => 'Struttura sanitaria accreditata con presenza multi-sede.',
                'legal_entity' => 'Srl',
                'establishment_date' => '2012',
                'ateco_code' => '86.22',
                'nominal_capital' => 'EUR 500.000',
                'headquarters_legal_province' => 'Verona',
                'headquarters_legal_country' => 'Italia',
                'headquarters_operative_province' => 'Vicenza',
                'headquarters_operative_country' => 'Italia',
                'total_employees' => 58,
                'selling_type' => '100% quote',
                'selling_reason' => 'Passaggio generazionale e apertura a partner strategico.',
                'real_estate' => true,
                'active' => true,
                'favorites' => ['customer1@local.test'],
                'financials' => [
                    ['year' => 2023, 'sales' => '4300000', 'income' => '290000', 'pfn' => '-150000', 'ebitda' => '540000', 'debt' => '780000'],
                    ['year' => 2024, 'sales' => '4680000', 'income' => '350000', 'pfn' => '-90000', 'ebitda' => '610000', 'debt' => '640000'],
                ],
                'attachments' => [],
                'audits' => [
                    ['action' => 'seeded', 'audit_description' => 'Profilo sanitario demo disponibile per prove di navigazione.'],
                ],
                'contact_requests' => [
                    ['requester_name' => 'Marta', 'requester_surname' => 'Conti', 'requester_email' => 'marta.conti@example.test', 'requester_phone' => '+39 333 0000002'],
                ],
            ],
            [
                'identification_code' => 'MA-2026-004',
                'user_email' => 'customer1@local.test',
                'economic_activity' => 'Attività professionali, scientifiche e tecniche',
                'intent_type' => MergeAcquisitionType::BUY_SIDE,
                'company_name' => 'Studio Delta Advisory',
                'company_description' => 'Ricerca di boutique consulenziale con specializzazione ESG, risk o transformation advisory.',
                'product' => 'Mandato focalizzato su target ad alta retention clienti e partnership senior consolidata.',
                'legal_entity' => 'Srl',
                'establishment_date' => '2026',
                'ateco_code' => '70.22',
                'nominal_capital' => 'N/D',
                'headquarters_legal_province' => 'Bologna',
                'headquarters_legal_country' => 'Italia',
                'headquarters_operative_province' => 'Bologna',
                'headquarters_operative_country' => 'Italia',
                'total_employees' => 0,
                'selling_type' => null,
                'selling_reason' => null,
                'real_estate' => false,
                'active' => true,
                'favorites' => ['customer2@local.test'],
                'financials' => [
                    ['year' => 2024, 'sales' => '3000000', 'income' => '420000', 'pfn' => '0', 'ebitda' => '560000', 'debt' => '0'],
                ],
                'attachments' => [],
                'audits' => [
                    ['action' => 'seeded', 'audit_description' => 'Mandato buy-side consulenza creato per ambiente di sviluppo.'],
                ],
                'contact_requests' => [],
            ],
            [
                'identification_code' => 'MA-2026-005',
                'user_email' => 'customer2@local.test',
                'economic_activity' => "Commercio all'ingrosso e al dettaglio",
                'intent_type' => MergeAcquisitionType::SELL_SIDE,
                'company_name' => 'Retail Harbor',
                'company_description' => 'Operatore omnicanale retail con presenza digitale consolidata e posizionamento premium nel segmento casa e lifestyle.',
                'product' => 'Brand proprietario con rete distributiva mista e forte componente direct-to-consumer.',
                'legal_entity' => 'Spa',
                'establishment_date' => '2015',
                'ateco_code' => '47.59',
                'nominal_capital' => 'EUR 1.000.000',
                'headquarters_legal_province' => 'Padova',
                'headquarters_legal_country' => 'Italia',
                'headquarters_operative_province' => 'Padova',
                'headquarters_operative_country' => 'Italia',
                'total_employees' => 76,
                'selling_type' => 'Ingresso socio di maggioranza',
                'selling_reason' => 'Ricerca capitale per accelerare espansione estera e consolidamento retail.',
                'real_estate' => false,
                'active' => true,
                'favorites' => [],
                'financials' => [
                    ['year' => 2023, 'sales' => '7800000', 'income' => '420000', 'pfn' => '-250000', 'ebitda' => '930000', 'debt' => '1350000'],
                    ['year' => 2024, 'sales' => '8560000', 'income' => '510000', 'pfn' => '-120000', 'ebitda' => '1120000', 'debt' => '980000'],
                ],
                'attachments' => [
                    ['mimetype' => 'application/pdf', 'file_path' => 'merge-acquisition/ma-2026-005/information-memo.pdf', 'filename' => 'retail-harbor-im.pdf'],
                ],
                'audits' => [
                    ['action' => 'seeded', 'audit_description' => 'Profilo retail demo caricato con dati finanziari e allegato.'],
                ],
                'contact_requests' => [],
            ],
            [
                'identification_code' => 'MA-2026-006',
                'user_email' => 'customer3@local.test',
                'economic_activity' => 'Attività finanziarie e assicurative',
                'intent_type' => MergeAcquisitionType::SELL_SIDE,
                'company_name' => 'Capital Bridge Services',
                'company_description' => 'Società di mediazione creditizia e consulenza corporate finance specializzata su PMI e family business.',
                'product' => 'Piattaforma relazionale per debt advisory, M&A support e pianificazione finanziaria.',
                'legal_entity' => 'Srl',
                'establishment_date' => '2010',
                'ateco_code' => '66.19',
                'nominal_capital' => 'EUR 120.000',
                'headquarters_legal_province' => 'Torino',
                'headquarters_legal_country' => 'Italia',
                'headquarters_operative_province' => 'Torino',
                'headquarters_operative_country' => 'Italia',
                'total_employees' => 21,
                'selling_type' => 'Cessione totalitaria',
                'selling_reason' => 'Uscita dei soci fondatori e integrazione in gruppo specializzato.',
                'real_estate' => false,
                'active' => false,
                'favorites' => [],
                'financials' => [
                    ['year' => 2024, 'sales' => '1950000', 'income' => '240000', 'pfn' => '80000', 'ebitda' => '310000', 'debt' => '40000'],
                ],
                'attachments' => [],
                'audits' => [
                    ['action' => 'seeded', 'audit_description' => 'Profilo inattivo demo utile per verifica filtri su opportunità attive.'],
                ],
                'contact_requests' => [],
            ],
        ];

        foreach ($opportunities as $data) {
            $owner = $users->get($data['user_email']) ?? $users->first();
            $economicActivity = $economicActivities->get($data['economic_activity']);

            if ($owner === null || $economicActivity === null) {
                continue;
            }

            $mergeAcquisition = MergeAcquisition::query()->updateOrCreate(
                ['identification_code' => $data['identification_code']],
                [
                    'user_id' => $owner->id,
                    'merge_acquisition_economic_activity_id' => $economicActivity->id,
                    'intent_type' => $data['intent_type'],
                    'company_name' => $data['company_name'],
                    'company_description' => $data['company_description'],
                    'product' => $data['product'],
                    'legal_entity' => $data['legal_entity'],
                    'establishment_date' => $data['establishment_date'],
                    'ateco_code' => $data['ateco_code'],
                    'nominal_capital' => $data['nominal_capital'],
                    'headquarters_legal_province' => $data['headquarters_legal_province'],
                    'headquarters_legal_country' => $data['headquarters_legal_country'],
                    'headquarters_operative_province' => $data['headquarters_operative_province'],
                    'headquarters_operative_country' => $data['headquarters_operative_country'],
                    'total_employees' => $data['total_employees'],
                    'selling_type' => $data['selling_type'],
                    'selling_reason' => $data['selling_reason'],
                    'real_estate' => $data['real_estate'],
                    'active' => $data['active'],
                ],
            );

            $mergeAcquisition->financials()->delete();
            $mergeAcquisition->attachments()->delete();
            $mergeAcquisition->audits()->delete();
            $mergeAcquisition->contactRequests()->delete();
            $mergeAcquisition->favoritePeople()->delete();

            foreach ($data['financials'] as $financial) {
                MergeAcquisitionFinancial::query()->create([
                    'merge_acquisition_id' => $mergeAcquisition->id,
                    'year' => $financial['year'],
                    'sales' => $financial['sales'],
                    'income' => $financial['income'],
                    'pfn' => $financial['pfn'],
                    'ebitda' => $financial['ebitda'],
                    'debt' => $financial['debt'],
                    'active' => true,
                ]);
            }

            foreach ($data['attachments'] as $attachment) {
                MergeAcquisitionAttachment::query()->create([
                    'merge_acquisition_id' => $mergeAcquisition->id,
                    'mimetype' => $attachment['mimetype'],
                    'file_path' => $attachment['file_path'],
                    'filename' => $attachment['filename'],
                    'active' => true,
                ]);
            }

            foreach ($data['audits'] as $audit) {
                MergeAcquisitionAudit::query()->create([
                    'merge_acquisition_id' => $mergeAcquisition->id,
                    'action' => $audit['action'],
                    'audit_description' => $audit['audit_description'],
                ]);
            }

            foreach ($data['contact_requests'] as $contactRequest) {
                MergeAcquisitionContactRequest::query()->create([
                    'merge_acquisition_id' => $mergeAcquisition->id,
                    'requester_name' => $contactRequest['requester_name'],
                    'requester_surname' => $contactRequest['requester_surname'],
                    'requester_email' => $contactRequest['requester_email'],
                    'requester_phone' => $contactRequest['requester_phone'],
                ]);
            }

            foreach ($data['favorites'] as $favoriteEmail) {
                $favoriteUser = $users->get($favoriteEmail);

                if ($favoriteUser === null) {
                    continue;
                }

                MergeAcquisitionFavoritePerson::query()->create([
                    'merge_acquisition_id' => $mergeAcquisition->id,
                    'user_id' => $favoriteUser->id,
                    'active' => true,
                ]);
            }
        }
    }
}
