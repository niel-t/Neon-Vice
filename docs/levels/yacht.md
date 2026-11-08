# The Royal Flush: floorplan reference and layout brief

> **Status:** W3 research deliverable (wave 1). This is docs only, not a runtime map.
> **Consumers:** W2 (level designer) builds the stage from it. W1's floorplan
> visualiser and query tools check the result against §5 and §6. W4 (decor)
> uses §8. W5 uses §6.7 and §7.
> **Mission brief:** levels.js line 134: *"Lex is on his yacht, the Royal
> Flush, two miles out. Glass dance floor over a shark tank. Bring me the
> yacht. Lex is optional."* W10d script draft (Job 8, team file, not in the
> repo): header *"On the water, the biggest fish eats first."*; McWey:
> *"Bring me that yacht. Lex is optional."*; with `singer_paid`: *"The
> singer says he sleeps aft."* / *"Then start aft."*
> **Evidence tags:** **V** verified from a cited source, **D** derived from
> sources, **P** proposed design choice (plausible, not measured), **G**
> gameplay override.
> **Validated:** area bounds, door and window geometry, reachability, m²
> totals, loops L1–L5, connectivity C1–C8 and sightlines S1–S15 were checked
> by script against the table data in §5–§6, plus a 0.6 m prop-free strip on
> both sides of every door and window (no overlaps; enclosed 280.0 m² +
> exterior 238.0 m² = 518.0 m² of walkable deck).
> **Machine-readable layout:** `docs/levels/yacht.layout.json` (STYLE-LEVELS
> §3.1), with `R`, `D`, `W`, `B` (props with roles) and `S` (sightline
> targets). The dance-floor insert (§5.4) is not in the sidecar.

---

## 1. Design intent

The legacy level (levels.js lines 134–150) is a 42 × 15 cell map: a hull
tapered at both ends, a 9 × 5 cell dance floor (`y`, plain floor) in a room
in the middle with doors west, east and south, Lex (`X`) standing on it,
eight enemies (`g` ×2, `u` ×2, `s`, `d`, `m`, and an unarmed `i`), four
pieces of furniture (`Z`), and a gangway south to a quay where the player
(`P`) and car (`C`) start. The legacy yacht is moored alongside, not "two
miles out" (§9 Q1).

This brief keeps the legacy reading (one deck, the dance floor in the
middle, Lex at the party) and makes it the **main deck of a real
mid-1980s three-deck motor yacht of about 50 m**:

- **The hull is real.** About 51 × 10 m with a steel hull and aluminium
  superstructure, like Codecasa's *Fantasia* (1986, 49.9–50.2 × 9.3 m,
  Y9–Y11) and Feadship's *The Highlander* (1986, 46 m, built for
  entertaining six to sixty guests, Y6). The upper (boat and sun) decks and
  the lower deck (guest cabins, crew, engine room) are implied by stairs;
  only the main deck is walkable (G).
- **The room set is real.** Stern to bow: a swim and boarding platform,
  the aft deck, the saloon, the dining saloon, and the galley and crew mess
  (Y10, Y12). 1 m side decks run the length of the deckhouse on both sides:
  narrower than a STYLE-LEVELS corridor, so two pawns cannot pass, an
  intended choke. On a real 46–50 m yacht the wheelhouse is a deck up, on
  the bridge deck; here it is brought down to the forward end of the main
  deck so the level plays on one floor (G).
- **The ballroom is Lex.** The main saloon is fitted out as a ballroom with
  a bar, a DJ booth and a lit glass dance floor (G; Nabila's nightclub, Y16,
  is the period precedent for a nightclub on board). The shark tank under
  the floor is fiction (§2, "Real versus fiction").
- **Lex sleeps aft.** A real 1980s owner's suite is usually forward on the
  main deck or full-beam below (Y7, Y10). Lex's is aft of the ballroom with
  its own glass slider D6 onto the aft deck (G). D6 is locked from inside;
  with `singer_paid` the singer has left it unlocked, so the script's hint
  "start aft" opens a quiet way in.

**Gameplay frame.** It is after midnight, the yacht is at anchor two miles
off Miami Beach, and the party is on. The player comes up from a speedboat
at the stern platform, where guests arrive by tender (Y15). "Bring me the
yacht" means **taking the helm** at the far end of the deck: through the
party, along a 1 m open side deck, or through the crew side (galley, mess,
crew stair).

**Objective and exits (proposed, §9 Q7).** The current engine ends a floor
only when every enemy is dead, the boss included, and the player then
reaches the car marker `C` (`index.html` lines 753, 1118–1119). It has no
yacht objective. This brief proposes:

- a `g.obj` "TAKE THE HELM", done at the helm console HELM;
- the level's `C` marker at the helm, so the run ends by sailing away;
- the player's speedboat at the swim platform as the second way off, always
  available (STYLE-LEVELS §6, two ways out), even if W2 cuts E2.

"Lex is optional" (W10d) is **not possible** under the current clear rule,
because the boss is in `g.enemies`. It needs an engine exception that W5
would make, or W10 drops the line (§9 Q5).

## 2. References and what each contributes

Images are not copied; read the sources at the links. Most yacht pages
describe yachts **after refits**: they support room order and construction,
not original 1986 room sizes.

