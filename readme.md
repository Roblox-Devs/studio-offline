# Studio-Offline
An easy way to use ROBLOX Studio Offline without any internet connection or GUAC.
## Requirements
1. [NodeJS](https://nodejs.org)

## Installing
1. Download the [latest release here]([https://github](https://github.com/Roblox-Devs/studio-offline/releases/latest))
2. Go to your ROBLOX Studio installation and rename the DLL ``WebView2Loader.dll`` to ``WebView2LoaderOld.dll``
3. Drag and drop the two DLL's present in the ``client`` folder of the latest release to your ROBLOX Studio installation
4. Make a file named ``OFFLINE_STUDIO`` with no file extension, this will tell Studio-Offline you want to launch it.
5. Open a command prompt in the ``server`` directory, and run the command ``npm i && node index.js``
6. Open ROBLOX Studio.

## Uninstalling
1. Go to your ROBLOX Studio installation and delete the DLLs ``studio_offline.dll`` and ``WebView2Loader.dll``
2. Rename ``WebView2LoaderOld.dll`` to ``WebView2Loader.dll``

**NOTE: THIS IS FOR IF YOU WANT TO COMPLETELY UNINSTALL STUDIO OFFLINE, IF YOU JUST WANT TO TURN IT OFF, DELETE THE OFFLINE_STUDIO FILE YOU HAVE MADE**

## Usage
Studio-Offline relies on the fact of a local web-server, meaning you will need to preload assets locally to have anything show up. The only thing that comes pre-loaded is the ``Baseplate`` place that can be found in File > New.

### Preloading Assets 
1. Clear your ROBLOX Studio asset cache (delete ``%localappdata%/Temp/Roblox``)
2. Launch Studio-Offline server and when asked, launch in Asset Grab mode
3. Open the place you want to open, when done Studio-Offline will download it, you should also play the game to download/preload any rigs, animations, etc.
4. Once everything is finished downloading, close studio, and launch Studio-Offline regularly.

**DISCLAIMER: ASSETS WILL NOT LOAD IN ASSET GRAB MODE, THIS IS FINE. IT WILL DOWNLOAD THEM REGARDLESS**

Just don't want to login this time? Use Reflection Mode which will redirect assets to the appropriate APIs without having to login.
## FAQ

### HTTPService doesn't work, why?
You're offline, why would it work? Oh you're using this online, run this in the command bar: ``game:GetService("HttpService").HttpEnabled = true``
### X is broken
Report it to the issues page.

## Roadmap
Planned features:
1. Local DataStores
