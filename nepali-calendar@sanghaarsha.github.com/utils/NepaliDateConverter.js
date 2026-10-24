import {
  readJsonFileAsync,
  convertToNepaliNumber,
  formatNumberBySystem,
  padZero,
} from './Helper.js';

export const MIN_SUPPORTED_YEAR = 2081;
export const MAX_SUPPORTED_YEAR = 2085;

export const NEPALI_MONTHS = [
  'बैशाख',
  'जेठ',
  'असार',
  'साउन',
  'भदौ',
  'असोज',
  'कार्तिक',
  'मंसिर',
  'पुष',
  'माघ',
  'फाल्गुन',
  'चैत',
];

export const NEPALI_WEEKDAYS = [
  'आइतबार',
  'सोमबार',
  'मंगलबार',
  'बुधबार',
  'बिहीबार',
  'शुक्रबार',
  'शनिबार',
];

export const NEPALI_WEEKDAYS_SHORT = [
  'आइत',
  'सोम',
  'मङ्गल',
  'बुध',
  'बिही',
  'शुक्र',
  'शनि',
];

export const ENGLISH_WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const ENGLISH_WEEKDAYS_SHORT = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

export const nepaliCalendarData = {
  2081: {
    monthDays: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    totalDays: 366,
  },
  2082: {
    monthDays: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    totalDays: 365,
  },
  2083: {
    monthDays: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    totalDays: 365,
  },
  2084: {
    monthDays: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
    totalDays: 365,
  },
  2085: {
    monthDays: [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30],
    totalDays: 365,
  },
};

const yearDataCache = new Map();

export const preloadYearData = async (extensionPath) => {
  const years = [2081, 2082, 2083, 2084, 2085];
  const loadPromises = years.map(async (year) => {
    if (!yearDataCache.has(year)) {
      const data = await readJsonFileAsync(`data/${year}.json`, extensionPath);
      yearDataCache.set(year, data);
    }
  });
  await Promise.all(loadPromises);
};

export const getYearDataFromCache = (year) => {
  const y = parseInt(year, 10);
  if (!y || isNaN(y)) {
    return null;
  }
  return yearDataCache.get(y) || null;
};

// Converts Nepali Date (BS) to Gregorian Date (AD) and weekday index (0=Sun..6=Sat)
export const nepaliToGregorian = (npYear, npMonth, npDay) => {
  let totalDays = 0;
  for (let y = MIN_SUPPORTED_YEAR; y < npYear; y++) {
    totalDays += nepaliCalendarData[y].totalDays;
  }
  for (let m = 1; m < npMonth; m++) {
    totalDays += nepaliCalendarData[npYear].monthDays[m - 1];
  }
  totalDays += npDay - 1;

  // Reference: 2081-01-01 BS = 2024-04-13 AD (Saturday, weekday index 6)
  const refUtc = Date.UTC(2024, 3, 13);
  const targetUtc = refUtc + totalDays * 86400000;
  const gregDate = new Date(targetUtc);
  const weekday = (6 + totalDays) % 7;

  return { gregDate, weekday };
};

// Converts Gregorian Date to Nepali Date (BS)
export const gregorianToNepali = (gregDate = new Date()) => {
  const refUtc = Date.UTC(2024, 3, 13);
  const targetUtc = Date.UTC(
    gregDate.getFullYear(),
    gregDate.getMonth(),
    gregDate.getDate()
  );
  let diffDays = Math.floor((targetUtc - refUtc) / 86400000);

  if (diffDays < 0) {
    return {
      nepaliYear: MIN_SUPPORTED_YEAR,
      nepaliMonth: 1,
      nepaliDay: 1,
      nepaliDayOfWeek: 7,
    };
  }

  let y = MIN_SUPPORTED_YEAR;
  while (y <= MAX_SUPPORTED_YEAR) {
    const yDays = nepaliCalendarData[y].totalDays;
    if (diffDays >= yDays) {
      diffDays -= yDays;
      y++;
    } else {
      break;
    }
  }

  if (y > MAX_SUPPORTED_YEAR) {
    y = MAX_SUPPORTED_YEAR;
    diffDays = nepaliCalendarData[y].totalDays - 1;
  }

  let m = 1;
  while (m <= 12) {
    const mDays = nepaliCalendarData[y].monthDays[m - 1];
    if (diffDays >= mDays) {
      diffDays -= mDays;
      m++;
    } else {
      break;
    }
  }

  const d = diffDays + 1;
  const dayOfWeek = gregDate.getDay() + 1; // 1 = Sun .. 7 = Sat

  return {
    nepaliYear: y,
    nepaliMonth: m,
    nepaliDay: d,
    nepaliDayOfWeek: dayOfWeek,
    englishDate: gregDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }),
  };
};

