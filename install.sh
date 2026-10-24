#!/bin/bash

UUID="nepali-calendar@sanghaarsha.github.com"

glib-compile-schemas ./"$UUID"/schemas

if (( $EUID == 0 )); then
	INSTALL_DIR="/usr/share/gnome-shell/extensions"
else
	INSTALL_DIR="$HOME/.local/share/gnome-shell/extensions"
fi
mkdir -p "$INSTALL_DIR"

# Clean up legacy directory if present
if [ -d "$INSTALL_DIR/nepali-calendar-gse" ]; then
	rm -rf "$INSTALL_DIR/nepali-calendar-gse"
fi

echo "Installing extension files in $INSTALL_DIR/$UUID"
rm -rf "$INSTALL_DIR/$UUID"
cp -r "$UUID" "$INSTALL_DIR/"
glib-compile-schemas "$INSTALL_DIR/$UUID/schemas"

echo "Done."
exit 0
