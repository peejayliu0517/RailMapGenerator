# Colour Database

This directory contains

- `city_list.json`, a list of cities sorted by their English name in alphabetical order; and
- `[city].json`, a list of colours used in the city's public transportation system. 

Please follow the rules below to 

- Add colour standards for more cities;
- Update colours; or
- Add translations for cities or lines. 

A typical example of an entry of `city_list.json`:

```JSON
{
    "id": "sanfrancisco", // Same as the filename of colour list file
    "country": "US", // ISO 3166-1 alpha-2 code (for cities in Britain, append BS 6879 code)
    "name": {
        "en": "San Francisco", 
        "zh-Hans": "旧金山", 
        "zh-HK": "三藩市", 
        "zh-TW": "舊金山"
        // Merge country variants if applicable
    }
}
```

A typical example of an entry of `guangzhou.json`:

```JSON
{
    "id": "gz3", 
    "name": {
        "en": "Line 3", 
        "zh-Hans": "3号线", 
        "zh-Hant": "3號線", 
    }, 
    "colour": "#ECA154", 
    "fg": "#000" // Optional if foreground colour is white
}
```

### Reference

| City | Reference |
| --- | --- |
| Chengdu | [2018.01.05 《成都市城市轨道交通线网导向系统设计导则》(报批稿) - 百度文库](https://wenku.baidu.com/view/a745419d64ce0508763231126edb6f1aff007137.html) |
| Edinburgh | [Lothian City Buses - Lothian Buses](https://www.lothianbuses.com/our-services/lothian-city-buses/) |
| Foshan | [Template:佛山地铁颜色 - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/Template:佛山地铁颜色) |
| Guangzhou | [不知道有没有火星。。-广 州 区-地铁族](http://www.ditiezu.com/forum.php?mod=viewthread&tid=523725) |
| London | [Colour standards - Transport for London](http://content.tfl.gov.uk/tfl-colour-standards-issue04.pdf) |
| Shanghai | [《上海轨道交通网络近期规划建设线路标志色方案》征求市民意见公告 - 上海地铁](http://www.shmetro.com/node49/201109/con109210.htm) <br> [模块:RailSystems/SHMetro - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/模块:RailSystems/SHMetro) |
| Shenzhen | [Template:深圳地铁颜色 - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/Template:深圳地铁颜色) |
| Toronto | [Signage Manual and Standards - Toronto Transit Commission](https://joeclark.org/design/signage/TTC/2015/TTCWayfindingStandardsManual_201409.pdf) |
| Xi'an | [西安轨道交通标准色号-西 安 区-地铁族](http://www.ditiezu.com/forum.php?mod=viewthread&tid=642532) <br> [Template:西安地铁颜色 - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/Template:西安地铁颜色)(Line 8, 9 and 11) |

#### Notes
- Hexachrome Green C for Line 4 of Chengdu not found. 