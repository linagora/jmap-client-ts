import { describe, expect, it } from 'vitest';

import { expandUriTemplate } from '../../src/index.js';

describe('expandUriTemplate', () => {
  it('expands simple variables with RFC 6570 encoding', () => {
    expect(
      expandUriTemplate('/d/{accountId}/{blobId}/{name}', {
        accountId: 'a',
        blobId: 'b',
        name: "it's (ok)!*",
      }),
    ).toBe('/d/a/b/it%27s%20%28ok%29%21%2A');
  });

  it('expands form-style query expressions and skips undefined variables', () => {
    expect(expandUriTemplate('/d/{blobId}{?type,name}', { blobId: 'b', type: 'text/plain' })).toBe(
      '/d/b?type=text%2Fplain',
    );
    expect(expandUriTemplate('/d?x=1{&name}', { name: 'n' })).toBe('/d?x=1&name=n');
  });

  it('scans unclosed braces in linear time', () => {
    const template = '{'.repeat(100_000);
    const start = performance.now();
    expect(expandUriTemplate(template, {})).toBe(template);
    expect(performance.now() - start).toBeLessThan(100);
  });
});
