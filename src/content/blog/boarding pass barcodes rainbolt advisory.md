---
title: "Testing how much data can be extracted from boarding pass barcodes"
summary: "The answer: enough to know about your current flight details. So long story short, don’t post photos of your boarding pass online."
pubDate: 2026-03-01T04:27:13+00:00
updatedDate: 2026-03-01T05:30:34+00:00
tags:
  - writing
  - travel
postLanguage: english
---

I recently watched [Rainbolt’s latest video](https://youtu.be/uA4WIOc4x7k) advising people not to post boarding passes online and not posting about flights _**live**_ (which should be a norm anyway for safety reasons) and even showed how to get the data just from a barcode picture.

Here’s the video so you can watch it for yourself (it’s just under 9 minutes so it’s not too long):

embed https://youtu.be/uA4WIOc4x7k

## Trying it out with my own old boarding pass

I normally don’t keep around boarding passes from my flights anymore as the recent flights I’ve had would just have the boarding pass itself on some flimsy paper that is similar to ones for receipts, and I haven’t really acted on the “keep boarding passes in a journal” task I’ve had in the back of my mind since the time I’d be flying more frequently than I did when I was a child, but after some scouring through my stuff, I eventually found an old boarding pass I could use as my way to verify how this works.

I took a photo of the old barcode I had from an international flight in 2025 from the US back home, cropped the photo so it only had the barcode visible, and sent it thru the same [PDF417 scanner](https://www.dynamsoft.com/barcode-reader/barcode-types/pdf417/) Rainbolt used in his video.

This was the result, with some info redacted just so I don’t have my full details laid out here:

> `M1SENIRES/CHI*** *****E###### SFOMNLPR 0105 137Y034B0129 3##>############ PR N`

Immediately, I saw all the things he pointed out:

1. The code to note it was a direct flight (`M1`)
2. My full name based on what’s printed on the boarding pass (my first name is kinda long so it was cut off but it still had most of it there)
3. An `E` because I have an electronic ticket issued
4. The booking reference number for my flight (6 characters total)
5. The airport where I came from (so, `SFO`)
6. The airport I’m going to (`MNL`)
7. The flight number (`PR 0105`, because I rode with Philippine Airlines then)
8. When I flew (`137` which pertains to which day in the year I flew, and 137th day was May 17 which checks out)
9. My seat class (I’m guessing `Y` means economY)
10. My seat number (`034B` which checks out)
11. My check in number (`0129` so I guess I was the 129th person to check in?? 😆)
12. My passenger status (`3` which when I searched online, I learned this meant passenger and baggage both checked in[^1])
13. Then I don’t know what the other stuff exactly meant, but just redacted it for safety
14. Second to the last, could be just which airline I’m on (since it just says `PR`)
15. Then last, whether I’m fast tracked or not (in this case, it’s `N`, so No)

While verifying how to interpret the information from this barcode (as I particularly didn’t know what the stuff after the 10th item was initially) I also encountered this post from [James Cridland also sharing why you should cover up your barcode](https://james.cridland.net/blog/2021/fun-with-a-boarding-pass--what-information-can-you-discover/).

## A reminder to self and a reminder to all

**Don’t share any information shown on your boarding pass online, ever.**

I knew about this already before just to exercise caution, so whenever I’m flying, I’d clip my boarding pass in my passport as like a bookmark to the front page with my details so it’s easier when boarding. Sometimes it’s too long though, so I fold it in such a way that you’d only see it was _a_ boarding pass, but the rest of the details are hidden within the closed passport.

Now with this newfound information of how easy it could be to just get your data from extracting the barcode[^2] from a photo, I’ll make sure to cover even the barcode and only show it to airline staff once needed.

[^1]: I really wanted to know what the rest of the numbers meant after this point and I stumbled upon [this online document](https://docs.scandit.com/6.28/data-capture-sdk/android/parser/iata-bcbp.html) listing all the details per segment.
[^2]: Not that I’d be the type to be targeted for things like this, but I’ll never really know what people online think, so best to err on the side of caution every time.
