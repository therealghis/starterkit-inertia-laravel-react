<?php

namespace App\Support;

use Illuminate\Support\Facades\File;

class Translations {
    /**
     * @return array<string, string>
     */
    public static function forLocale(string $locale): array {
        $path = lang_path("{$locale}.json");

        if (! File::exists($path)) {
            return [];
        }

        $translations = json_decode(File::get($path), true);

        return is_array($translations) ? $translations : [];
    }
}
