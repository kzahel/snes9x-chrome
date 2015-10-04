
https://chrome.google.com/webstore/detail/super-nintendo-emulator-s/ckpjobcmemfpfeaeolhhjkjdpfnkngnd

BUILDING
===

You'll need to install these things:
- https://developer.chrome.com/native-client/sdk/download
- https://www.chromium.org/developers/how-tos/install-depot-tools
- https://code.google.com/p/naclports/wiki/HowTo_Checkout

```
cd naclports/src
./make-all.sh snes9x
```

then copy the .nexe files to the _platform_specific folders
