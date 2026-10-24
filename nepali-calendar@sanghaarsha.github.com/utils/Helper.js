import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

Gio._promisify(Gio.File.prototype, 'load_contents_async');

export const readJsonFileAsync = (filePath, extensionPath) => {
  return new Promise((resolve) => {
    const fullPath = GLib.build_filenamev([extensionPath, filePath]);
    const file = Gio.File.new_for_path(fullPath);

    file
      .load_contents_async(null)
      .then(([contents]) => {
        const decoder = new TextDecoder('utf-8');
        const jsonString = decoder.decode(contents);
        resolve(JSON.parse(jsonString));
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(`Error reading JSON file: ${filePath}`, error.message);
        resolve({});
      });
  });
};

const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export const convertToNepaliNumber = (number) => {
  if (number === null || number === undefined) {
    return '';
  }
  return number
    .toString()
    .split('')
    .map((char) => {
      const digit = parseInt(char, 10);
      return !isNaN(digit) ? NEPALI_DIGITS[digit] : char;
    })
    .join('');
};

export const formatNumberBySystem = (number, numeralSystem = 'nepali') => {
  if (numeralSystem === 'english') {
    return number.toString();
  }
  return convertToNepaliNumber(number);
};
