# syllabary

-- check loading on mobile devices
too many glyphs cause iPad to choke while downloading

iPad viewing window resizes to encompass all glyphs



-- use ES5

-- animate within 1 big SVG or individual SVGs?  Performance? Research
https://css-tricks.com/weighing-svg-animation-techniques-benchmarks/
https://greensock.com/
getAnimationFrame?

-- use app cache?
Probably not
https://www.html5rocks.com/en/tutorials/appcache/beginner/

-- important to reduce # of requests?

-- gzip for download?



-- touch library
zingtouch
interact.js
alloyfinger
hammer.js

-- get font

-------------------------------------------------
Use cases:

User attempts to drag screen while poem is playing

User attempts to drag wheel while poem is playing

User attempts to drag screen while sound w/o poem is playing

User attempts to drag wheel while sound w/o poem is playing

User drags screen while auto-animation is playing

User drags wheel while auto-animation is playing

User drags screen while momentum scrolling is happening

User drags wheel while momentum scrolling is happening

Momentum scrolling comes to a stop not on top of a glyph

Momentum scrolling comes to a stop on top of a glyph

User tries to scroll wheel and screen at same time

User tries to scroll screen in more than one direction at a time (pinch and scroll, for example)

-------------------------------------------------

Other possibilities:

Separate and contract

Rotate XY

Reverse pinch and zoom

-------------------------------------------------
Remember:

File structure must conform to v.2 standards


-------------------------------------------------

OK, how to structure this:

class Syllabary
    characters arrays

    class Device
        screensize
        browser

    class Controller

    class LoadingController?

    class LoadingScreen

    class GlyphLoader // download bundles of glyphs maybe 1 row at a time so that we can indicate progress -- other ways to indicate progress

    class (controller/Wheel/)

    Class Grid
        contains reference 3-d array of Syllables
        positionX
        positionY
        positionZ
        rotationXY?Easter Egg

            class Syllable

                class SyllableAudio

                class Glyph
                    class GlyphShape


                class Poem
                    class PoemText
                    class PoemAudio

                        class AudioLoader

                        class AudioPlayer

                        class TextLoader
                            class TextDisplayer (really?)

                            class FileLoader
                            class FileRenderer (come on!)(but you're gonna need it)

                                class Glyphrenderer

                                    class SvgRenderer

