# Nepali Calendar GNOME Shell Extension (`nepali-calendar-gse`)

A modern GNOME Shell extension that provides a native Bikram Sambat (BS) Nepali calendar in the top panel with an interactive monthly calendar grid, dual English/Nepali dates, holiday and weekend highlights, and lunar Tithi details.

> **Note**: This project is a fork of [PublisherName/nepali-calendar-gs-extension](https://github.com/PublisherName/nepali-calendar-gs-extension) maintained at [sanghaarsha/nepali-calendar-gse](https://github.com/sanghaarsha/nepali-calendar-gse).

## Features

- **Interactive Month Grid**: 7-column monthly view supporting Bikram Sambat years 2081 through 2085.
- **Dual-Date Display**: Shows both Bikram Sambat date and secondary Gregorian date numbers in cells.
- **Native GNOME Theme Fidelity**: Seamlessly adapts to light, dark, and custom themes (e.g., Catppuccin, Adwaita) and respects accent colors.
- **Selected Day & Events Card**: Displays full Nepali/English date, lunar Tithi pill, public holiday badge (`सार्वजनिक बिदा`), and a list of festivals/events.
- **Configurable Top Panel**: Full, medium, or date-only formats, with numeral style options (Nepali ०-९ or English 0-9).
- **Libadwaita Preferences**: Modern settings window for customizing display, panel position, and calendar features.

## Installation

### Manual Installation
1. Clone this repository:
   ```bash
   git clone git@github.com:sanghaarsha/nepali-calendar-gse.git
   ```

2. Change directory into the repository:
   ```bash
   cd nepali-calendar-gse
   ```

3. Run the install script:
   ```bash
   ./install.sh
   ```

4. Enable the extension:
   ```bash
   gnome-extensions enable nepali-calendar-gse
   ```

## Development & Packaging

1. Install dependencies:
   ```bash
   uv sync
   ```

2. Build extension zip:
   ```bash
   ./build.sh
   ```

3. Validate with shexli:
   ```bash
   uv run shexli nepali-calendar-gse.zip
   ```

4. Open preferences:
   ```bash
   gnome-extensions prefs nepali-calendar-gse
   ```

## License
This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
