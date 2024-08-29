import { SyncClient } from "twilio-sync";

export default class SyncHelper {
  static pageHandler(paginator: any) {
    const items: any[] = [];
    paginator.items.forEach((item: any) => {
      items.push(item);
    });
    return paginator.hasNextPage
      ? paginator.nextPage().then(this.pageHandler)
      : items;
  }

  static async getMapItems(client: SyncClient, mapName: string) {
    try {
      const map = await client.map(mapName);
      const paginator = await map.getItems();
      return this.pageHandler(paginator);
    } catch (error) {
      console.error("Map getItems() failed", error);
      return [];
    }
  }
}
