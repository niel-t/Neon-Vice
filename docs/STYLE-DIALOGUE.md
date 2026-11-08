# Neon Vice — Dialogue Style Guide

This guide is for developers and doesn't ship with the game. It covers McWey's briefings and debriefs, `REPLY`, the `MC_*` tables, Nine of Nine, Tony, banners, and anything new written in `DLG` nodes.

> **North star:** better the player has too little and wants more, than too much.

---

## 1. The ten rules

1. **Cut the part players skip.** If you can delete a line and lose neither the objective, the relationship nor a laugh, delete it. "If it sounds like writing, rewrite it." — Leonard [1]
2. **One thought per line, 3–12 words.** A line over 14 words has to earn its length. Hard cap: 90 characters.
3. **Every exchange is a deal.** Someone wants something *now*: obedience, a cut, an excuse, a watch. Ask Mamet's question: *who wants what, and why now?* [2]
4. **Never tell people what they both know.** McWey doesn't explain the loan to the person who owes it. The target and the place go on the objective card; the dialogue carries the attitude.
5. **Subtext over statement.** Characters say one thing and do another: they probe, dodge, flatter or threaten. Nobody narrates their own feelings. [3][5]
6. **Menace by understatement.** Don't say McWey is dangerous. Show the room shifting: a sudden formality, an unanswered question, a joke nobody's allowed to laugh at. [6]
7. **Specific beats general.** "That carpet cost more than your car" beats "I'm a powerful man." Use nouns: brands, prices, addresses, objects on the desk.
8. **Jokes come from the character's priorities**, such as vanity, money or inconvenience. Don't put a pun on every kill. [7][10]
9. **Arrive late, leave early.** Open on the problem. End when the order lands or the relationship turns, and don't summarise. [14]
10. **The last line gives a reason to continue.** It should raise a question or a tension. It should never recap what the player already knows.

## 2. Length budget (per McWey visit)

| Visit part | Budget |
|---|---|
| Greeting or reaction (suit, haul, payday) | **Max 1 line.** Pick *one*, not all of them. |
| Briefing | **2–3 lines** from McWey: the job plus one complication. |
| Player response | 1 line (later, a choice of at least 3). |
| Sign-off quote | 1 line, and only if it's good. |
| **Whole visit** | **6 lines or fewer.** Put optional lore behind an optional question. |

The debrief gives a *consequence*, not a replay of the mission, in one line.

When several reactions are eligible (first visit, loan, grade, payday, suit, haul), show only **the most important one**, in this priority order: story beat, grade, payday, suit, haul.

## 3. Voice sheets

| Character | Sentence shape | Lexicon | Never |
|---|---|---|---|
| **McWey** | Short. Corrects people mid-sentence. Asks questions he already knows the answer to. | Money, gold, prices, the shark; "kid" until the loan is square, "partner" after | Explains his employers, raises his voice, says "dangerous" |
| **The Don** | Fewest words in the room. Statements, not questions. | Family, the city, "done" | Jokes about money, asks permission |
| **The Consigliere** | Polite words, violent meaning. | Advice, a word, conversation, manners | Swears, rushes |
| **The Money Man** | Fast and transactional; always pricing something. | Cut, price, double, change, receipts | Sentiment, loyalty talk |
| **Lex** (off-screen) | Heard only through other people's reports. Petty and theatrical. | Gold, glamour, his yacht | Appears on screen before the finale |
| **Nine of Nine** | *Deliberately* broken salesman English, eager and grandiose. Keep the charm, cut the length. | "My friend", "exotic", "ludicrous" | Becomes a caricature: the joke is the hard sell, not the accent |
| **Tony** | A barman's patience. Trades favours for stories. | Drinks, tabs, "on the house" | Monologues |

## 4. Banned AI-isms

Rewrite these on sight. They are editorial tics, not proof of authorship [26].

- **Abstraction words:** *delve, tapestry, landscape, testament, realm, journey, navigate, unleash, embark, symphony, dance of, a sea of.*
- **The contrast formula:** "It's not just X, it's Y." / "This isn't about X. It's about Y."
- **Decorative triplets:** "Fast, clean, and quiet." Keep a list of three only when it's a real list of instructions.
- **Explaining the joke or the feeling** after the line has already shown it.
- **Em-dash seasoning.** Use a dash only for a real interruption, and no more than one per line.
- **Throat-clearing:** *let's be honest, at the end of the day, here's the thing, make no mistake, mark my words.*
- **Self-answered rhetorical questions:** "Know what I call that? Business."
- **Generic menace:** "You have no idea who you're dealing with." / "You'll regret this."
- **Stacked fortune-cookie aphorisms.** McWey gets **one** aphorism per visit at most.
- **Over-tidy symmetry.** "Gold doesn't lie. People do." works once; ten in a row become a pattern.
- **A punchline on every line.** Let some lines just be business.

