/**
 * 地点场所服务
 * 提供通用的地点场所名称（不绑定特定城市）
 */
export class PlaceService {
  private static readonly commonPlaces = [
    "小摊边", "路边摊", "水果摊", "小吃摊", "大排档",
    "小卖部", "中医院", "电话亭",
    "三轮车", "小商店", "电影院", "小亭子", "小商场门口",
    "工地旁", "草地边", "电线杆下",
    "小路边", "路边", "街边的", "公园里", "地铁站",
    "长途汽车站", "游戏厅旁边", "广告公司旁边", "公司旁边",
    "便利店", "咖啡厅", "书店", "银行门口"
  ]

  /**
   * 获取随机场所名称
   */
  static getRandomPlace(): string {
    const randomIndex = Math.floor(Math.random() * this.commonPlaces.length)
    return this.commonPlaces[randomIndex] ?? '未知地点'
  }

  /**
   * 根据城市特色获取场所（可选扩展）
   */
  static getRandomPlaceForCity(cityName: string): string {
    void cityName
    // 未来可以根据城市特色返回不同的场所
    // 目前返回通用场所
    return this.getRandomPlace()
  }
}
