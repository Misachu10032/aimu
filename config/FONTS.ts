export interface FontConfig {
  path: string
  name: string
  type: 'cn' | 'en' | 'thai'
}

export const FONTS: FontConfig[] = [
  { path: 'SourceHanSansCN-Normal.otf', name: 'Source Han Sans CN Normal', type: 'cn' },
  { path: 'SourceHanSansCN-Medium.otf', name: 'Source Han Sans CN Medium', type: 'cn' },
  { path: 'SourceHanSansCN-Bold.otf', name: 'Source Han Sans CN Bold', type: 'cn' },
  { path: 'SourceHanSerifCN-Medium.ttf', name: 'Source Han Serif CN Medium', type: 'cn' },
  { path: 'Alibaba-PuHuiTi-Heavy.ttf', name: 'Alibaba PuHuiTi Heavy', type: 'cn' },
  { path: 'ZCOOLKuaiLe-Regular.ttf', name: 'ZCOOL KuaiLe', type: 'cn' },
  { path: 'AbrilFatface-Regular.ttf', name: 'Abril Fatface', type: 'en' },
  { path: 'AlfaSlabOne-Regular.ttf', name: 'Alfa Slab One', type: 'en' },
  { path: 'Anton-Regular.ttf', name: 'Anton', type: 'en' },
  { path: 'ArchivoBlack-Regular.ttf', name: 'Archivo Black', type: 'en' },
  { path: 'Calistoga-Regular.ttf', name: 'Calistoga', type: 'en' },
  { path: 'Chewy-Regular.ttf', name: 'Chewy', type: 'en' },
  { path: 'CourierPrime-Regular.ttf', name: 'Courier Prime', type: 'en' },
  { path: 'Iceberg-Regular.ttf', name: 'Iceberg', type: 'en' },
  { path: 'OleoScript-Regular.ttf', name: 'Oleo Script', type: 'en' },
  { path: 'PermanentMarker-Regular.ttf', name: 'Permanent Marker', type: 'en' },
  { path: 'Rakkas-Regular.ttf', name: 'Rakkas', type: 'en' },
  { path: 'Roboto-Regular.ttf', name: 'Roboto', type: 'en' },
  { path: 'SquadaOne-Regular.ttf', name: 'Squada One', type: 'en' },
  { path: 'TitanOne-Regular.ttf', name: 'Titan One', type: 'en' },
  { path: 'NotoSansThai-Regular.ttf', name: 'Noto Sans Thai', type: 'thai' },
  { path: 'NotoSerifThai-Regular.ttf', name: 'Noto Serif Thai', type: 'thai' },
]
