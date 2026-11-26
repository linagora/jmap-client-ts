/**
 * Minimal RFC 6570 expansion, enough for JMAP `downloadUrl` / `uploadUrl`
 * templates: simple `{var}` (level 1) and form-style query `{?a,b}` /
 * continuation `{&a,b}` expressions.
 */

function encodeTemplateValue(value: string): string {
  // encodeURIComponent leaves !'()* alone; RFC 6570 simple expansion encodes them.
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export function expandUriTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{([?&]?)([^{}]+)\}/g, (_match, operator: string, names: string) => {
    const parts = names.split(',').map(name => name.trim());
    if (operator === '') {
      return parts.map(name => encodeTemplateValue(variables[name] ?? '')).join(',');
    }
    const pairs = parts
      .filter(name => variables[name] !== undefined)
      .map(name => `${name}=${encodeTemplateValue(variables[name] ?? '')}`);
    return pairs.length === 0 ? '' : `${operator}${pairs.join('&')}`;
  });
}
