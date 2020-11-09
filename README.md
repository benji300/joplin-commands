# Joplin Note Extensions

_joplin-note-ext_ is a plugin to extend the UX and UI of [Joplin's](https://joplinapp.org/) desktop application.

It provides a set of [features](#features) to enhance working with notes and to-dos.

> **NOTE** - This plugin requires at least Joplin v1.3.9!

## Table of contents

* [Features](#features)
  * [New commands](#new-commands)
  * [Mapped commands](#mapped-commands)
  * [User options](#user-options)
* [Installation](#installation)
* [Uninstallation](#uninstallation)
* [Support](#support)
* [Changes](#changes)
* [License](#license)

## Features

* Add several [new commands](#new-commands) to
  * Update note properties (e.g. [Toggle to-do state](#toggle-to-do-state))
  * [Move notes](#move-notes) in current note list
  * and more...
  
* Map Joplin [internal commands](#mapped-commands) to the main menu
  * Allows to assign keyboard shortcuts to them.
 
* TODO user options

### New Commands

> **NOTE** - Default keyboard shortcuts can be changed in user options.\
> Navigate to `Tools > Options > Keyboard Shortcuts` and search for the command label to be changed.

> **NOTE** - Column `UI Locations` describes where buttons for the command can be added to the UI.\
> Whether the buttons are finally be displayed can be set in the [user options](#user-options).

#### Toggle to-do state

| Command Label      | Command ID        | Default Key             | UI Locations |
| ------------------ | ----------------- | ----------------------- | ------------ |
| Toggle to-do state | `toggleTodoState` | `CmdOrCtrl+Shift+Space` | Note toolbar |

Set the status of the selected to-do to either completed or open.

> **NOTE** - Works only with to-dos.

#### Touch note

| Command Label | Command ID  | Default Key | UI Locations |
| ------------- | ----------- | ----------- | ------------ |
| Touch note    | `touchNote` | -           | -            |

"Touch" the last updated timestamp of the selected note and set it to now.
Useful to move a note to the top of a list when the 'Updated date' sort is active.

> **NOTE** - The title or content of the note are _not_ changed.

#### Set URL

| Command Label | Command ID | Default Key | UI Locations |
| ------------- | ---------- | ----------- | ------------ |
| Set URL       | `editURL`  | -           | -            |

TODO describe more detailed...

#### Open URL in browser

| Command Label       | Command ID         | Default Key            | UI Locations |
| ------------------- | ------------------ | ---------------------- | ------------ |
| Open URL in browser | `openURLInBrowser` | `-`                    | Note toolbar |

TODO describe more detailed...

#### Move notes

| Command Label       | Command ID         | Default Key            | UI Locations |
| ------------------- | ------------------ | ---------------------- | ------------ |
| Move note to top    | `moveNoteToTop`    | `CmdOrCtrl+Alt+Up`     | Context menu |
| Move note up        | `moveNoteUp`       | `CmdOrCtrl+Shift+Up`   | Context menu |
| Move note down      | `moveNoteDown`     | `CmdOrCtrl+Shift+Down` | Context menu |
| Move note to bottom | `moveNoteToBottom` | `CmdOrCtrl+Alt+Down`   | Context menu |

Change the position of a note in the current note list if 'Custom order' sort is active.

> **NOTE** - Sorting in `All notes` list is _not_ possible.

### Mapped commands

The following internal commands are mapped to main menu entries. This allows to assign keyboard shortcuts to them.
 
| Menu    | Command Label       | Command ID         | Default Key            |
| --------| ------------------- | ------------------ | ---------------------- |
| Edit    | Checkbox            | `textCheckbox`     | `CmdOrCtrl+Shift+C`    |
| Note    | Move to notebook    | `moveToFolder`     | `CmdOrCtrl+Shift+M`    |
| Note    | Set alarm           | `editAlarm`        | -                      |

### User options

This plugin adds the following user options which can be accessed via `Tools > Options > Note Extensions`.

> **NOTE** - Changes to the user options are only applied after a restart of the app.

- Show [Toggle to-do state](#toggle-to-do-state) button on note toolbar:\
  _Select whether an button for the command shall be shown on the note toolbar (next to note title) or not_

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
