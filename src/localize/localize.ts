import * as en from './languages/en.json';
import * as es from './languages/es.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const languages: any = {
  en: en,
  es: es,
};

export function localize(string: string, ...args: string[]): string {
  const lang = (localStorage.getItem('selectedLanguage') || 'en').replace(/['"]+ /g, '').replace('-', '_');

  let translated: string;

  try {
    translated = string.split('.').reduce((o, i) => o[i], languages[lang]);
  } catch (e) {
    translated = string.split('.').reduce((o, i) => o[i], languages['en']);
  }

  if (translated === undefined) translated = string.split('.').reduce((o, i) => o[i], languages['en']);

  // Replace {0}, {1}, etc. with provided arguments
  if (args.length > 0) {
    args.forEach((arg, index) => {
      translated = translated.replace(`{${index}}`, arg);
    });
  }

  return translated;
}
