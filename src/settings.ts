import joplin from 'api';

/**
 * Predefined keyboard shortcuts.
 */
export enum DefaultKeys {
  TextCheckbox = 'CmdOrCtrl+Shift+C',
  ToggleTodoState = 'CmdOrCtrl+Shift+Space',
  MoveToTop = 'CmdOrCtrl+Alt+num8',
  MoveUp = 'CmdOrCtrl+num8',
  MoveDown = 'CmdOrCtrl+num2',
  MoveToBottom = 'CmdOrCtrl+Alt+num2',
  MoveToFolder = 'CmdOrCtrl+Shift+M'
}

/**
 * Advanced style setting default values.
 * Used when setting is set to 'default'.
 */
// enum SettingDefaults {
//   Empty = '0',
//   Default = 'default',
//   FontFamily = 'Roboto',
//   FontSize = 'var(--joplin-font-size)',
//   Background = 'var(--joplin-background-color3)',
//   HoverBackground = 'var(--joplin-background-color-hover3)', // var(--joplin-background-hover)
//   Foreground = 'var(--joplin-color-faded)',
//   ActiveBackground = 'var(--joplin-background-color)',
//   ActiveForeground = 'var(--joplin-color)',
//   DividerColor = 'var(--joplin-divider-color)'
// }

/**
 * Definitions of plugin settings.
 */
export class Settings {
  // private settings
  // none
  // general settings
  // none
  // advanced settings
  // none
  // internals
  // private _defaultRegExp: RegExp = new RegExp(SettingDefaults.Default, "i");

  constructor() {
  }

  //#region GETTER

  //#endregion

  //#region GLOBAL VALUES

  get notesSortOrder(): Promise<string> {
    return joplin.settings.globalValue('notes.sortOrder.field');
  }

  get uncompletedTodosOnTop(): Promise<boolean> {
    return joplin.settings.globalValue('uncompletedTodosOnTop');
  }

  //#endregion

  /**
   * Register settings section with all options and intially read them at the end.
   */
  async register() {

    // settings section
    // await joplin.settings.registerSection('commands.settings', {
    //   label: 'Command Collection',
    //   iconName: 'fas fa-terminal'
    // });

    // private settings
    // none

    // general settings
    // none

    // advanced settings
    // none

    // initially read settings
    // await this.read();
  }

  // private async getOrDefault(event: ChangeEvent, localVar: any, setting: string, defaultValue?: string): Promise<any> {
  //   const read: boolean = (!event || event.keys.includes(setting));
  //   if (read) {
  //     const value: string = await joplin.settings.value(setting);
  //     if (defaultValue && value.match(this._defaultRegExp)) {
  //       return defaultValue;
  //     } else {
  //       return value;
  //     }
  //   }
  //   return localVar;
  // }

  /**
   * Update settings. Either all or only changed ones.
   */
  // async read(event?: ChangeEvent) {
  // }
}