| id | Source | What it shows (evidence) | Used for | Why it matters |
|---|---|---|---|---|
| **Y2** | Boat International, "Lady Sandals (ex-Gallant Lady), Feadship 1985" listing. <https://www.boatinternational.com/yachts-for-sale/lady-sandals-feadship-1985> | Steel hull, aluminium superstructure (V; MATERIALS) | §7 | The construction. |
| **Y4** | Feadship, "Gallant Lady" fleet record. <https://feadship.nl/fleet/gallant-lady-3> | 1985; 40.07 × 8.00 m; Feadship's first swim platform and stern boarding door (V) | `swim`, D1 | A swim platform was new but real in 1985. |
| **Y5** | YachtBuyer, "Lady Sandals" (after 2007 refit). <https://www.yachtbuyer.com/en-us/fleet/lady-sandals-131-feadship> | 40.07 × 7.26 m; three decks; seven crew; twelve-person dining in the saloon (V, post-refit) | `dining`, §8 | Dining for twelve on a mid-1980s Feadship. |
| **Y6** | Feadship, "The Highlander" fleet record. <https://feadship.nl/fleet/the-highlander-3> | 1986; 46.0 m; built for Malcolm Forbes to entertain six to sixty guests (V) | The party yacht | A purpose-built 1986 entertaining yacht. |
| **Y7** | YachtBuyer, "Highlander" (after 2014 refit). <https://www.yachtbuyer.com/en/fleet/highlander-162-feadship> | 49.45 × 8.59 m; three decks; main deck: full-beam saloon opening aft, galley forward, master suite forward with study; crew forward on the lower deck; central stair; eleven crew (V, post-refit) | Room order, `lobby`, `crew_stair` | Where things go on a 50 m main deck. |
| **Y8** | M. Blazeby, "Highlander", BOAT International, 27 Mar 2020. <https://www.boatinternational.com/yachts/editorial-features/highlander-feadship-superyacht--43115> | 1986 origin; steel/aluminium; eleven crew; a disco lounge, but after a 2014 refit (V) | `ballroom` | A disco on a 50 m yacht; not backdated to 1986. |
| **Y9** | Codecasa, fleet register. <https://www.codecasayachts.com/codecasa-yachts/> | *Fantasia* (ex-Marcalan IV): 49.90 m, 1986, steel–aluminium (V) | Hull size | Builder's record of the size and date. |
| **Y10** | YachtBuyer, "Fantasia" (1993 refit). <https://www.yachtbuyer.com/en/fleet/fantasia-164-codecasa> | About 50.2 × 9.3 m; delivered May 1986; main deck aft: outdoor dining → glass doors → saloon; forward: study and dining saloon; then crew mess and galley; boat deck with two tenders in cradles; eleven crew (V) | The whole main-deck order | The closest textual GA. |
| **Y11** | BOAT International, "Fantasia" directory. <https://www.boatinternational.com/yachts/the-superyacht-directory/fantasia--69103> | 50.23 × 9.3 m; 2.71 m draught; 14 guests; eleven crew; teak decks (V) | Envelope, crew count | Second measurement of the same yacht. |
| **Y12** | YachtBuyer, "Freemont", Benetti 1983 (2017 refit). <https://www.yachtbuyer.com/en-us/fleet/freemont-114-benetti> | 35 × 7 m; aft-deck dining; side decks forward; saloon with dining at its forward end; boat-deck tenders; golden wood, brass, mirrored ceilings (V) | `aft`, side decks, §8 | Period interior style. |
| **Y15** | S. Wilson, "Nabila", BOAT International, Nov 2022. <https://www.boatinternational.com/yachts/editorial-features/adnan-khashoggi-benetti-yacht-nabila> | 1980, 86 m; lavish parties; crew recall 24-hour service and tendering VIP guests to and from the yacht (V) | Guests by tender, E1 | How party guests reached a yacht at anchor. |
| **Y16** | Italian Yacht Masters, "M/Y Nabila: a symbol of 1980s yachting". <https://italianyachtmasters.com/blog/my-nabila-a-symbol-of-1980s-yachting-and-its-connection-to-italian-yacht-masters> | Five decks, eleven suites, a nightclub, a cinema, a helideck (S, retrospective) | `ballroom` | A real 1980s nightclub at sea (on a far bigger yacht). |
| **Y17** | Julien's Auctions, "Living Legends: John Travolta", Feb 2026. <https://www.juliensauctions.com/en/articles/john-travolta-pilot-grease-disco-fever-pulp-fiction> | The 1977 *Saturday Night Fever* floor: 24 ft, 288 bulbs, **acrylic** panels, not glass (V) | §5.4, §7, §8 | The lit floor is period: acrylic panels and incandescent bulbs, not glass and LEDs. |
| **Y18** | Dio-Met, "33mm walk-on floor glass". <https://diomet.co.uk/products/33mm-walk-on-floor-glass> | 33 mm toughened laminated, three plies; panels up to 2 × 1 m (V, modern) | §5.4, §9 Q3 | Modern walk-on floor benchmark: panel size and thickness only. |
| **Y19** | C. Gauert, "Solo", BOAT International, Aug 2022. <https://www.boatinternational.com/yachts/editorial-features/on-board-tankoa-yacht-solo> | 2018, 72 m; a dining-room aquarium with its own equipment room (V) | §5.4 | The nearest real precedent for a tank on board. |
| **Y20** | US EPA, "Density". <https://www.epa.gov/environmental-geophysics/density> | Water ≈ 1000 kg/m³ (V) | §5.4 | The tank's weight. |
| **Y23** | Marinelite Windows, "Glass options & specs". <https://www.marinelitewindows.com/glass-options-specs> | 6 mm and 10 mm tempered marine glazing (V, modern) | §7 windows | Marine glazing is engineered glass. |
| **Y24** | UK MCA, LY3 Large Commercial Yacht Code, 2014/2019. <https://www.gov.uk/government/publications/ly3-the-large-commercial-yacht-code> | Watertight doors kept closed; damage-stability subdivision (V, modern rule, not 1986) | `crew_stair`, §7 | Watertight doors are below; main-deck doors are weathertight. |
| **Y25** | ISO 14884:2015, "Large yachts: weathertight doors". <https://www.iso.org/standard/55258.html> | Hinged, sliding and pantograph weathertight doors on yachts 24 m and up (V) | D11, D17, D21–D23 | Exterior doors are weathertight steel or aluminium. |
| **Y26** | NOAA, US Coast Pilot 4, ch. 10. <https://nauticalcharts.noaa.gov/publications/coast-pilot/files/cp4/CPB4_C10_WEB.pdf> | Offshore anchorages north of Miami buoy M on sand and coral over limestone; Government Cut currents 2–4 kn; Miamarina takes vessels to 150 ft (45.7 m) (V, current edition, not 1986) | The anchorage, §9 Q1 | A 51 m yacht plausibly anchors off; the modern berth limit is indicative only. |
| **Y29** | A. Rubin, "Miami welcomes Bayside", UPI, 8 Apr 1987. <https://www.upi.com/Archives/1987/04/08/Miami-welcomes-Bayside/2336544852800/> | Bayside Marketplace opened April 1987 (S) | §9 Q1 | Don't show Bayside in a 1986 skyline. |
| **Y31** | M. Block and R. Farzad, "Hotel Scarface", NPR, Oct 2017. <https://www.vpm.org/npr-news/2017-10-22/hotel-scarface-the-hotel-at-the-center-of-miamis-cocaine-boom/> | The Mutiny's nightclub mixing celebrities and traffickers; speedboat culture (V, retrospective) | §1, §8 | The party's atmosphere. |

