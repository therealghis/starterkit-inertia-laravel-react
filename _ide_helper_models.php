<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property int|null $merge_acquisition_economic_activity_id
 * @property string $identification_code
 * @property string $intent_type
 * @property string|null $company_name
 * @property string|null $company_description
 * @property string|null $product
 * @property string|null $legal_entity
 * @property string|null $establishment_date
 * @property string|null $ateco_code
 * @property string|null $nominal_capital
 * @property string|null $headquarters_legal_province
 * @property string|null $headquarters_legal_country
 * @property string|null $headquarters_operative_province
 * @property string|null $headquarters_operative_country
 * @property int|null $total_employees
 * @property string|null $selling_type
 * @property string|null $selling_reason
 * @property bool|null $real_estate
 * @property bool $active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MergeAcquisitionAttachment> $attachments
 * @property-read int|null $attachments_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MergeAcquisitionAudit> $audits
 * @property-read int|null $audits_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MergeAcquisitionContactRequest> $contactRequests
 * @property-read int|null $contact_requests_count
 * @property-read \App\Models\MergeAcquisitionEconomicActivity|null $economicActivity
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MergeAcquisitionFavoritePerson> $favoritePeople
 * @property-read int|null $favorite_people_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MergeAcquisitionFinancial> $financials
 * @property-read int|null $financials_count
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereAtecoCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereCompanyDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereCompanyName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereEstablishmentDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereHeadquartersLegalCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereHeadquartersLegalProvince($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereHeadquartersOperativeCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereHeadquartersOperativeProvince($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereIdentificationCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereIntentType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereLegalEntity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereMergeAcquisitionEconomicActivityId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereNominalCapital($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereProduct($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereRealEstate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereSellingReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereSellingType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereTotalEmployees($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisition whereUserId($value)
 */
	class MergeAcquisition extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $merge_acquisition_id
 * @property string $mimetype
 * @property string $file_path
 * @property string $filename
 * @property bool $active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\MergeAcquisition $mergeAcquisition
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionAttachment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionAttachment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionAttachment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionAttachment whereActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionAttachment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionAttachment whereFilePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionAttachment whereFilename($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionAttachment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionAttachment whereMergeAcquisitionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionAttachment whereMimetype($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionAttachment whereUpdatedAt($value)
 */
	class MergeAcquisitionAttachment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $merge_acquisition_id
 * @property string $action
 * @property string|null $audit_description
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\MergeAcquisition $mergeAcquisition
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionAudit newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionAudit newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionAudit query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionAudit whereAction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionAudit whereAuditDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionAudit whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionAudit whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionAudit whereMergeAcquisitionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionAudit whereUpdatedAt($value)
 */
	class MergeAcquisitionAudit extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $merge_acquisition_id
 * @property int|null $email_id
 * @property string $requester_name
 * @property string $requester_surname
 * @property string $requester_email
 * @property string $requester_phone
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\MergeAcquisition $mergeAcquisition
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionContactRequest newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionContactRequest newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionContactRequest query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionContactRequest whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionContactRequest whereEmailId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionContactRequest whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionContactRequest whereMergeAcquisitionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionContactRequest whereRequesterEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionContactRequest whereRequesterName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionContactRequest whereRequesterPhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionContactRequest whereRequesterSurname($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionContactRequest whereUpdatedAt($value)
 */
	class MergeAcquisitionContactRequest extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $activity_name
 * @property bool $active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MergeAcquisition> $mergeAcquisitions
 * @property-read int|null $merge_acquisitions_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionEconomicActivity newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionEconomicActivity newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionEconomicActivity query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionEconomicActivity whereActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionEconomicActivity whereActivityName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionEconomicActivity whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionEconomicActivity whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionEconomicActivity whereUpdatedAt($value)
 */
	class MergeAcquisitionEconomicActivity extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $merge_acquisition_id
 * @property int $user_id
 * @property bool $active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\MergeAcquisition $mergeAcquisition
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFavoritePerson newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFavoritePerson newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFavoritePerson query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFavoritePerson whereActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFavoritePerson whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFavoritePerson whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFavoritePerson whereMergeAcquisitionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFavoritePerson whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFavoritePerson whereUserId($value)
 */
	class MergeAcquisitionFavoritePerson extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $merge_acquisition_id
 * @property int $year
 * @property string $sales
 * @property string $income
 * @property string $pfn
 * @property string $ebitda
 * @property string|null $debt
 * @property bool $active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\MergeAcquisition $mergeAcquisition
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFinancial newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFinancial newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFinancial query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFinancial whereActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFinancial whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFinancial whereDebt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFinancial whereEbitda($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFinancial whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFinancial whereIncome($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFinancial whereMergeAcquisitionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFinancial wherePfn($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFinancial whereSales($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFinancial whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MergeAcquisitionFinancial whereYear($value)
 */
	class MergeAcquisitionFinancial extends \Eloquent {}
}

namespace App\Models\Trivy{
/**
 * @property int $id
 * @property string $fingerprint
 * @property string|null $vulnerability_id
 * @property string $pkg_name
 * @property string|null $installed_version
 * @property string|null $fixed_version
 * @property SecurityScanSeverity $severity
 * @property string|null $severity_source
 * @property string|null $title
 * @property string|null $primary_url
 * @property string|null $target
 * @property string|null $class
 * @property string|null $type
 * @property SecurityFindingStatus $status
 * @property \Carbon\CarbonImmutable|null $first_seen_at
 * @property \Carbon\CarbonImmutable|null $last_seen_at
 * @property int|null $first_seen_scan_id
 * @property int|null $last_seen_scan_id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Trivy\SecurityFindingEvent> $events
 * @property-read int|null $events_count
 * @property-read \App\Models\Trivy\SecurityScan|null $firstSeenScan
 * @property-read \App\Models\Trivy\SecurityScan|null $lastSeenScan
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereClass($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereFingerprint($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereFirstSeenAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereFirstSeenScanId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereFixedVersion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereInstalledVersion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereLastSeenAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereLastSeenScanId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding wherePkgName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding wherePrimaryUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereSeverity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereSeveritySource($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereTarget($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFinding whereVulnerabilityId($value)
 * @mixin \Eloquent
 */
	class SecurityFinding extends \Eloquent {}
}

namespace App\Models\Trivy{
/**
 * @property int $id
 * @property int $security_finding_id
 * @property int $security_scan_id
 * @property SecurityFindingEventType $event_type
 * @property array<array-key, mixed>|null $payload
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property-read \App\Models\Trivy\SecurityFinding $finding
 * @property-read \App\Models\Trivy\SecurityScan $scan
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFindingEvent newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFindingEvent newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFindingEvent query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFindingEvent whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFindingEvent whereEventType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFindingEvent whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFindingEvent wherePayload($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFindingEvent whereSecurityFindingId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityFindingEvent whereSecurityScanId($value)
 * @mixin \Eloquent
 */
	class SecurityFindingEvent extends \Eloquent {}
}

namespace App\Models\Trivy{
/**
 * @property int $id
 * @property string $scan_key
 * @property SecurityScanStatus $status
 * @property string $scan_mode
 * @property \Carbon\CarbonImmutable|null $started_at
 * @property \Carbon\CarbonImmutable|null $finished_at
 * @property array<array-key, mixed>|null $raw_report_paths
 * @property string|null $error_message
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereErrorMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereFinishedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereRawReportPaths($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereScanKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereScanMode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereStartedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SecurityScan whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	class SecurityScan extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property \Carbon\CarbonImmutable|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property \Carbon\CarbonImmutable|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTwoFactorConfirmedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTwoFactorRecoveryCodes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTwoFactorSecret($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @mixin \Eloquent
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MergeAcquisitionFavoritePerson> $mergeAcquisitionFavorites
 * @property-read int|null $merge_acquisition_favorites_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MergeAcquisition> $mergeAcquisitions
 * @property-read int|null $merge_acquisitions_count
 */
	class User extends \Eloquent {}
}

