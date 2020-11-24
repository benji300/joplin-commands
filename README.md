# Joplin Command Collection

Joplin Command Collection is a plugin to extend the UX of [Joplin's](https://joplinapp.org/) desktop application.

It provides [new commands](#new-commands) or maps [internal commands](#mapped-commands) to the main menu to enhance working with notes and to-dos.

> :warning: **CAUTION** - Requires Joplin **v1.4.11** or newer

## Table of contents

- [Features](#features)
  - [New commands](#new-commands)
    - [Toggle to-do state](#toggle-to-do-state)
    - [Copy note ID](#copy-note-id)
    - [Copy Markdown link](#copy-markdown-link)
    - [Set URL](#set-url)
    - [Open URL in browser](#Open-url-in-browser)
    - [Touch note](#touch-note)
    - [Move note in list](#Move-note-in-list)
    - [Quick move note](#quick-move-note)
  - [Mapped commands](#mapped-commands)
  - [User options](#user-options)
- [Installation](#installation)
- [Uninstallation](#uninstallation)
- [Feedback](#feedback)
- [Development](#development)
- [Changes](#changes)
- [License](#license)

## Features

- Add new [commands](#new-commands) to ...
  - Update note properties (e.g. [Toggle to-do state](#toggle-to-do-state))
  - [Move notes](#move-notes) in current note list
  - and many more...
- Map Joplin [internal commands](#mapped-commands) to the main menu
  - Allows to assign keyboard shortcuts to them
- Add [user options](#user-options) to specify additional display locations for commands
  - For example to display also in note toolbar

### New commands

This plugin provides the commands as described in the following chapters.

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
| Copy note ID  | `copyNoteId` | -           | `Note > Note properties` | -                       |

Copy the IDs of all selected notes to the clipboard.

#### Copy Markdown link

| Command Label     | Command ID         | Default Key | Menu                     | Additional UI Locations |
| ----------------- | ------------------ | ----------- | ------------------------ | ----------------------- |
| Copy Markown link | `copyMarkdownLink` | -           | `Note > Note properties` | -                       |

Basically a replica of the internal command. But with an entry in the main menu, so that a keyboard shortcut can be assigned to it.

Also the command is available via the command palette now.

> **NOTE** - Works also with multiple selected notes.

#### Set URL

| Command Label | Command ID | Default Key | Menu                     | Additional UI Locations |
| ------------- | ---------- | ----------- | ------------------------ | ----------------------- |
| Set URL       | `editURL`  | -           | `Note > Note properties` | -                       |

Opens dialog to directly edit the URL of the note.

#### Open URL in browser

> :construction: **NOTE** - This command is urrently not implemented!

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

#### Move note in list

| Command Label  | Command ID     | Default Key          | Menu                  | Additional UI Locations |
| -------------- | -------------- | -------------------- | --------------------- | ----------------------- |
| Move to top    | `moveToTop`    | `CmdOrCtrl+num8`     | `Note > Move in list` | Note context            |
| Move up        | `moveUp`       | `CmdOrCtrl+Alt+num8` | `Note > Move in list` | Note context            |
| Move down      | `moveDown`     | `CmdOrCtrl+num2`     | `Note > Move in list` | Note context            |
| Move to bottom | `moveToBottom` | `CmdOrCtrl+Alt+num2` | `Note > Move in list` | Note context            |

Change the position of a note in the current note list (notebook), if `Sort notes by` is set to `Custom order`.

> **NOTE** - Sorting in `All notes` is _not_ possible

> **NOTE** - The default keys using num keys in order to trigger the commands also when focus is set to note list

#### Quick move note

| Command Label   | Command ID   | Default Key         | Menu             | Additional UI Locations |
| --------------- | ------------ | ------------------- | ---------------- | ----------------------- |
| Move to: `name` | `quickMove1` | `CmdOrCtrl+Shift+1` | `Note > Move to` | -                       |
| Move to: `name` | `quickMove2` | `CmdOrCtrl+Shift+2` | `Note > Move to` | -                       |
| Move to: `name` | `quickMove3` | `CmdOrCtrl+Shift+3` | `Note > Move to` | -                       |
| Move to: `name` | `quickMove4` | `CmdOrCtrl+Shift+4` | `Note > Move to` | -                       |
| Move to: `name` | `quickMove5` | `CmdOrCtrl+Shift+5` | `Note > Move to` | -                       |

Quickly move (without interaction) selected note to one of five predefined notebooks.

> **NOTE** - `name` is the user defined name of the notebook. See [user options](#user-options) for details

### Mapped commands

The following internal commands are mapped to main menu entries. This allows to assign keyboard shortcuts to them.

| Menu                | Command Label    | Command ID     | Default Key         |
| ------------------- | ---------------- | -------------- | ------------------- |
| `Edit`              | Checkbox         | `textCheckbox` | `CmdOrCtrl+Shift+C` |
| `Note > Move to`    | Move to notebook | `moveToFolder` | `CmdOrCtrl+Shift+M` |
| `Note > Properties` | Set alarm        | `editAlarm`    | -                   |

### User options

This plugin adds the following user options which can be accessed via `Tools > Options > Note Extensions`.

> **NOTE** - Changes to the user options are only applied after a restart of the app

- Show [Open URL in browser](#open-url-in-browser) on note toolbar:\
  _Select whether a button to open the note URL in the default browser shall be shown on the note toolbar or not._

- Show [Toggle to-do state](#toggle-to-do-state) on note toolbar:\
  _Select whether a button to toggle the to-do state (open/closed) shall be shown on the note toolbar or not._

- Enter notebook name for [quick move](#quick-move-note) action X _(where X is 0..5)_:\
  _Specify the name of a notebook to which the selected note can be moved quickly without interaction. This options exists 5 times.
  Currently the names must be copied manually from the sidebar._

## Installation

- Download the latest released JPL package (`com.benji300.joplin.commands.jpl`) from [here](https://github.com/benji300/joplin-commands/releases)
- Open Joplin
- Navigate to `Tools > Options > Plugins`
- Click `Install plugin` and select the previously downloaded `jpl` file
- Confirm selection
- Restart Joplin to enable the plugin

## Uninstallation

- Open Joplin
- Navigate to `Tools > Options > Plugins`
- Search for the `Command Collection` plugin
- Click `Delete` to remove the plugin from the user profile directory
  - Alternatively you can also disable the plugin by clicking on the toggle button
- Restart Joplin

## Feedback

If you need help or found a bug, open an issue on [GitHub](https://github.com/benji300/joplin-commands/issues).

## Development

### Building the plugin

If you want to build the plugin by your own simply run:

```
npm run dist
```

Or run to create also the archives:

```
npm run release
```

## Changes

See [CHANGELOG](./CHANGELOG.md) for details.

## License

Copyright (c) 2020 Benjamin Seifert

MIT License. See [LICENSE](./LICENSE) for more information.