**Real versus fiction.** Real or period-supported: steel and aluminium
construction, teak decks, a professional crew of about eleven, tender
transfers, lavish parties, a nightclub on board (Y6–Y16). Plausible but not
verified: an owner's suite aft on the main deck, a ballroom in place of the
saloon. **Fiction:** the shark tank and glass dance floor. No 1980s yacht
with either was found; a 6 × 4 × 1.5 m tank holds 36 m³, about 36 tonnes
of water (Y20), and needs its own life-support room (Y19). The armed
entourage is Lex's, not normal yacht practice.

**Not used, and why.** Y3 (Broward *Harlina*, 30.5 m; MATERIALS) and Y13
(a 1985 Broward listing,
<https://www.aquasolyachtsales.com/boat/1985/broward/flybridge-motoryacht/1140/>)
are too small for a 50 m layout; Y3 stays in MATERIALS as the
aluminium-hull comparator. Christensen began building in 1986 (Y32,
<https://atlanticyachtandship.com/christensen-yachts-history/>), too late.
Kasten's aluminium scantlings (Y21, <https://www.kastenmarine.com/scantlings.htm>)
and Filippi's partitions (Y22,
<https://www.filippi1971.com/en/blog/boat-and-ship-bulkheads-complete-compartment-solutions>)
are modern guidance, consistent with MATERIALS `alu_bulkhead` and
`joinery_ply`.

## 3. Site and coordinate frame

Metres. **x** runs stern → bow (0–53, west → east), **z** runs port →
starboard (0–10, north → south). The hull is x 2–53 × z 0–10 (51 m LOA ×
10 m beam, P after Y10, Y11); the swim platform hangs off the stern at x
0–2. The deckhouse is x 10–45 × z 1–9 with 1 m side decks either side. The
sea lies all round. Every room edge against the sea is a **stage edge**
with a steel bulwark (about 1 m, waist cover; §7), except the swim
platform's stern edge, which has none.

The bow is drawn square for the checker; W2 should taper the foredeck from
10 m to a point between x 49 and 53 (P), keeping the windlass reachable.

Heights (P): main-deck rooms 2.3 m (Y24 gives only crew minimums, about
1.9–2.0 m), the ballroom 2.6 m (G). The deck above overhangs the aft deck
(it is covered).

### 3.1 Plan (generated from the sidecar; tables in §5–§6 are authoritative)

```
0         1         2         3         4         5  
01234567890123456789012345678901234567890123456789012
  xxxxxxxaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa  z 0
  xxxxxxxa###++######++##DD#++##+++###D####D#aaaaaaaa
  aaaaaaaa#xxxrr##x##xBBBBBxxx##ooo##ggx##xw+aaxxaaaa
aaaaaaaaaaDxxxrrDDr##xB~~~~~~B##xxxDDggx##wx+aaaaaaaa
aaaaaaxxaa+xxxrr##D##BB~~~~~~B  xxx## ####wx+aaaaxxaa
aaaaaaxxaa+#D##D##D##BB~~~~~~B  xxx## ####wx+aaaaxxaa  z 5
aaaaaaaaaa##D##D##.##BB~~~~~~B##xxx##x####wx+aaaaaaaa
  aaaaaaaa#tt##r##.DDxxxxBxxxx##ooo##x  DDww+aaxxaaaa
  aaaxxxxa########D##++##DD#++##+++#####D##D#aaaaaaaa
  aaaxxxxaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```

Key: `#` wall, `D` door leaf, `+` window, space = open opening; `a` decks
and swim platform, `r` owner's suite, `t` bathroom, `.` lobby and crew
stair, `B` ballroom, `~` glass dance floor, `o` dining saloon, `g` galley
and crew mess, `w` wheelhouse; `x` props. The `z` labels give the row's
north coordinate. Cells are 1 m.

## 4. Typology rules the layout must keep

1. **Stern to bow: guests, owner, service, command.** The aft deck and
   saloon are for guests; the galley and crew are forward of the dining
   saloon (Y7, Y10, Y12). The wheelhouse is furthest forward on this
   deck (G; it belongs a deck up, §1).
2. **Guests board at the stern.** By tender to the swim platform and
   through the gate D1 (Y4, Y15). There is no gangway at sea.
3. **Two worlds.** Guests use the side decks, the ballroom and dining;
   crew use the galley's side-deck door D17, the mess and the crew stair.
   The dining saloon's service door D16 is the only door between them
   inside.
4. **Exterior hinged doors are weathertight steel** (Y25) and open
   inward, so no leaf ever swings across a 1 m side deck; the guest doors
   D6, D13 and D14 are glass sliders. Interior doors are light joinery
   (MATERIALS `joinery_ply`). Watertight doors are on the
   deck below (Y24), not here.
5. **The wheelhouse has no forward door.** You reach it from the wing
   doors on the side decks or the crew stair. The windscreen looks over
   the foredeck.
6. **The deck below is implied.** The lobby holds the main stair down to
   the guest cabins; the crew stair leads down to crew quarters and the
   engine room. The shark tank is below the ballroom (§5.4). None of these
   is walkable (G; §9 Q2).

## 5. Area schedule (checkable)

Bounds are `[x0, z0, x1, z1]`. **Ent** counts doorways and openings a pawn
can walk through. Windows are not entrances. Where exterior areas meet, the
edge is unwalled and §5.2 lists it as an `open` row. Every other room edge
is a wall. Builds refer to MATERIALS §3.

### 5.1 Stage `yacht`

| id | Name | Kind | Bounds | Dims (m) | m² | Ent | Entrances | Research | Tag |
|---|---|---|---|---|---:|:-:|---|---|:-:|
| `swim` | Swim and boarding platform | exterior | 0, 3, 2, 7 | 2 × 4 | 8.0 | 1 | D1 (+ stern stage edge) | Y4, Y15 | D |
| `aft` | Aft party deck | exterior | 2, 0, 10, 10 | 8 × 10 | 80.0 | 4 | D1, D2, D3, D6 (+ bulwark edges) | Y10, Y12 | D |
| `side_p` | Port side deck | exterior | 10, 0, 45, 1 | 35 × 1 | 35.0 | 5 | D2, D4, D13, D17, D22 (+ bulwark edge) | Y12 | P |
| `side_s` | Starboard side deck | exterior | 10, 9, 45, 10 | 35 × 1 | 35.0 | 6 | D3, D5, D11, D14, D21, D23 (+ bulwark edge) | Y12 | P |
| `fore` | Foredeck | exterior | 45, 0, 53, 10 | 8 × 10 | 80.0 | 2 | D4, D5 (+ bulwark edges) | — | P |
| `master` | Owner's stateroom | bedroom | 10, 1, 17, 6 | 7 × 5 | 35.0 | 4 | D6, D7, D8, D9 | Y7 | G |
| `m_bath` | Owner's bathroom | bath | 10, 6, 14, 9 | 4 × 3 | 12.0 | 1 | D7 | Y7 | P |
| `m_dress` | Owner's dressing room | bedroom | 14, 6, 17, 9 | 3 × 3 | 9.0 | 1 | D8 | Y7 | P |
| `study` | Owner's study | office | 17, 1, 20, 5 | 3 × 4 | 12.0 | 2 | D9, D10 | Y10 | D |
| `lobby` | Main stair lobby | circulation | 17, 5, 20, 9 | 3 × 4 | 12.0 | 3 | D10, D11, D12 | Y7 | D |
| `ballroom` | Ballroom (main saloon) | lounge | 20, 1, 31, 9 | 11 × 8 | 88.0 | 4 | D12, D13, D14, D15 | Y8, Y16 | G |
| `dining` | Dining saloon | dining | 31, 1, 36, 9 | 5 × 8 | 40.0 | 2 | D15, D16 | Y5, Y12 | D |
| `galley` | Galley | kitchen | 36, 1, 41, 5 | 5 × 4 | 20.0 | 3 | D16, D17, D18 | Y7, Y10 | D |
| `mess` | Crew mess | service | 36, 5, 39, 9 | 3 × 4 | 12.0 | 2 | D18, D19 | Y10 | D |
| `crew_stair` | Crew stair and utility | circulation | 39, 5, 41, 9 | 2 × 4 | 8.0 | 3 | D19, D20, D21 | Y7, Y24 | P |
| `bridge` | Wheelhouse | service | 41, 1, 45, 9 | 4 × 8 | 32.0 | 3 | D20, D22, D23 | Y10 | P |

Totals: enclosed 280.0 m² (11 rooms); exterior 238.0 m².

Sizes against the sources: the research found no dimensioned 1980s
general arrangement, so every room size is P or G. The ballroom (88 m²) is
the deckhouse's full 8 m width (G; a 50 m yacht's saloon is the same idea
with sofas). The owner's suite (stateroom, bath, dressing room and study,
68 m²) is a generous 50 m-yacht master. The wheelhouse (32 m²) and galley
(20 m²) are in the research synthesis's ranges.

