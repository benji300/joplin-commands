import joplin from "api";
import JoplinViewsDialogs from "api/JoplinViewsDialogs";
// import JoplinViewsDialogs from "api/JoplinViewsDialogs";
import { MenuItemLocation, ToolbarButtonLocation } from 'api/types';

const copy = require('../node_modules/copy-to-clipboard');
// const open = require('open');
// const { shell } = require('electron');

// predefined keyboard shortcuts
const accTextCheckbox = 'CmdOrCtrl+Shift+C';
const accToggleTodoState = 'CmdOrCtrl+Shift+Space';
const accMoveToFolder = 'CmdOrCtrl+Shift+M';
// API: Internal shortcuts may override these ones here
//      E.g. if note-list has focus - the "Up" key is always considered to change the selected note in the list
const accMoveToTop = 'CmdOrCtrl+Shift+Alt+Up';
const accMoveUp = 'CmdOrCtrl+Alt+Up';
const accMoveDown = 'CmdOrCtrl+Alt+Down';
const accMoveToBottom = 'CmdOrCtrl+Shift+Alt+Down';

joplin.plugins.register({
  onStart: async function () {
    const COMMANDS = joplin.commands;
    const DATA = joplin.data;
    const DIALOGS = joplin.views.dialogs;
    const SETTINGS = joplin.settings;
    const WORKSPACE = joplin.workspace;

    //#region INITIALIZE PLUGIN

    // prepare dialog/view/panel objects
    const dialogEditURL = await DIALOGS.create('dialogEditURL');

    //#endregion

    //#region REGISTER USER OPTIONS

    await SETTINGS.registerSection('joplin-note-ext', {
      label: 'Note Extensions',
      iconName: 'fas fa-file-medical', // TODO icon: tachometer-alt?
      description: 'Note: Changes are only applied after a restart.'
    });

    await SETTINGS.registerSetting('showOpenURLInBrowserToolbar', {
      value: false,
      type: 3,
      section: 'joplin-note-ext',
      public: true,
      label: 'Show "Open URL in browser" on note toolbar',
    });

    await SETTINGS.registerSetting('showToggleTodoStateToolbar', {
      value: false,
      type: 3,
      section: 'joplin-note-ext',
      public: true,
      label: 'Show "Toggle to-do state" on note toolbar',
    });

    //#endregion

    //#region REGISTER NEW COMMANDS

    // Command: toggleTodoState
    // Desc: Set 'todo_completed' of selected note to current timestamp (closed) or zero (open)
    await COMMANDS.register({
      name: 'toggleTodoState',
      label: 'Toggle to-do state',
      iconName: 'fas fa-check',
      // API: Disabling commands with "enabledCondition" has no effect in note context menu
      enabledCondition: "noteIsTodo && oneNoteSelected && !inConflictFolder",
      execute: async () => {
        // get the selected note and exit if none is currently selected
        const selectedNote = await WORKSPACE.selectedNote();
        if (!selectedNote) return;

        if (selectedNote.todo_completed) {
          await DATA.put(['notes', selectedNote.id], null, { todo_completed: 0 });
        } else {
          await DATA.put(['notes', selectedNote.id], null, { todo_completed: Date.now() });
        }

        // implementation to toggle state for multiple todos - not sure if it works correct
        // const noteIds = await WORKSPACE.selectedNoteIds();
        // for (let i = 0; i < noteIds.length; i++) {
        //   const note = await joplin.data.get(['notes', noteIds[i]], { fields: ['todo_completed'] });
        //   if (note.is_todo) {
        //     if (note.todo_completed) {
        //       await DATA.put(['notes', noteIds[i]], null, { todo_completed: 0 });
        //     } else {
        //       await DATA.put(['notes', noteIds[i]], null, { todo_completed: Date.now() });
        //     }
        //   }
        // }
      }
    });

    // Command: copyNoteId
    // Desc: Copy the IDs of all selected notes to the clipboard
    await COMMANDS.register({
      name: 'copyNoteId',
      label: 'Copy note ID',
      iconName: 'fas fa-copy',
      execute: async () => {
        // get the selected note IDs and exit if none is currently selected
        const selectedNoteIds = await WORKSPACE.selectedNoteIds();
        if (!selectedNoteIds) return;

        // copy each ID to clipboard
        const ids = [];
        for (let i = 0; i < selectedNoteIds.length; i++) {

          // TODO consider pagination here
          // https://joplinapp.org/api/references/rest_api/#pagination
          const note = await DATA.get(['notes', selectedNoteIds[i]], { fields: ['id'] });
          ids.push(note.id);
        }
        copy(ids.join('\n'));
      }
    });

    // Command: editURL
    // Desc: todo
    await COMMANDS.register({
      name: 'editURL',
      label: 'Set URL',
      iconName: 'fas fa-edit',
      enabledCondition: "oneNoteSelected && !inConflictFolder",
      execute: async () => {
        // get the selected note and exit if none is currently selected
        const selectedNote = await WORKSPACE.selectedNote();
        if (!selectedNote) return;

        // prepare and open dialog
        // API: dialog box is fixed to width which cannot be overwritten by plugin itself
        //      Adding "width: fit-content;" to parent container div#joplin-plugin-content fixes the problem
        await DIALOGS.setHtml(dialogEditURL, `
          <div class="joplin-note-ext-dialog">
            <form name="urlForm" style="display:grid;">
              <label style="padding:5px 2px;">Set URL</label>
              <input type="text" id="url" name="url" style="padding:2px;" value="${selectedNote.source_url}">
            </form>
          </div>
        `);
        const result = await DIALOGS.open(dialogEditURL);

        // get return and new URL value
        if (result.id == 'ok') {
          if (result.formData != null) {
            // let test = JSON.stringify(result);
            // await DIALOGS.showMessageBox(`Result: ${test}`);
            const newUrl = result.formData.urlForm.url as string;

            const boxResult = await DIALOGS.showMessageBox(`Set URL to: ${newUrl}`);
            if (boxResult != 0) return;

            await DATA.put(['notes', selectedNote.id], null, { source_url: newUrl });
          }
        }
      }
    });

    // Command: openURLInBrowser
    // Desc: todo
    await COMMANDS.register({
      name: 'openURLInBrowser',
      label: 'Open URL in browser',
      iconName: 'fas fa-external-link-square-alt',
      // TODO enableCondition possible? only if URL is set
      enabledCondition: "oneNoteSelected",
      execute: async () => {
        // get the selected note and exit if none is currently selected
        const selectedNote = await WORKSPACE.selectedNote();
        if (!selectedNote) return;

        // exit if 'source_url' is not set for note
        if (!selectedNote.source_url) return;

        // open URL in default browser
        // TODO wait for feedback from forum
        // https://discourse.joplinapp.org/t/how-to-open-url-in-default-browser-from-plugin/12376

        // 1: from joplin code - does not work
        // const bridge = require('electron').remote.require('./bridge').default;
        // bridge().openExternal(url);

        // 2: electron shell - does not work
        // const { shell } = require('electron');
        // shell.openExternal('https://github.com');

        // 3: npm open - does not work
        // https://github.com/pwnall/node-open
        // https://www.npmjs.com/package/open
        // first: npm install open
        // await open("http://www.google.com");
        // await open(note.source_url);

        // 4: built in open command - does not work
        // open('https://www.google.com', '_blank');
        // open(selectedNote.source_url, '_blank');

        await DIALOGS.showMessageBox(`Open URL: ${selectedNote.source_url}`);
      }
    });

    // Command: touchNote
    // Desc: Set 'updated_time' of selected note to current timestamp
    await COMMANDS.register({
      name: 'touchNote',
      label: 'Touch note',
      iconName: 'fas fa-hand-pointer',
      enabledCondition: "oneNoteSelected && !inConflictFolder",
      execute: async () => {
        // get the selected note and exit if none is currently selected
        const selectedNote = await WORKSPACE.selectedNote();
        if (!selectedNote) return;

        // set 'updated_time' to current timestamp value
        await DATA.put(['notes', selectedNote.id], null, { updated_time: Date.now() });
      },
    });

    // Command: moveToTop
    // Desc: todo
    await COMMANDS.register({
      name: 'moveToTop',
      label: 'Move to top',
      iconName: 'fas fa-angle-double-up',
      // TODO check if disabling is possible in case of other sort type
      // TODO enabledCondtion == !firstInList?
      enabledCondition: "oneNoteSelected && !inConflictFolder",
      execute: async () => {
        // get the selected note and exit if none is currently selected
        const selectedNote = await WORKSPACE.selectedNote();
        if (!selectedNote) return;

        // get the note sort order and exit if not custom order
        const sortOrder = await SETTINGS.globalValue("notes.sortOrder.field");
        if (sortOrder != 'order') return;

        // set 'order' to current timestamp value
        await DATA.put(['notes', selectedNote.id], null, { order: Date.now() });
      }
    });

    // Command: moveUp
    // Desc: todo
    await COMMANDS.register({
      name: 'moveUp',
      label: 'Move up',
      iconName: 'fas fa-angle-up',
      enabledCondition: "oneNoteSelected && !inConflictFolder",
      execute: async () => {
        // get the selected note and exit if none is currently selected
        const selectedNote = await WORKSPACE.selectedNote();
        if (!selectedNote) return;

        // get the note sort order and exit if not custom order
        const sortOrder = await SETTINGS.globalValue("notes.sortOrder.field");
        if (sortOrder != 'order') return;

        // search for all notes in the same folder and exit if empty
        // TODO see here how to order_by: https://joplinapp.org/api/references/rest_api/#pagination
        // TODO consider pagination also
        // TODO what is "let" meant for?
        let notes = await DATA.get(['folders', selectedNote.parent_id, 'notes'], { fields: ['title', 'parent_id', 'order'] });
        if (!notes.length) return;

        // TODO implement this command
        // TODO get order value from previous note > set this order to: <previous-order> - 1?
        // Check out joplin drag&drop implementation

        // copy result to clipboard for test purposes
        const ids = [];
        ids.push('Copied notes:');
        ids.push('title,parent_id,order');
        for (let i = 0; i < notes.length; i++) {
          ids.push(`${notes[i].title}, ${notes[i].parent_id}, ${notes[i].order}`);
        }
        copy(ids.join('\n'));
      }
    });

    // Command: moveDown
    // Desc: todo
    await COMMANDS.register({
      name: 'moveDown',
      label: 'Move down',
      iconName: 'fas fa-angle-down',
      enabledCondition: "oneNoteSelected && !inConflictFolder",
      execute: async () => {
        // get the selected note and exit if none is currently selected
        const selectedNote = await WORKSPACE.selectedNote();
        if (!selectedNote) return;

        // get the note sort order and exit if not custom order
        const sortOrder = await SETTINGS.globalValue("notes.sortOrder.field");
        if (sortOrder != 'order') return;

        // TODO implement this command
        // TODO get order value from next note > set this order to: <next-order> + 1?
        await DIALOGS.showMessageBox('Sorry, this command is currently not implemented...');
      }
    });

    // Command: moveToBottom
    // Desc: todo
    await COMMANDS.register({
      name: 'moveToBottom',
      label: 'Move to bottom',
      iconName: 'fas fa-angle-double-down',
      // TODO enabledCondtion == !LastInLast?
      enabledCondition: "oneNoteSelected && !inConflictFolder",
      execute: async () => {
        // get the selected note and exit if none is currently selected
        const selectedNote = await WORKSPACE.selectedNote();
        if (!selectedNote) return;

        // get the note sort order and exit if not custom order
        const sortOrder = await SETTINGS.globalValue("notes.sortOrder.field");
        if (sortOrder != 'order') return;

        // TODO implement this command
        await DIALOGS.showMessageBox('Sorry, this command is currently not implemented...');
      }
    });

    //#endregion

    //#region MAP COMMANDS

    // prepare "Note properties" sub-menu
    const notePropertiesSubMenu = [
      {
        // API: sub-menu entries are not shown in keyboard editor unless they have a default accelarator (or manually added to keymap.json)
        commandName: "copyNoteId",
      },
      {
        commandName: "editAlarm",
      },
      {
        commandName: "editURL"
      },
      {
        commandName: "openURLInBrowser"
      },
      {
        commandName: "touchNote",
      }
    ]

    // prepare "Move in list" sub-menu
    const moveNoteSubMenu = [
      {
        commandName: "moveToTop",
        accelerator: accMoveToTop
      },
      {
        commandName: "moveUp",
        accelerator: accMoveUp
      },
      {
        commandName: "moveDown",
        accelerator: accMoveDown
      },
      {
        commandName: "moveToBottom",
        accelerator: accMoveToBottom
      }
    ];

    // add commands to "edit" menu
    await joplin.views.menuItems.create('menEditTextCheckbox', 'textCheckbox', MenuItemLocation.Edit, { accelerator: accTextCheckbox });

    // add commands to "note" menu
    await joplin.views.menuItems.create('menNoteToggleTodoState', 'toggleTodoState', MenuItemLocation.Note, { accelerator: accToggleTodoState });
    await joplin.views.menuItems.create('menNoteMoveToFolder', 'moveToFolder', MenuItemLocation.Note, { accelerator: accMoveToFolder });
    await joplin.views.menus.create('menNoteMoveInList', 'Move in list', moveNoteSubMenu, MenuItemLocation.Note);
    await joplin.views.menus.create('menNoteNoteProperties', 'Note properties', notePropertiesSubMenu, MenuItemLocation.Note);

    // add commands to context menu
    // API 1.4.10: currently disabled - how to get current note on which the context menu was opened (must not be the selected note)
    // API: sub-menus are not shown in context menu
    // await joplin.views.menus.create('conListMoveInList', 'Move in list', moveNoteSubMenu, MenuItemLocation.NoteListContextMenu);
    // await joplin.views.menuItems.create('conListToggleTodoState', 'toggleTodoState', MenuItemLocation.NoteListContextMenu);
    // await joplin.views.menuItems.create('conListCopyNoteId', 'copyNoteId', MenuItemLocation.NoteListContextMenu);

    // add commands to note toolbar depending on user options
    // API: Icons in toolbar seems to be bigger than the default ones
    const showOpenURLInBrowserToolbar = await SETTINGS.value('showOpenURLInBrowserToolbar');
    if (showOpenURLInBrowserToolbar) {
      await joplin.views.toolbarButtons.create('barNoteOpenURLInBrowser', 'openURLInBrowser', ToolbarButtonLocation.NoteToolbar);
    }
    const showToggleTodoStateToolbar = await SETTINGS.value('showToggleTodoStateToolbar');
    if (showToggleTodoStateToolbar) {
      await joplin.views.toolbarButtons.create('barNoteToggleTodoState', 'toggleTodoState', ToolbarButtonLocation.NoteToolbar);
    }

    // TODO test command icons here
    // await joplin.views.toolbarButtons.create('touchNote', ToolbarButtonLocation.NoteToolbar);

    //#endregion

  },
});
