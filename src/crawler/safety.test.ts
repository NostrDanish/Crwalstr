import { describe, it, expect } from 'vitest';
import { isPubliclyFetchable } from './safety';

/**
 * SSRF guard tests — the proxy boundary (audit finding #1). Every one of
 * these must be refused BEFORE a request is handed to fetch or the proxy.
 */
describe('isPubliclyFetchable — SSRF guard', () => {
  it('allows ordinary public https URLs', () => {
    expect(isPubliclyFetchable('https://example.com/page')).toBe(true);
    expect(isPubliclyFetchable('https://en.wikipedia.org/wiki/Nostr')).toBe(true);
  });

  it('refuses non-http(s) schemes', () => {
    expect(isPubliclyFetchable('file:///etc/passwd')).toBe(false);
    expect(isPubliclyFetchable('javascript:alert(1)')).toBe(false);
    expect(isPubliclyFetchable('data:text/html,<p>hi</p>')).toBe(false);
    expect(isPubliclyFetchable('ftp://example.com/')).toBe(false);
  });

  it('refuses localhost and friends', () => {
    expect(isPubliclyFetchable('http://localhost:8080/admin')).toBe(false);
    expect(isPubliclyFetchable('http://foo.localhost/')).toBe(false);
    expect(isPubliclyFetchable('http://printer.local/')).toBe(false);
    expect(isPubliclyFetchable('http://nas.internal/')).toBe(false);
    expect(isPubliclyFetchable('http://metadata.google.internal/')).toBe(false);
  });

  it('refuses loopback IPv4 in all its forms', () => {
    expect(isPubliclyFetchable('http://127.0.0.1/')).toBe(false);
    expect(isPubliclyFetchable('http://127.1/')).toBe(false);               // short form
    expect(isPubliclyFetchable('http://2130706433/')).toBe(false);          // integer form
    expect(isPubliclyFetchable('http://0x7f000001/')).toBe(false);          // hex
    expect(isPubliclyFetchable('http://017700000001/')).toBe(false);        // octal
  });

  it('refuses RFC1918 and link-local IPv4', () => {
    expect(isPubliclyFetchable('http://10.0.0.5/')).toBe(false);
    expect(isPubliclyFetchable('http://192.168.1.1/')).toBe(false);
    expect(isPubliclyFetchable('http://172.16.0.1/')).toBe(false);
    expect(isPubliclyFetchable('http://172.31.255.255/')).toBe(false);
    expect(isPubliclyFetchable('http://169.254.169.254/latest/meta-data')).toBe(false); // cloud metadata
  });

  it('refuses 0.x, CGNAT, and benchmark ranges', () => {
    expect(isPubliclyFetchable('http://0.0.0.0/')).toBe(false);
    expect(isPubliclyFetchable('http://100.64.0.1/')).toBe(false);
    expect(isPubliclyFetchable('http://198.18.0.1/')).toBe(false);
  });

  it('refuses loopback/ULA/link-local IPv6', () => {
    expect(isPubliclyFetchable('http://[::1]/')).toBe(false);
    expect(isPubliclyFetchable('http://[fd00::1]/')).toBe(false);
    expect(isPubliclyFetchable('http://[fe80::1]/')).toBe(false);
    expect(isPubliclyFetchable('http://[::ffff:127.0.0.1]/')).toBe(false);
  });

  it('allows public IP literals (not everything numeric is private)', () => {
    expect(isPubliclyFetchable('http://8.8.8.8/')).toBe(true);
    expect(isPubliclyFetchable('http://1.1.1.1/')).toBe(true);
  });

  it('refuses garbage', () => {
    expect(isPubliclyFetchable('not a url')).toBe(false);
    expect(isPubliclyFetchable('')).toBe(false);
  });
});
