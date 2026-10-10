# Agloe social posts

Three posts, one per scoring line. Attach the named video to each.

Live: https://agloe.20.84.32.208.nip.io
Code: https://github.com/KanurkarPrateek/agloe

---

## 1. Project post

### X (270 characters)

There's a black market for "Claude" tokens: up to 95% off, because your prompts are the product.

Agloe proves it: plant a fact that exists nowhere else, lock its hash on Monad, catch the model that repeats it.

https://agloe.20.84.32.208.nip.io

@monad @monad_dev @geeky_kartikey

### LinkedIn

In the 1930s, two mapmakers drew a town called Agloe onto their map of New York. It didn't exist. Years later it showed up on a rival's map, and the fake town was the proof of copying.

I built the same trap for LLM traffic.

Grey-market "Claude" resellers sell tokens at 70–95% off. The discount is the bait: they log your prompts and the model's replies, then sell them to labs as distillation data. Until now there was no way to prove it.

Agloe does three things:

1. Plant. Invent a fake protocol with one secret value, commit its hash on Monad, and send it through exactly one suspected reseller.
2. Wait. If the reseller sells its logs, the fact ends up in someone's training set.
3. Probe. Ask a new model about the protocol by name only. If it answers with the secret, the commitment is revealed on-chain: a public, timestamped link between that reseller and that model.

A chance match is about 1 in 2.5 billion per trap, and anyone can re-run the probe.

Why Monad: commit-then-reveal needs a clock nobody can rewrite, and scattering thousands of traps only makes sense on a fast, near-free chain.

Try it: https://agloe.20.84.32.208.nip.io
Code: https://github.com/KanurkarPrateek/agloe

Thanks to @monad, @monad_dev and @geeky_kartikey.

#Monad #AI #LLM #Security

---

## 2. Demo video post — attach `agloe-demo.mp4` (72s)

### X (269 characters)

Agloe, running end to end in 72 seconds:

1. Plant a fake fact, hash committed on Monad
2. The reseller quietly logs it
3. A clean model has never heard of it
4. A model trained on those logs repeats it. Leak proven, revealed on-chain

@monad @monad_dev @geeky_kartikey

### LinkedIn

Here is Agloe running end to end.

In this demo I plant a made-up protocol with a secret value and commit its hash on Monad testnet. The demo reseller answers normally and quietly logs all five copies into the dataset it sells. A clean model has never heard of the protocol. A model trained on the reseller's logs repeats the secret, and the commitment is revealed on-chain.

Every transaction in the video is real and on Monad testnet. The waits for confirmation are trimmed. Narration by ElevenLabs.

Try it yourself: https://agloe.20.84.32.208.nip.io/console

@monad @monad_dev @geeky_kartikey

---

## 3. Ad video post — attach `agloe-ad.mp4` (51s)

### X (273 characters)

In the 1930s, two mapmakers invented a town to catch anyone who copied their map.

It worked.

Today there's a black market for AI tokens, and your prompts are the map. Agloe is the town.

Voice and sound by @elevenlabsio. Built on Monad.

@monad @monad_dev @geeky_kartikey

### LinkedIn

In the 1930s, two mapmakers invented a town to catch anyone who copied their map. It worked.

Today there is a black market for AI tokens: "Claude" at up to 95% off. The discount is the bait. The real product is your prompts, logged and sold to labs as training data.

Agloe is the town that isn't there: a planted fact, a hash locked on Monad, and proof the day a model repeats it.

Voice and sound by ElevenLabs. Built on Monad.

https://agloe.20.84.32.208.nip.io

@monad @monad_dev @geeky_kartikey
