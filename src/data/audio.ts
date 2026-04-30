import type { BgmCue } from '../types/game'

export const bgmSources: Record<BgmCue, string> = {
  home: new URL('../../music/domartistudios-magic-forest-473582.mp3', import.meta.url).href,
  prologue: new URL(
    '../../music/syouki_takahashi-midnight-forest-184304.mp3',
    import.meta.url
  ).href,
  departure: new URL(
    '../../music/deuslower-fantasy-medieval-mystery-ambient-292418.mp3',
    import.meta.url
  ).href,
  investigation: new URL(
    '../../music/ovrsoull-dark-ambient-cinematic-drone-investigative-pulse-minimalist-tension-454723.mp3',
    import.meta.url
  ).href,
  revelation: new URL(
    '../../music/romansenykmusic-cinematic-fantasy-dark-160932.mp3',
    import.meta.url
  ).href,
  danger: new URL(
    '../../music/wbmstudio-dramatic-tension-dark-cinematic-tension-467871.mp3',
    import.meta.url
  ).href,
  finale: new URL(
    '../../music/sigmaeffect-cinematic-dark-tension-atmosphere-464380.mp3',
    import.meta.url
  ).href,
  victory: new URL(
    '../../music/paulyudin-hopeful-piano-emotional-158606.mp3',
    import.meta.url
  ).href,
  hidden: new URL(
    '../../music/royaltyfreemusicstudio-hopeful-cinematic-journey-506057.mp3',
    import.meta.url
  ).href,
  fail: new URL(
    '../../music/megalix-dark-ambient-for-crime-and-tension-360762.mp3',
    import.meta.url
  ).href
}
