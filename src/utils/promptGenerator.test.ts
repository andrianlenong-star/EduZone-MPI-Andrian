import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generatePromptText,
  validatePromptInput,
  EXAMPLE_DATA,
  EXAMPLE_TTS_DATA,
  getReadyToUseTTSCode,
  toneDescriptions,
} from './promptGenerator.ts';

test('validatePromptInput rejects empty fields', () => {
  const result1 = validatePromptInput('', '');
  assert.equal(result1.isValid, false);
  assert.ok(result1.errorMessage?.includes('Topik Materi'));

  const result2 = validatePromptInput('Fisika', '');
  assert.equal(result2.isValid, false);

  const result3 = validatePromptInput('  Fisika  ', '  SMA  ');
  assert.equal(result3.isValid, true);
});

test('generatePromptText generates valid prompt with EXAMPLE_DATA', () => {
  const prompt = generatePromptText(EXAMPLE_DATA);
  assert.ok(prompt.includes('Ahli Desain Instruksional'));
  assert.ok(prompt.includes('🔹 Topik Materi: Konsep Dasar Tata Surya (Planet-planet dan Karakteristiknya)'));
  assert.ok(prompt.includes('[INSTRUKSI FORMAT OUTPUT: APLIKASI WEB CANVAS]'));
});

test('generatePromptText handles tts_feature output instructions', () => {
  const prompt = generatePromptText(EXAMPLE_TTS_DATA);
  assert.ok(prompt.includes('[INSTRUKSI FORMAT OUTPUT: FITUR TEXT-TO-SPEECH (TTS) INTERAKTIF UNTUK MPI]'));
  assert.ok(prompt.includes('window.speechSynthesis'));
  assert.ok(prompt.includes('id-ID'));
  assert.ok(prompt.includes('0.8x'));
});

test('getReadyToUseTTSCode returns valid HTML/JS module code', () => {
  const code = getReadyToUseTTSCode();
  assert.ok(code.includes('MODUL TEXT-TO-SPEECH (TTS) INTERAKTIF EDUZONE MPI'));
  assert.ok(code.includes('ANDRIAN, S.S.Gr.'));
  assert.ok(code.includes('SpeechSynthesisUtterance'));
  assert.ok(code.includes('tts-highlight'));
});
