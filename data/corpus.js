/* Rewound seed corpus.
   - "classics" has keep:true (real video IDs, survives rebuilds).
   - Channels with sample:true are placeholders; the first run of the
     "Refresh corpus" GitHub Action replaces them with real API data. */
window.CORPUS = {
  meta: { builtAt: "seed", source: "seed-data" },
  channels: [
    {
      key: "classics", name: "Internet Classics", avatar: "📼", c1: "#444", c2: "#111",
      real: true, keep: true, sample: false,
      blurb: "The viral canon, 2005-2012. Real videos — they actually play.",
      subsNow: null, subsExp: 1,
      videos: [
        { id: "jNQXAC9IVRw", title: "Me at the zoo", by: "jawed", date: "2005-04-23", nowViews: 348000000, embeddable: true, desc: "The first video on YouTube." },
        { id: "dMH0bHeiRNg", title: "Evolution of Dance", by: "judsonlaipply", date: "2006-04-06", nowViews: 320000000, embeddable: true, desc: "The funniest 6 minutes you will ever see!" },
        { id: "FzRH3iTQPrk", title: "Sneezing Baby Panda", by: "jimvwmoss", date: "2006-11-06", nowViews: 230000000, embeddable: true, desc: "A baby panda sneezing." },
        { id: "EwTZ2xpQwpA", title: "\"Chocolate Rain\" Original Song by Tay Zonday", by: "TayZonday", date: "2007-04-26", nowViews: 140000000, embeddable: true, desc: "Some stay dry and others feel the pain." },
        { id: "_OBlgSz8sSM", title: "Charlie bit my finger - again !", by: "HDCYT", date: "2007-05-22", nowViews: 910000000, embeddable: true, desc: "Even had I tried, I could not have scripted this." },
        { id: "J---aiyznGQ", title: "Charlie Schmidt's Keyboard Cat! - THE ORIGINAL!", by: "Charlie Schmidt", date: "2007-06-07", nowViews: 78000000, embeddable: true, desc: "Play him off, Keyboard Cat." },
        { id: "a1Y73sPHKxw", title: "Dramatic Chipmunk", by: "magnets99", date: "2007-06-19", nowViews: 60000000, embeddable: true, desc: "Dun dun DUNNN." },
        { id: "txqiwrbYGrs", title: "David After Dentist", by: "booba1234", date: "2009-01-30", nowViews: 141000000, embeddable: true, desc: "\"Is this real life?\"" },
        { id: "4-94JhLEiN0", title: "JK Wedding Entrance Dance", by: "TheKheinz", date: "2009-07-19", nowViews: 101000000, embeddable: true, desc: "The wedding entrance that started it all." },
        { id: "OQSNhk5ICTI", title: "Yosemitebear Mountain Double Rainbow 1-8-10", by: "Yosemitebear62", date: "2010-01-08", nowViews: 50000000, embeddable: true, desc: "Double rainbow all the way!! What does it mean??" },
        { id: "hMtZfW2z9dw", title: "BED INTRUDER SONG!!!", by: "schmoyoho", date: "2010-07-31", nowViews: 155000000, embeddable: true, desc: "Hide yo kids, hide yo wife." },
        { id: "kfVsfOSbJY0", title: "Friday - Rebecca Black", by: "rebecca", date: "2011-02-10", nowViews: 170000000, embeddable: true, desc: "It's Friday, Friday, gotta get down on Friday." },
        { id: "QH2-TGUlwu4", title: "Nyan Cat [original]", by: "saraj00n", date: "2011-04-05", nowViews: 215000000, embeddable: true, desc: "Pop tart cat. 10 hours not included." },
        { id: "nGeKSiCQkPw", title: "Ultimate Dog Tease", by: "klaatu42", date: "2011-05-01", nowViews: 205000000, embeddable: true, desc: "The maple kind. Yeah." },
        { id: "8UVNT4wvIGY", title: "Gotye - Somebody That I Used To Know (feat. Kimbra)", by: "gotyemusic", date: "2011-07-05", nowViews: 2300000000, embeddable: true, desc: "Official video." },
        { id: "9bZkp7q19f0", title: "PSY - GANGNAM STYLE(강남스타일) M/V", by: "officialpsy", date: "2012-07-15", nowViews: 5500000000, embeddable: true, desc: "Oppa Gangnam Style." }
      ]
    },
    {
      key: "penguinz0", name: "penguinz0", avatar: "🎮", c1: "#37474f", c2: "#102027",
      real: false, sample: true, subsNow: 400000, subsExp: 2.0,
      blurb: "Charlie's channel. Most 2007-2010 uploads are lost media — shown as tombstones.",
      videos: [
        { id: "cz01", title: "gears of war jetpack glitch", date: "2007-08-05", gone: true },
        { id: "cz02", title: "halo 3 rocket launcher glitch", date: "2007-11-20", gone: true },
        { id: "cz03", title: "gears of war 2 shield glitch", date: "2008-12-02", gone: true },
        { id: "cz04", title: "gameplay commentary", date: "2009-06-14", gone: true },
        { id: "cz05", title: "Greatest Plan Of All Time", date: "2011-03-18", nowViews: 2400000, e: "🎮", desc: "This is the greatest plan of all time." },
        { id: "cz06", title: "Incredible Gameplay And Commentary", date: "2011-09-27", nowViews: 1800000, e: "🎮", desc: "Absolutely incredible." },
        { id: "cz07", title: "Spooky Game Playthrough", date: "2012-10-30", nowViews: 2100000, e: "👻", desc: "This game is not spooky at all." }
      ]
    },
    {
      key: "pewdiepie", name: "PewDiePie", avatar: "👊", c1: "#2b5876", c2: "#4e4376",
      real: false, sample: true, subsNow: 2500000, subsExp: 3.2,
      blurb: "Relive the Bro Army from day one — October 2, 2010.",
      videos: [
        { id: "pd01", title: "Minecraft Multiplayer Fun", date: "2010-10-02", nowViews: 14000000, e: "⛏️", desc: "My first video! Playing some Minecraft with friends." },
        { id: "pd02", title: "Minecraft - Episode 2 - EPIC MINING", date: "2010-10-09", nowViews: 2100000, e: "⛏️", desc: "More Minecraft. Diamonds??" },
        { id: "pd03", title: "Amnesia: The Dark Descent - Part 1 - SO SCARY", date: "2010-12-12", nowViews: 9800000, e: "🕯️", desc: "This game is too scary, bros." },
        { id: "pd04", title: "Amnesia: The Dark Descent - Part 2 - BARRELS!!", date: "2010-12-16", nowViews: 7600000, e: "🛢️", desc: "I don't trust the barrels." },
        { id: "pd05", title: "AMNESIA: Custom Story - ABANDONED - Part 1", date: "2011-02-20", nowViews: 5400000, e: "🏚️", desc: "Custom story time! What could go wrong." },
        { id: "pd06", title: "FRIDAYS WITH PEWDIEPIE #1", date: "2011-04-15", nowViews: 6900000, e: "📣", desc: "New series! Talking to you bros every Friday." },
        { id: "pd07", title: "AMNESIA: JUSTINE - Part 1 - SHE'S CRAZY", date: "2011-05-12", nowViews: 4800000, e: "🕯️", desc: "New Amnesia DLC. Send help." },
        { id: "pd08", title: "HAPPY WHEELS - Part 1 - FUNNIEST GAME EVER", date: "2011-06-03", nowViews: 12500000, e: "🤕", desc: "Trying out Happy Wheels. I have no regrets." },
        { id: "pd09", title: "HAPPY WHEELS - FUNNY MOMENTS MONTAGE", date: "2011-08-21", nowViews: 8800000, e: "🤕", desc: "Best of Happy Wheels so far!" },
        { id: "pd10", title: "FRIDAYS WITH PEWDIEPIE #20 - BRO ARMY GROWS", date: "2011-12-09", nowViews: 3900000, e: "📣", desc: "We're growing so fast, bros. Thank you." },
        { id: "pd11", title: "1 MILLION BROS!!! THANK YOU!", date: "2012-07-11", nowViews: 11200000, e: "🎉", desc: "ONE. MILLION. SUBSCRIBERS. Brofist." },
        { id: "pd12", title: "HAPPY WHEELS - Part 30 - SEGWAY GUY RETURNS", date: "2012-09-02", nowViews: 6100000, e: "🤕", desc: "He's back. My old nemesis." }
      ]
    },
    {
      key: "smosh", name: "Smosh", avatar: "🎭", c1: "#5e2e91", c2: "#2d1650",
      real: false, sample: true, subsNow: 6500000, subsExp: 1.2,
      blurb: "Ian & Anthony — on YouTube almost from the very beginning.",
      videos: [
        { id: "sm01", title: "Pokemon Theme Music Video", date: "2005-11-28", nowViews: 25000000, e: "🎤", desc: "Gotta catch 'em all!" },
        { id: "sm02", title: "Mortal Kombat Theme", date: "2006-04-22", nowViews: 17000000, e: "🥋", desc: "MORTAL KOMBAAAT!" },
        { id: "sm03", title: "Power Rangers Theme", date: "2006-08-10", nowViews: 9000000, e: "⚡", desc: "Go go Power Rangers." },
        { id: "sm04", title: "Food Battle 2006", date: "2006-11-24", nowViews: 12000000, e: "🍩", desc: "Donut vs. taquito. The original showdown." },
        { id: "sm05", title: "Boxman", date: "2007-03-30", nowViews: 7500000, e: "📦", desc: "His name is Boxman and he wants to be your friend." },
        { id: "sm06", title: "Food Battle 2008", date: "2008-11-21", nowViews: 10000000, e: "🍩", desc: "The battle continues." },
        { id: "sm07", title: "Beef 'n Go", date: "2009-05-15", nowViews: 9000000, e: "🥩", desc: "A song about... beef." },
        { id: "sm08", title: "Food Battle 2010", date: "2010-11-19", nowViews: 14000000, e: "🍩", desc: "Year five. It never ends." }
      ]
    },
    {
      key: "nigahiga", name: "nigahiga", avatar: "🗡️", c1: "#b03030", c2: "#5e1212",
      real: false, sample: true, subsNow: 6200000, subsExp: 0.8,
      blurb: "Ryan Higa — the most-subscribed channel of the late 2000s.",
      videos: [
        { id: "nh01", title: "How To Be Ninja", date: "2007-10-13", nowViews: 40000000, e: "🗡️", desc: "Step one: be sneaky." },
        { id: "nh02", title: "How To Be Gangster", date: "2007-12-01", nowViews: 28000000, e: "😎", desc: "The sequel you demanded." },
        { id: "nh03", title: "How To Be Emo", date: "2008-02-16", nowViews: 21000000, e: "🖤", desc: "It's not just a phase." },
        { id: "nh04", title: "Movies In Minutes - Twilight", date: "2009-01-20", nowViews: 11000000, e: "🧛", desc: "The whole movie, minus 110 minutes." },
        { id: "nh05", title: "Ninja Melk", date: "2009-08-08", nowViews: 34000000, e: "🥛", desc: "Got melk?" },
        { id: "nh06", title: "Nice Guys", date: "2011-06-03", nowViews: 68000000, e: "🎵", desc: "Nice guys finish last." }
      ]
    },
    {
      key: "rhettandlink", name: "Rhett & Link", avatar: "🎸", c1: "#1f6f50", c2: "#0d3527",
      real: false, sample: true, subsNow: 600000, subsExp: 1.5,
      blurb: "Internetainers since 2006 — long before Good Mythical Morning.",
      videos: [
        { id: "rl01", title: "The Unibrow Song", date: "2006-10-12", nowViews: 1800000, e: "🤨", desc: "An ode to the brow that connects us." },
        { id: "rl02", title: "The Facebook Song", date: "2009-04-17", nowViews: 5500000, e: "👍", desc: "It's complicated." },
        { id: "rl03", title: "T-Shirt War (stop-motion)", date: "2010-02-09", nowViews: 18000000, e: "👕", desc: "222 t-shirts. 2 guys. 1 war." },
        { id: "rl04", title: "Red House Furniture Commercial", date: "2010-06-30", nowViews: 4800000, e: "🏠", desc: "I Love Local Commercials, episode... yes." },
        { id: "rl05", title: "2 Guys 600 Pillows (Backwards Music Video)", date: "2011-12-05", nowViews: 16000000, e: "🛏️", desc: "Filmed entirely in reverse." }
      ]
    },
    {
      key: "goodmythicalmorning", name: "Good Mythical Morning", avatar: "🌅", c1: "#c27a14", c2: "#6b3e02",
      real: false, sample: true, subsNow: 350000, subsExp: 1.0,
      blurb: "The show launched Jan 9, 2012 — a daily morning talk show from Rhett & Link.",
      videos: [
        { id: "gm01", title: "Good Mythical Morning - Episode 1", date: "2012-01-09", nowViews: 3200000, e: "☀️", desc: "Welcome to Good Mythical Morning! Let's talk about that." },
        { id: "gm02", title: "Strange Addictions - GMM", date: "2012-02-14", nowViews: 1400000, e: "🌀", desc: "People are addicted to WHAT?" },
        { id: "gm03", title: "Our Embarrassing High School Stories - GMM", date: "2012-04-03", nowViews: 1100000, e: "😳", desc: "We were not cool. At all." },
        { id: "gm04", title: "Weird Food Combinations Taste Test - GMM", date: "2012-06-21", nowViews: 2600000, e: "🍳", desc: "Pickles and peanut butter. For science." },
        { id: "gm05", title: "Halloween Costume Ideas - GMM", date: "2012-10-29", nowViews: 900000, e: "🎃", desc: "Last-minute costumes, mythical edition." },
        { id: "gm06", title: "Christmas Sweaters - GMM", date: "2012-12-17", nowViews: 800000, e: "🎄", desc: "The uglier the better." }
      ]
    }
  ]
};
