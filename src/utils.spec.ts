import { stripSubject } from './utils';

describe('stripSubject', () => {
  const expected = 'Helloworld!';

  it('should return same string', () => {
    expect(stripSubject('Helloworld!')).toEqual(expected);
  });
  it('should remove space', () => {
    expect(stripSubject('Hello world!')).toEqual(expected);
  });
  it('should remove multiple spaces', () => {
    expect(stripSubject('H e l l o    w o r l d!')).toEqual(expected);
  });
  it('should remove text between square brackets and spaces', () => {
    expect(stripSubject('[PERSONAL] Hello world!')).toEqual(expected);
  });
  it('should remove text before colon and spaces', () => {
    expect(stripSubject('PERSONAL: Hello world!')).toEqual(expected);
  });
  it('should remove text and square brackets between square brackets and spaces', () => {
    expect(stripSubject('[MORE [COMPLEX] ] Hello world!')).toEqual(expected);
  });
  it('should remove text and closing square bracket between square brackets and spaces', () => {
    expect(stripSubject('[What about wrong brackets] ] Hello world!')).toEqual(expected);
  });
  it('should remove text and colon between square brackets and spaces', () => {
    expect(stripSubject('[ And : inside ] Hello world!')).toEqual(expected);
  });
  it('should remove text, colon and square brackets before semicolon', () => {
    expect(stripSubject('[Inside : and ] outside : Hello world!')).toEqual(expected);
  });
  it('should remove line break and spaces', () => {
    expect(stripSubject('  Hello\nworld!')).toEqual(expected);
  });
  it('should remove closing square bracket, colons, and text before colon and text between square brackets and spaces', () => {
    expect(stripSubject(']:This:one:is:tricky: Hello [Invisible] world!')).toEqual(expected);
  });
  it('should remove colon and opening square bracket between square brackets and space', () => {
    expect(stripSubject('Hello[:[] world!')).toEqual(expected);
  });
});