### 5.2 Doors and openings

`x=c` is a wall on the line x = c, with the opening centred at the stated z
(and vice versa). **Kind** maps to MATERIALS §3 builds; `open` is an opening
with no leaf; `glass` is a `glass_tempered_6` slider.

| Door | Rooms | Wall, centre | Width | Kind |
|---|---|---|---:|---|
| D1 | `swim` ↔ `aft` | x=2, z 5 | 4.0 | open (stern boarding gate, chain across) |
| D2 | `aft` ↔ `side_p` | x=10, z 0.5 | 1.0 | open (side deck) |
| D3 | `aft` ↔ `side_s` | x=10, z 9.5 | 1.0 | open (side deck) |
| D4 | `side_p` ↔ `fore` | x=45, z 0.5 | 1.0 | open (side deck) |
| D5 | `side_s` ↔ `fore` | x=45, z 9.5 | 1.0 | open (side deck) |
| D6 | `master` ↔ `aft` | x=10, z 3.5 | 0.9 | glass (Lex's private slider to the aft deck) |
| D7 | `master` ↔ `m_bath` | z=6, x 12 | 0.8 | door_hollow |
| D8 | `master` ↔ `m_dress` | z=6, x 15.5 | 0.8 | door_hollow |
| D9 | `master` ↔ `study` | x=17, z 3 | 0.9 | door_hollow (suite door) |
| D10 | `study` ↔ `lobby` | z=5, x 18.5 | 0.9 | door_hollow (suite door, locked) |
| D11 | `lobby` ↔ `side_s` | z=9, x 18.5 | 0.9 | door_metal (weathertight) |
| D12 | `lobby` ↔ `ballroom` | x=20, z 7 | 0.9 | door_hollow (saloon door) |
| D13 | `ballroom` ↔ `side_p` | z=1, x 25.5 | 1.8 | glass (ballroom slider) |
| D14 | `ballroom` ↔ `side_s` | z=9, x 25.5 | 1.8 | glass (ballroom slider) |
| D15 | `ballroom` ↔ `dining` | x=31, z 5 | 1.8 | open (double opening) |
| D16 | `dining` ↔ `galley` | x=36, z 3 | 0.9 | door_hollow (service door, swings both ways) |
| D17 | `galley` ↔ `side_p` | z=1, x 38.5 | 0.9 | door_metal (crew door, weathertight) |
| D18 | `galley` ↔ `mess` | z=5, x 37.5 | 0.9 | open (pass) |
| D19 | `mess` ↔ `crew_stair` | x=39, z 7 | 0.9 | open |
| D20 | `crew_stair` ↔ `bridge` | x=41, z 7 | 0.9 | door_metal (wheelhouse inside door, steel) |
| D21 | `crew_stair` ↔ `side_s` | z=9, x 40 | 0.9 | door_metal (weathertight) |
| D22 | `bridge` ↔ `side_p` | z=1, x 43 | 0.9 | door_metal (wing door, weathertight, locked at night) |
| D23 | `bridge` ↔ `side_s` | z=9, x 43 | 0.9 | door_metal (wing door, weathertight, locked at night) |
| W1 | `master` ↔ `aft` | x=10, z 5 | 1.6 | glass_lam_windshield (window) |
| W2 | `master` ↔ `side_p` | z=1, x 13.5 | 2.0 | glass_lam_windshield (window) |
| W3 | `ballroom` ↔ `side_p` | z=1, x 22 | 2.5 | glass_lam_windshield (window) |
| W4 | `ballroom` ↔ `side_p` | z=1, x 29 | 2.5 | glass_lam_windshield (window) |
| W5 | `ballroom` ↔ `side_s` | z=9, x 22 | 2.5 | glass_lam_windshield (window) |
| W6 | `ballroom` ↔ `side_s` | z=9, x 29 | 2.5 | glass_lam_windshield (window) |
| W7 | `dining` ↔ `side_p` | z=1, x 33.5 | 3.0 | glass_lam_windshield (window) |
| W8 | `dining` ↔ `side_s` | z=9, x 33.5 | 3.0 | glass_lam_windshield (window) |
| W9 | `bridge` ↔ `fore` | x=45, z 5 | 6.0 | glass_lam_windshield (wheelhouse windscreen) |

### 5.3 Props with gameplay roles (sidecar `B`)

Footprints keep a 0.6 m clear strip on both sides of every door and window.

| id | Role | Footprint `[x0, z0, x1, z1]` | Size | Build | Coverage |
|---|---|---|---|---|---|
| BED | Lex's bed | 11, 1.8, 13.2, 4.3 | 2.2 × 2.5 | `mattress` | waist |
| SAFE | Lex's safe | 19.2, 3.5, 19.9, 4.3 | 0.7 × 0.8 | `steel_10mm` | chest |
| SDESK | Study desk | 17.5, 1.3, 19.5, 2.2 | 2 × 0.9 | `counter_cabinet` | waist |
| DJ | DJ booth | 20.3, 1.8, 21.5, 3.8 | 1.2 × 2 | `counter_cabinet` | chest |
| BAR | Ballroom bar | 27, 1.8, 30.5, 2.6 | 3.5 × 0.8 | `counter_cabinet` | chest |
| BQ1 | Banquette | 21.5, 7.5, 24.2, 8.3 | 2.7 × 0.8 | `sofa` | waist |
| BQ2 | Banquette | 26.8, 7.5, 30.5, 8.3 | 3.7 × 0.8 | `sofa` | waist |
| DT | Dining table (12 seats) | 32.5, 3, 34.5, 7 | 2 × 4 | `counter_cabinet` | waist |
| GC | Galley counter (stainless) | 39.5, 1.1, 40.9, 4.5 | 1.4 × 3.4 | `steel_3mm` | waist |
| MT | Crew mess table | 36.3, 6.5, 38, 8.5 | 1.7 × 2 | `counter_cabinet` | waist |
| CHART | Chart table | 41.2, 1.5, 42.4, 2.7 | 1.2 × 1.2 | `counter_cabinet` | waist |
| HELM | Helm console | 43.2, 3, 44.2, 7 | 1 × 4 | `counter_cabinet` | chest |
| ASOFA1 | Aft-deck sofa | 5.5, 0.3, 9, 1.1 | 3.5 × 0.8 | `sofa` | waist |
| ASOFA2 | Aft-deck sofa | 5.5, 8.9, 9, 9.7 | 3.5 × 0.8 | `sofa` | waist |
| ATBL | Aft-deck table | 6, 4, 8, 6 | 2 × 2 | `counter_cabinet` | waist |
| ABAR | Aft-deck bar | 2.6, 0.3, 4.6, 1.1 | 2 × 0.8 | `counter_cabinet` | chest |
| WINDLASS | Anchor windlass | 49.5, 4, 51, 6 | 1.5 × 2 | `steel_3mm` | waist |
| FLK1 | Foredeck locker (lines, fenders) | 47, 2, 48.2, 3 | 1.2 × 1 | `steel_3mm` | waist |
| FLK2 | Foredeck locker (lines, fenders) | 47, 7, 48.2, 8 | 1.2 × 1 | `steel_3mm` | waist |

### 5.4 The dance floor and the tank (G)

A lit glass floor **x 22.5–28.5, z 3–7** (6 × 4 m, 24 m²) in the middle of
the ballroom, flush with the deck and walkable. Under it, on the deck below,
the shark tank is the same size and 1.5 m deep (36 m³, 36 tonnes, Y20),
lit from below. Build the floor as thick acrylic panels in a steel grid,
each 2 × 1 m: acrylic is the period material (Y17), and Y18's modern
walk-on glass gives only the panel size. Coloured incandescent lamps sit in
the grid at the panel edges, so the tank stays visible through the middle
of each panel. It is not cover, it does not block sight, and it is
not in the sidecar. Whether it can break is §9 Q3.

## 6. Gameplay overlay (checkable targets)

### 6.1 Entries

| # | Entry | Arrives in | Use |
|---|---|---|---|
| E1 | Stern gate D1 | `swim` → `aft` | The guests' way in. The player's speedboat ties up at the swim platform beside the tender. A guard at the gate checks invitations (S14). |
| E2 | Bow (G) | `fore` | Climb the anchor chain or a ladder from the speedboat to the foredeck: quiet, but the wheelhouse windscreen looks straight at it (S7) and the wing doors are locked (key in SAFE). W2 to decide whether to include it (§9 Q4). |

Exits: the helm (objective, `C` marker) and the speedboat at the swim
platform (§1).

Walking distances, door centre to door centre: from the gate D1, 8.1 m to
Lex's slider D6 (locked unless `singer_paid`); 24.7 m to the ballroom (D2,
D13); 42.2 m to the wheelhouse along the port deck (D2, D22, locked, once
breached or with the key); 41.4 m to the wheelhouse's inside door by the
starboard deck and crew stair (D3, D21, D20).

