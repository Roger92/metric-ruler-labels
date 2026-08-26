[![GitHub issues](https://img.shields.io/github/issues/Roger92/metric-ruler-labels?label=Issues)](https://github.com/Roger92/metric-ruler-labels/issues)
[![Version (latest)](https://img.shields.io/github/v/release/Roger92/metric-ruler-labels?label=Release)](https://github.com/Roger92/metric-ruler-labels/releases/latest)
[![Foundry Version](https://img.shields.io/badge/dynamic/json.svg?url=https://github.com/Roger92/metric-ruler-labels/releases/latest/download/module.json&label=Foundry%20Version&query=$.compatibility.maximum&colorB=blueviolet)](https://github.com/Roger92/metric-ruler-labels/releases/latest)
![All Time Downloads](https://img.shields.io/github/downloads/Roger92/metric-ruler-labels/module.zip?colorB=blue&label=All%20Time%20Downloads)
![Latest Release Downloads](https://img.shields.io/github/downloads/Roger92/metric-ruler-labels/latest/module.zip?colorB=blue&label=Downloads@Latest)
[![Forge Install Base](https://img.shields.io/badge/dynamic/json?label=Forge%20Install%20Base&query=package.installs&suffix=%&url=https://forge-vtt.com/api/bazaar/package/metric-ruler-labels&colorB=brightgreen)](https://forge-vtt.com/)
[![Ko-fi](https://img.shields.io/badge/-buy%20me%20a%20coffee-%23FF5E5B?logo=Ko-fi&logoColor=white)](https://ko-fi.com/roger92)
# Roger's Additional Metric Ruler Labels

For everyone that uses the metric system in the real world and wants to know the metric distances without changing the underlying game system. **Or do you want to add your own custom measurement conversions? Or maybe travel times?**

GM:
> A 20 feet wide gorge lies ahead of your party. What do you do?

*You are asking yourself:* 
> 20 feet ... is this wide? Should I try jumping across it?

<br>
This module will help you to better understand distances. <br>
It adds additional labels for the metric measurements to your ruler. It is not changing any systems etc. It only applies an additional label to the UI.

## V14 - Compatability
The latest version is compatible with V14. If you find problems with future subversions of V14, then please let me know.

## NEW --- NEW --- NEW
You can now add your [Customizable Measurement Conversions](#customizable-conversions) and [Travel times](#travel-times) if you want :) Have fun!
Compatability with V14 and localized numbers, that use a comma as decimal separator!!!
Flickering of V13 ruler labels should be gone now :)

## Table of Contents

  * [The following units are supported:](#the-following-units-are-supported)
  * [Example feet to meters](#example-feet-to-meters)
  * [Example miles to kilometers](#example-miles-to-kilometers)
  * [Works with FoundryVTT's MeasureTemplates](#works-with-foundryvtts-measuretemplates)
  * [Customizable Conversions](#customizable-conversions)
  * [Travel times](#travel-times)
  * [Rounding Modes](#rounding-modes)
  * [Support for other packages](#support-for-other-packages)
    +  [Hover Distance](#hover-distance)
  * [Installation](#installation)
  * [Compatibility](#compatibility)
  * [Dependencies](#dependencies)
  * [Planned](#planned)
  * [Feedback](#feedback)
  * [Changelog](#changelog)

## The following units are supported with the built-in conversion

- ft, ft. and feet will get converted to meters (5 ft -> 1,5 m)
- mi, mi., and miles will be converted to kilometers (1 mile -> 1,61 km)

## Example feet to meters
<img width="800" height="481" alt="Module-Ruler-Drag-Feet-Meter-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/cbfc8db3-034b-4a32-9295-74f5b7793216" />

## Example miles to kilometers 
<img width="800" height="450" alt="Module-Ruler-Miles-kilometer-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/c7d50b34-328a-431e-baf3-25a211230523" />

## Works with FoundryVTT's MeasureTemplates
<img width="800" height="429" alt="Module-Ruler-Templates-Feet-Meter-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/8c51b181-9ae8-40e1-8df1-9aeff67dc3a0" />


## Customizable Conversions
You can also add your own custom conversion with custom labels, etc. Just go to the settings and add all the information for your own conversion. 
The module has the concept of a small and a big measurement unit. For example, feet and miles. Or meters and kilometers. That way you can support normal maps, as well
as bigger travelmaps. Fill in the original labels so that the module can find the measurements that it should convert with your custom factor. That way you will receive your own custom measurement with a label of your choice.

Your players then can decide if they want to see the built-in metric conversion for feet and miles or your custom one, or just BOTH :). If you want to get rid of the original foundry measurements, then there is an option too. I hope this helps all the people that have some different szenarios than imperial to metric. <br>

<img width="1791" height="931" alt="Module-Custom-Conversions" src="https://github.com/user-attachments/assets/e79ca70f-68ea-4e04-a201-8b5b175c2483" /><br><br>
### Foundry + Built-In + Custom Conversions <br>
<img width="800" height="438" alt="Module-Ruler-All-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/3279d21c-3aec-459a-b0fb-30cc8185f1a2" /><br><br>
### Built-In + Custom Conversions <br>
<img width="800" height="435" alt="Module-Ruler-WithoutFoundry-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/76f3ab20-e345-4551-b6be-30bdaa9fbcf0" /><br><br>
### Only Built-In Conversions <br>
<img width="800" height="448" alt="Module-Ruler-OnlyBuiltIn-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/d5c8ce03-900c-4774-a7b4-089234d633c7" /><br><br>
### Only Custom Conversions <br>
<img width="800" height="438" alt="Module-Ruler-OnlyCustom-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/477c2ee6-5b6e-46fd-8365-a53a54119d08" /><br>


## Travel times
You can now add travel times to the ruler. Just go to the settings and add all the information for your own conversion. You will need to define the label that the module should look for (e.g. miles) 
and then the distances for that measuring unit that your group would travel at a slow, normal and fast travel speed. You can also define if you want to display the travel times in days, hours or whatever you want.

To save some space, you can also toggle on the option to only show the total travel time on the last segment of a ruler, instead of both the total and the travel time to this segment from the previous one.

<img width="689" height="732" alt="Module-Travel-Time-Settings" src="https://github.com/user-attachments/assets/e74b2ab4-8d8e-4cc9-ad32-d6f4daa1247f" /><br>

<img width="800" height="473" alt="Module-Ruler-Travel-Times-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/ccf5eca4-4888-41ce-897c-5715efe2764e" />

## Rounding Modes
You can configure rounding behavior in the module settings for **converted distances** and **travel times**. Optionally, you can also apply the rounding mode to Foundry's original distance labels.

The following rounding modes are available:

| Rounding Mode | Description | Examples |
| :--- | :--- | :--- |
| **No additional rounding** | Keeps the calculated conversion without extra step rounding. | `1.23` &rarr; `1.23` |
| **Tenths (round up)** | Rounds up to the nearest multiple of `0.1`. | `1.21` &rarr; `1.3`<br>`1.20` &rarr; `1.2`<br>`0.04` &rarr; `0.1` |
| **Quarters (round up)** | Rounds up to the nearest multiple of `0.25`. | `1.05` &rarr; `1.25`<br>`1.25` &rarr; `1.25`<br>`1.26` &rarr; `1.50`<br>`1.60` &rarr; `1.75` |
| **Halves (round up)** | Rounds up to the nearest multiple of `0.5`. | `1.01` &rarr; `1.5`<br>`1.50` &rarr; `1.5`<br>`1.51` &rarr; `2.0` |
| **Full (round up)** | Rounds up to the nearest whole integer (`1.0`). | `1.01` &rarr; `2`<br>`1.80` &rarr; `2`<br>`2.00` &rarr; `2` |
| **One decimal (standard rounding)** | Standard mathematical rounding to one decimal place. | `1.24` &rarr; `1.2`<br>`1.25` &rarr; `1.3`<br>`1.26` &rarr; `1.3` |

### Related Settings

- **Rounding mode for distances**: Controls how converted metric / custom distances are rounded (*default: No additional rounding*).
- **Rounding mode for travel times**: Controls how travel times for slow, normal, and fast speeds are rounded (*default: Quarters (round up)*).
- **Apply rounding to Foundry label**: When enabled, applies the selected distance rounding mode directly to Foundry's original distance label on the ruler.

## Support for other packages
### Hover Distance
This module supports the [HoverDistance](https://wiki.theripper93.com/premium/hover-distance) module from TheRipper93. 
You can enable/disable the labels in the settings. 

<img width="800" height="435" alt="Module-Hover-Distance-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/aa52ea1c-1797-4f20-8991-e65a2e082e6e" />



## Installation
To install, follow these instructions:

1. Inside Foundry, select the "Add-on Modules" tab in the Configuration and Setup menu.
2. Click the Install Module button and enter the following URL: https://github.com/roger92/metric-ruler-labels/releases/latest/download/module.json or search for Metric Ruler Labels in the search.
3. Click Install and wait for installation to complete.

## Compatibility
Works with V9 to V14
Please note that Release 1.1.0 and above are not compatible with foundry versions below V9 :)(They might work with earlier versions than V9, but it's not officially supported)

1.1.0 - 4.1.7 (V9 - V13) 

4.2.0 - 4.2.2 (V13) 

5.0.0 - current (V13 + V14) 

## Dependencies
- libWrapper from ruipin https://foundryvtt.com/packages/lib-wrapper/

Also thanks to ruipin for the libWrapper and TheRipper93 for the Hover Distance module :)

## Planned
Feel free to recommend enhancements.

## Feedback
If you find a bug or have any feedback for me just add an issue in the [issuetracker](https://github.com/Roger92/metric-ruler-labels/issues). Thx alot and i hope this module helps you in your game :)

## Changelog
**v5.1.0**
- Added support for TheRipper93's Hover Distance Module
- Removed Drag-Ruler settings, as measurements on drags are now part of base foundry
- Updated some labels in the settings.

**v5.0.1**
- Removed debug messages, fixed incompatibility check and fixed libwrapper dependency check

**v5.0.0**
- V14 compatible

**v4.2.2**
- Russian localization (fixed treiling comma)

**v4.2.1**
- Russian localization (thanks to @nPocToI4eJI)

**v4.2.0**
- Rounding options can be chosen in the settings
- This and newer versions are only compatible with V13 upwards

**v4.1.7**
- The V13 ruler labels are now handled better and don't cause flickering or wrong styling anymore

**v4.1.6**
- Fixed a bug where a label could be doubled

**v4.1.5**
- Fixed a bug where travel times were not displayed correctly when they were the only label
- Fixed a bug where spacing was off when foundry labels were hidden
- Fixed styling of delta labels when you have multiple ruler segments

**v4.1.4**
- French Localization (thanks to @rectulo)
- Added selection for rounding mode for travel times

**v4.1.3**
- Changed handling for V13 CSS
- Improved the handling when multiple rulers are visible. Now every ruler is handled separately, when it comes to CSS updates.

**v4.1.2**
- Fixed a small whoopsie :D

**v4.1.1**
- V13 Ruler Labels now also work on hosted FoundryVTT instances like "The Forge"
- Fixed a bug with travel time in combination with localized numbers, that use a comma as decimal separator

**v4.1.0**
- Support for localized distances. The module now also works if you use a foundry localization that uses the comma as decimal separator

**v4.0.3**
- Fixed CSS access errors that caused the libwrapper hook registration to fail

**v4.0.2**
- Fixed module.json

**v4.0.1**
- Fixed module.json
  
**v4.0.0**
- Support for V13 :)
- There might be some not 100% smooth UI things with the new ruler labels of V13, but i will try to minimize weird behavior in subsequent minor releases 

**v3.3.1**
- Cleanup of manifest.json to remove a warning because of deprecated/unknown field

**v3.3.0**
- Changed the way the labels are converted, so that it should work with more different variations out of the box.

**v3.2.2**
- Setting for Drag Ruler support is now a dropdown

**v3.2.1**
- Compatibility for PF2e Token Drag Ruler (and build in Drag Ruler of the pathfinder system)
- Italian Language Support (Thx to GregoryWarn)
- Fixed warning for unsupported manifest field

**v3.2.0**
- V12 Compatibility

**v3.1.9**
- Just removed some console logs :)

**v3.1.8**
- Fix for Measurement Templates on V11

**v3.1.7**
- Fix for incompatibility dialog

**v3.1.6**
- Compatibility with V11

**v3.1.5**
- Fix for elevation ruler. Now displays metric conversions on drag ruler if elevation ruler is active.

**v3.1.2**
- Fixed bugs with disappearing labels, when dragruler is active and foundryLabels are disabled

**v3.1.1**
- Added option to only show the total travel time on the last ruler segment

**v3.1.0**
- Travel time label customizable
- Fixed bug where travel time did not display on ruler segments
- Fixed bug where settings for conversions where available to players

**v3.0.2**
- New Travel time ruler option
- Bugfix for gridless maps

**v2.1.3**
- Small Bugfix

**v2.1.2**
- DragRuler (By Stäbchenfisch) V10 Support
- Support for moving of Measurement Templates
- Smaller Bugfixes

**v2.1.0**
- V10 Support

**v2.0.1**
- Fixed German localization bug

**v2.0.0**
- Added Support for custom conversions

**v1.1.0**
- Added support for V9
- Fixed MeasureTemplates support that didn't work anymore in V9

**v1.0.0**
- Added support for FoundryVTT's MeasureTemplates

**v0.9.1**
- Added support for the DragRuler module by Stäbchenfisch ( you can activate/deactivate metric labels for this module in the settings)
- All segments of the ruler now have metric labels
- Added german localization
- Added a dialog if dependency is missing
- Removed libRuler as a dependency  (yay ... less dependencies are always better \\(°0°)/ )

**v0.9.0**
- First release with the conversions for miles and feet for the ruler tool.
