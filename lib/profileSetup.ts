type UserMetadata = Record<string, unknown> | null | undefined;

export function getDisplayNameFromMetadata(metadata: UserMetadata) {
  if (!metadata) {
    return "";
  }

  const displayNameValue =
    typeof metadata.display_name === "string"
      ? metadata.display_name
      : typeof metadata.displayName === "string"
        ? metadata.displayName
        : "";

  return displayNameValue.trim();
}

export function hasCompletedProfileSetup(metadata: UserMetadata) {
  return getDisplayNameFromMetadata(metadata).length > 0;
}
