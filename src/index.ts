import joplin from 'api';
import { SettingItemType, MenuItem, MenuItemLocation, ToolbarButtonLocation } from 'api/types';
import { DefaultKeys } from './helpers';

const copy = require('../node_modules/copy-to-clipboard');

joplin.plugins.register({
  onStart: async function () {
    const COMMANDS = joplin.commands;
    const DATA = joplin.data;
    const DIALOGS = joplin.views.dialogs;
    const SETTINGS = joplin.settings;
    const WORKSPACE = joplin.workspace;

    //#region REGISTER USER OPTIONS

    await SETTINGS.registerSection('commands.settings', {
      label: 'Command Collection',
      iconName: 'fas fa-terminal',
      description: 'Changes are only applied after a restart.'
    });

    await SETTINGS.registerSetting('keepMovedNoteSelected', {
      value: false,
      type: SettingItemType.Bool,
      section: 'commands.settings',
      public: true,
      label: 'Keep moved note selected',
      description: 'If selected note is moved via one of the quick move actions, it will still be selected afterwards. Otherwise the next note within the current list will be selected.'
    });

    await SETTINGS.registerSetting('quickMove1', {
      value: '<empty>',
      type: 2,
      section: 'commands.settings',
      public: true,
      label: 'Enter notebook name for quick move action 1.',
      description: 'Specify the name of a notebook to which the selected note can be moved directly without interaction. Currently the notebook names must be copied manually from the sidebar. The same applies to the below settings.'
    });

    await SETTINGS.registerSetting('quickMove2', {
      value: '<empty>',
      type: 2,
      section: 'commands.settings',
      public: true,
      label: 'Enter notebook name for quick move action 2.'
    });

    await SETTINGS.registerSetting('quickMove3', {
      value: '<empty>',
      type: 2,
      section: 'commands.settings',
      public: true,
      label: 'Enter notebook name for quick move action 3.'
    });

    await SETTINGS.registerSetting('quickMove4', {
      value: '<empty>',
      type: 2,
      section: 'commands.settings',
      public: true,
      label: 'Enter notebook name for quick move action 4.'
    });

    await SETTINGS.registerSetting('quickMove5', {
      value: '<empty>',
      type: 2,
      section: 'commands.settings',
      public: true,
      label: 'Enter notebook name for quick move action 5.'
    });

    //#endregion

    //#region INIT LOCAL VARIABLES

    // prepare dialog/view/panel objects
    const dialogEditURL = await DIALOGS.create('commands.dialog');

    //#endregion

    //#region HELPERS

    function escapeTitleText(text: string) {
      return text.replace(/(\[|\])/g, '\\$1');
    }

    function getItemWithAttr(array: any, attr: any, value: any): any {
      for (var i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
          return array[i];
        }
      }
      return -1;
    }

    function getAllWithAttr(array: any, attr: any, value: any): any {
      const notes: any = [];
      for (var i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
          notes.push(array[i]);
        }
      }
      return notes;
    }

    function getIndexWithAttr(array: any, attr: any, value: any): any {
      for (var i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
          return i;
        }
      }
      return -1;
    }

    function openUrl(url: string) {
      if (!url) return;

      // try to open the URL in the system's default browser
      try {
        const { exec } = require('child_process');
        var start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
        const subprocess = exec(start + ' ' + url);
        subprocess.unref();
      } catch (error) {
        DIALOGS.showMessageBox(`Something went wrong... could not open requested URL.`);
      }
    }

    async function quickMoveToFolder(quickMoveSetting: string) {
      // get the selected note and exit if none is currently selected
      const selectedNote: any = await WORKSPACE.selectedNote();
      if (!selectedNote) return;

      // get the quick move folder from user settings and exit if empty
      const quickMoveFolder: string = await SETTINGS.value(quickMoveSetting);
      if (quickMoveFolder == '<empty>' || quickMoveFolder == '') return;

      // check if quick move folder exist and exit if not
      const folders: any = await DATA.get(['folders'], { fields: ['id', 'title'] });
      const folder: any = getItemWithAttr(folders.items, 'title', quickMoveFolder);
      if (folder == -1) return;

      // move selected note to new folder
      await DATA.put(['notes', selectedNote.id], null, { parent_id: folder.id });

      // keep moved note selected if enabled
      const keepMovedNoteSelected: boolean = await SETTINGS.value('keepMovedNoteSelected');
      if (keepMovedNoteSelected) {
        COMMANDS.execute('openNote', selectedNote.id);
      }
    }


    //#endregion

    //#region COMMANDS

    // Command: copyFolderName
    // Desc: Copy the name of right-clicked folder
    await COMMANDS.register({
      name: 'copyFolderName',
      label: 'Copy notebook name',
      iconName: 'fas fa-copy',
      execute: async (folderId: string) => {
        let folder: any;

        if (folderId) {

          // called from context menu
          folder = await DATA.get(['folders', folderId], { fields: ['title'] });
        } else {

          // get the parent folder name of the selected note
          const selectedNote = await WORKSPACE.selectedNote();
          if (selectedNote) {
            const note: any = await DATA.get(['notes', selectedNote.id], { fields: ['parent_id'] });
            folder = await DATA.get(['folders', note.parent_id], { fields: ['title'] });
          }
        }

        // copy name to clipboard
        if (folder) {
          copy(folder.title);
        }
      }
    });

    // Command: toggleTodoState
    // Desc: Set 'todo_completed' of selected notes to current timestamp (closed) or zero (open)
    await COMMANDS.register({
      name: 'toggleTodoState',
      label: 'Toggle to-do state',
      iconName: 'fas fa-check',
      enabledCondition: 'someNotesSelected && !inConflictFolder',
      execute: async (noteIds: string[]) => {
        // get selected note ids and return if empty
        let selectedNoteIds = noteIds;
        if (!selectedNoteIds) selectedNoteIds = await WORKSPACE.selectedNoteIds();
        if (!selectedNoteIds) return;

        // toggle state for all todos
        for (const noteId of selectedNoteIds) {
          const note: any = await DATA.get(['notes', noteId], { fields: ['id', 'is_todo', 'todo_completed'] });

          if (note && note.is_todo) {
            if (note.todo_completed) {
              await DATA.put(['notes', note.id], null, { todo_completed: 0 });
            } else {
              await DATA.put(['notes', note.id], null, { todo_completed: Date.now() });
            }
          }
        }
      }
    });

    // Command: copyNoteName
    // Desc: Copy the names of all selected notes to the clipboard
    await COMMANDS.register({
      name: 'copyNoteName',
      label: 'Copy note name',
      iconName: 'fas fa-copy',
      enabledCondition: 'someNotesSelected',
      execute: async (noteIds: string[]) => {
        // get selected note ids and return if empty
        let selectedNoteIds = noteIds;
        if (!selectedNoteIds) selectedNoteIds = await WORKSPACE.selectedNoteIds();
        if (!selectedNoteIds) return;

        // copy each name to clipboard
        const ids = [];
        for (const noteId of selectedNoteIds) {
          const note: any = await DATA.get(['notes', noteId], { fields: ['title'] });
          if (note) ids.push(note.title);
        }
        copy(ids.join('\n'));
      }
    });

    // Command: copyNoteId
    // Desc: Copy the IDs of all selected notes to the clipboard
    await COMMANDS.register({
      name: 'copyNoteId',
      label: 'Copy note ID',
      iconName: 'fas fa-copy',
      enabledCondition: 'someNotesSelected',
      execute: async (noteIds: string[]) => {
        // get selected note ids and return if empty
        let selectedNoteIds = noteIds;
        if (!selectedNoteIds) selectedNoteIds = await WORKSPACE.selectedNoteIds();
        if (!selectedNoteIds) return;

        // copy each ID to clipboard
        const ids = [];
        for (const noteId of selectedNoteIds) {
          ids.push(noteId);
        }
        copy(ids.join('\n'));
      }
    });

    // Command: copyMarkdownLink
    // Desc: Copy the markdown links of all selected notes to the clipboard
    await COMMANDS.register({
      name: 'copyMarkdownLink',
      label: 'Copy Markdown link',
      iconName: 'fas fa-markdown',
      enabledCondition: 'someNotesSelected',
      execute: async (noteIds: string[]) => {
        // get selected note ids and return if empty
        let selectedNoteIds = noteIds;
        if (!selectedNoteIds) selectedNoteIds = await WORKSPACE.selectedNoteIds();
        if (!selectedNoteIds) return;

        // copy each markdown link to clipboard
        const links = [];
        for (let i = 0; i < selectedNoteIds.length; i++) {
          const note: any = await DATA.get(['notes', selectedNoteIds[i]], { fields: ['id', 'title'] });
          // TODO extract to helper function
          const mdLink = [];
          mdLink.push('[');
          mdLink.push(escapeTitleText(note.title));
          mdLink.push(']');
          mdLink.push(`(:/${note.id})`);
          links.push(mdLink.join(''));
        }
        copy(links.join('\n'));
      }
    });

    // Command: editURL
    // Desc: Opens dialog to directly edit the URL of the note
    await COMMANDS.register({
      name: 'editURL',
      label: 'Set URL',
      iconName: 'fas fa-edit',
      enabledCondition: 'oneNoteSelected',
      execute: async () => {
        // get the selected note and exit if none is currently selected
        const selectedNote: any = await WORKSPACE.selectedNote();
        if (!selectedNote) return;

        // prepare and open dialog
        await DIALOGS.setHtml(dialogEditURL, `
          <div class="joplin-commands-container">
            <form name="urlForm" style="display:grid;">
              <label for="url" style="padding:5px 2px;">Set URL</label>
              <input type="text" id="url" name="url" style="padding:2px;" placeholder="Enter URL..." value="${selectedNote.source_url}">
            </form>
          </div>
        `);
        const result: any = await DIALOGS.open(dialogEditURL);

        // get return and new URL value
        if (result.id == 'ok') {
          if (result.formData != null) {
            const newUrl: string = result.formData.urlForm.url;
            const dialogRes: number = await DIALOGS.showMessageBox(`Set URL to: ${newUrl}`);
            if (dialogRes == 0) {
              await DATA.put(['notes', selectedNote.id], null, { source_url: newUrl });
            }
          }
        }
      }
    });

    // Command: openURL
    // Desc: Opens the note URL in the system's default browser.
    await COMMANDS.register({
      name: 'openURL',
      label: 'Open URL in browser',
      iconName: 'fas fa-external-link-square-alt',
      enabledCondition: 'oneNoteSelected',
      execute: async () => {
        // get the selected note and exit if none is currently selected
        const selectedNote = await WORKSPACE.selectedNote();
        if (!selectedNote) return;

        // try to open the URL in the system's default browser
        openUrl(selectedNote.source_url);
      }
    });

    // Command: touchNote
    // Desc: Set 'updated_time' of selected note to current timestamp
    await COMMANDS.register({
      name: 'touchNote',
      label: 'Touch note',
      iconName: 'fas fa-hand-pointer',
      enabledCondition: 'oneNoteSelected',
      execute: async () => {
        // get the selected note and exit if none is currently selected
        const selectedNote = await WORKSPACE.selectedNote();
        if (!selectedNote) return;

        // TODO allow to touch multiple notes at once

        // set 'updated_time' to current timestamp value
        await DATA.put(['notes', selectedNote.id], null, { updated_time: Date.now() });
      },
    });

    // Command: moveToTop
    // Desc: Moves the selected note to the top of the list
    await COMMANDS.register({
      name: 'moveToTop',
      label: 'Move to top',
      iconName: 'fas fa-angle-double-up',
      enabledCondition: 'oneNoteSelected',
      execute: async () => {
        // get the selected note and exit if none is currently selected
        const selectedNote: any = await WORKSPACE.selectedNote();
        if (!selectedNote) return;

        // get the note sort order and exit if not custom order
        const sortOrder: string = await SETTINGS.globalValue('notes.sortOrder.field');
        if (sortOrder != 'order') return;

        // exit if selected note is a completed to-do and completed ones shall be shown at the bottom (uncompletedTodosOnTop)
        const uncompletedTodosOnTop: any = await SETTINGS.globalValue('uncompletedTodosOnTop');
        if (uncompletedTodosOnTop && selectedNote.todo_completed) return;

        // set 'order' to current timestamp value
        await DATA.put(['notes', selectedNote.id], null, { order: Date.now() });
      }
    });

    // Command: moveUp
    // Desc: Moves the selected note one position up
    await COMMANDS.register({
      name: 'moveUp',
      label: 'Move up',
      iconName: 'fas fa-angle-up',
      enabledCondition: 'oneNoteSelected',
      execute: async () => {
        // get the selected note and exit if none is currently selected
        const selectedNote: any = await WORKSPACE.selectedNote();
        if (!selectedNote) return;

        // get the note sort order and exit if not custom order
        const sortOrder: string = await SETTINGS.globalValue('notes.sortOrder.field');
        if (sortOrder != 'order') return;

        // exit if selected note is a completed to-do and completed ones shall be shown at the bottom (uncompletedTodosOnTop)
        const uncompletedTodosOnTop: any = await SETTINGS.globalValue('uncompletedTodosOnTop');
        if (uncompletedTodosOnTop && selectedNote.todo_completed) return;

        // get all notes from folder sorted by their 'order' value and exit if empty
        var notes: any = await DATA.get(['folders', selectedNote.parent_id, 'notes'], { fields: ['id', 'title', 'order'], order_by: 'order', order_dir: 'DESC' });
        if (!notes.items.length) return;

        // get index of selected note in list and exit if it is already the first
        const index: number = getIndexWithAttr(notes.items, 'id', selectedNote.id);
        if (index == 0) return;

        // if it is second - simply trigger moveToTop command and exit
        if (index == 1) {
          COMMANDS.execute('moveToTop');
          return;
        }

        // get all notes with same order value as previous note
        const previousNote: any = await DATA.get(['notes', notes.items[index - 1].id], { fields: ['id', 'order'] });
        var previousOrder: number = previousNote.order;
        const notesWithSameOrder: any = getAllWithAttr(notes.items, 'order', previousOrder);
        if (notesWithSameOrder.length > 1) {
          // multiple notes found - special handling required
          // if selected note order will just be increased, it will "jump" up several positions
          // so each previous note with same order value needs to be adapted
          // TODO: Check for a better solution as this will change other notes data (which might lead to sync problems)
          previousOrder += notesWithSameOrder.length * 1000;
          for (const note of notesWithSameOrder) {
            await DATA.put(['notes', note.id], null, { order: previousOrder });
            previousOrder -= 1000;
          }
          await DATA.put(['notes', selectedNote.id], null, { order: previousOrder + 10 });
        } else {
          // put selected note in between previous in pre-previous note
          const prevprevNote: any = await DATA.get(['notes', notes.items[index - 2].id], { fields: ['id', 'order'] });
          const newOrder: number = ((prevprevNote.order - previousNote.order) / 2);
          await DATA.put(['notes', selectedNote.id], null, { order: previousNote.order + newOrder });
        }

        // debug: write output to clipboard
        // await copy(JSON.stringify(await DATA.get(['folders', selectedNote.parent_id, 'notes'], { fields: ['id', 'title', 'order'], order_by: 'order', order_dir: 'DESC' })));
      }
    });

    // Command: moveDown
    // Desc: Moves the selected note one position down
    await COMMANDS.register({
      name: 'moveDown',
      label: 'Move down',
      iconName: 'fas fa-angle-down',
      enabledCondition: 'oneNoteSelected',
      execute: async () => {
        // get the selected note and exit if none is currently selected
        const selectedNote: any = await WORKSPACE.selectedNote();
        if (!selectedNote) return;

        // get the note sort order and exit if not custom order
        const sortOrder: string = await SETTINGS.globalValue('notes.sortOrder.field');
        if (sortOrder != 'order') return;

        // exit if selected note is a completed to-do and completed ones shall be shown at the bottom (uncompletedTodosOnTop)
        const uncompletedTodosOnTop: any = await SETTINGS.globalValue('uncompletedTodosOnTop');
        if (uncompletedTodosOnTop && selectedNote.todo_completed) return;

        // get all notes from folder sorted by their 'order' value and exit if empty
        var notes: any = await DATA.get(['folders', selectedNote.parent_id, 'notes'], { fields: ['id', 'title', 'order'], order_by: 'order', order_dir: 'ASC' });
        if (!notes.items.length) return;

        // get index of selected note in list and exit if it is already the last
        const index: number = getIndexWithAttr(notes.items, 'id', selectedNote.id);
        if (index == 0) return;

        // if it is second - simply trigger moveToBottom command and exit
        if (index == 1) {
          COMMANDS.execute('moveToBottom');
          return;
        }

        // get all notes with same order value as subsequent note
        const subsequentNote: any = await DATA.get(['notes', notes.items[index - 1].id], { fields: ['id', 'order'] });
        var subsequentOrder: number = subsequentNote.order;
        const notesWithSameOrder: any = getAllWithAttr(notes.items, 'order', subsequentOrder);
        if (notesWithSameOrder.length > 1) {
          // multiple notes found - special handling required
          // if selected note order will just be decreased, it will "jump" up several positions
          // so each subsequent note with same order value needs to be adapted
          // TODO: Check for a better solution as this will change other notes data (which might lead to sync problems)
          subsequentOrder -= notesWithSameOrder.length * 1000;
          for (const note of notesWithSameOrder) {
            await DATA.put(['notes', note.id], null, { order: subsequentOrder });
            subsequentOrder += 1000;
          }
          await DATA.put(['notes', selectedNote.id], null, { order: subsequentOrder - 10 });
        } else {
          // put selected note in between subsequent in sub-subsequent note
          const subsubsequentNote: any = await DATA.get(['notes', notes.items[index - 2].id], { fields: ['id', 'order'] });
          const newOrder: number = ((subsequentNote.order - subsubsequentNote.order) / 2);
          await DATA.put(['notes', selectedNote.id], null, { order: subsequentNote.order - newOrder });
        }

        // debug: write output to clipboard
        // await copy(JSON.stringify(await DATA.get(['folders', selectedNote.parent_id, 'notes'], { fields: ['id', 'title', 'order'], order_by: 'order', order_dir: 'ASC' })));
      }
    });

    // Command: moveToBottom
    // Desc: Moves the selected note to the bottom of the list
    await COMMANDS.register({
      name: 'moveToBottom',
      label: 'Move to bottom',
      iconName: 'fas fa-angle-double-down',
      enabledCondition: 'oneNoteSelected',
      execute: async () => {
        // get the selected note and exit if none is currently selected
        const selectedNote: any = await WORKSPACE.selectedNote();
        if (!selectedNote) return;

        // get the note sort order and exit if not custom order
        const sortOrder: string = await SETTINGS.globalValue('notes.sortOrder.field');
        if (sortOrder != 'order') return;

        // exit if selected note is a completed to-do and completed ones shall be shown at the bottom (uncompletedTodosOnTop)
        const uncompletedTodosOnTop: any = await SETTINGS.globalValue('uncompletedTodosOnTop');
        if (uncompletedTodosOnTop && selectedNote.todo_completed) return;

        // get all notes from folder sorted by their 'order' value and exit if empty
        const notes: any = await DATA.get(['folders', selectedNote.parent_id, 'notes'], { fields: ['id', 'title', 'order'], order_by: 'order', order_dir: 'ASC' });
        if (!notes.items.length) return;

        // get index of selected note in list and exit if it is already the last
        const index = getIndexWithAttr(notes.items, 'id', selectedNote.id);
        if (index == 0) return;

        const lastNote: any = await DATA.get(['notes', notes.items[0].id], { fields: ['id', 'order'] });
        if (lastNote.order == 0) {
          const notesWithZeroOrder: any = getAllWithAttr(notes.items, 'order', 0);
          if (notesWithZeroOrder.length > 0) {
            // multiple notes found with zero order value
            // so take order value from selected note and give each of them the halve value
            var newOrder: number = selectedNote.order;
            for (const note of notesWithZeroOrder) {
              newOrder = (newOrder / 2);
              await DATA.put(['notes', note.id], null, { order: newOrder });
            }
            await DATA.put(['notes', selectedNote.id], null, { order: (newOrder / 2) });
          }
        } else {
          // previous order value is greater than zero - so halve the value
          await DATA.put(['notes', selectedNote.id], null, { order: (lastNote.order / 2) });
        }

        // debug: write output to clipboard
        // await copy(JSON.stringify(await DATA.get(['folders', selectedNote.parent_id, 'notes'], { fields: ['id', 'title', 'order'], order_by: 'order', order_dir: 'ASC' })));
      }
    });

    // Command: quickMove1
    // Desc: Moves the selected note directly to the specified folder
    const lblQuickMove1: string = await SETTINGS.value('quickMove1');
    await COMMANDS.register({
      name: 'quickMove1',
      label: `Move to: ${lblQuickMove1}`,
      iconName: 'fas fa-shipping-fast',
      enabledCondition: 'oneNoteSelected',
      execute: async () => {
        quickMoveToFolder('quickMove1');
      }
    });

    // Command: quickMove2
    // Desc: Moves the selected note directly to the specified folder
    const lblQuickMove2: string = await SETTINGS.value('quickMove2');
    await COMMANDS.register({
      name: 'quickMove2',
      label: `Move to: ${lblQuickMove2}`,
      iconName: 'fas fa-shipping-fast',
      enabledCondition: 'oneNoteSelected',
      execute: async () => {
        quickMoveToFolder('quickMove2');
      }
    });

    // Command: quickMove3
    // Desc: Moves the selected note directly to the specified folder
    const lblQuickMove3: string = await SETTINGS.value('quickMove3');
    await COMMANDS.register({
      name: 'quickMove3',
      label: `Move to: ${lblQuickMove3}`,
      iconName: 'fas fa-shipping-fast',
      enabledCondition: 'oneNoteSelected',
      execute: async () => {
        quickMoveToFolder('quickMove3');
      }
    });

    // Command: quickMove4
    // Desc: Moves the selected note directly to the specified folder
    const lblQuickMove4: string = await SETTINGS.value('quickMove4');
    await COMMANDS.register({
      name: 'quickMove4',
      label: `Move to: ${lblQuickMove4}`,
      iconName: 'fas fa-shipping-fast',
      enabledCondition: 'oneNoteSelected',
      execute: async () => {
        quickMoveToFolder('quickMove4');
      }
    });

    // Command: quickMove5
    // Desc: Moves the selected note directly to the specified folder
    const lblQuickMove5: string = await SETTINGS.value('quickMove5');
    await COMMANDS.register({
      name: 'quickMove5',
      label: `Move to: ${lblQuickMove5}`,
      iconName: 'fas fa-shipping-fast',
      enabledCondition: 'oneNoteSelected',
      execute: async () => {
        quickMoveToFolder('quickMove5');
      }
    });

    // prepare Properties submenu
    const propertiesSubmenu: MenuItem[] = [
      {
        commandName: 'copyNoteName',
        label: 'Copy name'
      },
      {
        commandName: 'copyNoteId',
        label: 'Copy ID'
      },
      {
        commandName: 'copyMarkdownLink'
      },
      {
        commandName: 'toggleTodoState',
        accelerator: DefaultKeys.ToggleTodoState
      },
      {
        commandName: 'editAlarm'
      },
      {
        commandName: 'editURL'
      },
      {
        commandName: 'openURL'
      }
    ]

    // prepare Move in list submenu
    const moveInListSubmenu: MenuItem[] = [
      {
        commandName: 'moveToTop',
        accelerator: DefaultKeys.MoveToTop
      },
      {
        commandName: 'moveUp',
        accelerator: DefaultKeys.MoveUp
      },
      {
        commandName: 'moveDown',
        accelerator: DefaultKeys.MoveDown
      },
      {
        commandName: 'moveToBottom',
        accelerator: DefaultKeys.MoveToBottom
      },
      {
        commandName: 'touchNote'
      }
    ];

    // prepare Move to notebook submenu
    const moveToFolderSubmenu: MenuItem[] = [
      {
        commandName: 'quickMove1',
        accelerator: DefaultKeys.QuickMove1
      },
      {
        commandName: 'quickMove2',
        accelerator: DefaultKeys.QuickMove2
      },
      {
        commandName: 'quickMove3',
        accelerator: DefaultKeys.QuickMove3
      },
      {
        commandName: 'quickMove4',
        accelerator: DefaultKeys.QuickMove4
      },
      {
        commandName: 'quickMove5',
        accelerator: DefaultKeys.QuickMove5
      },
      {
        commandName: 'moveToFolder',
        accelerator: DefaultKeys.MoveToFolder
      }
    ];

    // add commands to edit menu
    await joplin.views.menuItems.create('menEditTextCheckbox', 'textCheckbox', MenuItemLocation.Edit, { accelerator: DefaultKeys.TextCheckbox });

    // add commands to note menu
    await joplin.views.menus.create('menNoteNoteProperties', 'Properties', propertiesSubmenu, MenuItemLocation.Note);
    await joplin.views.menus.create('menNoteMoveInList', 'Move in list', moveInListSubmenu, MenuItemLocation.Note);
    await joplin.views.menus.create('menNoteMoveToFolder', 'Move to notebook', moveToFolderSubmenu, MenuItemLocation.Note);

    // add commands to folder context menu
    await joplin.views.menuItems.create('contextFolderCopyName', 'copyFolderName', MenuItemLocation.FolderContextMenu);

    // add commands to note list context menu
    await joplin.views.menuItems.create('contextListCopyNoteName', 'copyNoteName', MenuItemLocation.NoteListContextMenu);
    await joplin.views.menuItems.create('contextListToggleTodoState', 'toggleTodoState', MenuItemLocation.NoteListContextMenu);

    //#endregion

    //#region EVENTS

    //#endregion

  }
});
