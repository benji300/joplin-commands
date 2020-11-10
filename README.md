# Joplin Note Extensions

_joplin-note-ext_ is a plugin to extend the UX and UI of [Joplin's](https://joplinapp.org/) desktop application.

It provides [features](#features) to enhance working with notes and to-dos.

> **NOTE** - This plugin requires at least **Joplin v1.3.9**!

## Table of contents

- [Features](#features)
  - [New commands](#new-commands)
  - [Mapped commands](#mapped-commands)
  - [User options](#user-options)
- [Installation](#installation)
- [Uninstallation](#uninstallation)
- [Support](#support)
- [Changes](#changes)
- [License](#license)

## Features

- Several [new commands](#new-commands) to ...

  - Update note properties (e.g. [Toggle to-do state](#toggle-to-do-state))
  - [Move notes](#move-notes) in current note list
  - and more...

- Map Joplin [internal commands](#mapped-commands) to the main menu

  - Allows to assign keyboard shortcuts to them

- Several [user options](#user-options) to specify additional display locations for commands

  - For example to display also in note toolbar

### New Commands

This plugin provides the new commands as described in the following chapters.

- Column `Additional UI Locations` describes where the command can additionally be added to the UI
  - Whether the command is displayed or not can be set in the [user options](#user-options)
- Default keyboard shortcuts can be changed in user options
  - Navigate to `Tools > Options > Keyboard Shortcuts` and search for the command label to be changed

#### Toggle to-do state

| Command Label      | Command ID        | Default Key             | Menu   | Additional UI Locations       |
| ------------------ | ----------------- | ----------------------- | ------ | ----------------------------- |
| Toggle to-do state | `toggleTodoState` | `CmdOrCtrl+Shift+Space` | `Note` | Note context,<br>Note toolbar |

Set the status of the selected to-do to either completed or open.

> **NOTE** - Works only with to-dos.

#### Copy note ID

| Command Label | Command ID   | Default Key | Menu                     | Additional UI Locations |
| ------------- | ------------ | ----------- | ------------------------ | ----------------------- |
| Copy note ID  | `copyNoteId` | -           | `Note > Note properties` | Note context            |

Copy the IDs of all selected notes to the clipboard.

#### Set URL

| Command Label | Command ID | Default Key | Menu                     | Additional UI Locations |
| ------------- | ---------- | ----------- | ------------------------ | ----------------------- |
| Set URL       | `editURL`  | -           | `Note > Note properties` | -                       |

TODO describe more detailed...

#### Open URL in browser

| Command Label       | Command ID         | Default Key | Menu                     | Additional UI Locations |
| ------------------- | ------------------ | ----------- | ------------------------ | ----------------------- |
| Open URL in browser | `openURLInBrowser` | `-`         | `Note > Note properties` | Note toolbar            |

TODO describe more detailed...

#### Touch note

| Command Label | Command ID  | Default Key | Menu                     | Additional UI Locations |
| ------------- | ----------- | ----------- | ------------------------ | ----------------------- |
| Touch note    | `touchNote` | -           | `Note > Note properties` | -                       |

"Touch" the last updated timestamp of the selected note and set it to now.
Useful to move a note to the top of a list when the 'Updated date' sort is active.

> **NOTE** - Title or content of the note are _not_ changed

#### Move notes in list

| Command Label  | Command ID     | Default Key                | Menu                  | Additional UI Locations |
| -------------- | -------------- | -------------------------- | --------------------- | ----------------------- |
| Move to top    | `moveToTop`    | `CmdOrCtrl+Shift+Alt+Up`   | `Note > Move in list` | Note context            |
| Move up        | `moveUp`       | `CmdOrCtrl+Alt+Up`         | `Note > Move in list` | Note context            |
| Move down      | `moveDown`     | `CmdOrCtrl+Alt+Down`       | `Note > Move in list` | Note context            |
| Move to bottom | `moveToBottom` | `CmdOrCtrl+Shift+Alt+Down` | `Note > Move in list` | Note context            |

Change the position of a note in the current note list if 'Custom order' sort is active.

> **NOTE** - Sorting in `All notes` is _not_ possible

### Mapped commands

The following internal commands are mapped to main menu entries. This allows to assign keyboard shortcuts to them.

| Menu                   | Command Label    | Command ID     | Default Key         |
| ---------------------- | ---------------- | -------------- | ------------------- |
| Edit                   | Checkbox         | `textCheckbox` | `CmdOrCtrl+Shift+C` |
| Note                   | Move to notebook | `moveToFolder` | `CmdOrCtrl+Shift+M` |
| Note > Note properties | Set alarm        | `editAlarm`    | -                   |

### User options

This plugin adds the following user options which can be accessed via `Tools > Options > Note Extensions`.

> **NOTE** - Changes to the user options are only applied after a restart of the app

- Show [Open URL in browser](#open-url-in-browser) on note toolbar:\
  _Select whether a button for the command shall be shown on the note toolbar (next to note title) or not_

- Show [Toggle to-do state](#toggle-to-do-state) on note toolbar:\
  _Select whether a button for the command shall be shown on the note toolbar (next to note title) or not_

> TODO - Add user options here...

## Installation

> TODO - Add steps to install the plugin here...

## Uninstallation

> TODO - Add steps to uninstall the plugin here...

## Support

If you need help or found a bug, open an issue on [GitHub](https://github.com/benji300/joplin-note-ext/issues).

## Changes

See [CHANGELOG](./CHANGELOG.md) for details.

## License

Copyright (c) 2020 Benjamin Seifert

MIT License. See [LICENSE](./LICENSE) for more information.