## 5. Interactive rules (for W10c branching)

These come from inkle's script-first approach [15][16][17] and Disco Elysium's micro-reactivity [18].

- **At least 3 responses at every choice, all ungated.** Make them *different actions* (comply, press, refuse, joke), not three paraphrases.
- **Light consequences** (user decision Q-D). A choice nudges McWey's relationship by up to ±10% and sets at most about **one mission-variant flag per act**. Choices never fork the mission structure.
- **Branch short, rejoin fast.** A choice changes McWey's *reaction*, then the conversation rejoins the main line.
- **Remember one thing.** A later line that references an earlier choice is worth more than a new branch.
- **Honest labels.** The choice text must match the force of the spoken line. A mild question can't come out as an insult.
- **Player lines are the shortest in the script:** 2–8 words.
- **Untimed.** No timers on mandatory briefings.

## 6. Presentation rules (log UI)

These come from Disco Elysium's column model [19][20] and the Xbox and Game Accessibility Guidelines [22]–[25].

- Use a right-side scrolling column, with previous lines still readable above.
- Format each entry as `SPEAKER — line`. Show the name in an accent colour *and* as text; never rely on colour alone.
- Set body text in a readable sans or mono face. Keep the neon styling for headers.
- Put a solid dark backing behind the text, with contrast of at least 4.5:1 against the worst background.
- Render default body text at 18 px or more at 1080p. The text-size setting goes up to about 1.45×. Test the largest size on the smallest viewport.
- A log is not subtitles, so there's no 2-line limit. Keep lines short (rule 2) so each entry wraps to 3 lines or fewer at the default size.

## 7. Before and after

These show the rules in action; they are not final copy. The full rewrite happens in W10d, after sign-off.

**Motel brief** (`MC_BRIEF[0]` plus reply and quote, 4 lines down to 3)

> **Before**
> McWEY — Some out-of-town crew moved into the Sunset Motel on Route 1. They're dealing on our streets.
> McWEY — Nobody does business in Miami without asking McWey first. Go make it clear.
> THE DON — Consider it done.
> McWEY — In Miami, gold doesn't lie. People do.

> **After**
> McWEY — Sunset Motel, Route 1. New faces selling on my corners.
> McWEY — Nobody asked me. Go ask them why.
> THE DON — They'll tell me.

*Why:* the place goes on the objective card. "Go ask them why" is the threat, so it doesn't need saying. The aphorism is cut because the line before it is stronger.

**Moreau brief** (`MC_BRIEF[2]`)

> **Before**
> Now the big fish. Victor 'The Shark' Moreau, top floor of Coral Tower.
> Two sharks in one town is one too many. Bring me his watch — I want to know what time it was.

> **After**
> Moreau. Top floor, Coral Tower.
> Bring me his watch. I want to know what time it was.

*Why:* "big fish" and "two sharks" are two shark gags before the good one. Keep the good one.

**Arcade brief** (`MC_BRIEF[4]`)

> **Before**
> Lex washes his money through the Starlight Arcade on the beach. Quarters in, clean dollars out.
> Unplug it. Every cabinet. And if somebody needs a lesson, there's always the air hockey tables.

> **After**
> Lex runs his laundry through the Starlight Arcade. Quarters in, clean dollars out.
> Unplug every cabinet.

*Why:* the air-hockey line explains a joke the player will make on their own.

**Debrief** (`MC_DEBRIEF[3]`)

> **Before**
> Lex's boats are at the bottom of the marina. He called me crying. I told him the sea is a dangerous place.

> **After**
> Lex called me crying. I told him boats sink.

*Why:* this gives the consequence instead of a replay. The player already knows where the boats are.

**Grade** (`MC_GRADE.D`)

> **Before** Sloppy. Next time, less mess and more finesse.
> **After** I had to buy a mop. For a building.

*Why:* the rhyme is a greeting-card move. A specific complaint carries both the judgement and the character.

**Nine of Nine** (`NINE_INTRO`: 3 sentences and 46 words, down to 2 lines and about 20 words)

> **Before**
> Hello my Friend, you may call me Nine, last name of Nine. I have come from the far east and bring you exotic machinery of death. Only at Nine of Nines can you get this ludicrous and exotic killing machines.

> **After**
> Hello my friend! Nine. Last name, also Nine.
> Exotic machinery of death. Ludicrous. Only at Nine of Nines.

*Why:* this keeps the voice and the joke, and gets the player to the shop sooner.

## 8. Final pass checklist

Read the scene aloud with the speaker names hidden. Can you still tell who's talking?

