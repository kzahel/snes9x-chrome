
https://chrome.google.com/webstore/detail/super-nintendo-emulator-s/ckpjobcmemfpfeaeolhhjkjdpfnkngnd

BUILDING
===

You'll need to install these things:
- https://developer.chrome.com/native-client/sdk/download
- https://www.chromium.org/developers/how-tos/install-depot-tools
- https://code.google.com/p/naclports/wiki/HowTo_Checkout

apply a tiny patch (to enable persistent saving)
```
diff --git a/ports/snes9x/nacl.patch b/ports/snes9x/nacl.patch
index 445ee6e..d5e2c7f 100644
--- a/ports/snes9x/nacl.patch
+++ b/ports/snes9x/nacl.patch
@@ -518,9 +518,9 @@ new file mode 100644
 +  umount("/");
 +  mount("", "/", "memfs", 0, NULL);
 +  mkdir("/mnt", 0777);
-+  mount("", "/mnt/html5fs", "html5fs", 0, "type=TEMPORARY");
++  mount("", "/mnt/html5fs", "html5fs", 0, "type=PERSISTENT");
 +  mkdir("/home", 0777);
-+  setenv("HOME", "/home", 1);
++  setenv("HOME", "/mnt/html5fs", 1);
 +
 +  if (argc < 1) {
 +    fprintf(stderr, "Expect ROM filename as first argument!\n");
```
then build:

```
cd naclports/src
./make-all.sh snes9x
```

then copy the .nexe files to the correct _platform_specific folders (x86-64, x86-32, arm)
