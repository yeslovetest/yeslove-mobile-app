/**
 * Backwards-compatibility re-export. The canonical theme now lives in
 * `app/theme`. Screens that still import this module keep working unchanged; new
 * code should import tokens from `@/app/theme` instead.
 */
import { legacyTheme } from "@/app/theme";

const theme = legacyTheme;

export default theme;
