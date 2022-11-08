[![Version (latest)](https://img.shields.io/github/v/release/Roger92/metric-ruler-labels)](https://github.com/Roger92/metric-ruler-labels/releases/latest)
[![Foundry Version](https://img.shields.io/badge/dynamic/json.svg?url=https://github.com/Roger92/metric-ruler-labels/releases/latest/download/module.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=blueviolet)](https://github.com/Roger92/metric-ruler-labels/releases/latest)
[![GitHub downloads (latest)](https://img.shields.io/badge/dynamic/json?label=Downloads@latest&query=assets[?(@.name.includes('zip'))].download_count&url=https://api.github.com/repos/Roger92/metric-ruler-labels/releases/latest&color=green)](https://github.com/Roger92/metric-ruler-labels/releases/latest)
[![Forge Install Base](https://img.shields.io/badge/dynamic/json?label=Forge%20Install%20Base&query=package.installs&suffix=%&url=https://forge-vtt.com/api/bazaar/package/metric-ruler-labels&colorB=brightgreen)](https://forge-vtt.com/)
[![Ko-fi](https://img.shields.io/badge/-buy%20me%20a%20coffee-%23FF5E5B?logo=Ko-fi&logoColor=white)](https://ko-fi.com/roger92)
# Roger's Additional Metric Ruler Labels

For everyone that uses the metric system in the real world and wants to know the metric distances without changing the underlying game system. **Or do you want to add your own custom measurement conversions?**

GM:
> A 20 feet wide gorge lies ahead of your party. What do you do?

*You are asking yourself:* 
> 20 feet ... is this wide? Should i try jumping across it?

<br>
This module will help you to better understand distances. <br>
It adds additional labels for the metric measurements to your ruler. It is not changing any systems etc. It only applies an additional label to the UI.

## NEW --- NEW --- NEW
You can now add your [Customizable Measurement Conversions](#customizable-conversions) and [Travel times](#travel-times) if you want :) Have fun!
Dragruler Support for V10 is back :)

## V10 - Compatability
The latest version is compatible with V10 - Checked on Build 288. 
Please note that Release 1.1.0 and above are not compatible with foundry versions below V9 :)(They might work with earlier versions than V9 but its not supported)

## Table of Contents

  * [The following units are supported:](#the-following-units-are-supported)
  * [Example feet to meters](#example-feet-to-meters)
  * [Example miles to kilometers](#example-miles-to-kilometers)
  * [Works with FoundryVTT's MeasureTemplates](#works-with-foundryvtts-measuretemplates)
  * [Customizable Conversions](#customizable-conversions)
  * [Travel times](#travel-times)
  * [Support for other packages](#support-for-other-packages)
    +  [DragRuler](#dragruler)
  * [Installation](#installation)
  * [Compatibility](#compatibility)
  * [Dependencies](#dependencies)
  * [Planned](#planned)
  * [Feedback](#feedback)
  * [Changelog](#changelog)

## The following units are supported

- ft, ft. and feet will get converted to meters (5 ft -> 1,5 m)
- mi, mi., and miles will be converted to kilometers (1 mile -> 1,61 km)

## Example feet to meters
![Ruler](https://user-images.githubusercontent.com/11605051/133685368-75476211-907a-43fb-8aa9-400e7aa9171c.gif)

## Example miles to kilometers 
![ezgif com-gif-maker (1)](https://user-images.githubusercontent.com/11605051/133089023-0cf26ee0-e310-491e-ba12-80990d1e3598.gif)

## Works with FoundryVTT's MeasureTemplates
![measureTemplates](https://user-images.githubusercontent.com/11605051/133858694-eea1b96e-3524-4725-b889-37dec98e2a74.gif)

## Customizable Conversions
You can now add your own custom conversion with custom labels, etc. Just go to the settings and add all the information for your own conversion. 
The module has the concept of a small and a big measurement unit. For example feet and miles. Or meters and kilometers. That way you can support normal maps, as well
as bigger travelmaps. Fill in the original labels, so that the module can find the measurements, that it should convert with your custom factor. That way you will receive your own custom measurement with a label of your choice.

Your players then can decide if they want to see the built-in metric conversion for feet and miles or your custom one, or just BOTH :). If you want to get rid of the original foundry measurements, then there is an option too. I hope this helps all the people that have some different szenarios than imperial to metric. <br>

![image](https://user-images.githubusercontent.com/11605051/181906692-b051eb17-a56d-40fa-b476-a30fb0db4e77.png) <br>

![ThreeMeasurements](https://user-images.githubusercontent.com/11605051/166330492-28456d83-b469-489f-a2e4-e712a1bb1eeb.gif)<br>

![TwoMeasurements](https://user-images.githubusercontent.com/11605051/166330502-27785408-efa2-4993-817c-1440f4cc61ec.gif)<br>

![OneMeasurements](https://user-images.githubusercontent.com/11605051/166330507-911d8062-a191-491e-879d-e36fe5665cfd.gif)<br>

![BigMeasureunit](https://user-images.githubusercontent.com/11605051/166330513-4dcf33fd-3672-4c7c-aa20-3ff9d8479647.gif)<br>

## Travel times
You can now add travel times to the ruler. Just go to the settings and add all the information for your own conversion. You will need to define the label that the module should look for (e.g. miles) 
and then the distances for that measuring unit that your group would travel on a slow, normal and fast travel speed.

![image](https://user-images.githubusercontent.com/11605051/200674734-ee096037-3858-46e6-a77e-0719ef86a9e5.png)
![image](https://user-images.githubusercontent.com/11605051/200674864-8cab8a31-731b-47e0-9755-c9ca022793a9.png)

## Support for other packages
### DragRuler
This module supports the [DragRuler](https://foundryvtt.com/packages/drag-ruler) module from Stäbchenfisch. You can enable/disable the labels in the settings.
![DragRuler](https://user-images.githubusercontent.com/11605051/133684447-e5f09288-7495-4987-a26e-f5300c811a72.gif)


## Installation
To install, follow these instructions:

1. Inside Foundry, select the "Add-on Modules" tab in the Configuration and Setup menu.
2. Click the Install Module button and enter the following URL: https://github.com/roger92/metric-ruler-labels/releases/latest/download/module.json or search for Metric Ruler Labels in the search.
3. Click Install and wait for installation to complete.

## Compatibility
Works with V9 + V10
## Dependencies
- libWrapper from ruipin https://foundryvtt.com/packages/lib-wrapper/

Also thanks to ruipin for the libWrapper and Stäbchenfisch for the DragRuler module :)

## Planned
Nothing yet. Feel free to recommend enhancements.

## Feedback
If you find a bug or have any feedback for me just add an issue in the [issuetracker](https://github.com/Roger92/metric-ruler-labels/issues). Thx alot and i hope this module helps you in your game :)

## Changelog

**v3.0.0**
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
