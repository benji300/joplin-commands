import joplin from "api";
import JoplinViewsDialogs from "api/JoplinViewsDialogs";
import { MenuItemLocation, ToolbarButtonLocation } from 'api/types';
import { info } from "console";

// predefined keyboard shortcuts
const accTextCheckbox = 'CmdOrCtrl+Shift+C';
const accToggleTodoState = 'CmdOrCtrl+Shift+Space';
const accMoveToFolder = 'CmdOrCtrl+Shift+M';
const accMoveNoteToTop = 'CmdOrCtrl+Alt+Up';
const accMoveNoteUp = 'CmdOrCtrl+Shift+Up';
const accMoveNoteDown = 'CmdOrCtrl+Shift+Down';
const accMoveNoteToBottom = 'CmdOrCtrl+Alt+Down';

joplin.plugins.register({
  onStart: async function () {

    //#region INITIALIZE PLUGIN

    //#endregion

    //#region REGISTER USER OPTIONS

    await joplin.settings.registerSection('joplin-note-ext', {
      label: 'Note Extensions',
      iconName: 'fas fa-tachometer-alt', // TODO icon?
      description: 'Note: Changes are only applied after a restart.'
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
      enabledCondition: "noteIsTodo",
      execute: async () => {
        const todo = await joplin.workspace.selectedNote();
        const state = await joplin.data.get(['notes', todo.id], { fields: ['todo_completed'] });
        if (state) {
          await joplin.data.put(['notes', todo.id], null, { todo_completed: Date.now() });
        } else {
          await joplin.data.put(['notes', todo.id], null, { todo_completed: 0 });
        }
      },
    });

    // Command: touchNote
    // Desc: Set 'updated_time' of selected note to current timestamp
    await joplin.commands.register({
      name: 'touchNote',
      label: 'Touch note',
      iconName: 'fas fa-flask', // timestamp icon?
      execute: async () => {
        const todo = await joplin.workspace.selectedNote();
        await joplin.data.put(['notes', todo.id], null, { updated_time: Date.now() });
      },
    });

    // Command: editURL
    // Desc: todo
    await joplin.commands.register({
      name: 'editURL',
      label: 'Set URL',
      iconName: 'fas fa-edit',
      execute: async () => {
        // TODO open dialog with input box - if URL already set - display this value in the input box
        alert('Sorry, this command is currently not implemented...');
      },
    });

    // Command: openURLInBrowser
    // Desc: todo
    await joplin.commands.register({
      name: 'openURLInBrowser',
      label: 'Open URL in browser',
      iconName: 'fas fa-globe',
      execute: async () => {
        // TODO if url is set open link in default browser
        // TODO enableCondition possible? only if URL is set
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
        commandName: "editAlarm"
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
        accelerator: "accMoveNoteToTop"
      },
      {
        commandName: "moveNoteUp",
        accelerator: "accMoveNoteUp"
      },
      {
        commandName: "moveNoteDown",
        accelerator: "accMoveNoteDown"
      },
      {
        commandName: "moveNoteToBottom",
        accelerator: "accMoveNoteToBottom"
      }
    ];

    // add commands to "edit" menu
    await joplin.views.menuItems.create('textCheckbox', MenuItemLocation.Edit, { accelerator: accTextCheckbox });

    // add commands to "note" menu
    // API: "menuItems" in sub-menus do not get default accelarators and are not shown in keyboard shortcuts editor
    //      Unless a shortcut is manually added to the keymap.json
    // API: "menuItems" are always sorted before "menus" in main menu (MenuItemLocation) - the order here is ignored
    // API: Only the first "menuItem" in main menu (MenuItemLocation) will get default accelarator specified here
    //      All following are ignored unless they are manually added to keymap.json
    await joplin.views.menuItems.create('toggleTodoState', MenuItemLocation.Note, { accelerator: accToggleTodoState });
    await joplin.views.menuItems.create('moveToFolder', MenuItemLocation.Note, { accelerator: accMoveToFolder });
    await joplin.views.menus.create('Move in list', moveNoteSubMenu, MenuItemLocation.Note);
    // API: By default the last of this four entries is not displayed at all (maybe yes, maybe no)
    await joplin.views.menus.create('Note properties', notePropertiesSubMenu, MenuItemLocation.Note);

    // add commands to context menu
    // API: sub-menus are not shown in context menu
    await joplin.views.menus.create('Move in list', moveNoteSubMenu, MenuItemLocation.Context);
    // API: this entry is also not added to the context menu
    await joplin.views.menuItems.create('toggleTodoState', MenuItemLocation.Context);

    // add commands to note toolbar depending on user options
    const showToggleTodoStateToolbar = await joplin.settings.value('showToggleTodoStateToolbar');
    if (showToggleTodoStateToolbar) {
      await joplin.views.toolbarButtons.create('toggleTodoState', ToolbarButtonLocation.NoteToolbar);
    }

    //#endregion

  },
});
