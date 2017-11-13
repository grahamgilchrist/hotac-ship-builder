# Hotac Ship Builder

## Contents
* [Background](#background)
* [Documentation](#documentation)
* [Acknowledgements](#acknowledgements)
* [Bugs and new features](#bugs-and-new-features)
* [Roadmap](#roadmap)
* [Changelog](#changelog)
* [Disclaimer](#disclaimer)

## Background

This is a web based ship builder and campaign tracker for the [Heroes of the Aturi Cluster](http://dockingbay416.com/campaign/) (hotac) campaign for the x-wing miniatures game.

The concept was originally built to help my campaign players by collecting all the options for upgrading their ships in one place, but has since grown into a fully fledged system for tracking pilot experience, upgardes, enemies etc. and can be used as a reference sheet during a game instead of needing the printed paper ship sheet and upgrade cards.

## Documentation

The application is wrriten as HTML, CSS and Javascript, which means that it runs right inside your web browser. Everything you do is saved in the URL of the app, and you may notice this changing as you update your ship.

To save your current status, simply copy the URL (either directly or via the "export" menu option)

### Getting started

Enter a player name, Callsign and starting ship to progress to the main screen. The main interface is divided into four tabs; Summary, Upgrades, History and Enemies.

### Summary
This tab is intended to be your reference point whilst playing a game. It shows you current ships stats, dial and equipped upgrades. You should equip upgrades via the "upgrades" tab before strating you game.

The dial maneuvers are clickable to indicate the currently selected maneuver, to avoid the need for a physical dial if not desired.

### Upgrades

The upgrades tab is probably the most complex part of the app. This tab contains all fucntionality related to upgrading your ship and earning/spending XP after a mission.
After you gain mission XP, you can add it by clicking the "+" button, increasing your "XP to spend".
In this tab you can spend XP to change ship, Upgrade Pilot skill, or buy ship upgrades. The first two can be done by clicking the labelled buttons. These buttons will be disabled if you do not have enough XP for either action.

Beneath these buttons are the available upgrade slots for the ship. Upgrade slots fall into three types:
* Free upgrades - These are provided for free as part of the ship chassis. They do not use up an upgrade slot to equip, and can be equipped/unequipped by toggling the "+/-" button next to the slot.
* Normal upgrade slots. These are the upgrade slots provided by the ship. To purchase upgrades for specific ship slots, click the slot and a set of options will appear. Slots which have not been unlocked yet due to pilot skill will be faded out and cannot be clicked. 
* Slots from upgrades - Sometimes, equipping certain upgrade cards will add additional slots to the ship (e.g. Sabine crew adds a bomb slot). Equipping one of these upgrades will add a slot to the list, which you can use to purchase and equip additionla upgrades. These will appear below the main list.

The list also shows unused and disabled upgrades. These correspond to upgrades you have purchased, but are not equipped to the ship, or upgrades you have purchased which are not usable on the current ship (for example, upgrades purchased when flying a different ship type).

### Purchasing upgrades
After clicking on an upgrades slot, a popup appears. Within the popup are several sections allowing you to equip either an already purchased upgrade for that slot, or purchase new upgrades. Purchasing an upgrade will reduce the amount from your XP total and equip immediately to that slot.

### History

The history tab shows the history of events which have occurred to your ship, including gaining mission XP, purchasing upgrades, changing ships etc. Since the order of upgrades in important in hotac, you can't undo specific purchases in a different order, but the upgrades list allows to to revert to an earlier point in time.
Clicking "revert" on any row in the table will discard all upgrade events after that row and revert your ship to its status at that point, including the upgrades available and the XP earnt/available. You can use this feature to test future potential upgrade combinations and costs buy buying a set of upgrades, then reverting back.
*Note that revrting does not affect the defeated enemies list. This will stay as it is*

### Enemies

This tab corresponds to the space of the paper sheet for recording the number of different types of enemies defeated. Whilst playing the game, you can either update these "live" as they happen, or record them offline and update later.

### Export

The export button simply gives you a convenient way to copy the URL for your current ship state.

### Print

Printing your ship will give you a fully usable reference sheet for use during gameplay, including printouts of any upgrade cards that you have equipped.

## Acknowledgements
This project couldn't exist without the excellent open source x-wing community. I would like to acknowledge the following amazing project, without which this application would be possible:

* [X-Wing symbols font](https://github.com/geordanr/xwing-miniatures-font) courtesy Hinny and Josh Derksen which is used for the dynamic ship stats and dial.
* [X-wing card data and images](https://github.com/guidokessels/xwing-data) courtesy of "guidokessels" which is essential for the upgrade card system and card images.
* And of course, the [Heroes of the Aturi Cluster](http://dockingbay416.com/campaign/) campaign itself, by Josh Derksen, and the x-wing miniatures game by Fantasy Flight Games.

## Development

The source code for this project is [hosted on Github](https://github.com/grahamgilchrist/hotac-squad-builder/) (https://github.com/grahamgilchrist/hotac-squad-builder/), and can be "forked" and run by anyone.

This project is maintained for free as a fun side project, so bugs and new features will be addressed as and when the time is available.

### Reporting bugs
Please use the [github issues queue](https://github.com/grahamgilchrist/hotac-squad-builder/issues) to report bugs and issues. It will greatly help debugging if you can include the device, Operating system and Browser version you are using.

Pull requests for bugfixes are welcome!

### Requesting new features
New features will be considered, but are going to be limited.

Currently we are limiting to the "Core" Hotac rules just to keep the complexity down. There is such a variety of custom and house rules used by different Hotac players, it would be impossible to support them all, so this project is limiting itself to more generic solutions which can address the widest number of options. The original remit of the app was also to present the upgrade options to newer players in an easy-to-understand and user friendly way, so additional features must be careful not to compromise the UX by introducing interface complexity.

If you have an idea for a new feature, please use the github issues queue to suggest it, but bear in mind the above considerations. You are welcome to fork the project and host your own version with specific custom features for your play group.

### Roadmap
A rough roadmap for upcoming issues/features can be seen in the [github project](https://github.com/grahamgilchrist/hotac-squad-builder/projects/1) 

### Changelog
An up-to-date [changelog](https://github.com/grahamgilchrist/hotac-squad-builder/blob/master/changelog.md) is maintained in github.

## Disclaimer
This application is unofficial and is not affiliated with Fantasy Flight Games, Lucasfilm Ltd., or Disney.
