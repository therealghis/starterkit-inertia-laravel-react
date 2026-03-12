<?php

namespace Tests\Unit;

use App\Models\Trivy\SecurityScan;
use App\Support\Trivy\Inteface\SecurityRawReportRepositoryInterface;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FileSecurityRawReportRepositoryTest extends TestCase {
    public function test_it_discovers_and_filters_json_reports_from_the_configured_directory(): void {
        Storage::fake('trivy_reports');

        config()->set('trivy.reports.disk', 'trivy_reports');
        config()->set('trivy.reports.directory', 'trivy-reports');

        Storage::disk('trivy_reports')->put('trivy-reports/scan-a.json', json_encode(['foo' => 'bar']));
        Storage::disk('trivy_reports')->put('trivy-reports/scan-b.json', json_encode(['bar' => 'baz']));
        Storage::disk('trivy_reports')->put('trivy-reports/readme.txt', 'skip');
        Storage::disk('trivy_reports')->put('other/ignored.json', json_encode(['ignored' => true]));

        $repository = app(SecurityRawReportRepositoryInterface::class);

        $this->assertSame([
            'trivy-reports/scan-a.json',
            'trivy-reports/scan-b.json',
        ], $repository->discoverGeneratedReports());
    }

    public function test_it_keeps_only_existing_report_paths_and_reads_their_contents(): void {
        Storage::fake('trivy_reports');

        config()->set('trivy.reports.disk', 'trivy_reports');
        config()->set('trivy.reports.directory', 'trivy-reports');

        Storage::disk('trivy_reports')->put('trivy-reports/scan-fs.json', json_encode([
            'Results' => [
                ['Target' => 'composer.lock'],
            ],
        ]));

        $repository = app(SecurityRawReportRepositoryInterface::class);
        $scan = new class () extends SecurityScan {
            public function save(array $options = []): bool {
                return true;
            }
        };

        $this->assertSame([
            'trivy-reports/scan-fs.json',
        ], $repository->existingReportPaths([
            'trivy-reports/scan-fs.json',
            'trivy-reports/missing.json',
            'other/ignored.json',
        ]));

        $repository->storeReportPaths($scan, [
            'trivy-reports/scan-fs.json',
            'trivy-reports/missing.json',
        ]);

        $reports = $repository->reportsForScan($scan);

        $this->assertCount(1, $reports);
        $this->assertSame('trivy_reports', $reports[0]->disk);
        $this->assertSame('trivy-reports/scan-fs.json', $reports[0]->path);
        $this->assertSame('scan-fs.json', $reports[0]->filename);
        $this->assertSame('composer.lock', $reports[0]->contents['Results'][0]['Target']);
    }
}
