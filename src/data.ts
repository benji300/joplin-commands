import joplin from 'api';
import { Path } from 'api/types';

/**
 * Helper class for data accesses.
 */
export class DA {

  private static async getAll(path: Path, query: any): Promise<any[]> {
    query.page = 1;
    let response = await joplin.data.get(path, query);
    let result = !!response.items ? response.items : [];
    while (!!response.has_more) {
      query.page += 1;
      let response = await joplin.data.get(path, query);
      result.concat(response.items)
    }
    return result;
  }

  /**
   * Gets All folders from the database.
   */
  static async getAllFolders(fields: string[]): Promise<any[]> {
    return await DA.getAll(['folders'], { fields: fields, page: 1 });
  }

  /**
   * Gets the folder with the handle ID from the database or null. Including the specified fields.
   */
  static async getFolderWithId(id: string, fields: string[]): Promise<any> {
    return (await DA.getAllFolders(fields)).find(x => x.id === id);
  }

  /**
   * Gets the folder with the handle title from the database or null. Including the specified fields.
   */
  static async getFolderWithTitle(title: string, fields: string[]): Promise<any> {
    return (await DA.getAllFolders(fields)).find(x => x.title === title);
  }

  /**
 * Gets All notes from the database.
 */
  static async getAllNotes(fields: string[]): Promise<any[]> {
    return await DA.getAll(['notes'], { fields: fields, page: 1 });
  }

  /**
   * Gets the note with the handle ID from the database or null. Including the specified fields.
   */
  static async getNoteWithId(id: string, fields: string[]): Promise<any> {
    return (await DA.getAllNotes(fields)).find(x => x.id === id);
  }

  /**
   * Gets the note with the handle title from the database or null. Including the specified fields.
   */
  static async getNoteWithTitle(title: string, fields: string[]): Promise<any> {
    return (await DA.getAllNotes(fields)).find(x => x.title === title);
  }

}