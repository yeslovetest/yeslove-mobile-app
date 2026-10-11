/**
 * Accessibility guard (WCAG 2.2 AA, see docs/accessibility-pre-audit.md).
 *
 * Static checks only: they keep the gaps found in the pre-audit from coming back, but they do not
 * replace testing with VoiceOver and TalkBack. A new tappable, text field or image has to say what
 * it is (role or label), or say that it is decorative (accessible={false}).
 */
/* eslint-disable @typescript-eslint/no-require-imports */
import fs from "fs";
import path from "path";

import { lightColors } from "@/app/theme/colors";

const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const APP = path.join(__dirname, "..", "..", "app");
const TAPPABLE = new Set([
  "TouchableOpacity",
  "Pressable",
  "TouchableHighlight",
  "TouchableWithoutFeedback",
]);

const sourceFiles = (dir: string): string[] =>
  fs.readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return fs.statSync(full).isDirectory()
      ? sourceFiles(full)
      : full.endsWith(".tsx")
        ? [full]
        : [];
  });

type Problem = string;

const scan = (): { tappables: Problem[]; fields: Problem[]; images: Problem[] } => {
  const result = { tappables: [] as Problem[], fields: [] as Problem[], images: [] as Problem[] };
  for (const file of sourceFiles(APP)) {
    const ast = parser.parse(fs.readFileSync(file, "utf8"), {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });
    traverse(ast, {
      JSXOpeningElement(p: { node: any }) {
        const node = p.node;
        const name = node.name.name;
        const attributes = new Map<string, any>(
          node.attributes
            .filter((a: any) => a.type === "JSXAttribute")
            .map((a: any) => [a.name.name, a]),
        );
        const at = `${path.relative(APP, file)}:${node.loc.start.line}`;
        const hidden =
          attributes.has("accessible") &&
          JSON.stringify(attributes.get("accessible").value).includes("false");
        const named = ["accessibilityLabel", "aria-label"].some((k) => attributes.has(k));
        if (
          TAPPABLE.has(name) &&
          !hidden &&
          !named &&
          !attributes.has("accessibilityRole") &&
          !attributes.has("role")
        ) {
          result.tappables.push(`${name} at ${at}`);
        }
        if (name === "TextInput" && !named && !attributes.has("accessibilityLabelledBy")) {
          result.fields.push(`TextInput at ${at}`);
        }
        if (
          name === "Image" &&
          !hidden &&
          !named &&
          !attributes.has("alt") &&
          !attributes.has("importantForAccessibility") &&
          !attributes.has("accessibilityElementsHidden")
        ) {
          result.images.push(`Image at ${at}`);
        }
      },
    });
  }
  return result;
};

const found = scan();

describe("accessibility: every interactive element and image says what it is", () => {
  it("gives every tappable a role or a label, or marks it as not a control", () => {
    expect(found.tappables).toEqual([]);
  });

  it("gives every text field a label", () => {
    expect(found.fields).toEqual([]);
  });

  it("describes every image, or marks it as decorative", () => {
    expect(found.images).toEqual([]);
  });
});

const channel = (v: number) =>
  v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4;
const luminance = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("accessibility: colour contrast of the colours the screens are built from (WCAG 1.4.3, 4.5:1)", () => {
  it.each([
    ["primary text", "textPrimary", "background"],
    ["primary text on cards", "textPrimary", "surface"],
    ["secondary text", "textSecondary", "background"],
    ["muted text", "textMuted", "background"],
    ["links and brand text", "primary", "surface"],
    ["error text", "danger", "surface"],
    ["text on the orange banners", "textPrimary", "accent"],
    ["text on brand buttons", "textOnPrimary", "primary"],
  ])("%s is readable", (_label, foreground, background) => {
    const colors = lightColors as unknown as Record<string, string>;
    expect(contrast(colors[foreground], colors[background])).toBeGreaterThanOrEqual(4.5);
  });
});
