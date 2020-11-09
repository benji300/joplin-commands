import joplin from "api";
import JoplinViewsDialogs from "api/JoplinViewsDialogs";
import { MenuItemLocation, ToolbarButtonLocation } from 'api/types';
import { info } from "console";

const copy = require('../node_modules/copy-to-clipboard');

// const open = require('open');
// const { shell } = require('electron');

// predefined keyboard shortcuts
const accTextCheckbox = 'CmdOrCtrl+Shift+C';
const accToggleTodoState = 'CmdOrCtrl+Shift+Space';
const accMoveToFolder = 'CmdOrCtrl+Shift+M';
// API: Internal shortcuts may override these ones here
//      E.g. if note-list has focus - the "Up" key is always considered to change the selected note in the list
const accMoveNoteToTop = 'CmdOrCtrl+Shift+Alt+Up';
const accMoveNoteUp = 'CmdOrCtrl+Alt+Up';
const accMoveNoteDown = 'CmdOrCtrl+Alt+Down';
const accMoveNoteToBottom = 'CmdOrCtrl+Shift+Alt+Down';

joplin.plugins.register({
  onStart: async function () {

    //#region INITIALIZE PLUGIN

    //#endregion

    //#region REGISTER USER OPTIONS

    await joplin.settings.registerSection('joplin-note-ext', {
      label: 'Note Extensions',
      iconName: 'fas fa-file-medical', // TODO icon? tachometer-alt
      description: 'Note: Changes are only applied after a restart.'
    });

    await joplin.settings.registerSetting('showOpenURLInBrowserToolbar', {
      value: false,
      type: 3,
      section: 'joplin-note-ext',
      public: true,
      label: 'Show "Open URL in browser" on note toolbar',
    });

    await joplin.settings.registerSetting('showToggleTodoStateToolbar', {
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
    await joplin.commands.register({
      name: 'toggleTodoState',
      label: 'Toggle to-do state',
      iconName: 'fas fa-check',
      // API: Disabling commands with "enabledCondition" has no effect in note context menu
      enabledCondition: "noteIsTodo && oneNoteSelected",
      execute: async () => {
        const note = await joplin.workspace.selectedNote();
        if (note.todo_completed) {
        } else {
          await joplin.data.put(['notes', note.id], null, { todo_completed: 0 });
        } else {
          await joplin.data.put(['notes', note.id], null, { todo_completed: Date.now() });
        }

        // implementation to toggle state for multiple todos - seems to cause errors
        // const noteIds = await joplin.workspace.selectedNoteIds();
        // for (let i = 0; i < noteIds.length; i++) {
        //   const note = await joplin.data.get(['notes', noteIds[i]], { fields: ['todo_completed'] });
        //   if (note.is_todo) {
        //     if (note.todo_completed) {
        //       await joplin.data.put(['notes', noteIds[i]], null, { todo_completed: 0 });
        //     } else {
        //       await joplin.data.put(['notes', noteIds[i]], null, { todo_completed: Date.now() });
        //     }
        //   }
        // }
      },
    });

    // Command: copyNoteId
    // Desc: Copy the IDs of all selected notes to the clipboard
    await joplin.commands.register({
      name: 'copyNoteId',
      label: 'Copy note ID',
      iconName: 'fas fa-copy',
      execute: async () => {
        const noteIds = await joplin.workspace.selectedNoteIds();
        const ids = [];
        for (let i = 0; i < noteIds.length; i++) {
          const note = await joplin.data.get(['notes', noteIds[i]], { fields: ['id'] });
          ids.push(note.id);
        }
        copy(ids.join('\n'));
      },
    });

    // Command: touchNote
    // Desc: Set 'updated_time' of selected note to current timestamp
    await joplin.commands.register({
      name: 'touchNote',
      label: 'Touch note',
      iconName: 'fas fa-hand-point-up',
      execute: async () => {
        const note = await joplin.workspace.selectedNote();
        await joplin.data.put(['notes', note.id], null, { updated_time: Date.now() });
      },
    });

    // Command: editURL
    // Desc: todo
    await joplin.commands.register({
      name: 'editURL',
      label: 'Set URL',
      iconName: 'fas fa-edit',
      execute: async () => {
        const note = await joplin.workspace.selectedNote();
        const dialogs = joplin.views.dialogs;
        const urlDialog = await dialogs.create();

        // API: dialog box is fixed to width which cannot be overwritten by plugin itself
        //      Adding "width: fit-content;" to parent container div#joplin-plugin-content fixes the problem
        await dialogs.setHtml(urlDialog, `
          <div class="joplin-note-ext-dialog" style="display:inline-flex;">
            <label style="min-width:fit-content;margin:auto;padding-right:8px;">Set URL:</label>
            <input type="text" value="${note.source_url}" style="min-width:300px;">
          </div>
        `);
        const result = await dialogs.open(urlDialog);

        if (result == 'ok') {
          // API: How to get feedback from a dialog? PostMessage?
          alert('This button was clicked: ' + result);
        }

        // TODO open dialog with input box - if URL already set - display this value in the input box
        // alert('Sorry, this command is currently not implemented...');
      },
    });

    // Command: openURLInBrowser
    // Desc: todo
    await joplin.commands.register({
      name: 'openURLInBrowser',
      label: 'Open URL in browser',
      iconName: 'fas fa-globe',
      enabledCondition: "oneNoteSelected",
      execute: async () => {
        const note = await joplin.workspace.selectedNote();
        if (note.source_url) {
          // await open("http://www.google.com");
          // window.open("http://www.google.com", '_blank');
          // open(note.source_url);
          alert(`Open URL: ${note.source_url}`);
        }

        // TODO if url is set open link in default browser
        // TODO enableCondition possible? only if URL is set

        // const bridge = require('electron').remote.require('./bridge').default;
        // bridge().openExternal(url)

        // oder
        // const { shell } = require('electron')
        // shell.openExternal('https://github.com')

        // oder
        // https://github.com/pwnall/node-open

        alert('Sorry, this command is currently not implemented...');
      },
    });

    // Command: moveNoteToTop
    // Desc: todo
    await joplin.commands.register({
      name: 'moveNoteToTop',
      label: 'Move note to top',
      iconName: 'fas fa-angle-double-up',
      execute: async () => {
        // TODO should only work when custom order is active
        // TODO check if disabling is possible in case of other sort type
        // TODO enabledCondtion == !firstInList?
        const todo = await joplin.workspace.selectedNote();
        await joplin.data.put(['notes', todo.id], null, { order: Date.now() });
      },
    });

    // Command: moveNoteUp
    // Desc: todo
    await joplin.commands.register({
      name: 'moveNoteUp',
      label: 'Move note up',
      iconName: 'fas fa-angle-up',
      execute: async () => {
        // TODO implement this command
        // TODO get order value from previous note > set this order to: <previous-order> - 1?
        alert('Sorry, this command is currently not implemented...');
      },
    });

    // Command: moveNoteDown
    // Desc: todo
    await joplin.commands.register({
      name: 'moveNoteDown',
      label: 'Move note down',
      iconName: 'fas fa-angle-down',
      execute: async () => {
        // TODO implement this command
        // TODO get order value from next note > set this order to: <next-order> + 1?
        alert('Sorry, this command is currently not implemented...');
      },
    });

    // Command: moveNoteToBottom
    // Desc: todo
    await joplin.commands.register({
      name: 'moveNoteToBottom',
      label: 'Move note to bottom',
      iconName: 'fas fa-angle-double-down',
      execute: async () => {
        // TODO implement this command
        // TODO enabledCondtion == !LastInLast?
        alert('Sorry, this command is currently not implemented...');
      },
    });

    //#endregion

    //#region MAP COMMANDS

    // prepare "Note properties" sub-menu
    const notePropertiesSubMenu = [
      {
        // API: sub-menu entries are not shown in keyboard editor unless it has a default accelarator (or manually added to keymap.json)
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
      }
    ]

    // prepare "move note" sub-menu
    const moveNoteSubMenu = [
      {
        commandName: "moveNoteToTop",
        accelerator: accMoveNoteToTop
      },
      {
        commandName: "moveNoteUp",
        accelerator: accMoveNoteUp
      },
      {
        commandName: "moveNoteDown",
        accelerator: accMoveNoteDown
      },
      {
        commandName: "moveNoteToBottom",
        accelerator: accMoveNoteToBottom
      }
    ];

    // add commands to "edit" menu
    await joplin.views.menuItems.create('textCheckbox', MenuItemLocation.Edit, { accelerator: accTextCheckbox });

    // add commands to "note" menu
    await joplin.views.menuItems.create('toggleTodoState', MenuItemLocation.Note, { accelerator: accToggleTodoState });
    await joplin.views.menuItems.create('moveToFolder', MenuItemLocation.Note, { accelerator: accMoveToFolder });
    await joplin.views.menus.create('Move in list', moveNoteSubMenu, MenuItemLocation.Note);
    await joplin.views.menus.create('Note properties', notePropertiesSubMenu, MenuItemLocation.Note);

    // add commands to context menu
    // API: sub-menus are not shown in context menu
    await joplin.views.menus.create('Move in list', moveNoteSubMenu, MenuItemLocation.Context);
    await joplin.views.menuItems.create('toggleTodoState', MenuItemLocation.Context);
    await joplin.views.menuItems.create('copyNoteId', MenuItemLocation.Context);

    // add commands to note toolbar depending on user options
    // API: Icons in toolbar seems to be bigger than the default ones
    const showOpenURLInBrowserToolbar = await joplin.settings.value('showOpenURLInBrowserToolbar');
    if (showOpenURLInBrowserToolbar) {
      await joplin.views.toolbarButtons.create('openURLInBrowser', ToolbarButtonLocation.NoteToolbar);
    }
    const showToggleTodoStateToolbar = await joplin.settings.value('showToggleTodoStateToolbar');
    if (showToggleTodoStateToolbar) {
      await joplin.views.toolbarButtons.create('toggleTodoState', ToolbarButtonLocation.NoteToolbar);
    }

    // TODO test command icons here
    // await joplin.views.toolbarButtons.create('touchNote', ToolbarButtonLocation.NoteToolbar);

    //#endregion

  },
});
