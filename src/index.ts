import joplin from "api";
import JoplinViewsDialogs from "api/JoplinViewsDialogs";
import { MenuItemLocation, ToolbarButtonLocation } from 'api/types';

// predefined keyboard shortcuts
const accMoveToFolder = 'CmdOrCtrl+Shift+M';
const accToggleTodoState = 'CmdOrCtrl+Shift+Space';
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
      label: 'Show "Toggle to-do state" button on note toolbar',
    });

    //#endregion

    //#region REGISTER NEW COMMANDS

    // Command: toggleTodoState
    // Desc: Set 'todo_completed' of selected note to current timestamp (closed) or zero (open)
    await joplin.commands.register({
      name: 'toggleTodoState',
      label: 'Toggle to-do state',
      iconName: 'fas fa-check',
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
    // await joplin.commands.register({
    //   name: 'editURL',
    //   label: 'Set URL',
    //   iconName: 'fas fa-flask', // todo icon
    //   execute: async () => {
    //     alert('TODO: Implement command xy');
    //   },
    // });

    // Command: moveNoteToTop
    // Desc: todo
    await joplin.commands.register({
      name: 'moveNoteToTop',
      label: 'Move note to top',
      iconName: 'fas fa-angle-double-up',
      execute: async () => {
        // TODO should only work when custom order is active
        // TODO check if disabling is possible in case of other sort type
        const todo = await joplin.workspace.selectedNote();
        await joplin.data.put(['notes', todo.id], null, { order: Date.now() });
      },
    });

    // Command: xy
    // Desc: todo
    // await joplin.commands.register({
    //   name: 'xy',
    //   label: 'todo',
    //   iconName: 'fas fa-flask', // todo icon
    //   execute: async () => {
    //     alert('TODO: Implement command xy');
    //   },
    // });

    // Command: xy
    // Desc: todo
    // await joplin.commands.register({
    //   name: 'xy',
    //   label: 'todo',
    //   iconName: 'fas fa-flask', // todo icon
    //   execute: async () => {
    //     alert('TODO: Implement command xy');
    //   },
    // });

    // Command: xy
    // Desc: todo
    // await joplin.commands.register({
    //   name: 'xy',
    //   label: 'todo',
    //   iconName: 'fas fa-flask', // todo icon
    //   execute: async () => {
    //     alert('TODO: Implement command xy');
    //   },
    // });

    //#endregion

    //#region MAP COMMANDS

    // add commands to "note" menu
    // TODO move into sub menu below
    // await joplin.views.menuItems.create('moveToFolder', MenuItemLocation.Note, { accelerator: accMoveToFolder });

    // TODO workaround - items in sub-menu do not get shortcuts and are not shown in options
    await joplin.views.menuItems.create('moveNoteToTop', MenuItemLocation.Note, { accelerator: accMoveNoteToTop });
    await joplin.views.menus.create('Move note', [
      {
        commandName: "moveToFolder",
        accelerator: "accMoveToFolder"
      }
      // ,
      // {
      //   commandName: "moveNoteToTop",
      //   accelerator: "accMoveNoteToTop"
      // }
      // ,
      // {
      //   commandName: "accMoveNoteUp",
      //   accelerator: "accMoveNoteUp"
      // },
      // {
      //   commandName: "accMoveNoteDown",
      //   accelerator: "accMoveNoteDown"
      // },
      // {
      //   commandName: "moveNoteToBottom",
      //   accelerator: "accMoveNoteToBottom"
      // }
    ], MenuItemLocation.Note);
    await joplin.views.menuItems.create('toggleTodoState', MenuItemLocation.Note, { accelerator: accToggleTodoState });

    // add commands to context menu
    // await joplin.views.menuItems.create('ptShowNoteData', MenuItemLocation.Context);
    // TODO dd "move note" commands to context menu (with user option)


    // add commands to note toolbar depending on user options
    const showToggleTodoStateToolbar = await joplin.settings.value('showToggleTodoStateToolbar');
    if (showToggleTodoStateToolbar) {
      await joplin.views.toolbarButtons.create('toggleTodoState', ToolbarButtonLocation.NoteToolbar);
    }

    //#endregion


  },
});