### 6.2 Sightlines (W1 query targets)

Standing eye 1.6 m to a standing target. Only `full` walls and **closed
leaf doors** block. Every window and every prop do not block sight
(STYLE-LEVELS §3.4). The bulwarks are stage edges and do not affect these
targets. Targets assume every leaf door is closed; an open leaf still
blocks rays that cross its swung position.

| # | From → to | Length | Expected | Intent |
|---|---|---:|---|---|
| S1 | aft (5.5, 5) → master (13, 5) | 7.5 | **clear** | Through Lex's aft window: the stateroom sees the aft deck, and the aft deck sees in. |
| S2 | side_p (13.5, 0.5) → master (13.5, 4) | 3.5 | **clear** | Through the stateroom's side window from the port deck. |
| S3 | ballroom (21, 5) → ballroom (30.5, 5) | 9.5 | **clear** | The ballroom end to end, across the dance floor. |
| S4 | side_p (25.5, 0.5) → side_s (25.5, 9.5) | 9.0 | **clear** | Across the beam through both ballroom sliders: the party is a fishbowl from either side deck. |
| S5 | ballroom (30, 5) → dining (35, 5) | 5.0 | **clear** | From the ballroom into the dining saloon through the open double opening. |
| S6 | dining (35, 3) → galley (38, 3) | 3.0 | **blocked** | The galley service door hides the crew side from the dining saloon. |
| S7 | fore (49, 5) → bridge (43, 5) | 6.0 | **clear** | Through the windscreen: the wheelhouse watches the foredeck. |
| S8 | side_p (12, 0.5) → side_p (44, 0.5) | 32.0 | **clear** | The port side deck is one 32 m lane with no cover (exterior doors open inward, §4 rule 4). |
| S9 | lobby (18.5, 7) → ballroom (24, 7) | 5.5 | **blocked** | The saloon door hides the stair lobby from the ballroom. |
| S10 | aft (5, 4.5) → ballroom (24, 4.5) | 19.0 | **blocked** | Lex's suite stands between the aft deck and the ballroom. |
| S11 | bridge (43, 7) → crew_stair (40, 7) | 3.0 | **blocked** | The wheelhouse's inside door D20 hides the crew stair. |
| S12 | side_s (33.5, 9.5) → dining (33.5, 7.5) | 2.0 | **clear** | The dining saloon's window onto the starboard deck. |
| S13 | aft (2.3, 0.7) → side_p (20, 0.5) | 17.7 | **clear** | From the aft deck down the port side deck. |
| S14 | swim (1, 5) → aft (5.5, 5) | 4.5 | **clear** | From the swim platform onto the aft deck: the gate is watched. |
| S15 | study (18.5, 3) → master (14, 3) | 4.5 | **blocked** | The suite door hides the stateroom from the study. |

