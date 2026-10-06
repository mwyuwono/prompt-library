#!/bin/zsh
set -euo pipefail
project_dir="${0:A:h}"
build_dir="${1:-/private/tmp/QuickTextMobileDeviceBuild}"
output_ipa="${2:-/private/tmp/QuickTextMobile.ipa}"
xcodebuild -project "$project_dir/QuickTextMobile.xcodeproj" -scheme QuickTextMobile -destination 'generic/platform=iOS' -derivedDataPath "$build_dir" CODE_SIGNING_ALLOWED=NO build
package_dir="$(mktemp -d /private/tmp/quicktext-ipa.XXXXXX)"
mkdir -p "$package_dir/Payload"
cp -R "$build_dir/Build/Products/Debug-iphoneos/QuickTextMobile.app" "$package_dir/Payload/"
(cd "$package_dir" && /usr/bin/zip -q -r "$package_dir/QuickTextMobile.ipa" Payload)
cp "$package_dir/QuickTextMobile.ipa" "$output_ipa"
print "IPA: $output_ipa"
