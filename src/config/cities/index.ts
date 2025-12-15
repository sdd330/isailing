// 城市配置统一导出文件
export { BeijingCityConfig } from './beijing/index'
export { ShanghaiCityConfig } from './shanghai/index'
export { GuangzhouCityConfig } from './guangzhou/index'
export { ShenzhenCityConfig } from './shenzhen/index'
export { HangzhouCityConfig } from './hangzhou/index'
export { SuzhouCityConfig } from './suzhou/index'
export { TianjinCityConfig } from './tianjin/index'
export { QingdaoCityConfig } from './qingdao/index'

// 导出所有策略类（现在策略都在各个城市目录中）
export { BeijingPriceStrategy, BeijingEventStrategy, BeijingTransportationStrategy, BeijingRentStrategy } from './beijing'
export { ShanghaiPriceStrategy, ShanghaiEventStrategy, ShanghaiTransportationStrategy, ShanghaiRentStrategy } from './shanghai'
export { GuangzhouPriceStrategy, GuangzhouEventStrategy, GuangzhouTransportationStrategy, GuangzhouRentStrategy } from './guangzhou'
export { ShenzhenPriceStrategy, ShenzhenEventStrategy, ShenzhenTransportationStrategy, ShenzhenRentStrategy } from './shenzhen'
export { HangzhouPriceStrategy, HangzhouEventStrategy, HangzhouTransportationStrategy, HangzhouRentStrategy } from './hangzhou'
export { SuzhouPriceStrategy, SuzhouEventStrategy, SuzhouTransportationStrategy, SuzhouRentStrategy } from './suzhou'
export { TianjinPriceStrategy, TianjinEventStrategy, TianjinTransportationStrategy, TianjinRentStrategy } from './tianjin'
export { QingdaoPriceStrategy, QingdaoEventStrategy, QingdaoTransportationStrategy, QingdaoRentStrategy } from './qingdao'