### 6.3 Cover inventory

"Stops" quotes BALLISTICS §4 and pen_model (retained energy; calibre order
9mm, Uzi, .45, .357, .50 AE, 12ga 00, 12ga slug, 5.56, 7.62×39).

| Zone | Cover | Coverage | Stops | Notes |
|---|---|---|---|---|
| Deckhouse sides | `alu_bulkhead` | full | buckshot only; 9mm keeps 15 %, .45 7 %, Uzi 30 %, .357 37 %, rifles 76–84 % | Thin aluminium: barely armour. |
| Two deckhouse walls | `alu_bulkhead` ×2 | full | every handgun except .50 AE (25 %); slug keeps 12 %, 5.56 52 % | Across the beam through both sides. |
| Interior partitions | `joinery_ply` | full (sight only) | nothing (9mm keeps 73 %, buckshot 53 %) | Concealment. |
| Windows | `glass_lam_windshield` | none (no sight block) | nothing (9mm keeps 53 %, buckshot 21 %) | |
| Weathertight doors | `door_metal` | full | buckshot; 9mm keeps 27 % | Like the bulkheads. |
| Bulwarks (stage edges) | steel, `steel_10mm` (P) | waist | everything but 5.56 (19 %) and 7.62×39 (46 %) | Outboard only: cover from boats alongside or boarders at the rail, not from threats inboard. Along a side deck it runs parallel to the line of fire. |
| Lex's safe | `steel_10mm` | chest | as above | Small. |
| Galley counter, windlass, foredeck lockers | `steel_3mm` | waist | 9mm pistol, .45, buckshot; Uzi keeps 20 %, .357 27 % | The only hard inboard cover on the open decks is forward; the aft deck has only soft cover. |
| Bar, DJ booth, tables, helm, chart table | `counter_cabinet` | waist / chest | nothing (9mm keeps 69 %) | Soft. |
| Sofas, banquettes, bed | `sofa`, `mattress` | waist | nothing | Soft. |

