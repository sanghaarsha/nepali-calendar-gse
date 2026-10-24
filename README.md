# Nepali Calendar GNOME Shell Extension (`nepali-calendar-gse`)

A modern GNOME Shell extension that provides a native Bikram Sambat (BS) Nepali calendar in the top panel with a sleek modern popup card, dual English/Nepali dates, holiday and weekend highlights, and lunar Tithi details.

> **Note**: This project is a modernized fork of [PublisherName/nepali-calendar-gs-extension](https://github.com/PublisherName/nepali-calendar-gs-extension) originally created by **Subash Ghimire** ([@PublisherName](https://github.com/PublisherName)).

## Features

- **Modern Compact Popup Card**: Clean, sleek popup displaying the current Nepali date, weekday, Gregorian equivalent, lunar Tithi, and upcoming festivals.
- **Dual-Date Display**: Shows both Bikram Sambat date and Gregorian English date.
- **Native GNOME Theme Fidelity**: Seamlessly adapts to light, dark, and custom themes (e.g., Catppuccin, Adwaita) and respects accent colors.
- **Today & Events Card**: Displays full Nepali/English date, circular day badge, lunar Tithi pill, public holiday badge (`सार्वजनिक बिदा`), and a list of festivals/events.
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
   gnome-extensions enable nepali-calendar@sanghaarsha.github.com
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
   uv run shexli nepali-calendar@sanghaarsha.github.com.zip
   ```

4. Open preferences:
   ```bash
   gnome-extensions prefs nepali-calendar@sanghaarsha.github.com
   ```

## Credits & Acknowledgements

- **Original Author**: [Subash Ghimire](https://github.com/PublisherName) ([@PublisherName](https://github.com/PublisherName)) for creating the original [Nepali Calendar GNOME Shell Extension](https://github.com/PublisherName/nepali-calendar-gs-extension) and compiling the Bikram Sambat calendar dataset.
- **Original Extension**: Available on [extensions.gnome.org (EGO #7490)](https://extensions.gnome.org/extension/7490/nepali-calendar/).
- **Current Maintainer**: [Sangharsha Dahal](https://github.com/sanghaarsha) ([@sanghaarsha](https://github.com/sanghaarsha)).

## License
This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
