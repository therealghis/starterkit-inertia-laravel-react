<?php

namespace Database\Seeders;

use App\Models\DueDiligenceTemplate;
use App\Models\DueDiligenceTemplateItem;
use Illuminate\Database\Seeder;

class DueDiligenceTemplateSeeder extends Seeder {
    /**
     * Seed the application's database.
     */
    public function run(): void {
        $template = DueDiligenceTemplate::query()->updateOrCreate([
            'name' => 'Checklist standard M&A',
        ], [
            'description' => 'Checklist documentale standard per processo di due diligence M&A',
            'is_active' => true,
        ]);

        $items = [
            [
                'entity' => 'Societa',
                'topic' => 'Informazioni generali',
                'request_text' => 'Visura camerale aggiornata',
                'sort_order' => 10,
                'is_active' => true,
            ],
            [
                'entity' => 'Societa',
                'topic' => 'Informazioni generali',
                'request_text' => 'Statuto sociale vigente',
                'sort_order' => 20,
                'is_active' => true,
            ],
            [
                'entity' => 'Amministrazione',
                'topic' => 'Bilanci',
                'request_text' => 'Bilanci approvati degli ultimi tre esercizi',
                'sort_order' => 30,
                'is_active' => true,
            ],
            [
                'entity' => 'Fiscale',
                'topic' => 'Dichiarazioni',
                'request_text' => 'Dichiarazioni fiscali degli ultimi tre esercizi',
                'sort_order' => 40,
                'is_active' => true,
            ],
            [
                'entity' => 'Legale',
                'topic' => 'Contratti',
                'request_text' => 'Principali contratti commerciali in essere',
                'sort_order' => 50,
                'is_active' => true,
            ],
        ];

        foreach ($items as $item) {
            DueDiligenceTemplateItem::query()->updateOrCreate([
                'due_diligence_template_id' => $template->id,
                'sort_order' => $item['sort_order'],
            ], [
                'entity' => $item['entity'],
                'topic' => $item['topic'],
                'request_text' => $item['request_text'],
                'is_active' => $item['is_active'],
            ]);
        }
    }
}
