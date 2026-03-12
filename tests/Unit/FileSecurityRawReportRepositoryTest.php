<?php

namespace Tests\Unit;

use App\Models\Trivy\SecurityScan;
use App\Support\Trivy\SecurityRawReportRepositoryInterface;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FileSecurityRawReportRepositoryTest extends TestCase {
    public function test_it_discovers_generated_json_reports_in_the_configured_directory(): void {
        Storage::fake('local');

        config()->set('trivy.reports.disk', 'local');
        config()->set('trivy.reports.directory', 'trivy-reports');

        Storage::disk('local')->put('trivy-reports/scan-a.json', json_encode(['foo' => 'bar']));
        Storage::disk('local')->put('trivy-reports/scan-b.json', json_encode(['bar' => 'baz']));
        Storage::disk('local')->put('trivy-reports/readme.txt', 'skip');

        $repository = app(SecurityRawReportRepositoryInterface::class);

        $this->assertSame([
            'trivy-reports/scan-a.json',
            'trivy-reports/scan-b.json',
        ], $repository->discoverGeneratedReports());
    }

    public function test_it_stores_report_metadata_and_reads_reports_for_a_scan(): void {
        Storage::fake('local');

        config()->set('trivy.reports.disk', 'local');
        config()->set('trivy.reports.directory', 'trivy-reports');

        Storage::disk('local')->put('trivy-reports/scan-fs.json', json_encode([
            'Results' => [
                ['Target' => 'composer.lock'],
            ],
        ]));

        $repository = app(SecurityRawReportRepositoryInterface::class);
        $scan = new SecurityScan();

        $repository->storeReportPaths($scan, [
            storage_path('app/trivy-reports/scan-fs.json'),
        ]);

        $reports = $repository->reportsForScan($scan);

        $this->assertCount(1, $reports);
        $this->assertSame('local', $reports[0]->disk);
        $this->assertSame('trivy-reports/scan-fs.json', $reports[0]->path);
        $this->assertSame('scan-fs.json', $reports[0]->filename);
        $this->assertSame('composer.lock', $reports[0]->contents['Results'][0]['Target']);
    }
}
