# Campus Connect Status Highlighter

A Tampermonkey userscript that highlights Campus Connect trackers and report with color-coded side stripes and optional filters.  
Makes it easier to scan a list of events for status — now with *racing stripes* for upcoming events. 🏁  

## Features

- **Color-coded borders:** Each event row gets a left stripe based on its status  
  - **Setup (yellow):** Needs vetting, orientation, or setup tasks  
  - **Planning (blue):** Organizers are actively preparing  
  - **Finalizing (purple):** Budget, contracts, or schedule approval in progress  
  - **Scheduled (green):** Everything ready to go  
  - **Completed (dark gray):** The event is done and closed  
  - **Cancelled/Declined (light gray):** Events that won’t take place  
- **Racing stripes:** Events starting within three weeks show a white-accented stripe (⚡️ subtle, not scary).  
- **Filter panel:** Quickly toggle visibility for each status, or check “Starting Soon Only” to see just upcoming events.  
- **Works across pages:** Automatically adapts to both the [**Campus Connect Tracker List**](https://central.wordcamp.org/wp-admin/edit.php?post_type=wordcamp&post_status=all&type=campusconnect) and [**Campus Connect Details**](https://central.wordcamp.org/wp-admin/index.php?page=wordcamp-reports&report=campus-connect-details) report on WordCamp Central.

## Note
On the trackers list, filters only apply to the current page. Consider increasing the number in Screen Options (I use 30).

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser.  
2. Click the raw link to the script:  
   [**Event Status Highlighter.user.js**](https://raw.githubusercontent.com/WordPress/Community-Team/scripts/highlighter/master/org/statushighlighter.user.js)  
3. Tampermonkey will prompt you to install the script.  
4. Visit any [WordCamp Central](https://central.wordcamp.org/wp-admin/) tracker or report page — highlights will appear automatically.

## Development

- Copied from https://github.com/supernovia/Scripts/tree/master/org. This script is currently **velda-vibe-coded** with some manual edits, but inspired by similar idea my son helped me with many years ago. So, props to [Ethan](https://github.com/EthanChristensen01)!
- Contributions, bug reports, and tweaks welcome! Please open an [issue](../../issues) or submit a PR.  
- When updating, please bump the version number for patches and major changes.

## License

Licensed under the [GNU General Public License v2.0 or later (GPL-2.0+)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html).  
