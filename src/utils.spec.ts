import { assert } from 'chai';
import 'mocha';
import { stripSubject } from './utils';

describe('stripSubject', () => {
  const expected = 'Helloworld!';

  it('should return same string', () => {
    assert.equal(stripSubject('Helloworld!'), expected);
  });
  it('should remove space', () => {
    assert.equal(stripSubject('Hello world!'), expected);
  });
  it('should remove multiple spaces', () => {
    assert.equal(stripSubject('H e l l o    w o r l d!'), expected);
  });
  it('should remove text between square brackets and spaces', () => {
    assert.equal(stripSubject('[PERSONAL] Hello world!'), expected);
  });
  it('should remove text before colon and spaces', () => {
    assert.equal(stripSubject('PERSONAL: Hello world!'), expected);
  });
  it('should remove text and square brackets between square brackets and spaces', () => {
    assert.equal(stripSubject('[MORE [COMPLEX] ] Hello world!'), expected);
  });
  it('should remove text and closing square bracket between square brackets and spaces', () => {
    assert.equal(
      stripSubject('[What about wrong brackets] ] Hello world!'),
      expected
    );
  });
  it('should remove text and colon between square brackets and spaces', () => {
    assert.equal(stripSubject('[ And : inside ] Hello world!'), expected);
  });
  it('should remove text, colon and square brackets before semicolon', () => {
    assert.equal(
      stripSubject('[Inside : and ] outside : Hello world!'),
      expected
    );
  });
  it('should remove line break and spaces', () => {
    assert.equal(stripSubject('  Hello\nworld!'), expected);
  });
  it('should remove closing square bracket, colons, and text before colon and text between square brackets and spaces', () => {
    assert.equal(
      stripSubject(']:This:one:is:tricky: Hello [Invisible] world!'),
      expected
    );
  });
  it('should remove colon and opening square bracket between square brackets and space', () => {
    assert.equal(stripSubject('Hello[:[] world!'), expected);
  });
});