- [ ] Does each visit stay at 6 lines or fewer?
- [ ] Is every line 90 characters or fewer, with one thought?
- [ ] Does each scene have a want, and does the last line pull forward?
- [ ] Is everything from §4 gone?
- [ ] Is there at most one aphorism per visit?
- [ ] Is the objective clear from the objective card plus one line?

---

## Sources

1. Elmore Leonard, "Ten rules for writing fiction", The Guardian, 2010. <https://www.theguardian.com/books/2010/feb/20/ten-rules-for-writing-fiction-part-one>
2. David Mamet, memo to the writers of *The Unit*, SlashFilm. <https://www.slashfilm.com/508254/a-letter-from-david-mamet-to-the-writers-of-the-unit/>
3. Michael Mann on the *Heat* diner scene, Far Out. <https://faroutmagazine.co.uk/michael-mann-behind-heat-scene/>
4. Michael Mann on *Collateral*, Variety. <https://variety.com/2004/film/awards/michael-mann-1117915104/>
5. *Miller's Crossing*, Cinephilia & Beyond. <https://cinephiliabeyond.org/millers-crossing/>
6. Scorsese on the *Goodfellas* "Funny how?" scene, Entertainment Weekly. <https://ew.com/mr-scorsese-doc-explains-origin-of-goodfellas-funny-how-scene-11791244>
7. Tarantino interviewed by Gavin Smith, Film Comment, 1994. <https://www.filmcomment.com/article/quentin-tarantino-interviewed-by-gavin-smith/>
8. Jonathan Glazer on *Sexy Beast*, BFI notes reproducing Sight and Sound. <https://bfidatadigipres.github.io/acting%20hard%3Cbr%3E%20working%20class%20masculinity%20in%20british%20cinema/2023/09/23/sexy-beast/>
9. *The Long Good Friday* transcript. <https://www.scripts.com/script.php?id=the_long_good_friday_12775&p=4>
10. Martin McDonagh on *In Bruges*, IndieWire. <https://www.indiewire.com/features/general/indiewire-interview-in-bruges-director-martin-mcdonagh-73019/>
11. *Jackie Brown* oral history, Cinema Scholars. <https://cinemascholars.com/jackie-brown-25-years-later-a-cinema-scholars-oral-history/>
12. Oliver Stone on writing *Scarface*, Europe 1 (French). <https://www.europe1.fr/culture/pourquoi-oliver-stone-a-ecrit-le-scenario-de-scarface-a-paris-3997103>
13. David Chase on *The Sopranos* finale, DGA Quarterly. <https://www.dga.org/craft/dgaq/issues/1502-spring-2015/shot-to-remember-the-sopranos>
14. "Enter late, exit early", Final Draft. <https://www.finaldraft.com/blog/how-to-enter-scenes-late-and-exit-early-with-examples>
15. Joseph Humfrey (inkle), "Creating Interactive Film Scripts for 3D Adventures with Ink", GDC 2017. Only the abstract is public; the full talk needs a Vault login. <https://gdcvault.com/play/1023990/Creating-Interactive-Film-Scripts-for> · <https://www.gamedeveloper.com/programming/video-the-tech-behind-inkle-s-interactive-film-scripts>
16. Ink documentation on weaves, gathers and conditional choices. <https://github.com/inkle/ink/blob/35c63e52f1d36060930dc7ed3cfba38ea224b528/Documentation/WritingWithInk.md>
17. Jon Ingold, "Sparkling Dialogue: A Masterclass", AdventureX 2018. <https://www.youtube.com/watch?v=_vRfNtvFVRo> · example source: <https://assets.inklestudios.com/file/inkle-assets/DialogueTalk/Ink/BladeRunnerExampleInk.zip>
18. Justin Keenan on *Disco Elysium*'s micro-reactivity, Game Developer. <https://www.gamedeveloper.com/business/understanding-the-meaningless-micro-reactive-and-marvellous-writing-of-i-disco-elysium-i->
19. Robert Kurvitz on the *Disco Elysium* UI, 80 Level. <https://80.lv/articles/disco-elysium-working-on-ui-design>
20. Taylor Wright, *Disco Elysium: The Final Cut* UX case study. <https://redlamp.org/work/disco-elysium/>
21. Steam thread on clipped numbered responses in *Disco Elysium*. <https://steamcommunity.com/app/632470/discussions/0/4420805388061797473/>
22. Xbox Accessibility Guideline 101: Text display. <https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101>
23. XAG 102: Contrast. <https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/102>
24. XAG 104: Subtitles and captions. <https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/104>
25. Game Accessibility Guidelines: readable subtitles. <https://gameaccessibilityguidelines.com/if-any-subtitles-captions-are-used-present-them-in-a-clear-easy-to-read-way/>
26. Wikipedia: Signs of AI writing. <https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing>
