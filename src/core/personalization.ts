import useAppStorysStore from '../core/store';

export function personalizeText(text: string): string {
  if (!text || text.trim() === '') {
    return text;
  }

  const personalizationData = useAppStorysStore.getState().personalizationData;

  if (!personalizationData || Object.keys(personalizationData).length === 0) {
    return replacePlaceholdersWithFallback(text);
  }

  const regex = /\{\{([^|}\s]+)\s*\|\s*([^}]+)\}\}/g;

  return text.replace(regex, (_, variableName, fallbackValue) => {
    const trimmedVariable = variableName.trim();
    const trimmedFallback = fallbackValue.trim();

    return personalizationData[trimmedVariable] ?? trimmedFallback;
  });
}

function replacePlaceholdersWithFallback(text: string): string {
  const regex = /\{\{[^|}\s]+\s*\|\s*([^}]+)\}\}/g;

  return text.replace(regex, (_, fallbackValue) => {
    return fallbackValue.trim();
  });
}