### 6.4 Flank loops (each must be a closed walkable cycle)

Length is the sum of straight segments between consecutive door centres (a
lower bound).

| # | Cycle | ≈ Length | Intent |
|---|---|---:|---|
| L1 | `aft` –D2– `side_p` –D13– `ballroom` –D14– `side_s` –D3– `aft` | 48.0 m | Round the party by either side deck. |
| L2 | `aft` –D6– `master` –D9– `study` –D10– `lobby` –D11– `side_s` –D3– `aft` | 28.0 m | Through Lex's suite and out the lobby door. D6 is locked (broken, or unlocked by `singer_paid`); D10 locks from the study side, so it opens freely in this direction. |
| L3 | `side_p` –D22– `bridge` –D23– `side_s` –D5– `fore` –D4– `side_p` | 21.1 m | Round the wheelhouse, once D22 and D23 are breached or unlocked. |
| L4 | `ballroom` –D15– `dining` –D16– `galley` –D18– `mess` –D19– `crew_stair` –D21– `side_s` –D14– `ballroom` | 33.9 m | From the party through the crew side and back along the starboard deck. |
| L5 | `side_p` –D17– `galley` –D18– `mess` –D19– `crew_stair` –D20– `bridge` –D22– `side_p` | 19.4 m | The crew route to the wheelhouse; closing the loop needs D22 breached or unlocked. |

**Checkable connectivity targets** (door ids removed = treat as walls):

| # | Check | Expected |
|---|---|---|
| C1 | Every room reachable on foot from `swim` | yes |
| C2 | `swim` → `ballroom` without D12 | yes (the sliders D13, D14) |
| C3 | `swim` → `master` without D6 | yes, by the lobby and study (D10 once breached) |
| C4 | `swim` → `master` without D6 and D10 | **no**: the suite has two ways in |
| C5 | `swim` → `bridge` without D20 | yes, by the wing doors |
| C6 | `swim` → `galley` without D16 and D17 | yes, by the crew stair and mess |
| C7 | `swim` → `m_bath` without D7 | **no**: one door |
| C8 | `swim` → `fore` without D4 and D5 | **no**: the side decks are the only way forward |

### 6.5 Approach variety

- **Through the party:** in at the gate, across the aft deck, along a side
  deck and in through a ballroom slider. Everyone sees you (S4); Lex is on
  the dance floor.
- **Start aft (`singer_paid`):** the singer has left Lex's slider D6
  unlocked, 8 m from the gate. Without her, D6 is locked and breaking the
  glass is loud (D6 is breakable; locking it does not make it
  bulletproof). Inside, the study's SAFE holds the wing-door key for D22
  and D23, so the aft route feeds the bridge; out through the study and
  lobby to the starboard deck (L2).
