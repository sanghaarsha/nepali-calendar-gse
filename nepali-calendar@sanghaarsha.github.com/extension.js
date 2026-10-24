import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import Pango from 'gi://Pango';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {
  Extension,
  gettext as _,
} from 'resource:///org/gnome/shell/extensions/extension.js';

import {
  getCurrentNepaliDate,
  preloadYearData,
  formatNepaliDateData,
  formatTopBarText,
} from './utils/NepaliDateConverter.js';

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    _init(settings) {
      super._init(0.5, 'Nepali Calendar');
      this._settings = settings;
      this._updateTimeout = null;
      this._dailyUpdateTimeout = null;

      // Top bar panel box
      this._box = new St.BoxLayout({
        style_class: 'panel-status-menu-box np-cal-panel-box',
        y_align: Clutter.ActorAlign.CENTER,
      });

      this._icon = new St.Icon({
        icon_name: 'x-office-calendar-symbolic',
        style_class: 'system-status-icon np-cal-panel-icon',
      });
      this._box.add_child(this._icon);

      this._nepaliDateLabel = new St.Label({
        text: '',
        y_align: Clutter.ActorAlign.CENTER,
        style_class: 'np-cal-top-bar-date-label',
      });
      this._box.add_child(this._nepaliDateLabel);

      this.add_child(this._box);

      this._createPopupMenu();
      this.updateSettings();
      this._scheduleMidnightUpdate();

      this.menu.connectObject(
        'open-state-changed',
        (menu, isOpen) => {
          if (isOpen) {
            this.updatePopup();
          }
        },
        this
      );
    }

    _createPopupMenu() {
      this._popupContainer = new St.BoxLayout({
        orientation: Clutter.Orientation.VERTICAL,
        style_class: 'np-cal-popup-container',
      });

      // 1. Header: Nepali Year and Month (stably centered)
      this._yearMonthLabel = new St.Label({
        text: '',
        style_class: 'np-cal-year-month-label',
        x_align: Clutter.ActorAlign.CENTER,
      });
      this._popupContainer.add_child(this._yearMonthLabel);

      // 2. Libadwaita Hero Card
      this._heroCard = new St.BoxLayout({
        orientation: Clutter.Orientation.HORIZONTAL,
        style_class: 'np-cal-hero-card',
        y_align: Clutter.ActorAlign.CENTER,
      });

      // Left: Date Tile
      this._dateTileBox = new St.BoxLayout({
        style_class: 'np-cal-date-tile',
        orientation: Clutter.Orientation.VERTICAL,
        x_align: Clutter.ActorAlign.CENTER,
        y_align: Clutter.ActorAlign.CENTER,
      });

      this._dateLabel = new St.Label({
        text: '',
        style_class: 'np-cal-date-tile-number',
        x_align: Clutter.ActorAlign.CENTER,
        y_align: Clutter.ActorAlign.CENTER,
      });
      this._dateTileBox.add_child(this._dateLabel);
      this._heroCard.add_child(this._dateTileBox);

      // Right: Details Column
      const detailsCol = new St.BoxLayout({
        orientation: Clutter.Orientation.VERTICAL,
        style_class: 'np-cal-details-col',
        y_align: Clutter.ActorAlign.CENTER,
        x_expand: true,
      });

      // Weekday
      this._dayLabel = new St.Label({
        text: '',
        style_class: 'np-cal-weekday-label',
      });
      detailsCol.add_child(this._dayLabel);

      // Gregorian English Date
      this._englishDateLabel = new St.Label({
        text: '',
        style_class: 'dim-label np-cal-english-date-label',
      });
      detailsCol.add_child(this._englishDateLabel);

      // Status Badges Row (Holiday & Tithi)
      const statusRow = new St.BoxLayout({
        orientation: Clutter.Orientation.HORIZONTAL,
        style_class: 'np-cal-status-row',
        y_align: Clutter.ActorAlign.CENTER,
      });

      this._holidayBadge = new St.Label({
        text: _('सार्वजनिक बिदा'),
        style_class: 'np-cal-badge np-cal-holiday-pill',
      });
      statusRow.add_child(this._holidayBadge);

      this._tithiBadge = new St.Label({
        text: '',
        style_class: 'np-cal-badge np-cal-tithi-pill',
      });
      statusRow.add_child(this._tithiBadge);

      detailsCol.add_child(statusRow);
      this._heroCard.add_child(detailsCol);

      this._popupContainer.add_child(this._heroCard);

      // 3. Subtle Divider
      this._divider = new St.Widget({
        style_class: 'np-cal-popup-divider',
      });
      this._popupContainer.add_child(this._divider);

      // 4. Events / Festivals Container
      this._eventsContainer = new St.BoxLayout({
        orientation: Clutter.Orientation.VERTICAL,
        style_class: 'np-cal-events-container',
      });
      this._popupContainer.add_child(this._eventsContainer);

      // Wrap container in PopupBaseMenuItem
      const customItem = new PopupMenu.PopupBaseMenuItem({
        reactive: false,
        can_focus: false,
        activate: false,
      });
      customItem.add_style_class_name('np-cal-custom-popup-item');
      customItem.add_child(this._popupContainer);

      this.menu.addMenuItem(customItem);
    }

    updateSettings() {
      const showIcon = this._settings
        ? this._settings.get_boolean('show-icon')
        : false;
      this._icon.visible = showIcon;

      this.updateLabel();
      this.updatePopup();
    }

    updateLabel() {
      const today = getCurrentNepaliDate();
      const text = formatTopBarText(today, this._settings);
      this._nepaliDateLabel.set_text(text);
    }

    updatePopup() {
      const today = getCurrentNepaliDate();
      const numeralSystem = this._settings
        ? this._settings.get_string('numeral-system')
        : 'nepali';
      const showEnglish = this._settings
        ? this._settings.get_boolean('show-english-dates')
        : true;
      const showTithi = this._settings
        ? this._settings.get_boolean('show-tithi')
        : true;
      const highlightHolidays = this._settings
        ? this._settings.get_boolean('highlight-holidays')
        : true;
      const showEvents = this._settings
        ? this._settings.get_boolean('show-events')
        : true;

      const formatted = formatNepaliDateData(today, numeralSystem);

      // 1. Year and Month
      this._yearMonthLabel.set_text(
        `${formatted.nepaliYear} ${formatted.nepaliMonth}`
      );

      // Holiday status (public holiday or Saturday)
      const isSaturday = today.nepaliDayOfWeek === 7;
      const isHolidayToday =
        highlightHolidays && (formatted.isHoliday || isSaturday);

      if (isHolidayToday) {
        this._holidayBadge.visible = true;
        this._dayLabel.add_style_class_name('np-cal-holiday-text');
        this._dateTileBox.add_style_class_name('np-cal-date-tile-holiday');
      } else {
        this._holidayBadge.visible = false;
        this._dayLabel.remove_style_class_name('np-cal-holiday-text');
        this._dateTileBox.remove_style_class_name('np-cal-date-tile-holiday');
      }

      // 2. Day & Date
      this._dayLabel.set_text(formatted.nepaliDayOfWeek);
      this._dateLabel.set_text(formatted.nepaliDay);

      // 3. Gregorian English Date
      if (showEnglish) {
        this._englishDateLabel.set_text(formatted.englishFullDate);
        this._englishDateLabel.visible = true;
      } else {
        this._englishDateLabel.visible = false;
      }

      // 4. Lunar Tithi
      if (showTithi && formatted.nepaliTithi && formatted.nepaliTithi !== '-') {
        this._tithiBadge.set_text(formatted.nepaliTithi);
        this._tithiBadge.visible = true;
      } else {
        this._tithiBadge.visible = false;
      }

      // 5. Events / Festivals
      this._eventsContainer.destroy_all_children();
      const rawEvents = formatted.nepaliEvent;
      const hasEvents = rawEvents && rawEvents !== '-' && rawEvents !== '--';

      if (showEvents && hasEvents) {
        this._divider.visible = true;
        this._eventsContainer.visible = true;

        const eventList = rawEvents
          .split('/')
          .map((e) => e.trim())
          .filter((e) => e.length > 0);

        eventList.forEach((eventName) => {
          const row = new St.BoxLayout({
            orientation: Clutter.Orientation.HORIZONTAL,
            style_class: 'np-cal-event-row',
            y_align: Clutter.ActorAlign.CENTER,
            x_align: Clutter.ActorAlign.CENTER,
          });

          const icon = new St.Icon({
            icon_name: 'emblem-favorite-symbolic',
            icon_size: 14,
            style_class: 'np-cal-event-icon',
          });
          const label = new St.Label({
            text: eventName,
            style_class: 'np-cal-event-label',
          });
          label.clutter_text.line_wrap = true;
          label.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;

          row.add_child(icon);
          row.add_child(label);
          this._eventsContainer.add_child(row);
        });
      } else {
        this._divider.visible = false;
        this._eventsContainer.visible = false;
      }
    }

    _scheduleMidnightUpdate() {
      const SECONDS_PER_DAY = 86400;
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 1, 0); // 1 second past midnight
      const timeUntilMidnight = Math.max(1, (midnight - now) / 1000);

      if (this._updateTimeout) {
        GLib.source_remove(this._updateTimeout);
        this._updateTimeout = null;
      }

      try {
        this._updateTimeout = GLib.timeout_add_seconds(
          GLib.PRIORITY_DEFAULT,
          timeUntilMidnight,
          () => {
            this.updateLabel();
            this.updatePopup();

            this._dailyUpdateTimeout = GLib.timeout_add_seconds(
              GLib.PRIORITY_DEFAULT,
              SECONDS_PER_DAY,
              () => {
                this.updateLabel();
                this.updatePopup();
                return GLib.SOURCE_CONTINUE;
              }
            );
            return GLib.SOURCE_REMOVE;
          }
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to setup midnight update timer:', error);
      }
    }

    destroy() {
      if (this._updateTimeout) {
        GLib.source_remove(this._updateTimeout);
        this._updateTimeout = null;
      }

      if (this._dailyUpdateTimeout) {
        GLib.source_remove(this._dailyUpdateTimeout);
        this._dailyUpdateTimeout = null;
      }

      super.destroy();
    }
  }
);