export const getCurrentNepaliDate = () => {
  return gregorianToNepali(new Date());
};

export const getTithiAndEventForNepaliDate = (nepaliDate) => {
  const data = getYearDataFromCache(nepaliDate.nepaliYear);
  let tithi = '-';
  let event = '-';
  let isHoliday = false;

  if (data && data[nepaliDate.nepaliMonth - 1]) {
    const dayData = data[nepaliDate.nepaliMonth - 1].days.find(
      (d) => d.dayInEn === nepaliDate.nepaliDay.toString()
    );
    if (dayData) {
      tithi = dayData.tithi || '-';
      event = dayData.event || '-';
      isHoliday = !!dayData.isHoliday;
    }
  }

  return { tithi, event, isHoliday };
};

export const formatNepaliDateData = (
  nepaliDate,
  numeralSystem = 'nepali'
) => {
  const formattedYear = formatNumberBySystem(
    nepaliDate.nepaliYear,
    numeralSystem
  );
  const formattedMonth = NEPALI_MONTHS[nepaliDate.nepaliMonth - 1];
  const formattedDay = formatNumberBySystem(
    nepaliDate.nepaliDay,
    numeralSystem
  );
  const formattedDayOfWeek = NEPALI_WEEKDAYS[nepaliDate.nepaliDayOfWeek - 1];

  const { tithi, event, isHoliday } =
    getTithiAndEventForNepaliDate(nepaliDate);

  const { gregDate } = nepaliToGregorian(
    nepaliDate.nepaliYear,
    nepaliDate.nepaliMonth,
    nepaliDate.nepaliDay
  );

  const englishFullDate = gregDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  return {
    nepaliYear: formattedYear,
    nepaliMonth: formattedMonth,
    nepaliDay: formattedDay,
    nepaliDayOfWeek: formattedDayOfWeek,
    englishDate: nepaliDate.englishDate,
    englishFullDate,
    nepaliTithi: tithi,
    nepaliEvent: event,
    isHoliday,
  };
};

// Generates the label text for the GNOME Shell top panel
export const formatTopBarText = (nepaliDate, settings) => {
  const numeralSystem = settings
    ? settings.get_string('numeral-system')
    : 'nepali';
  const format = settings ? settings.get_string('top-bar-format') : 'full';
  const showDayOfWeek = settings
    ? settings.get_boolean('show-day-of-week')
    : true;
  const showYear = settings ? settings.get_boolean('show-year') : false;

  const dayStr = formatNumberBySystem(nepaliDate.nepaliDay, numeralSystem);
  const monthStr = NEPALI_MONTHS[nepaliDate.nepaliMonth - 1];
  const yearStr = formatNumberBySystem(nepaliDate.nepaliYear, numeralSystem);
  const weekdayStr = NEPALI_WEEKDAYS[nepaliDate.nepaliDayOfWeek - 1];

  let text = '';
  switch (format) {
    case 'date-only':
      text = dayStr;
      break;
    case 'medium':
      text = `${dayStr} ${monthStr}`;
      break;
    case 'full':
    default:
      text = `${dayStr} ${monthStr}`;
      if (showDayOfWeek) {
        text += ` (${weekdayStr})`;
      }
      break;
  }

  if (showYear && format !== 'date-only') {
    text = `${text} ${yearStr}`;
  }

  return text;
};
