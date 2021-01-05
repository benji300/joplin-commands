# Joplin Command Collection

Joplin Command Collection is a plugin to extend the UX of [Joplin's](https://joplinapp.org/) desktop application.

It provides a collection of [new commands](#new-commands) to improve and speed up your daily work with the keyboard in Joplin.
Furthermore it maps also some [internal commands](#mapped-commands) to the main menu to allow to assign keyboard shortcuts to them.

> :warning: **CAUTION** - Requires Joplin **v1.4.16** or newer

> :construction: **BETA** - This is a development version at a very early stage. Please make a backup copy of the user data (especially from the database) before using this plugin. I don't think that the plugin causes any damage to the database, but unfortunately I can't rule it out completely. I neither have the time nor the possibilities to test all possible use cases.

## Table of contents

- [Features](#features)
  - [New commands](#new-commands)
    - [Toggle to-do state](#toggle-to-do-state)
    - [Copy Markdown link](#copy-markdown-link)
    - [Copy note ID](#copy-note-id)
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

- Add [new commands](#new-commands) to ...
  - Update note properties (e.g. [Toggle to-do state](#toggle-to-do-state))
  - [Move note](#move-note-in-list) in current note list
  - Quickly [move note to notebook](#quick-move-note) without interaction
  - and more...
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

#### Copy Markdown link

| Command Label     | Command ID         | Default Key | Menu   | Additional UI Locations |
| ----------------- | ------------------ | ----------- | ------ | ----------------------- |
| Copy Markown link | `copyMarkdownLink` | -           | `Note` | -                       |

Basically a replica of the internal command. But with an entry in the main menu, so that a keyboard shortcut can be assigned to it.

Also the command is available via the command palette now.

> **NOTE** - Works also with multiple selected notes.

#### Copy note ID

| Command Label | Command ID   | Default Key | Menu                | Additional UI Locations |
| ------------- | ------------ | ----------- | ------------------- | ----------------------- |
| Copy note ID  | `copyNoteId` | -           | `Note > Properties` | -                       |

Copy the IDs of all selected notes to the clipboard.

#### Set URL

| Command Label | Command ID | Default Key | Menu                | Additional UI Locations |
| ------------- | ---------- | ----------- | ------------------- | ----------------------- |
| Set URL       | `editURL`  | -           | `Note > Properties` | -                       |

Opens dialog to directly edit the URL of the note.

#### Open URL in browser

| Command Label       | Command ID | Default Key | Menu                | Additional UI Locations |
| ------------------- | ---------- | ----------- | ------------------- | ----------------------- |
| Open URL in browser | `openURL`  | `-`         | `Note > Properties` | Note toolbar            |

Opens the note URL in the system's default browser.

#### Touch note

| Command Label | Command ID  | Default Key | Menu                  | Additional UI Locations |
| ------------- | ----------- | ----------- | --------------------- | ----------------------- |
| Touch note    | `touchNote` | -           | `Note > Move in list` | -                       |

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

| Command Label   | Command ID   | Default Key         | Menu                      | Additional UI Locations |
| --------------- | ------------ | ------------------- | ------------------------- | ----------------------- |
| Move to: `name` | `quickMove1` | `CmdOrCtrl+Shift+1` | `Note > Move to notebook` | -                       |
| Move to: `name` | `quickMove2` | `CmdOrCtrl+Shift+2` | `Note > Move to notebook` | -                       |
| Move to: `name` | `quickMove3` | `CmdOrCtrl+Shift+3` | `Note > Move to notebook` | -                       |
| Move to: `name` | `quickMove4` | `CmdOrCtrl+Shift+4` | `Note > Move to notebook` | -                       |
| Move to: `name` | `quickMove5` | `CmdOrCtrl+Shift+5` | `Note > Move to notebook` | -                       |

Quickly move (without interaction) selected note to one of five predefined notebooks.

> **NOTE** - `name` is the user defined name of the notebook. See [user options](#user-options) for details

### Mapped commands

The following internal commands are mapped to main menu entries. This allows to assign keyboard shortcuts to them.

| Menu                      | Command Label    | Command ID     | Default Key         |
| ------------------------- | ---------------- | -------------- | ------------------- |
| `Edit`                    | Checkbox         | `textCheckbox` | `CmdOrCtrl+Shift+C` |
| `Note > Properties`       | Set alarm        | `editAlarm`    | -                   |
| `Note > Move to notebook` | Move to notebook | `moveToFolder` | `CmdOrCtrl+Shift+M` |

### User options

This plugin adds the following user options which can be accessed via `Tools > Options > Note Extensions`.

> **NOTE** - Changes to the user options are only applied after a restart of the app

- Show [Open URL in browser](#open-url-in-browser) on note toolbar:\
  _Select whether a button to open the note URL in the default browser shall be shown on the note toolbar or not._

- Show [Toggle to-do state](#toggle-to-do-state) on note toolbar:\
  _Select whether a button to toggle the to-do state (open/closed) shall be shown on the note toolbar or not._

- Enter notebook name for [quick move](#quick-move-note) action X _(where X is 0..5)_:\
  _Specify the name of a notebook to which the selected note can be moved quickly without interaction. This options exists 5 times.
  Currently the notebook names must be copied manually from the sidebar._

- Keep moved note selected:\
  If selected note is moved via one of the [quick move](#quick-move-note) actions, it shall still be selected afterwards.\
  Otherwise the next note within the current list will be selected.

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

- :question: Need help?
  - Ask a question on the [Joplin Forum](https://discourse.joplinapp.org/c/plugins/18) (TODO: Paste link to thread)
- :bulb: An idea to improve or enhance the plugin?
  - [Request a new feature](https://github.com/benji300/joplin-commands/issues) or upvote [popular feature requests](https://github.com/benji300/joplin-commands/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement+sort%3Areactions-%2B1-desc+)
- :bug: Found a bug?
  - File an issue on [GitHub](https://github.com/benji300/joplin-commands/issues)

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
