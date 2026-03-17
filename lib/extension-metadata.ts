export type ExtensionMetaV1 = {
  schema: "extensionhub.v1";
  name: string;
  version: string;
  author: string;
  description?: string;
};

export type ListedExtension = {
  id: number;
  name: string;
  version: string;
  author: string;
  description?: string;
  downloadUrl: string | null;
  releaseUrl: string | null;
};

export function toReleaseBody(meta: ExtensionMetaV1) {
  return [
    "```json",
    JSON.stringify(meta, null, 2),
    "```",
    "",
    meta.description?.trim() ? meta.description.trim() : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function parseReleaseBody(body: string | null | undefined) {
  if (!body) return null;

  const match = body.match(/```json\s*([\s\S]*?)\s*```/i);
  if (!match) return null;

  try {
    const obj = JSON.parse(match[1]) as Partial<ExtensionMetaV1>;
    if (obj?.schema !== "extensionhub.v1") return null;
    if (!obj.name || !obj.version || !obj.author) return null;
    return obj as ExtensionMetaV1;
  } catch {
    return null;
  }
}

