import joplin from 'api';
import { MenuItem, MenuItemLocation } from 'api/types';
import { ChangeEvent } from 'api/JoplinSettings';
import { Settings, DefaultKeys } from './settings';
import { TextInputDialog } from './dialogs';
import { DA } from './data';
import { Url } from './url';

const copy = require('../node_modules/copy-to-clipboard');

joplin.plugins.register({
  onStart: async function () {
    const COMMANDS = joplin.commands;
    const DATA = joplin.data;
    const SETTINGS = joplin.settings;
    const WORKSPACE = joplin.workspace;
    // settings
    const settings: Settings = new Settings();
    await settings.register();
    // dialogs
    const dialogEditURL: TextInputDialog = new TextInputDialog('Set URL', 'Enter URL (source_url)...');
    await dialogEditURL.register();

    //#region HELPERS

    function escapeTitleText(text: string) {
      return text.replace(/(\[|\])/g, '\\$1');
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

    async function getFolderWithId(folderId: string): Promise<any> {
      let folder: any;

      if (folderId) {
        // called from context menu
        folder = await DA.getFolderWithId(folderId);
      } else {
        // get the parent folder name of the selected note
        const selectedNote: any = await WORKSPACE.selectedNote();
        if (selectedNote) {
          folder = await DA.getFolderWithId(selectedNote.parent_id);
        }
      }
      return folder;
    }

    //#endregion

    //#region COMMANDS

    // Command: copyFolderName
    // Desc: Copy the name of the folder
    await COMMANDS.register({
      name: 'copyFolderName',
      label: 'Copy notebook name',
      iconName: 'fas fa-copy',
      execute: async (folderId: string) => {
        let folder: any = await getFolderWithId(folderId);
        if (folder) {
          copy(folder.title);
        }
      }
    });

    // Command: copyFolderId
    // Desc: Copy the ID of the folder
    await COMMANDS.register({
      name: 'copyFolderId',
      label: 'Copy notebook ID',
      iconName: 'fas fa-copy',
      execute: async (folderId: string) => {
        let folder: any = await getFolderWithId(folderId);
        if (folder) {
          copy(folder.id);
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
          const note: any = await DA.getNoteWithId(noteId);

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
          const note: any = await DA.getNoteWithId(noteId);
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
        let selectedNoteIds: string[] = noteIds;
        if (!selectedNoteIds) selectedNoteIds = await WORKSPACE.selectedNoteIds();
        if (!selectedNoteIds) return;

        // copy each markdown link to clipboard
        const links = [];
        for (const noteId of selectedNoteIds) {
          const note: any = await DA.getNoteWithId(noteId);
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

        // open dialog and handle result
        const newUrl: string = await dialogEditURL.open(selectedNote.source_url);
        if (newUrl) {
          await DATA.put(['notes', selectedNote.id], null, { source_url: newUrl });
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
        Url.open(selectedNote.source_url);
      }
    });

    // Command: touchNote
    // Desc: Set 'updated_time' of selected note to current timestamp
    await COMMANDS.register({
      name: 'touchNote',
      label: 'Touch note',
      iconName: 'fas fa-hand-pointer',
      enabledCondition: 'someNotesSelected',
      execute: async (noteIds: string[]) => {
        // get selected note ids and return if empty
        let selectedNoteIds: string[] = noteIds;
        if (!selectedNoteIds) selectedNoteIds = await WORKSPACE.selectedNoteIds();
        if (!selectedNoteIds) return;

        // set 'updated_time' to current timestamp value for each note
        for (const noteId of selectedNoteIds) {
          await DATA.put(['notes', noteId], null, { updated_time: Date.now() });
        }
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
        const sortOrder: string = await settings.notesSortOrder;
        if (sortOrder != 'order') return;

        // exit if selected note is a completed to-do and completed ones shall be shown at the bottom (uncompletedTodosOnTop)
        const uncompletedTodosOnTop: boolean = await settings.uncompletedTodosOnTop;
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
        const sortOrder: string = await settings.notesSortOrder;
        if (sortOrder != 'order') return;

        // exit if selected note is a completed to-do and completed ones shall be shown at the bottom (uncompletedTodosOnTop)
        const uncompletedTodosOnTop: boolean = await settings.uncompletedTodosOnTop;
        if (uncompletedTodosOnTop && selectedNote.todo_completed) return;

        // get all notes from folder sorted by their 'order' value and exit if empty
        // TODO DA.getNotesOfFolder(folderId, orderby, orderdir);
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
        // TODO DA
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
          // TODO DA
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
        const sortOrder: string = await settings.notesSortOrder;
        if (sortOrder != 'order') return;

        // exit if selected note is a completed to-do and completed ones shall be shown at the bottom (uncompletedTodosOnTop)
        const uncompletedTodosOnTop: boolean = await settings.uncompletedTodosOnTop;
        if (uncompletedTodosOnTop && selectedNote.todo_completed) return;

        // get all notes from folder sorted by their 'order' value and exit if empty
        // TODO DA
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
        // TODO DA
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
          // TODO DA
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
        const sortOrder: string = await settings.notesSortOrder;
        if (sortOrder != 'order') return;

        // exit if selected note is a completed to-do and completed ones shall be shown at the bottom (uncompletedTodosOnTop)
        const uncompletedTodosOnTop: boolean = await settings.uncompletedTodosOnTop;
        if (uncompletedTodosOnTop && selectedNote.todo_completed) return;

        // get all notes from folder sorted by their 'order' value and exit if empty
        // TODO DA
        const notes: any = await DATA.get(['folders', selectedNote.parent_id, 'notes'], { fields: ['id', 'title', 'order'], order_by: 'order', order_dir: 'ASC' });
        if (!notes.items.length) return;

        // get index of selected note in list and exit if it is already the last
        const index = getIndexWithAttr(notes.items, 'id', selectedNote.id);
        if (index == 0) return;

        // TODO DA
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

    // prepare move submenu
    const moveSubmenu: MenuItem[] = [
      {
        commandName: 'moveToFolder',
        accelerator: DefaultKeys.MoveToFolder
      },
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


    ];

    // add commands to edit menu
    await joplin.views.menuItems.create('menEditTextCheckbox', 'textCheckbox', MenuItemLocation.Edit, { accelerator: DefaultKeys.TextCheckbox });

    // add commands to note menu
    await joplin.views.menus.create('menNoteProperties', 'Properties', propertiesSubmenu, MenuItemLocation.Note);
    await joplin.views.menus.create('menNoteMove', 'Move', moveSubmenu, MenuItemLocation.Note);

    // add commands to folder context menu
    await joplin.views.menuItems.create('folderContextCopyFolderName', 'copyFolderName', MenuItemLocation.FolderContextMenu);
    await joplin.views.menuItems.create('folderContextCopyFolderId', 'copyFolderId', MenuItemLocation.FolderContextMenu);

    // add commands to notes context menu
    await joplin.views.menuItems.create('notesContextCopyNoteName', 'copyNoteName', MenuItemLocation.NoteListContextMenu);
    await joplin.views.menuItems.create('notesContextToggleTodoState', 'toggleTodoState', MenuItemLocation.NoteListContextMenu);

    // add commands to editor context menu
    await joplin.views.menuItems.create('editorContextCopyNoteName', 'copyNoteName', MenuItemLocation.EditorContextMenu);
    await joplin.views.menuItems.create('editorContextToggleTodoState', 'toggleTodoState', MenuItemLocation.EditorContextMenu);

    //#endregion

    //#region EVENTS

    //#endregion
  }
});