- **The crew side:** along the port deck (32 m, no cover but the bulwark,
  S8) to the crew door D17, through the galley and mess, up to the
  wheelhouse by its inside door D20 (L5). Quiet; apart from the cook (one
  of Lex's men), the crew are civilians.
- **The wing doors:** breach D22 or D23 from a side deck (fast, loud), or
  open them with the key from SAFE.
- **From the bow (if E2 exists):** the foredeck in full view of the
  windscreen, then a wing door.

### 6.6 Spawns and enemy placement (by role, for W2 to tune)

The legacy map has eight enemies (`g` ×2, `u` ×2, `s`, `d`, `m`, and an
unarmed `i`) and Lex as boss (22 hp, `goldgl`, the gold 40 mm grenade launcher). Keep the count, sorted
by role:

- **Stern (2):** a gate guard on the aft deck by D1, one at the aft bar.
  Legacy `g`, `s`.
- **Ballroom (2 + Lex):** two bodyguards by the bar and DJ booth, Lex on the
  dance floor (legacy `X` position). Legacy `u`, `d`.
- **Side decks (2):** one patrolling each deck. Legacy `g`, `u`.
- **Wheelhouse (1):** a guard with the captain (civilian). Legacy `m`.
- **Crew side (1):** the cook in the galley, one of Lex's men and unarmed.
  Legacy `i`; he must go down for the floor to clear.
- **Civilians:** guests in the ballroom and dining saloon, the captain and
  about ten crew (Y10, Y11), §9 Q6.

### 6.7 Penetration play notes (from BALLISTICS §4 and pen_model)

- **The deckhouse is thin.** `alu_bulkhead` stops buckshot, but a 9mm keeps
  15 % and a 5.56 76 %. Rifle fire from a side deck goes through the
  ballroom and out the far side (5.56 keeps 52 % through both walls).
- **Inside, everything is veneer.** `joinery_ply` passes a 9mm at 73 %; the
  suite, the lobby and the crew rooms are concealment only.
- **The open decks have little cover.** The bulwark is steel at waist
  height (stops every handgun), but it faces the sea. Along a 1 m side deck
  nothing stands between you and a shooter at the far end (S8). The
  foredeck's lockers and windlass are the only hard cover outside.
- **The windows don't stop anything.** Laminated marine glass passes a 9mm
  at 53 %; the wheelhouse windscreen is no protection for the helmsman.
- **Don't shoot the floor** (§9 Q3).
- **Lex fires 40 mm HE.** MATERIALS §5 shatters every pane within 5 m of a
  burst, and the deckhouse is mostly glass. A fight with Lex in the
  ballroom strips its windows and sliders. §5 has no HE reach rows for
  `alu_bulkhead`, `joinery_ply` or `steel_10mm` yet (§9 Q9).

## 7. Construction summary

The first matching row wins.

| Element | Build | Basis |
|---|---|---|
| Bulwarks along every stage edge except the swim platform's stern | `steel_10mm`, waist (about 1 m) | P (MATERIALS §4 yacht row, hull) |
| Any wall between an interior room and `aft`, `side_p`, `side_s` or `fore` | `alu_bulkhead` | D MATERIALS §4; Y2, Y9 |
| Crew stair trunk walls (around `crew_stair`) | `alu_bulkhead` | P (the trunk down to the engine room; its wheelhouse door D20 is steel, its mess side D19 a held-back opening, G) |
| Every other interior wall | `joinery_ply` | D MATERIALS §4 |
| Windows W1–W9 | `glass_lam_windshield` | D MATERIALS §4 (P, marine glazing); Y23 |
| Sliders D6, D13, D14 | `glass_tempered_6` | P; Y23 |
| Exterior doors D11, D17, D21–D23 and the wheelhouse inside door D20 | `door_metal` | D MATERIALS §4; Y25 |
| Cabin and saloon doors | `door_hollow` | D MATERIALS §4 |
| Dance-floor insert | thick acrylic panels (no MATERIALS id yet) | G; Y17, Y18; §9 Q3 |
| Bar, DJ booth, tables, helm, desks | `counter_cabinet` | P |
| Galley counter, windlass, foredeck lockers | `steel_3mm` | P |
| Lex's safe | `steel_10mm` | P |

## 8. Props by zone (circa 1986)

- **Swim platform and aft deck:** teak decking (Y11), a chain across the
  boarding gate, a boarding ladder, the tender and the player's speedboat
  alongside, white sofas, a bar with a blender, a champagne bucket,
  life-rings stencilled ROYAL FLUSH, the ensign at the stern staff.
- **Side decks:** teak, varnished cap rails on the bulwarks, fenders and
  mooring lines in baskets, a lit porthole every few metres.
- **Lex's suite:** a bed in gold satin, mirrored ceiling panels (Y12),
  a white carpet, a wet bar, a gold telephone, a video recorder and a big tube television, cocaine on a
  glass table.
- **Ballroom:** the lit glass floor over the tank (grey reef sharks
  circling below), a mirror ball, a DJ booth with two Technics turntables,
  a curved brass-and-mirror bar, white leather banquettes, palm plants in
  brass pots, glossy burl-wood panelling (Y12).
- **Dining saloon:** a twelve-seat table set with crystal and gold-rimmed
  china (Y5), a lobster on ice, a mirrored sideboard.
- **Galley and crew mess:** stainless counters with fiddle rails, a
  commercial range, crew uniforms (white polo shirts with the yacht's name)
  on hooks, a radio, a duty roster.
- **Wheelhouse:** a wooden wheel and a helm console with engine gauges, two
  radars (a CRT each), a Loran-C and a VHF radio, a paper chart of the
  Florida coast and Straits on the chart table, binoculars, the captain's cap.
- **Study:** a desk with a brass lamp, a squat steel floor safe beside it
  (SAFE: the wing-door key and cash), a ship's clock.
- **Foredeck:** the windlass and anchor chain, mooring bitts, two steel
  deck lockers for lines and fenders, a covered jet ski on chocks.
- **Implied above:** the boat deck with two tenders in cradles (Y10).

## 9. Open questions for W2, W5 and W10

1. **At anchor or alongside?** The brief says "two miles out"; the legacy
   map has a gangway to a quay with the player's car. A 51 m yacht would
   plausibly anchor off (Y26's modern Miamarina limit is 45.7 m). This brief assumes at
   anchor, arriving by speedboat. W10 and W2 to confirm.
2. **The lower deck.** The guest cabins, the engine room and the tank are
   implied. Should any of them be playable (a second stage)? W2 to decide.
3. **The glass floor.** Can it break, and does a pawn fall into the tank?
   The panels are thick acrylic (Y17); MATERIALS has no id for them, and
   whether they stop a handgun round is unmodelled. W5 to decide; W1 to add a construction if it is cover or
   breakable.
4. **The bow entry (E2).** Include it, or keep the stern the only way
   aboard? W2 to decide.
5. **Is Lex optional?** The script says so, but the engine's clear rule
   needs the boss dead (§1). Either W5 adds a boss exception for this
   floor or W10 drops the line. This brief keeps Lex on the dance floor and
   uses `singer_paid` only to unlock D6.
6. **Civilians.** Guests, the captain and the crew: flee (to the tender?),
   hide, or count against scoring? "Bring me the yacht" needs someone to
   drive it. W10 to decide.
7. **"Bring me the yacht."** This brief proposes a `g.obj` "TAKE THE
   HELM" at HELM, with the `C` exit marker there too (§1). Holding the
   wheelhouse or weighing anchor at the windlass are alternatives. W10, W2
   and W5 to decide.
8. **Falling overboard.** The bulwarks are waist-high stage edges, and the
   swim platform's stern is open. Can pawns go over? W2 to decide.
9. **HE against yacht builds.** MATERIALS §5 has no HE reach for
   `alu_bulkhead`, `joinery_ply` or `steel_10mm`, and Lex fires 40 mm HE.
   W5 to add them.
