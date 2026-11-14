# Gun sound credits

`guns.mp3` holds every gunshot, reload and dry-fire sound in the game. All of them are real recordings from
**The Free Firearm Sound Library** by **Still North Media** (Ben Jaszczak), funded on Kickstarter in 2014 and released
into the public domain under **CC0 1.0** (https://creativecommons.org/publicdomain/zero/1.0/). No attribution is
required, but credit where it is due.

- Original project: https://www.kickstarter.com/projects/bjjaszcz/the-firearm-sound-library
- Mirror used: https://github.com/buddingmonkey/FreeFirearmsSFXLibrary (CC0-1.0, includes the master sheet)

Clips were trimmed, faded, normalised and packed into one mono MP3 by `scripts/gun-audio.py`.

| In game | Recording used |
| --- | --- |
| 9mm pistol, dual 9mms | Walther PPQ 9mm, near (X_39P); mag out/in, slide release, dry fire (X_3, X_4, X_11, X_18) |
| Silenced 9mm | Walther PPQ 9mm suppressed, mic at muzzle (X_43) |
| .357 Magnum | Smith & Wesson 642 .38 Special (V_27P); cylinder open, extract, load, close, dry fire (V_9, V_3, V_2, V_10, V_5) |
| Pump shotgun | Charles Daly pump 12 gauge (H_21P); shell into breach, full cycle, dry fire (H_7, H_6, H_8) |
| Double barrel | Benelli Nova 12 gauge (O_21P); open/insert/close action (O_0, O_7, O_1) stand in for the break-open |
| Uzi | Carl Gustav M45 "Swedish K" 9mm SMG (G_31P); mag out/in, bolt (G_9, G_8, G_2) |
| M16 | AR-15 5.56 (D_32P); mag out/in, bolt drop, dry fire (D_3, D_4, D_13, D_16) |
| Golden AK-47 | AK-47 7.62x39 (C_28P); mag out/in, charging handle (C_11, C_10, C_14) |
| Golden Deagles | Colt 1911 .45 shot pitched down (A_42P); mag out/in, slide (A_3, A_4, A_11) |
| Gold grenade launcher | Mossberg 190 12 gauge shot pitched down into a thump (N_30P); Nova action sounds |

The shell-casing tinkle after a shot is still synthesized in code.
