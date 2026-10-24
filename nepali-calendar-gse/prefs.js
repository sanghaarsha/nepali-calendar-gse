import {
  ExtensionPreferences,
  gettext as _,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import Adw from 'gi://Adw';

export default class NepaliCalendarPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    window._settings = this.getSettings();

    // Main Page
    const page = new Adw.PreferencesPage({
      title: _('General'),
      icon_name: 'x-office-calendar-symbolic',
    });
    window.add(page);

    // 1. Top Panel Group
    const panelGroup = new Adw.PreferencesGroup({
      title: _('Top Panel'),
      description: _('Configure the top bar indicator appearance and format'),
    });
    page.add(panelGroup);

    // Position Row
    const positionOptions = [
      { id: 'left', label: _('Left') },
      { id: 'center', label: _('Center') },
      { id: 'right', label: _('Right') },
    ];
    const positionComboRow = new Adw.ComboRow({
      title: _('Panel Position'),
      subtitle: _('Select where to place the Nepali Calendar menu on the panel'),
    });
    const posModel = new Gtk.StringList();
    positionOptions.forEach((opt) => posModel.append(opt.label));
    positionComboRow.set_model(posModel);

    const currentPos = window._settings.get_string('menu-position');
    const posIdx = positionOptions.findIndex((opt) => opt.id === currentPos);
    positionComboRow.set_selected(posIdx !== -1 ? posIdx : 1);
    positionComboRow.connect('notify::selected', (combo) => {
      const selected = positionOptions[combo.selected];
      if (selected) {
        window._settings.set_string('menu-position', selected.id);
      }
    });
    panelGroup.add(positionComboRow);

    // Top Bar Format Row
    const formatOptions = [
      { id: 'full', label: _('Full (७ कार्तिक (शनिबार))') },
      { id: 'medium', label: _('Medium (७ कार्तिक)') },
      { id: 'date-only', label: _('Date Only (७)') },
    ];
    const formatComboRow = new Adw.ComboRow({
      title: _('Date Format'),
      subtitle: _('Choose how much date detail is displayed in the top bar'),
    });
    const formatModel = new Gtk.StringList();
    formatOptions.forEach((opt) => formatModel.append(opt.label));
    formatComboRow.set_model(formatModel);

    const currentFormat = window._settings.get_string('top-bar-format');
    const formatIdx = formatOptions.findIndex(
      (opt) => opt.id === currentFormat
    );
    formatComboRow.set_selected(formatIdx !== -1 ? formatIdx : 0);
    formatComboRow.connect('notify::selected', (combo) => {
      const selected = formatOptions[combo.selected];
      if (selected) {
        window._settings.set_string('top-bar-format', selected.id);
      }
    });
    panelGroup.add(formatComboRow);

    // Numeral System Row
    const numeralOptions = [
      { id: 'nepali', label: _('Nepali Digits (०, १, २, ३...)') },
      { id: 'english', label: _('English Digits (0, 1, 2, 3...)') },
    ];
    const numeralComboRow = new Adw.ComboRow({
      title: _('Numeral System'),
      subtitle: _('Digit style for dates across the panel and popup'),
    });
    const numeralModel = new Gtk.StringList();
    numeralOptions.forEach((opt) => numeralModel.append(opt.label));
    numeralComboRow.set_model(numeralModel);

    const currentNumeral = window._settings.get_string('numeral-system');
    const numeralIdx = numeralOptions.findIndex(
      (opt) => opt.id === currentNumeral
    );
    numeralComboRow.set_selected(numeralIdx !== -1 ? numeralIdx : 0);
    numeralComboRow.connect('notify::selected', (combo) => {
      const selected = numeralOptions[combo.selected];
      if (selected) {
        window._settings.set_string('numeral-system', selected.id);
      }
    });
    panelGroup.add(numeralComboRow);

    // Day of Week Switch
    const dayOfWeekRow = new Adw.SwitchRow({
      title: _('Show Day of the Week'),
      subtitle: _('Include the weekday in the top bar label'),
    });
    window._settings.bind(
      'show-day-of-week',
      dayOfWeekRow,
      'active',
      Gio.SettingsBindFlags.DEFAULT
    );
    panelGroup.add(dayOfWeekRow);

    // Show Year Switch
    const yearRow = new Adw.SwitchRow({
      title: _('Show Nepali Year'),
      subtitle: _('Include the Bikram Sambat year in the top bar label'),
    });
    window._settings.bind(
      'show-year',
      yearRow,
      'active',
      Gio.SettingsBindFlags.DEFAULT
    );
    panelGroup.add(yearRow);

    // Show Icon Switch
    const iconRow = new Adw.SwitchRow({
      title: _('Show Calendar Icon'),
      subtitle: _('Display a calendar icon next to the date in the panel'),
    });
    window._settings.bind(
      'show-icon',
      iconRow,
      'active',
      Gio.SettingsBindFlags.DEFAULT
    );
    panelGroup.add(iconRow);

    // 2. Popup Menu Group
    const popupGroup = new Adw.PreferencesGroup({
      title: _('Popup Menu'),
      description: _('Configure date details and information shown in the popup'),
    });
    page.add(popupGroup);

    // Show English Date Switch
    const englishDatesRow = new Adw.SwitchRow({
      title: _('Show Gregorian Date'),
      subtitle: _('Display corresponding English full date in the popup card'),
    });
    window._settings.bind(
      'show-english-dates',
      englishDatesRow,
      'active',
      Gio.SettingsBindFlags.DEFAULT
    );
    popupGroup.add(englishDatesRow);

    // Highlight Holidays Switch
    const holidaysRow = new Adw.SwitchRow({
      title: _('Highlight Holidays and Saturdays'),
      subtitle: _('Highlight official public holidays and Saturdays in the popup'),
    });
    window._settings.bind(
      'highlight-holidays',
      holidaysRow,
      'active',
      Gio.SettingsBindFlags.DEFAULT
    );
    popupGroup.add(holidaysRow);

    // Show Tithi Switch
    const tithiRow = new Adw.SwitchRow({
      title: _('Show Lunar Tithi'),
      subtitle: _('Display Nepali lunar Tithi badge in the popup card'),
    });
    window._settings.bind(
      'show-tithi',
      tithiRow,
      'active',
      Gio.SettingsBindFlags.DEFAULT
    );
    popupGroup.add(tithiRow);

    // Show Events Switch
    const eventsRow = new Adw.SwitchRow({
      title: _('Show Events and Festivals'),
      subtitle: _('Display cultural festivals and events in the popup card'),
    });
    window._settings.bind(
      'show-events',
      eventsRow,
      'active',
      Gio.SettingsBindFlags.DEFAULT
    );
    popupGroup.add(eventsRow);

    // 3. About Group
    const aboutGroup = new Adw.PreferencesGroup({
      title: _('About'),
    });
    page.add(aboutGroup);

    // Version Row
    const versionRow = new Adw.ActionRow({
      title: _('Version'),
      subtitle: '17',
    });
    aboutGroup.add(versionRow);

    // Extension UUID Row
    const uuidRow = new Adw.ActionRow({
      title: _('Extension UUID'),
      subtitle: 'nepali-calendar-gse',
    });
    aboutGroup.add(uuidRow);

    // Repository Link ActionRow
    const repoRow = new Adw.ActionRow({
      title: _('Source Code and Issues'),
      subtitle: 'https://github.com/sanghaarsha/nepali-calendar-gse',
      activatable: true,
    });
    const repoIcon = new Gtk.Image({
      icon_name: 'adw-external-link-symbolic',
      valign: Gtk.Align.CENTER,
    });
    repoRow.add_suffix(repoIcon);
    repoRow.connect('activated', () => {
      Gtk.show_uri(
        window,
        'https://github.com/sanghaarsha/nepali-calendar-gse',
        Gdk.CURRENT_TIME
      );
    });
    aboutGroup.add(repoRow);

    // Upstream Credit Row
    const upstreamRow = new Adw.ActionRow({
      title: _('Upstream Project'),
      subtitle: 'PublisherName/nepali-calendar-gs-extension',
      activatable: true,
    });
    const upstreamIcon = new Gtk.Image({
      icon_name: 'adw-external-link-symbolic',
      valign: Gtk.Align.CENTER,
    });
    upstreamRow.add_suffix(upstreamIcon);
    upstreamRow.connect('activated', () => {
      Gtk.show_uri(
        window,
        'https://github.com/PublisherName/nepali-calendar-gs-extension',
        Gdk.CURRENT_TIME
      );
    });
    aboutGroup.add(upstreamRow);
  }
}