export default class NepaliCalendar extends Extension {
  constructor(metadata) {
    super(metadata);
    this._indicator = null;
    this._settings = null;
    this._settingsSignalIds = [];
  }

  async enable() {
    this._settings = this.getSettings();
    const position = this._settings.get_string('menu-position');

    try {
      await preloadYearData(this.path);

      if (!this._settings) {
        return;
      }

      this._indicator = new Indicator(this._settings);
      Main.panel.addToStatusArea(this.uuid, this._indicator, 1, position);

      this._listenToSettings();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to enable Nepali Calendar extension:', error);
    }
  }

  _listenToSettings() {
    if (!this._settings) {
      return;
    }

    const posId = this._settings.connect('changed::menu-position', () => {
      const newPosition = this._settings.get_string('menu-position');
      this._moveIndicator(newPosition);
    });
    this._settingsSignalIds.push(posId);

    const settingKeys = [
      'top-bar-format',
      'show-day-of-week',
      'show-year',
      'numeral-system',
      'show-icon',
      'show-english-dates',
      'highlight-holidays',
      'show-tithi',
      'show-events',
    ];

    settingKeys.forEach((key) => {
      const id = this._settings.connect(`changed::${key}`, () => {
        if (this._indicator) {
          this._indicator.updateSettings();
        }
      });
      this._settingsSignalIds.push(id);
    });
  }

  _moveIndicator(newPosition) {
    if (!this._indicator) {
      return;
    }
    this._indicator.destroy();
    this._indicator = new Indicator(this._settings);
    Main.panel.addToStatusArea(this.uuid, this._indicator, 1, newPosition);
  }

  disable() {
    if (this._settings) {
      this._settingsSignalIds.forEach((id) => {
        this._settings.disconnect(id);
      });
      this._settingsSignalIds = [];
      this._settings = null;
    }

    if (this._indicator) {
      this._indicator.destroy();
      this._indicator = null;
    }
  }
}
