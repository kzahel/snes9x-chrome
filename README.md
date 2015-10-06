
https://chrome.google.com/webstore/detail/super-nintendo-emulator-s/ckpjobcmemfpfeaeolhhjkjdpfnkngnd

BUILDING
===

You'll need to install these things:
- https://developer.chrome.com/native-client/sdk/download
- https://www.chromium.org/developers/how-tos/install-depot-tools
- https://code.google.com/p/naclports/wiki/HowTo_Checkout

edit these 3 lines in naclports/src/ports/snes9x/nacl.patch (to enable persistent saving)
```
+  mount("", "/mnt/html5fs", "html5fs", 0, "type=PERSISTENT");
+  mkdir("/home", 0777);
+  setenv("HOME", "/mnt/html5fs", 1);
```

```
cd naclports/src
./make-all.sh snes9x
```

then copy the .nexe files to the _platform_specific folders
